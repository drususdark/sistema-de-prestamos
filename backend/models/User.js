const { supabase } = require('../supabase');
const bcrypt = require('bcrypt');

class User {
  // Buscar usuario por nombre de usuario
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', username)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error al buscar usuario por username:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios (locales)
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, creado_en')
        .order('nombre');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  static async create(userData) {
    try {
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nombre: userData.nombre,
          usuario: userData.usuario,
          password: hashedPassword
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Retornar sin la contraseña
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    try {
      const updateData = { ...userData };
      
      // Si se proporciona una nueva contraseña, encriptarla
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Retornar sin la contraseña
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

module.exports = User;

