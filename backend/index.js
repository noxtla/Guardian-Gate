// backend/index.js (VERSIÓN FINAL LIMPIA)
// Handler para la Google Cloud Function 'auth-handler'

require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand } = require('@aws-sdk/client-rekognition');

const secretManagerClient = new SecretManagerServiceClient();
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY;

async function loadSecrets() {
    if (SUPABASE_URL) return;
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
                const [version] = await secretManagerClient.accessSecretVersion({ name });
                return [key, version.payload.data.toString()];
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
    } catch (error) {
        console.error("CRÍTICO: El proceso de carga de secretos falló.", error);
        throw error;
    }
}

function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

functions.http('auth-handler', async (req, res) => {
    try {
        res.set('Access-control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') { return res.status(204).send(''); }

        await loadSecrets();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { action } = req.body;
        console.log(`\n\n--- Petición de Autenticación --- Acción: ${action}`);

        if (action === 'check-employee-id') {
            const { employeeId } = req.body;
            const { data } = await supabase.from('auth_users').select('status_name').eq('employee_id', parseInt(String(employeeId).trim(), 10)).single();
            const userFound = !!(data && data.status_name === 'Active');
            console.log(`[check-employee-id] Resultado para ${employeeId}: ${userFound}`);
            return res.status(200).send({ status: 'success', userFound });

        } else if (action === 'verify-identity') {
            const { employeeId, day, month, year } = req.body;
            console.log(`[verify-identity] Verificando:`, { employeeId, day, month, year });
            const birthDateToVerify = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const { data, error } = await supabase.from('auth_users').select('employee_uuid, is_biometric_enabled').eq('employee_id', parseInt(String(employeeId).trim(), 10)).eq('birth_date', birthDateToVerify).single();
            if (error && error.code !== 'PGRST116' || !data) {
                console.error(`[verify-identity] Fallo en la consulta o no se encontraron datos. Error:`, error);
                return res.status(403).send({ error: 'Credenciales inválidas.' });
            }
            const { employee_uuid: userId, is_biometric_enabled: isBiometricEnabled } = data;
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
            console.log(`[verify-identity] Éxito. userId: ${userId}, token generado.`);
            return res.status(200).send({ status: 'success', token, userId, isBiometricEnabled });

        } else if (action === 'get-upload-url') {
            const decodedToken = verifyToken(req);
            const { userId } = req.body;
            if (decodedToken.userId !== userId) return res.status(403).send({ error: 'Token no coincide con el usuario.' });
            
            console.log(`[get-upload-url] Generando URL para userId: ${userId}`);
            const s3Client = new S3Client({ region: 'us-east-2', credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            const s3Key = `${userId}/profile.jpg`;
            const command = new PutObjectCommand({ Bucket: 'noxtla-guardian-gate-faces', Key: s3Key, ContentType: 'image/jpeg' });
            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
            console.log(`[get-upload-url] URL generada exitosamente.`);
            return res.status(200).send({ status: 'success', uploadUrl, s3Key });

        } else if (action === 'process-face-image') {
            const decodedToken = verifyToken(req);
            const { userId, s3Key, isBiometricEnabled } = req.body;
            if (decodedToken.userId !== userId) return res.status(403).send({ error: 'Token no coincide con el usuario.' });
            
            console.log(`[process-face-image] Procesando para userId: ${userId}. Biometría activada: ${isBiometricEnabled}`);
            const rekognitionClient = new RekognitionClient({ region: 'us-east-2', credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
            const imageReference = { S3Object: { Bucket: 'noxtla-guardian-gate-faces', Name: s3Key } };

            if (isBiometricEnabled === false) {
                console.log(`[process-face-image] Indexando nueva cara...`);
                const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({ CollectionId: 'guardian_gate_employees', ExternalImageId: userId, Image: imageReference, MaxFaces: 1, QualityFilter: "AUTO" }));
                if (!FaceRecords || FaceRecords.length === 0) throw new Error('No se detectó un rostro en la imagen.');
                
                const { error: updateError } = await supabase.from('employees').update({ is_biometric_enabled: true }).eq('id', userId);
                if (updateError) {
                    console.error("Error al actualizar Supabase:", updateError);
                    throw updateError;
                };
                
                console.log(`[process-face-image] Cara indexada y DB actualizada.`);
                return res.status(200).send({ status: 'success', message: 'Rostro registrado exitosamente.' });
            } else {
                console.log(`[process-face-image] Buscando cara existente...`);
                const { FaceMatches } = await rekognitionClient.send(new SearchFacesByImageCommand({ CollectionId: 'guardian_gate_employees', Image: imageReference, FaceMatchThreshold: 98, MaxFaces: 1 }));
                if (!FaceMatches || FaceMatches.length === 0) return res.status(404).send({ error: 'Su rostro no coincide con nuestros registros.' });
                
                const matchedUserId = FaceMatches[0].Face?.ExternalImageId;
                if (matchedUserId === userId) {
                    console.log(`[process-face-image] Coincidencia encontrada y correcta.`);
                    return res.status(200).send({ status: 'success', message: 'Verificación de rostro exitosa.' });
                } else {
                    console.warn(`[process-face-image] Coincidencia encontrada pero no pertenece al usuario. Encontrado: ${matchedUserId}, esperado: ${userId}`);
                    return res.status(403).send({ error: 'El rostro no pertenece a este usuario.' });
                }
            }
        } else {
            // Se ha cambiado el mensaje de error para reflejar las acciones esperadas
            return res.status(400).send({ error: 'Acción de autenticación desconocida.' });
        }

    } catch (err) {
        console.error('--- ERROR EN AUTH-HANDLER ---', { message: err.message, stack: err.stack });
        return res.status(500).send({ error: 'Ocurrió un error interno.', details: err.message });
    }
});