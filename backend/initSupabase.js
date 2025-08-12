const { supabase } = require('./supabase');
const bcrypt = require('bcrypt');

// ✅ SEGURO: Datos de los locales SIN contraseñas hardcodeadas
const localesIniciales = [
  { nombre: 'Local Central', usuario: 'central' },
  { nombre: 'Local Norte', usuario: 'norte' },
  { nombre: 'Local Sur', usuario: 'sur' },
  { nombre: 'Local Este', usuario: 'este' },
  { nombre: 'Local Oeste', usuario: 'oeste' },
  { nombre: 'Local Centro', usuario: 'centro' }
];

// ✅ SEGURO: Función para obtener contraseñas de variables de entorno
function getPassword(usuario) {
  const envVar = `PASSWORD_${usuario.toUpperCase()}`;
  const password = process.env[envVar];
  
  if (!password) {
    console.error(`❌ Error: Falta variable de entorno ${envVar}`);
    console.log(`💡 Solución: Definir en Render: ${envVar}=tu_contraseña_segura`);
    return null;
  }
  
  if (password.length < 8) {
    console.error(`❌ Error: La contraseña para ${usuario} debe tener al menos 8 caracteres`);
    return null;
  }
  
  return password;
}

async function inicializarSupabase() {
  try {
    console.log('🚀 Iniciando configuración SEGURA de Supabase...');

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

    // Verificar que todas las variables de entorno estén disponibles
    console.log('🔐 Verificando variables de entorno...');
    const missingPasswords = [];
    
    for (const local of localesIniciales) {
      const password = getPassword(local.usuario);
      if (!password) {
        missingPasswords.push(local.usuario);
      }
    }
    
    if (missingPasswords.length > 0) {
      console.error('❌ Error: Faltan variables de entorno para las contraseñas');
      console.log('💡 Define estas variables en Render:');
      missingPasswords.forEach(usuario => {
        console.log(`   PASSWORD_${usuario.toUpperCase()}=tu_contraseña_segura`);
      });
      console.log('\n🔧 Alternativamente, usa el script crear-usuarios-seguro.js');
      return;
    }

    // Insertar locales iniciales con contraseñas seguras
    console.log('👥 Insertando locales con contraseñas seguras...');
    
    for (const local of localesIniciales) {
      try {
        const password = getPassword(local.usuario);
        
        // Encriptar contraseña con salt fuerte
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

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

    console.log('🎉 Inicialización SEGURA de Supabase completada exitosamente');
    console.log('');
    console.log('📋 Usuarios creados (contraseñas en variables de entorno):');
    localesIniciales.forEach(local => {
      console.log(`   ${local.nombre}: usuario="${local.usuario}"`);
    });
    console.log('');
    console.log('🔒 Las contraseñas están protegidas en variables de entorno');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarSupabase()
    .then(() => {
      console.log('🏁 Script de inicialización SEGURO finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { inicializarSupabase };