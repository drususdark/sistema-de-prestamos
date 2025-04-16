const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio de la base de datos exista
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'prestamos.db');
const db = new sqlite3.Database(dbPath);

// Inicializar la base de datos con las tablas necesarias
const initDb = () => {
  db.serialize(() => {
    // Tabla de usuarios (locales)
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de vales de préstamo
    db.run(`
      CREATE TABLE IF NOT EXISTS vales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TIMESTAMP NOT NULL,
        local_origen_id INTEGER NOT NULL,
        local_destino_id INTEGER NOT NULL,
        persona_responsable TEXT NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (local_origen_id) REFERENCES usuarios (id),
        FOREIGN KEY (local_destino_id) REFERENCES usuarios (id)
      )
    `);

    // Tabla de items de mercadería en cada vale
    db.run(`
      CREATE TABLE IF NOT EXISTS items_mercaderia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vale_id INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        FOREIGN KEY (vale_id) REFERENCES vales (id) ON DELETE CASCADE
      )
    `);

    console.log('Base de datos inicializada correctamente');
  });
};

// Función para insertar los 6 locales iniciales (solo si no existen)
const insertarLocalesIniciales = (locales) => {
  const checkExistingUsers = () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  };

  checkExistingUsers()
    .then(count => {
      if (count === 0) {
        const stmt = db.prepare('INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)');
        
        locales.forEach(local => {
          stmt.run(local.nombre, local.usuario, local.password);
        });
        
        stmt.finalize();
        console.log('Locales iniciales insertados correctamente');
      } else {
        console.log('Ya existen usuarios en la base de datos, no se insertaron locales iniciales');
      }
    })
    .catch(err => console.error('Error al verificar usuarios existentes:', err));
};

module.exports = {
  db,
  initDb,
  insertarLocalesIniciales
};
