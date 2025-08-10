const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return false;
    }
    console.log('Conexión con Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};

