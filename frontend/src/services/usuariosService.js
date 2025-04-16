import LocalStorageService from '../services/LocalStorageService';

// Servicio para interactuar con los usuarios (ahora usando localStorage)
const usuariosService = {
  // Obtener todos los usuarios/locales
  obtenerUsuarios: async () => {
    try {
      const response = LocalStorageService.getUsuarios();
      return response;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario actual
  obtenerUsuarioActual: () => {
    try {
      return LocalStorageService.getUsuarioActual();
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }
};

export default usuariosService;
