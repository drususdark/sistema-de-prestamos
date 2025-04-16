// Script para inicializar la base de datos con datos de prueba
const { initDb, insertarLocalesIniciales } = require('./database');
const bcrypt = require('bcrypt');

// Inicializar la base de datos
initDb();

// Función para encriptar contraseñas
const encriptarPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Crear los 6 locales iniciales
const crearLocalesIniciales = async () => {
  try {
    // Encriptar las contraseñas
    const password1 = await encriptarPassword('local1');
    const password2 = await encriptarPassword('local2');
    const password3 = await encriptarPassword('local3');
    const password4 = await encriptarPassword('local4');
    const password5 = await encriptarPassword('local5');
    const password6 = await encriptarPassword('local6');

    const locales = [
      { nombre: 'Local 1', usuario: 'local1', password: password1 },
      { nombre: 'Local 2', usuario: 'local2', password: password2 },
      { nombre: 'Local 3', usuario: 'local3', password: password3 },
      { nombre: 'Local 4', usuario: 'local4', password: password4 },
      { nombre: 'Local 5', usuario: 'local5', password: password5 },
      { nombre: 'Local 6', usuario: 'local6', password: password6 }
    ];

    insertarLocalesIniciales(locales);
    console.log('Locales iniciales creados correctamente');
  } catch (error) {
    console.error('Error al crear locales iniciales:', error);
  }
};

// Ejecutar la inicialización
crearLocalesIniciales();
