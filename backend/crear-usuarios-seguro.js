#!/usr/bin/env node

/**
 * SCRIPT SEGURO - Creación de Usuarios
 * ====================================
 * 
 * Este script NO contiene contraseñas hardcodeadas.
 * Las contraseñas se leen de variables de entorno o se solicitan al usuario.
 * 
 * IMPORTANTE: Este es el método CORRECTO y SEGURO para manejar credenciales.
 */

const { supabase } = require('./supabase');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Interfaz para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function preguntarContrasena(usuario) {
  return new Promise((resolve) => {
    rl.question(`Ingrese contraseña segura para usuario '${usuario}': `, (password) => {
      resolve(password);
    });
  });
}

async function crearUsuarioSeguro(nombre, usuario) {
  try {
    // Opción 1: Leer de variable de entorno (MÁS SEGURO)
    let password = process.env[`PASSWORD_${usuario.toUpperCase()}`];
    
    // Opción 2: Si no hay variable de entorno, solicitar al usuario
    if (!password) {
      console.log(`\n🔐 No se encontró variable de entorno PASSWORD_${usuario.toUpperCase()}`);
      password = await preguntarContrasena(usuario);
    }
    
    if (!password || password.length < 8) {
      console.log(`❌ Error: La contraseña para '${usuario}' debe tener al menos 8 caracteres`);
      return false;
    }
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(12); // Usar sal más fuerte
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear usuario en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: nombre,
        usuario: usuario,
        password: hashedPassword
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Duplicate key
        console.log(`⚠️  Usuario '${usuario}' ya existe, actualizando contraseña...`);
        
        // Actualizar contraseña existente
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ password: hashedPassword })
          .eq('usuario', usuario);
        
        if (updateError) {
          console.log(`❌ Error al actualizar usuario '${usuario}':`, updateError.message);
          return false;
        }
        
        console.log(`✅ Contraseña actualizada para usuario '${usuario}'`);
      } else {
        console.log(`❌ Error al crear usuario '${usuario}':`, error.message);
        return false;
      }
    } else {
      console.log(`✅ Usuario '${usuario}' creado correctamente (ID: ${data.id})`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error al procesar usuario '${usuario}':`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔒 Script Seguro de Creación de Usuarios');
  console.log('======================================\n');
  
  console.log('💡 MÉTODOS SEGUROS para definir contraseñas:');
  console.log('   1. Variables de entorno: PASSWORD_CENTRAL=tu_contraseña_segura');
  console.log('   2. Input manual (se solicitará durante ejecución)');
  console.log('   3. Archivo .env (solo para desarrollo local)\n');
  
  // Verificar conexión
  try {
    const { error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Error de conexión con Supabase:', error.message);
      process.exit(1);
    }
    console.log('✅ Conexión con Supabase establecida\n');
  } catch (error) {
    console.log('❌ Error fatal de conexión:', error.message);
    process.exit(1);
  }
  
  // Definir usuarios que necesitas (SIN CONTRASEÑAS)
  const usuariosACrear = [
    { nombre: 'Local Central', usuario: 'central' },
    { nombre: 'Local Norte', usuario: 'norte' },
    { nombre: 'Local Sur', usuario: 'sur' },
    { nombre: 'Local Este', usuario: 'este' },
    { nombre: 'Local Oeste', usuario: 'oeste' },
    { nombre: 'Local Centro', usuario: 'centro' }
  ];
  
  console.log('👥 Usuarios a crear/actualizar:');
  usuariosACrear.forEach(u => console.log(`   - ${u.nombre} (${u.usuario})`));
  console.log('');
  
  // Crear cada usuario de forma segura
  for (const userData of usuariosACrear) {
    await crearUsuarioSeguro(userData.nombre, userData.usuario);
  }
  
  console.log('\n🎉 Proceso completado');
  console.log('\n📋 Verificación final...');
  
  // Mostrar usuarios creados (SIN CONTRASEÑAS)
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario, creado_en')
      .order('id');
    
    if (error) {
      console.log('❌ Error al verificar usuarios:', error.message);
    } else {
      console.log('\n✅ Usuarios en base de datos:');
      usuarios.forEach(u => {
        console.log(`   ${u.id}. ${u.nombre} (${u.usuario}) - Creado: ${new Date(u.creado_en).toLocaleDateString()}`);
      });
    }
  } catch (error) {
    console.log('❌ Error en verificación:', error.message);
  }
  
  rl.close();
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🏁 Script finalizado de forma segura');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { crearUsuarioSeguro };