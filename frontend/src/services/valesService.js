import LocalStorageService from '../services/LocalStorageService';

// Servicio para interactuar con los vales (ahora usando localStorage)
const valesService = {
  // Crear un nuevo vale
  crearVale: async (valeData) => {
    try {
      const response = LocalStorageService.crearVale(valeData);
      return response;
    } catch (error) {
      console.error('Error al crear vale:', error);
      throw error;
    }
  },

  // Obtener todos los vales
  obtenerVales: async () => {
    try {
      const response = LocalStorageService.getVales();
      return response;
    } catch (error) {
      console.error('Error al obtener vales:', error);
      throw error;
    }
  },

  // Buscar vales con filtros
  buscarVales: async (filtros) => {
    try {
      const response = LocalStorageService.buscarVales(filtros);
      return response;
    } catch (error) {
      console.error('Error al buscar vales:', error);
      throw error;
    }
  },

  // Marcar vale como pagado
  marcarComoPagado: async (valeId) => {
    try {
      const response = LocalStorageService.marcarComoPagado(valeId);
      return response;
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      throw error;
    }
  },

  // Exportar vales a CSV
  exportarVales: () => {
    try {
      const response = LocalStorageService.exportarValesCSV();
      if (response.success) {
        // Crear un blob con el contenido CSV
        const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Crear un enlace para descargar
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'vales.csv');
        document.body.appendChild(link);
        
        // Simular clic para descargar
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al exportar vales:', error);
      throw error;
    }
  }
};

export default valesService;
