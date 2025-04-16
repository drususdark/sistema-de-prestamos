const { db } = require('../database');
const bcrypt = require('bcrypt');

class User {
  // Buscar usuario por nombre de usuario
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM usuarios WHERE usuario = ?', [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  // Buscar usuario por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM usuarios WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  // Obtener todos los usuarios (locales)
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, nombre, usuario, creado_en FROM usuarios', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Crear un nuevo usuario
  static create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        db.run(
          'INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)',
          [userData.nombre, userData.usuario, hashedPassword],
          function(err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...userData, password: undefined });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
