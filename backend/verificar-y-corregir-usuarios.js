#!/usr/bin/env node

/**
 * Script de Verificación y Corrección de Usuarios
 * Sistema de Préstamos entre Locales
 * 
 * Este script:
 * 1. Verifica la conexión con Supabase
 * 2. Examina los usuarios existentes
 * 3. Verifica si las contraseñas son válidas
 * 4. Corrige automáticamente los problemas encontrados
 */

const { supabase } = require('./supabase');
const bcrypt = require('bcrypt');

// Datos de los locales con contraseñas correctas
const localesCorrectos = [
  { nombre: 'Local Central', usuario: 'central', password: 'central123' },
  { nombre: 'Local Norte', usuario: 'norte', password: 'norte123' },
  { nombre: 'Local Sur', usuario: 'sur', password: 'sur123' },
  { nombre: 'Local Este', usuario: 'este', password: 'este123' },
  { nombre: 'Local Oeste', usuario: 'oeste', password: 'oeste123' },
  { nombre: 'Local Centro', usuario: 'centro', password: 'centro123' }
];

async function verificarConexion() {
  console.log('🔍 Verificando conexión con Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }

    console.log('✅ Conexión con Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error fatal de conexión:', error.message);
    return false;
  }
}

async function verificarUsuarios() {
  console.log('\\n👥 Verificando usuarios existentes...');
  
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id');

    if (error) {
      console.error('❌ Error al obtener usuarios:', error.message);
      return { usuarios: [], problemasEncontrados: [] };
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la base de datos');
      return { usuarios: [], problemasEncontrados: ['NO_USERS'] };
    }

    console.log(`📊 Encontrados ${usuarios.length} usuarios:`);
    
    const problemasEncontrados = [];
    
    for (const usuario of usuarios) {
      console.log(`\\n   🔍 Verificando usuario: ${usuario.usuario} (${usuario.nombre})`);
      
      // Buscar la contraseña correcta para este usuario
      const localCorrecto = localesCorrectos.find(l => l.usuario === usuario.usuario);
      
      if (!localCorrecto) {
        console.log(`   ⚠️  Usuario no reconocido: ${usuario.usuario}`);
        problemasEncontrados.push(`UNKNOWN_USER:${usuario.usuario}`);
        continue;
      }
      
      // Verificar si la contraseña es válida
      try {
        const esValida = await bcrypt.compare(localCorrecto.password, usuario.password);
        
        if (esValida) {
          console.log(`   ✅ Contraseña correcta para ${usuario.usuario}`);
        } else {
          console.log(`   ❌ Contraseña inválida para ${usuario.usuario}`);
          problemasEncontrados.push(`INVALID_PASSWORD:${usuario.usuario}`);
        }
      } catch (error) {
        console.log(`   ❌ Error al verificar contraseña de ${usuario.usuario}:`, error.message);
        problemasEncontrados.push(`BCRYPT_ERROR:${usuario.usuario}`);
      }
    }

    return { usuarios, problemasEncontrados };
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
    return { usuarios: [], problemasEncontrados: ['VERIFICATION_ERROR'] };
  }
}

async function corregirUsuarios(problemasEncontrados) {
  console.log('\\n🔧 Iniciando corrección de problemas...');
  
  if (problemasEncontrados.includes('NO_USERS')) {
    console.log('📝 Creando usuarios desde cero...');
    return await crearUsuariosDesdeRaiz();
  }
  
  // Corregir contraseñas inválidas
  const usuariosConProblemas = problemasEncontrados
    .filter(p => p.startsWith('INVALID_PASSWORD:'))
    .map(p => p.split(':')[1]);
  
  if (usuariosConProblemas.length > 0) {
    console.log(`🔑 Corrigiendo contraseñas para ${usuariosConProblemas.length} usuarios...`);
    
    for (const nombreUsuario of usuariosConProblemas) {
      await corregirContrasenaUsuario(nombreUsuario);
    }
  }
  
  return true;
}

async function corregirContrasenaUsuario(nombreUsuario) {
  try {
    const localCorrecto = localesCorrectos.find(l => l.usuario === nombreUsuario);
    
    if (!localCorrecto) {
      console.log(`   ⚠️  No se puede corregir usuario desconocido: ${nombreUsuario}`);
      return false;
    }
    
    // Hashear la contraseña correcta
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(localCorrecto.password, salt);
    
    // Actualizar en Supabase
    const { error } = await supabase
      .from('usuarios')
      .update({ password: hashedPassword })
      .eq('usuario', nombreUsuario);
    
    if (error) {
      console.log(`   ❌ Error al actualizar ${nombreUsuario}:`, error.message);
      return false;
    }
    
    console.log(`   ✅ Contraseña corregida para ${nombreUsuario}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error al corregir ${nombreUsuario}:`, error.message);
    return false;
  }
}

async function crearUsuariosDesdeRaiz() {
  console.log('🏗️  Creando usuarios desde raíz...');
  
  for (const local of localesCorrectos) {
    try {
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(local.password, salt);
      
      // Insertar usuario
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
        console.log(`   ❌ Error al crear ${local.nombre}:`, error.message);
      } else {
        console.log(`   ✅ ${local.nombre} creado correctamente (ID: ${data.id})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error al procesar ${local.nombre}:`, error.message);
    }
  }
  
  return true;
}

async function mostrarResultados() {
  console.log('\\n📋 Verificación final...');
  
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario')
      .order('id');
    
    if (error) {
      console.error('❌ Error en verificación final:', error.message);
      return;
    }
    
    console.log('\\n🎉 Usuarios disponibles para login:');
    console.log('================================================');
    
    for (const usuario of usuarios) {
      const localCorrecto = localesCorrectos.find(l => l.usuario === usuario.usuario);
      const password = localCorrecto ? localCorrecto.password : 'DESCONOCIDA';
      
      console.log(`   ${usuario.nombre}`);
      console.log(`   Usuario: ${usuario.usuario}`);
      console.log(`   Contraseña: ${password}`);
      console.log(`   ---`);
    }
    
    console.log('\\n✨ ¡Listo! Ahora puedes probar el login en tu aplicación.');
    console.log('💡 Recomendación: Prueba con usuario "central" y contraseña "central123"');
    
  } catch (error) {
    console.error('❌ Error en resultados:', error.message);
  }
}

async function main() {
  console.log('🚀 Script de Verificación y Corrección de Usuarios');
  console.log('==================================================\\n');
  
  // Verificar conexión
  const conexionOk = await verificarConexion();
  if (!conexionOk) {
    console.log('\\n❌ No se puede continuar sin conexión a Supabase');
    console.log('💡 Verifica tus variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  // Verificar usuarios
  const { usuarios, problemasEncontrados } = await verificarUsuarios();
  
  if (problemasEncontrados.length === 0) {
    console.log('\\n🎉 ¡Todo está perfecto! No se encontraron problemas.');
    await mostrarResultados();
    process.exit(0);
  }
  
  console.log(`\\n⚠️  Se encontraron ${problemasEncontrados.length} problemas:`);
  problemasEncontrados.forEach(problema => {
    console.log(`   - ${problema}`);
  });
  
  // Intentar corregir problemas
  const correccionExitosa = await corregirUsuarios(problemasEncontrados);
  
  if (correccionExitosa) {
    console.log('\\n✅ Corrección completada exitosamente');
    await mostrarResultados();
  } else {
    console.log('\\n❌ Hubo problemas durante la corrección');
    console.log('💡 Intenta ejecutar el script nuevamente o revisa los logs de Supabase');
  }
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\\n🏁 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verificarConexion, verificarUsuarios, corregirUsuarios };