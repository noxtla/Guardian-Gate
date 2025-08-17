// backend/index.js
// VERSIÓN FINAL CON ENDPOINT GET /me Y LÓGICA POST PARA ACCIONES

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

// --- Bloque de Carga de Secretos (sin cambios) ---
async function loadSecrets() { if (SUPABASE_URL) return; const projectId = process.env.GCP_PROJECT || 'gateway-r9gl0'; const secretsToLoad = { SUPABASE_URL: `projects/${projectId}/secrets/SUPABASE_URL/versions/latest`, SUPABASE_SERVICE_KEY: `projects/${projectId}/secrets/SUPABASE_SERVICE_KEY/versions/latest`, JWT_SECRET: `projects/${projectId}/secrets/JWT_SECRET_KEY/versions/latest`, AWS_ACCESS_KEY_ID: `projects/${projectId}/secrets/AWS_ACCESS_KEY_ID/versions/latest`, AWS_SECRET_ACCESS_KEY: `projects/${projectId}/secrets/AWS_SECRET_ACCESS_KEY/versions/latest`, }; try { const results = await Promise.all( Object.entries(secretsToLoad).map(async ([key, name]) => { const [version] = await secretManagerClient.accessSecretVersion({ name }); return [key, version.payload.data.toString()]; }) ); const loadedSecrets = Object.fromEntries(results); SUPABASE_URL = loadedSecrets.SUPABASE_URL; SUPABASE_SERVICE_KEY = loadedSecrets.SUPABASE_SERVICE_KEY; JWT_SECRET = loadedSecrets.JWT_SECRET; AWS_ACCESS_KEY_ID = loadedSecrets.AWS_ACCESS_KEY_ID; AWS_SECRET_ACCESS_KEY = loadedSecrets.AWS_SECRET_ACCESS_KEY; } catch (error) { console.error("CRÍTICO: El proceso de carga de secretos falló.", error); throw error; } }

// --- Función de Verificación de Token (sin cambios) ---
function verifyToken(req) { const authHeader = req.headers.authorization; if (!authHeader || !authHeader.startsWith('Bearer ')) { throw new Error('Missing or invalid authorization header'); } const token = authHeader.split(' ')[1]; try { return jwt.verify(token, JWT_SECRET); } catch (error) { throw new Error('Invalid or expired token'); } }


// --- Handler Principal de la Función ---
functions.http('auth-handler', async (req, res) => {
    try {
        // --- Configuración de CORS y carga de secretos ---
        res.set('Access-control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') { return res.status(204).send(''); }

        await loadSecrets();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        // --- LÓGICA PARA PETICIONES GET (ENDPOINT /me) ---
        if (req.method === 'GET') {
            try {
                const decodedToken = verifyToken(req);
                const { userId } = decodedToken;

                if (!userId) {
                    return res.status(401).send({ error: 'Invalid token: missing userId' });
                }

                console.log(`[get-me] Petición para userId: ${userId}`);

                const { data, error } = await supabase
                    .from('auth_users')
                    .select('employee_uuid, name, is_biometric_enabled, position:positions ( name )')
                    .eq('employee_uuid', userId)
                    .single();

                if (error) {
                    console.error('[get-me] Error de Supabase:', error);
                    return res.status(404).send({ error: 'User not found.' });
                }

                const userProfile = {
                    userId: data.employee_uuid,
                    name: data.name,
                    isBiometricEnabled: data.is_biometric_enabled,
                    position: data.position ? data.position.name : 'N/A',
                };
                
                console.log('[get-me] Usuario encontrado, devolviendo perfil:', userProfile);
                return res.status(200).send(userProfile);

            } catch (err) {
                console.error('[get-me] Error de autenticación:', err.message);
                return res.status(401).send({ error: `Authentication failed: ${err.message}` });
            }
        }

        // --- LÓGICA PARA PETICIONES POST (ACCIONES) ---
        if (req.method === 'POST') {
            const { action } = req.body;
            console.log(`\n\n--- Petición de Autenticación POST --- Acción: ${action}`);

            if (action === 'check-employee-id') {
                const { employeeId } = req.body;
                const { data } = await supabase.from('auth_users').select('status_name').eq('employee_id', parseInt(String(employeeId).trim(), 10)).single();
                const userFound = !!(data && data.status_name === 'Active');
                console.log(`[check-employee-id] Resultado para ${employeeId}: ${userFound}`);
                return res.status(200).send({ status: 'success', userFound });

            } else if (action === 'verify-identity') {
                const { employeeId, day, month, year, deviceId } = req.body;
                if (!deviceId) { return res.status(400).send({ error: 'Device ID is missing.' }); }
                console.log(`[verify-identity-rpc] Verificando con RPC:`, { employeeId, day, month, year, deviceId });

                const { data, error } = await supabase.rpc('verify_user_dob', { p_employee_id: employeeId, p_year: year, p_month: month, p_day: day, p_device_id: deviceId });
                
                if (error || !data || data.length === 0) {
                    console.error(`[verify-identity-rpc] Fallo RPC. Error:`, error);
                    if (error && error.message.includes('Device ID does not match')) { return res.status(403).send({ error: 'This account is bound to another device.' }); }
                    return res.status(403).send({ error: 'Invalid credentials.' });
                }

                const userData = data[0];
                const { employee_uuid: userId, is_biometric_enabled: isBiometricEnabled, employee_name: name, position_name: position } = userData;
                const token = jwt.sign({ userId, name, position }, JWT_SECRET, { expiresIn: '1h' });
                console.log(`[verify-identity-rpc] Éxito. userId: ${userId}, name: ${name}, position: ${position}`);
                return res.status(200).send({ status: 'success', token, userId, isBiometricEnabled, name, position });

            } else if (action === 'get-upload-url') {
                const decodedToken = verifyToken(req);
                const { userId } = req.body;
                if (decodedToken.userId !== userId) return res.status(403).send({ error: 'Token no coincide con el usuario.' });
                
                console.log(`[get-upload-url] Generando URL para userId: ${userId}`);
                const s3Client = new S3Client({ region: 'us-east-2', credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
                const s3Key = `${userId}/profile.jpg`;
                const command = new PutObjectCommand({ Bucket: 'noxtla-guardian-gate-faces', Key: s3Key, ContentType: 'image/jpeg' });
                const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
                return res.status(200).send({ status: 'success', uploadUrl, s3Key });

            } else if (action === 'process-face-image') {
                const decodedToken = verifyToken(req);
                const { userId, s3Key, isBiometricEnabled } = req.body;
                if (decodedToken.userId !== userId) return res.status(403).send({ error: 'Token no coincide con el usuario.' });
                
                console.log(`[process-face-image] Procesando para userId: ${userId}. Biometría activada: ${isBiometricEnabled}`);
                const rekognitionClient = new RekognitionClient({ region: 'us-east-2', credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
                const imageReference = { S3Object: { Bucket: 'noxtla-guardian-gate-faces', Name: s3Key } };

                if (isBiometricEnabled === false) {
                    const { FaceRecords } = await rekognitionClient.send(new IndexFacesCommand({ CollectionId: 'guardian_gate_employees', ExternalImageId: userId, Image: imageReference, MaxFaces: 1, QualityFilter: "AUTO" }));
                    if (!FaceRecords || FaceRecords.length === 0) throw new Error('No se detectó un rostro en la imagen.');
                    
                    await supabase.from('auth_users').update({ is_biometric_enabled: true }).eq('employee_uuid', userId);
                    return res.status(200).send({ status: 'success', message: 'Rostro registrado exitosamente.' });
                } else {
                    const { FaceMatches } = await rekognitionClient.send(new SearchFacesByImageCommand({ CollectionId: 'guardian_gate_employees', Image: imageReference, FaceMatchThreshold: 98, MaxFaces: 1 }));
                    if (!FaceMatches || FaceMatches.length === 0) return res.status(404).send({ error: 'Su rostro no coincide con nuestros registros.' });
                    
                    const matchedUserId = FaceMatches[0].Face?.ExternalImageId;
                    if (matchedUserId === userId) {
                        return res.status(200).send({ status: 'success', message: 'Verificación de rostro exitosa.' });
                    } else {
                        return res.status(403).send({ error: 'El rostro no pertenece a este usuario.' });
                    }
                }
            } else {
                return res.status(400).send({ error: 'Acción de autenticación desconocida.' });
            }
        }
        
        // Si no es GET ni POST, devolver un error
        return res.status(405).send({ error: `Method ${req.method} not allowed.` });

    } catch (err) {
        console.error('--- ERROR EN AUTH-HANDLER ---', { message: err.message, stack: err.stack });
        return res.status(500).send({ error: 'Ocurrió un error interno.', details: err.message });
    }
});