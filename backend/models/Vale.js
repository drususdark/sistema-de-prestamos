const { db } = require('../database');

class Vale {
  // Crear un nuevo vale con sus items de mercadería
  static create(valeData, itemsMercaderia) {
    return new Promise((resolve, reject) => {
      // Iniciar transacción
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Insertar el vale
        db.run(
          'INSERT INTO vales (fecha, local_origen_id, local_destino_id, persona_responsable, estado) VALUES (?, ?, ?, ?, ?)',
          [valeData.fecha, valeData.local_origen_id, valeData.local_destino_id, valeData.persona_responsable, 'pendiente'],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            const valeId = this.lastID;
            
            // Preparar la inserción de items
            const stmt = db.prepare('INSERT INTO items_mercaderia (vale_id, descripcion) VALUES (?, ?)');
            
            // Insertar cada item de mercadería
            let hasError = false;
            itemsMercaderia.forEach(item => {
              stmt.run([valeId, item], (err) => {
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  stmt.finalize();
                  return reject(err);
                }
              });
            });
            
            stmt.finalize();
            
            if (!hasError) {
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                resolve({ id: valeId, ...valeData, estado: 'pendiente', items: itemsMercaderia });
              });
            }
          }
        );
      });
    });
  }

  // Obtener todos los vales con sus items
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          v.id, v.fecha, v.persona_responsable, v.estado, v.creado_en,
          origen.id as origen_id, origen.nombre as origen_nombre,
          destino.id as destino_id, destino.nombre as destino_nombre
        FROM vales v
        JOIN usuarios origen ON v.local_origen_id = origen.id
        JOIN usuarios destino ON v.local_destino_id = destino.id
        ORDER BY v.fecha DESC
      `;
      
      db.all(query, async (err, vales) => {
        if (err) return reject(err);
        
        try {
          // Para cada vale, obtener sus items de mercadería
          const valesConItems = await Promise.all(vales.map(async (vale) => {
            const items = await this.getItemsByValeId(vale.id);
            return {
              ...vale,
              items
            };
          }));
          
          resolve(valesConItems);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Obtener items de mercadería por ID de vale
  static getItemsByValeId(valeId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, descripcion FROM items_mercaderia WHERE vale_id = ?',
        [valeId],
        (err, items) => {
          if (err) return reject(err);
          resolve(items);
        }
      );
    });
  }

  // Buscar vales con filtros
  static buscarVales(filtros) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          v.id, v.fecha, v.persona_responsable, v.estado, v.creado_en,
          origen.id as origen_id, origen.nombre as origen_nombre,
          destino.id as destino_id, destino.nombre as destino_nombre
        FROM vales v
        JOIN usuarios origen ON v.local_origen_id = origen.id
        JOIN usuarios destino ON v.local_destino_id = destino.id
        LEFT JOIN items_mercaderia im ON v.id = im.vale_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Aplicar filtros si existen
      if (filtros.fechaDesde) {
        query += ' AND v.fecha >= ?';
        params.push(filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        query += ' AND v.fecha <= ?';
        params.push(filtros.fechaHasta);
      }
      
      if (filtros.localOrigen) {
        query += ' AND v.local_origen_id = ?';
        params.push(filtros.localOrigen);
      }
      
      if (filtros.localDestino) {
        query += ' AND v.local_destino_id = ?';
        params.push(filtros.localDestino);
      }
      
      if (filtros.mercaderia) {
        query += ' AND im.descripcion LIKE ?';
        params.push(`%${filtros.mercaderia}%`);
      }
      
      if (filtros.estado) {
        query += ' AND v.estado = ?';
        params.push(filtros.estado);
      }
      
      // Agrupar por ID de vale para evitar duplicados por items
      query += ' GROUP BY v.id ORDER BY v.fecha DESC';
      
      db.all(query, params, async (err, vales) => {
        if (err) return reject(err);
        
        try {
          // Para cada vale, obtener sus items de mercadería
          const valesConItems = await Promise.all(vales.map(async (vale) => {
            const items = await this.getItemsByValeId(vale.id);
            return {
              ...vale,
              items
            };
          }));
          
          resolve(valesConItems);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Marcar un vale como pagado
  static marcarComoPagado(valeId, usuarioId) {
    return new Promise((resolve, reject) => {
      // Primero verificar que el usuario es el dueño del vale
      db.get(
        'SELECT * FROM vales WHERE id = ? AND local_origen_id = ?',
        [valeId, usuarioId],
        (err, vale) => {
          if (err) return reject(err);
          
          if (!vale) {
            return reject(new Error('No tienes permiso para modificar este vale o el vale no existe'));
          }
          
          // Actualizar el estado del vale
          db.run(
            'UPDATE vales SET estado = ? WHERE id = ?',
            ['pagado', valeId],
            function(err) {
              if (err) return reject(err);
              resolve({ success: true, message: 'Vale marcado como pagado' });
            }
          );
        }
      );
    });
  }
}

module.exports = Vale;
