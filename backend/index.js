require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { RekognitionClient, IndexFacesCommand } = require('@aws-sdk/client-rekognition');

const secretManagerClient = new SecretManagerServiceClient();
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;

async function loadSecrets() {
    if (AWS_ACCESS_KEY_ID) return; 
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

        if (action === 'check-employee-id') {
            const { employeeId } = req.body;
            if (!employeeId) { return res.status(400).send({ error: 'El parámetro employeeId es requerido.' }); }
            
            const idAsString = String(employeeId).trim();
            if (!/^\d+$/.test(idAsString) || idAsString.length < 6 || idAsString.length > 12) {
                return res.status(400).send({ error: 'El employeeId debe ser un número entre 6 y 12 dígitos.' });
            }
            const numericEmployeeId = parseInt(idAsString, 10);
            
            console.log(`Verificando ID de empleado: ${numericEmployeeId}`);
            
            const { data, error } = await supabase
                .from('auth_users')
                .select('status_name')
                .eq('employee_id', numericEmployeeId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error de Supabase en check-employee-id:", error);
                throw error;
            }
            
            const userFound = !!(data && data.status_name === 'Active');
            console.log(`Empleado encontrado y activo: ${userFound}`);
            
            return res.status(200).send({ status: 'success', userFound });

        } else if (action === 'verify-identity') {
            const { employeeId, day, month, year } = req.body;
            if (!employeeId || !day || !month || !year) {
                return res.status(400).send({ error: 'Los parámetros employeeId, day, month, y year son requeridos.' });
            }
            
            const idAsString = String(employeeId).trim();
            if (!/^\d+$/.test(idAsString)) {
                return res.status(400).send({ error: 'El employeeId debe ser un número.' });
            }
            const numericEmployeeId = parseInt(idAsString, 10);
            
            const birthDateToVerify = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Verificando identidad para ${numericEmployeeId} con fecha de nacimiento ${birthDateToVerify}`);
            
            const { data, error } = await supabase
                .from('auth_users')
                .select('employee_uuid')
                .eq('employee_id', numericEmployeeId)
                .eq('birth_date', birthDateToVerify)
                .single();

            if (error || !data) {
                console.warn('Fallo en la verificación de identidad:', { employeeId, error });
                return res.status(403).send({ error: 'Prohibido: Credenciales inválidas.' });
            }
            
            const userId = data.employee_uuid;
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
            console.log(`Identidad verificada para userId: ${userId}. Token generado.`);
            return res.status(200).send({ status: 'success', token, userId });

        } else if (action === 'register-face') {
            const { userId, imageBase64 } = req.body;
            if (!userId || !imageBase64) { return res.status(400).send({ error: 'userId y imageBase64 son requeridos.' }); }
            console.log(`Registrando rostro para userId: ${userId}`);

            const AWS_REGION = 'us-east-2';
            const S3_BUCKET_NAME = 'noxtla-guardian-gate-faces';
            const REKOGNITION_COLLECTION_ID = 'guardian_gate_employees';
            const s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            const rekognitionClient = new RekognitionClient({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const s3Key = `${userId}/profile.jpg`;

            await s3Client.send(new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key, Body: imageBuffer, ContentType: 'image/jpeg' }));
            console.log(`Imagen subida a S3: ${s3Key}`);

            const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({
                CollectionId: REKOGNITION_COLLECTION_ID,
                ExternalImageId: userId,
                Image: { Bytes: imageBuffer },
                MaxFaces: 1,
                QualityFilter: "AUTO"
            }));

            if (!FaceRecords || FaceRecords.length === 0) { throw new Error('No se detectó ningún rostro en la imagen proporcionada.'); }
            console.log(`Rostro indexado en Rekognition. FaceId: ${FaceRecords[0].Face.FaceId}`);
            
            // --- LÍNEA CORREGIDA ---
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