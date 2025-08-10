const { supabase } = require('./supabase');
const bcrypt = require('bcrypt');

// Datos de los 6 locales iniciales
const localesIniciales = [
  { nombre: 'Local Central', usuario: 'central', password: 'central123' },
  { nombre: 'Local Norte', usuario: 'norte', password: 'norte123' },
  { nombre: 'Local Sur', usuario: 'sur', password: 'sur123' },
  { nombre: 'Local Este', usuario: 'este', password: 'este123' },
  { nombre: 'Local Oeste', usuario: 'oeste', password: 'oeste123' },
  { nombre: 'Local Centro', usuario: 'centro', password: 'centro123' }
];

async function inicializarSupabase() {
  try {
    console.log('🚀 Iniciando configuración de Supabase...');

    // Verificar conexión
    console.log('📡 Verificando conexión con Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Error al conectar con Supabase:', testError);
      return;
    }

    console.log('✅ Conexión con Supabase establecida correctamente');

    // Verificar si ya existen usuarios
    const { data: existingUsers, error: countError } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('❌ Error al verificar usuarios existentes:', countError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log(`ℹ️  Ya existen ${existingUsers.length} usuarios en la base de datos`);
      console.log('✅ Inicialización completada - no se requieren cambios');
      return;
    }

    // Insertar locales iniciales
    console.log('👥 Insertando locales iniciales...');
    
    for (const local of localesIniciales) {
      try {
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(local.password, salt);

        const { data, error } = await supabase
          .from('usuarios')
          .insert([{
            nombre: local.nombre,
            usuario: local.usuario,
            password: hashedPassword
          }])
          .select()
          .single();

        if (error) {
          console.error(`❌ Error al insertar ${local.nombre}:`, error);
        } else {
          console.log(`✅ ${local.nombre} insertado correctamente (ID: ${data.id})`);
        }
      } catch (localError) {
        console.error(`❌ Error al procesar ${local.nombre}:`, localError);
      }
    }

    console.log('🎉 Inicialización de Supabase completada exitosamente');
    console.log('');
    console.log('📋 Credenciales de los locales:');
    localesIniciales.forEach(local => {
      console.log(`   ${local.nombre}: usuario="${local.usuario}", password="${local.password}"`);
    });

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarSupabase()
    .then(() => {
      console.log('🏁 Script de inicialización finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { inicializarSupabase };

