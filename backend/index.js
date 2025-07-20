// backend/index.js
require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { RekognitionClient, IndexFacesCommand } = require('@aws-sdk/client-rekognition');

const secretManagerClient = new SecretManagerServiceClient();

// Variables globales para cachear los secretos
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;

// --- Carga de secretos mejorada con logs detallados ---
async function loadSecrets() {
    if (AWS_ACCESS_KEY_ID) return; // Los secretos ya están cargados.

    const projectId = process.env.GCP_PROJECT || 'gateway-r9gl0';
    console.log(`Cargando secretos para el proyecto: ${projectId}`);

    const secretsToLoad = {
        SUPABASE_URL: `projects/${projectId}/secrets/SUPABASE_URL/versions/latest`,
        SUPABASE_SERVICE_KEY: `projects/${projectId}/secrets/SUPABASE_SERVICE_KEY/versions/latest`,
        JWT_SECRET: `projects/${projectId}/secrets/JWT_SECRET_KEY/versions/latest`,
        AWS_ACCESS_KEY_ID: `projects/${projectId}/secrets/AWS_ACCESS_KEY_ID/versions/latest`,
        AWS_SECRET_ACCESS_KEY: `projects/${projectId}/secrets/AWS_SECRET_ACCESS_KEY/versions/latest`,
    };

    try {
        const results = await Promise.all(
            Object.entries(secretsToLoad).map(async ([key, name]) => {
                try {
                    const [version] = await secretManagerClient.accessSecretVersion({ name });
                    return [key, version.payload.data.toString()];
                } catch (err) {
                    console.error(`🔴 FALLÓ la carga del secreto: ${key}. Ruta: ${name}`);
                    // Volver a lanzar el error para que sea capturado por el catch exterior
                    throw new Error(`No se pudo acceder al secreto: ${key}. Razón: ${err.message}`);
                }
            })
        );
        
        const loadedSecrets = Object.fromEntries(results);

        SUPABASE_URL = loadedSecrets.SUPABASE_URL;
        SUPABASE_SERVICE_KEY = loadedSecrets.SUPABASE_SERVICE_KEY;
        JWT_SECRET = loadedSecrets.JWT_SECRET;
        AWS_ACCESS_KEY_ID = loadedSecrets.AWS_ACCESS_KEY_ID;
        AWS_SECRET_ACCESS_KEY = loadedSecrets.AWS_SECRET_ACCESS_KEY;

        // Verificar que todos los secretos se cargaron
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
            throw new Error("Uno o más valores de secretos están vacíos después de la carga.");
        }

        console.log("✅ Todos los secretos se han cargado correctamente.");

    } catch (error) {
        console.error("CRÍTICO: El proceso de carga de secretos falló.", error);
        // Volver a lanzar para que sea capturado por el manejador principal
        throw error;
    }
}


functions.http('auth-handler', async (req, res) => {
    // --- Manejo de cabeceras CORS ---
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }
    // --- Fin manejo CORS ---
    
    try {
        await loadSecrets();
    } catch (error) {
        console.error('CRÍTICO: FALLÓ LA CARGA DE SECRETOS EN EL HANDLER.', error);
        return res.status(500).send({ error: 'Internal Server Error: Could not load configuration.' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    if (req.method !== 'POST') { return res.status(405).send({ error: 'Method Not Allowed' }); }

    try {
        const { action } = req.body;
        console.log(`Acción recibida: ${action}`);

        if (action === 'check-phone') {
            const { phoneNumber } = req.body;
            if (!phoneNumber) {
                return res.status(400).send({ error: 'El parámetro phoneNumber es requerido.' });
            }
            console.log(`Verificando número de teléfono: ${phoneNumber}`);
            
            // --- INICIO DE LA MODIFICACIÓN ---
            const { data, error } = await supabase
                .from('auth_users') // 1. Cambiamos de 'employees' a 'auth_users'
                .select('status_name') // 2. Seleccionamos 'status_name' para verificar si es "Active"
                .eq('phone_number', phoneNumber)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignorar el error "no se encontraron filas"
                console.error("Error de Supabase en check-phone:", error);
                throw error;
            }

            // 3. La lógica ahora comprueba si se encontró un usuario y si su status_name es 'Active'
            const userFound = !!(data && data.status_name === 'Active');
            // --- FIN DE LA MODIFICACIÓN ---

            console.log(`Usuario encontrado y activo: ${userFound}`);
            return res.status(200).send({ status: 'success', userFound });

        } else if (action === 'verify-identity') {
            const { phoneNumber, day, month, year } = req.body;
            if (!phoneNumber || !day || !month || !year) {
                return res.status(400).send({ error: 'Los parámetros phoneNumber, day, month, y year son requeridos.' });
            }
            console.log(`Verificando identidad para: ${phoneNumber}`);

            // NOTA: Esta consulta también podría necesitar un ajuste similar si falla.
            // Por ahora, la dejamos como estaba.
            const { data, error } = await supabase
                .from('employees')
                .select('id')
                .eq('phone_number', phoneNumber)
                .eq('birth_day', day)
                .eq('birth_month', month)
                .eq('birth_year', year)
                .single();

            if (error || !data) {
                return res.status(403).send({ error: 'Prohibido: Credenciales inválidas.' });
            }

            const userId = data.id;
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });

            console.log(`Identidad verificada para userId: ${userId}. Token generado.`);
            return res.status(200).send({ status: 'success', token, userId });

        } else if (action === 'register-face') {
            const { userId, imageBase64 } = req.body;
            if (!userId || !imageBase64) {
                return res.status(400).send({ error: 'userId y imageBase64 son requeridos.' });
            }

            console.log(`Registrando rostro para userId: ${userId}`);

            // --- Configuración de AWS ---
            const AWS_REGION = 'us-east-2';
            const S3_BUCKET_NAME = 'noxtla-guardian-gate-faces';
            const REKOGNITION_COLLECTION_ID = 'guardian_gate_employees';
            
            const s3Client = new S3Client({
                region: AWS_REGION,
                credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY }
            });
            const rekognitionClient = new RekognitionClient({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });

            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const s3Key = `${userId}/profile.jpg`;
            
            await s3Client.send(new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: imageBuffer,
                ContentType: 'image/jpeg',
            }));
            console.log(`Imagen subida a S3: ${s3Key}`);

            const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({
                CollectionId: REKOGNITION_COLLECTION_ID,
                ExternalImageId: userId,
                Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: s3Key } },
                MaxFaces: 1,
                QualityFilter: "AUTO",
            }));

            if (!FaceRecords || FaceRecords.length === 0) {
                throw new Error('No se detectó ningún rostro en la imagen proporcionada.');
            }
            console.log(`Rostro indexado en Rekognition. FaceId: ${FaceRecords[0].Face.FaceId}`);
            
            const { error: updateError } = await supabase
                .from('employees')
                .update({ is_biometric_enabled: true })
                .eq('id', userId);

            if (updateError) throw updateError;
            console.log(`Base de datos actualizada para userId: ${userId}`);
            
            return res.status(200).send({ status: 'success', message: 'Rostro registrado exitosamente.' });

        } else {
            console.warn(`Acción desconocida recibida: ${action}`);
            return res.status(400).send({ error: 'Acción desconocida' });
        }
    } catch (err) {
        console.error('Error en auth-handler:', err);
        return res.status(500).send({ error: err.message || 'Ocurrió un error interno en el servidor.' });
    }
});