import ApiService from './ApiService';

// Servicio para gestionar vales
const valesService = {
  // Obtener todos los vales
  async obtenerVales() {
    try {
      console.log('Obteniendo vales desde el servicio');
      const response = await ApiService.getVales();
      console.log('Respuesta de obtenerVales:', response);
      
      if (!response || !response.success) {
        console.error('Error al obtener vales:', response?.message || 'Respuesta vacía');
        return { 
          success: false, 
          message: response?.message || 'Error al obtener vales', 
          vales: [] 
        };
      }
      
      return {
        success: true,
        vales: response.vales || []
      };
    } catch (error) {
      console.error('Error en obtenerVales:', error);
      return { 
        success: false, 
        message: 'Error al obtener vales: ' + error.message,
        vales: [] 
      };
    }
  },
  
  // Buscar vales con filtros
  async buscarVales(filtros) {
    try {
      const response = await ApiService.buscarVales(filtros);
      
      if (!response || !response.success) {
        return { 
          success: false, 
          message: response?.message || 'Error al buscar vales', 
          vales: [] 
        };
      }
      
      return {
        success: true,
        vales: response.vales || []
      };
    } catch (error) {
      console.error('Error en buscarVales:', error);
      return { 
        success: false, 
        message: 'Error al buscar vales: ' + error.message,
        vales: [] 
      };
    }
  },
  
  // Marcar vale como pagado
  async marcarComoPagado(valeId) {
    try {
      const response = await ApiService.marcarComoPagado(valeId);
      
      if (!response || !response.success) {
        return { 
          success: false, 
          message: response?.message || 'Error al marcar vale como pagado'
        };
      }
      
      return {
        success: true,
        message: 'Vale marcado como pagado exitosamente'
      };
    } catch (error) {
      console.error('Error en marcarComoPagado:', error);
      return { 
        success: false, 
        message: 'Error al marcar vale como pagado: ' + error.message
      };
    }
  },
  
  // Exportar vales a CSV
  async exportarVales() {
    try {
      const response = await ApiService.exportarValesCSV();
      
      if (!response || !response.success) {
        console.error('Error al exportar vales:', response?.message || 'Respuesta vacía');
        return { 
          success: false, 
          message: response?.message || 'Error al exportar vales'
        };
      }
      
      // Crear un blob con el contenido CSV
      const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8;' });
      
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vales_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Simular clic para descargar
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Vales exportados exitosamente'
      };
    } catch (error) {
      console.error('Error en exportarVales:', error);
      return { 
        success: false, 
        message: 'Error al exportar vales: ' + error.message
      };
    }
  },
  
  // Crear un nuevo vale
  async crearVale(valeData) {
    try {
      console.log('Creando vale con datos:', valeData);
      const response = await ApiService.crearVale(valeData);
      console.log('Respuesta de crearVale:', response);
      
      if (!response || !response.success) {
        console.error('Error al crear vale:', response?.message || 'Respuesta vacía');
        return { 
          success: false, 
          message: response?.message || 'Error al crear vale'
        };
      }
      
      return {
        success: true,
        message: 'Vale creado exitosamente',
        vale: response.vale
      };
    } catch (error) {
      console.error('Error en crearVale:', error);
      return { 
        success: false, 
        message: 'Error al crear vale: ' + error.message
      };
    }
  }
};

export default valesService;
