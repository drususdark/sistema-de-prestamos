// Versión corregida del script de prueba
const { initDb } = require('./database');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Vale = require('./models/Vale');

// Inicializar la base de datos
console.log('Inicializando base de datos para pruebas...');
initDb();

// Función para encriptar contraseñas
const encriptarPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Crear los 6 locales de prueba
const crearLocalesPrueba = async () => {
  try {
    console.log('Creando locales de prueba...');
    
    // Crear locales directamente con el modelo User
    const locales = [
      { nombre: 'Local 1', usuario: 'local1', password: 'local1' },
      { nombre: 'Local 2', usuario: 'local2', password: 'local2' },
      { nombre: 'Local 3', usuario: 'local3', password: 'local3' },
      { nombre: 'Local 4', usuario: 'local4', password: 'local4' },
      { nombre: 'Local 5', usuario: 'local5', password: 'local5' },
      { nombre: 'Local 6', usuario: 'local6', password: 'local6' }
    ];

    // Crear cada local usando el modelo User
    for (const local of locales) {
      await User.create(local);
    }
    
    console.log('Locales de prueba creados correctamente');
    return locales;
  } catch (error) {
    console.error('Error al crear locales de prueba:', error);
    throw error;
  }
};

// Crear vales de prueba
const crearValesPrueba = async () => {
  try {
    console.log('Creando vales de prueba...');
    
    // Obtener IDs de los locales
    const local1 = await User.findByUsername('local1');
    const local2 = await User.findByUsername('local2');
    const local3 = await User.findByUsername('local3');
    
    if (!local1 || !local2 || !local3) {
      throw new Error('No se encontraron los locales necesarios para las pruebas');
    }
    
    // Crear vales de prueba
    const vales = [
      {
        fecha: '2025-04-10',
        local_origen_id: local1.id,
        local_destino_id: local2.id,
        persona_responsable: 'Juan Pérez'
      },
      {
        fecha: '2025-04-12',
        local_origen_id: local2.id,
        local_destino_id: local3.id,
        persona_responsable: 'María González'
      },
      {
        fecha: '2025-04-15',
        local_origen_id: local3.id,
        local_destino_id: local1.id,
        persona_responsable: 'Carlos Rodríguez'
      }
    ];
    
    const items = [
      ['Caja de herramientas', 'Taladro eléctrico', 'Juego de destornilladores'],
      ['Impresora láser', 'Cartuchos de tinta', 'Resma de papel A4'],
      ['Monitor 24"', 'Teclado inalámbrico', 'Mouse óptico']
    ];
    
    // Guardar los vales en la base de datos
    for (let i = 0; i < vales.length; i++) {
      await Vale.create(vales[i], items[i]);
    }
    
    console.log('Vales de prueba creados correctamente');
  } catch (error) {
    console.error('Error al crear vales de prueba:', error);
    throw error;
  }
};

// Probar la búsqueda de vales
const probarBusquedaVales = async () => {
  try {
    console.log('Probando búsqueda de vales...');
    
    // Buscar todos los vales
    const todosLosVales = await Vale.getAll();
    console.log(`Se encontraron ${todosLosVales.length} vales en total`);
    
    // Buscar vales con filtros
    const local1 = await User.findByUsername('local1');
    
    if (local1) {
      const filtros = {
        localOrigen: local1.id
      };
      
      const valesFiltrados = await Vale.buscarVales(filtros);
      console.log(`Se encontraron ${valesFiltrados.length} vales del Local 1`);
    }
    
    // Buscar vales por mercadería
    const filtrosMercaderia = {
      mercaderia: 'Taladro'
    };
    
    const valesPorMercaderia = await Vale.buscarVales(filtrosMercaderia);
    console.log(`Se encontraron ${valesPorMercaderia.length} vales con "Taladro" en la mercadería`);
    
    console.log('Pruebas de búsqueda completadas correctamente');
  } catch (error) {
    console.error('Error al probar búsqueda de vales:', error);
    throw error;
  }
};

// Ejecutar todas las pruebas
const ejecutarPruebas = async () => {
  try {
    console.log('Iniciando pruebas de la aplicación...');
    
    await crearLocalesPrueba();
    await crearValesPrueba();
    await probarBusquedaVales();
    
    console.log('Todas las pruebas completadas correctamente');
    console.log('La aplicación está lista para ser utilizada');
  } catch (error) {
    console.error('Error durante las pruebas:', error);
  }
};

// Ejecutar las pruebas
ejecutarPruebas();
