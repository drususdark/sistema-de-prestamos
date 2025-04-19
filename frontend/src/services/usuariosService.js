import ApiService from '../services/ApiService';

// Servicio para interactuar con los usuarios (usando API en lugar de localStorage)
const usuariosService = {
  // Obtener todos los usuarios/locales
  obtenerUsuarios: async () => {
    try {
      const response = await ApiService.getUsuarios();
      return response;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario actual
  obtenerUsuarioActual: async () => {
    try {
      return await ApiService.getUsuarioActual();
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }
};

export default usuariosService;
