// backend/index.js
require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
// --- 1. IMPORTAR LIBRERÍAS DE AWS ---
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { RekognitionClient, IndexFacesCommand } = require('@aws-sdk/client-rekognition');

const secretManagerClient = new SecretManagerServiceClient();

// Variables globales para cachear los secretos
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;

async function loadSecrets() {
    if (AWS_ACCESS_KEY_ID) return; // Si ya está cargado, no hacer nada

    const projectId = process.env.GCP_PROJECT || 'gateway-r9gl0';
    
    // --- 2. AÑADIR LOS NUEVOS SECRETOS DE AWS A LA CARGA ---
    const [
        [supabaseUrlVersion],
        [supabaseKeyVersion],
        [jwtSecretVersion],
        [awsAccessKeyIdVersion],
        [awsSecretAccessKeyVersion],
    ] = await Promise.all([
        secretManagerClient.accessSecretVersion({ name: `projects/${projectId}/secrets/SUPABASE_URL/versions/latest` }),
        secretManagerClient.accessSecretVersion({ name: `projects/${projectId}/secrets/SUPABASE_SERVICE_KEY/versions/latest` }),
        secretManagerClient.accessSecretVersion({ name: `projects/${projectId}/secrets/JWT_SECRET_KEY/versions/latest` }),
        secretManagerClient.accessSecretVersion({ name: `projects/${projectId}/secrets/AWS_ACCESS_KEY_ID/versions/latest` }),
        secretManagerClient.accessSecretVersion({ name: `projects/${projectId}/secrets/AWS_SECRET_ACCESS_KEY/versions/latest` }),
    ]);

    SUPABASE_URL = supabaseUrlVersion.payload.data.toString();
    SUPABASE_SERVICE_KEY = supabaseKeyVersion.payload.data.toString();
    JWT_SECRET = jwtSecretVersion.payload.data.toString();
    AWS_ACCESS_KEY_ID = awsAccessKeyIdVersion.payload.data.toString();
    AWS_SECRET_ACCESS_KEY = awsSecretAccessKeyVersion.payload.data.toString();
}

functions.http('auth-handler', async (req, res) => {
    try {
        await loadSecrets();
    } catch (error) {
        console.error('CRITICAL: FAILED TO LOAD SECRETS.', error);
        return res.status(500).send({ error: 'Internal Server Error: Could not load configuration.' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { /* ...Manejo de CORS... */ return res.status(204).send(''); }
    if (req.method !== 'POST') { return res.status(405).send({ error: 'Method Not Allowed' }); }

    try {
        const { action } = req.body;

        if (action === 'check-phone') {
            // ... Lógica existente ...
        } else if (action === 'verify-identity') {
            // ... Lógica existente ...
        
        // --- 3. NUEVA ACCIÓN PARA REGISTRAR LA CARA ---
        } else if (action === 'register-face') {
            const { userId, imageBase64 } = req.body;
            if (!userId || !imageBase64) {
                return res.status(400).send({ error: 'userId and imageBase64 are required.' });
            }

            // Configuración de los clientes de AWS
            const AWS_REGION = 'us-east-2'; // La región donde creaste tus recursos de AWS
            const S3_BUCKET_NAME = 'noxtla-guardian-gate-faces'; // El nombre de tu bucket
            const REKOGNITION_COLLECTION_ID = 'guardian_gate_employees';
            
            const s3Client = new S3Client({
                region: AWS_REGION,
                credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY }
            });
            const rekognitionClient = new RekognitionClient({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });

            // Paso 1: Subir la imagen a S3
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const s3Key = `${userId}/profile.jpg`; // ej: 'uuid-del-empleado/profile.jpg'
            
            await s3Client.send(new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: imageBuffer,
                ContentType: 'image/jpeg',
            }));

            // Paso 2: Registrar (indexar) la cara en Rekognition desde S3
            const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({
                CollectionId: REKOGNITION_COLLECTION_ID,
                ExternalImageId: userId, // Usamos el UUID del empleado como ID externo
                Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: s3Key } },
                MaxFaces: 1,
                QualityFilter: "AUTO",
            }));

            if (!FaceRecords || FaceRecords.length === 0) {
                // Si Rekognition no encontró una cara en la foto
                throw new Error('No face detected in the provided image.');
            }
            
            // Paso 3: Actualizar la base de datos para marcar la biometría como habilitada
            const { error: updateError } = await supabase
                .from('employees')
                .update({ is_biometric_enabled: true })
                .eq('id', userId);

            if (updateError) throw updateError;
            
            return res.status(200).send({ status: 'success', message: 'Face registered successfully.' });

        } else {
            return res.status(400).send({ error: 'Unknown action' });
        }
    } catch (err) {
        console.error('Error in auth-handler:', err);
        return res.status(500).send({ error: err.message || 'An internal server error occurred.' });
    }
});