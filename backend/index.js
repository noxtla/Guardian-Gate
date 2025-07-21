// backend/index.js (con logs de depuración)
require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
// ... (resto de importaciones sin cambios) ...
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { RekognitionClient, IndexFacesCommand } = require('@aws-sdk/client-rekognition');


const secretManagerClient = new SecretManagerServiceClient();
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;

async function loadSecrets() {
    if (AWS_ACCESS_KEY_ID) return; 
    const projectId = process.env.GCP_PROJECT || 'gateway-r9gl0';
    // ... (lógica de loadSecrets sin cambios) ...
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
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
            throw new Error("Uno o más valores de secretos están vacíos después de la carga.");
        }
        console.log("✅ Todos los secretos se han cargado correctamente.");
    } catch (error) {
        console.error("CRÍTICO: El proceso de carga de secretos falló.", error);
        throw error;
    }
}


functions.http('auth-handler', async (req, res) => {
    res.set('Access-control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { return res.status(204).send(''); }
    try { await loadSecrets(); } catch (error) {
        console.error('CRÍTICO: FALLÓ LA CARGA DE SECRETOS EN EL HANDLER.', error);
        return res.status(500).send({ error: 'Internal Server Error: Could not load configuration.' });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    if (req.method !== 'POST') { return res.status(405).send({ error: 'Method Not Allowed' }); }

    try {
        const { action } = req.body;
        console.log(`Acción recibida: ${action}`);

        if (action === 'check-phone') {
            // ... (sin cambios) ...
            const { phoneNumber } = req.body;
            if (!phoneNumber) { return res.status(400).send({ error: 'El parámetro phoneNumber es requerido.' }); }
            console.log(`Verificando número de teléfono: ${phoneNumber}`);
            const { data, error } = await supabase.from('auth_users').select('status_name').eq('phone_number', phoneNumber).single();
            if (error && error.code !== 'PGRST116') { console.error("Error de Supabase en check-phone:", error); throw error; }
            const userFound = !!(data && data.status_name === 'Active');
            console.log(`Usuario encontrado y activo: ${userFound}`);
            return res.status(200).send({ status: 'success', userFound });
        } else if (action === 'verify-identity') {
            const { phoneNumber, day, month, year } = req.body;
            if (!phoneNumber || !day || !month || !year) {
                return res.status(400).send({ error: 'Los parámetros phoneNumber, day, month, y year son requeridos.' });
            }
            
            // --- INICIO DE LA MODIFICACIÓN DE DEBUG ---
            console.log('--- DEBUG: VERIFY-IDENTITY ---');
            console.log(`Recibido - Teléfono: ${phoneNumber}`);
            console.log(`Recibido - Día: ${day}, Mes: ${month}, Año: ${year}`);

            const birthDateToVerify = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Construido para consulta - birth_date: '${birthDateToVerify}'`);
            
            const { data, error } = await supabase
                .from('auth_users')
                .select('employee_uuid')
                .eq('phone_number', phoneNumber)
                .eq('birth_date', birthDateToVerify)
                .single();

            // Log del resultado de la consulta
            if (error) {
                console.error('Error de Supabase en la consulta:', JSON.stringify(error, null, 2));
            }
            if (data) {
                console.log('Datos encontrados:', JSON.stringify(data, null, 2));
            } else {
                console.log('No se encontraron datos que coincidan.');
            }
            console.log('-----------------------------');
            // --- FIN DE LA MODIFICACIÓN DE DEBUG ---

            if (error || !data) {
                return res.status(403).send({ error: 'Prohibido: Credenciales inválidas.' });
            }
            
            const userId = data.employee_uuid;
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
            console.log(`Identidad verificada para userId: ${userId}. Token generado.`);
            return res.status(200).send({ status: 'success', token, userId });

        } else if (action === 'register-face') {
            // ... (sin cambios) ...
            const { userId, imageBase64 } = req.body;
            if (!userId || !imageBase64) { return res.status(400).send({ error: 'userId y imageBase64 son requeridos.' }); }
            console.log(`Registrando rostro para userId: ${userId}`);
            const AWS_REGION = 'us-east-2'; const S3_BUCKET_NAME = 'noxtla-guardian-gate-faces'; const REKOGNITION_COLLECTION_ID = 'guardian_gate_employees';
            const s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            const rekognitionClient = new RekognitionClient({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const s3Key = `${userId}/profile.jpg`;
            await s3Client.send(new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key, Body: imageBuffer, ContentType: 'image/jpeg' }));
            console.log(`Imagen subida a S3: ${s3Key}`);
            const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({ CollectionId: REKOGNITION_COLLECTION_ID, ExternalImageId: userId, Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: s3Key } }, MaxFaces: 1, QualityFilter: "AUTO" }));
            if (!FaceRecords || FaceRecords.length === 0) { throw new Error('No se detectó ningún rostro en la imagen proporcionada.'); }
            console.log(`Rostro indexado en Rekognition. FaceId: ${FaceRecords[0].Face.FaceId}`);
            const { error: updateError } = await supabase.from('employees').update({ is_biometric_enabled: true }).eq('id', userId);
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