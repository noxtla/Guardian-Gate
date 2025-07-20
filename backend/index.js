// backend/index.js
require('dotenv').config(); 

// 1. Importamos las herramientas que instalamos.
const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');

// --- ¡IMPORTANTE! ---
// 2. Configuración de Supabase (Temporal para Pruebas Locales)
// Para probar localmente de forma rápida, pondremos las credenciales aquí.
// NUNCA subas este archivo a un repositorio con claves reales.
// En un paso posterior, reemplazaremos esto con una llamada segura a Secret Manager.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

//const SUPABASE_URL = 'https://ebkcvjkrjwckqcwyukeq.supabase.co'; // <-- Reemplaza con tu Project URL de Supabase
//const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVia2N2amtyandja3Fjd3l1a2VxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2NjQwOSwiZXhwIjoyMDY4NTQyNDA5fQ.Tv82NWpmHTaPFT7oDuwStCFuI8JeN5ZrBEOaz8W1ssk'; // <-- Reemplaza con tu clave 'service_role'

// 3. Creamos el cliente de Supabase una sola vez.
// Esto nos permitirá hacer consultas a nuestra base de datos.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Esta es nuestra función principal. Se registrará como un endpoint HTTP.
 * 'req' (request) contiene la información de la llamada entrante.
 * 'res' (response) es lo que usamos para enviar una respuesta.
 */
const authHandler = async (req, res) => {
  // 4. Medida de seguridad básica: Solo aceptamos peticiones POST.
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  try {
    // 5. Extraemos los datos que nos envía la app móvil desde el cuerpo (body) de la petición.
    const { action, phoneNumber } = req.body;

    // 6. Verificamos la acción solicitada. Por ahora, solo conocemos 'check-phone'.
    if (action === 'check-phone') {
      
      // Validamos que el número de teléfono fue enviado.
      if (!phoneNumber) {
        return res.status(400).send({ error: 'phoneNumber is required' });
      }

      // 7. Hacemos la consulta a Supabase.
      // Le pedimos que busque en la tabla 'auth_users'.
      const { data, error } = await supabase
        .from('auth_users') // Desde la tabla optimizada...
        .select('status_name') // ...selecciona solo el estado (es todo lo que necesitamos saber)...
        .eq('phone_number', phoneNumber) // ...donde el 'phone_number' coincida...
        .single(); // ...y esperamos solo UN resultado (o ninguno).

      // 8. Manejamos los posibles errores de la base de datos.
      if (error && error.code !== 'PGRST116') {
        // 'PGRST116' es el código para "no se encontró la fila", lo cual no es un error para nosotros.
        // Cualquier otro error sí es un problema del servidor.
        console.error('Supabase error:', error);
        return res.status(500).send({ error: 'Database query failed' });
      }
      
      // 9. Lógica de negocio: Verificamos si se encontró el usuario y si está activo.
      const userIsActive = !!(data && data.status_name === 'Active');

      // 10. Enviamos la respuesta exitosa a la app.
      // La app sabrá si puede continuar con el login basado en 'userFound'.
      return res.status(200).send({
        status: 'success',
        userFound: userIsActive,
      });

    } else {
      // Si la acción no es 'check-phone', devolvemos un error.
      return res.status(400).send({ error: 'Unknown action' });
    }

  } catch (err) {
    // Capturamos cualquier otro error inesperado (ej. si el body no es JSON).
    console.error('Unexpected error:', err);
    return res.status(500).send({ error: 'An unexpected error occurred' });
  }
};

// 11. Registramos nuestra función 'authHandler' con el Functions Framework.
// Le damos el nombre 'auth-handler' y le decimos que es una función HTTP.
functions.http('auth-handler', authHandler);