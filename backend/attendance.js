// backend/attendance.js
// Handler para la Google Cloud Function 'attendance-handler'

require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// --- Bloque de Configuración y Secretos (Reutilizado) ---
const secretManagerClient = new SecretManagerServiceClient();
let SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET;

async function loadSecrets() {
    if (SUPABASE_URL) return; // Evita recargar si ya están en memoria
    const projectId = process.env.GCP_PROJECT || 'gateway-r9gl0';
    console.log(`Cargando secretos para el proyecto: ${projectId}`);
    const secretsToLoad = {
        SUPABASE_URL: `projects/${projectId}/secrets/SUPABASE_URL/versions/latest`,
        SUPABASE_SERVICE_KEY: `projects/${projectId}/secrets/SUPABASE_SERVICE_KEY/versions/latest`,
        JWT_SECRET: `projects/${projectId}/secrets/JWT_SECRET_KEY/versions/latest`,
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
    } catch (error) {
        console.error("CRÍTICO: El proceso de carga de secretos falló.", error);
        throw error;
    }
}

// --- Función de Utilidad para Autenticación (Reutilizada) ---
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
        // Usamos el JWT_SECRET cargado para verificar el token
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

// --- Handler Principal de la Función de Asistencia ---
functions.http('attendance-handler', async (req, res) => {
    try {
        // Configuración de CORS
        res.set('Access-control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') { return res.status(204).send(''); }

        // Carga de secretos y cliente de Supabase
        await loadSecrets();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        const { action } = req.body;
        console.log(`\n\n--- Petición de Asistencia --- Acción: ${action}`);

        if (action === 'get-attendance-status') {
            const decodedToken = verifyToken(req); // Requiere autenticación
            console.log(`[get-attendance-status] Enviando estado para usuario: ${decodedToken.userId}`);

            // Lógica de backend real consultaría la DB para el geofence y usaría
            // la hora del servidor para determinar si la ventana está abierta.
            const isWindowOpen = true; // Hardcoded para pruebas
            const response = {
                serverTimeUTC: new Date().toISOString(),
                isWindowOpen: isWindowOpen,
                windowEndTimeUTC: isWindowOpen 
                    ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
                    : new Date().toISOString(),
                geofence: {
                    latitude: 39.954863,
                    longitude: -83.127586,
                    radius: 150,
                },
            };
            return res.status(200).send(response);
        
        } else if (action === 'post-check-in') {
            const decodedToken = verifyToken(req); // Requiere autenticación
            const { userId } = decodedToken;
            const { latitude, longitude } = req.body;
            
            console.log(`[post-check-in] Recibido check-in de usuario ${userId} en coords: ${latitude}, ${longitude}`);
            
            // Lógica de backend real guardaría el check-in en la base de datos
            // asociado al `userId` del token. Por ejemplo:
            // await supabase.from('attendance_records').insert({ user_id: userId, lat: latitude, lon: longitude });
            
            const response = {
                status: 'success',
                message: 'Attendance recorded successfully by the server.',
                checkedInAt: new Date().toISOString(),
            };
            return res.status(200).send(response);
            
        } else {
            return res.status(400).send({ error: 'Acción de asistencia desconocida.' });
        }

    } catch (err) {
        console.error('--- ERROR EN ATTENDANCE-HANDLER ---', { message: err.message, stack: err.stack });
        // Devuelve un error genérico para no exponer detalles de implementación
        return res.status(500).send({ error: 'Ocurrió un error interno.', details: err.message });
    }
});