import ApiService from './ApiService';

// Servicio para gestionar vales
const valesService = {
  // Obtener todos los vales
  async getAll() {
    try {
      console.log('valesService: Obteniendo todos los vales');
      const response = await ApiService.getVales();
      console.log('valesService: Respuesta de getVales:', response);
      return response;
    } catch (error) {
      console.error('valesService: Error en getAll:', error);
      return { success: false, message: 'Error al obtener vales' };
    }
  },

  // Buscar vales con filtros
  async buscar(filtros) {
    try {
      console.log('valesService: Buscando vales con filtros:', filtros);
      const response = await ApiService.buscarVales(filtros);
      console.log('valesService: Respuesta de buscarVales:', response);
      return response;
    } catch (error) {
      console.error('valesService: Error en buscar:', error);
      return { success: false, message: 'Error al buscar vales' };
    }
  },

  // Crear un nuevo vale
  async crear(valeData) {
    try {
      console.log('valesService: Creando nuevo vale:', valeData);
      const response = await ApiService.crearVale(valeData);
      console.log('valesService: Respuesta de crearVale:', response);
      return response;
    } catch (error) {
      console.error('valesService: Error en crear:', error);
      return { success: false, message: 'Error al crear vale' };
    }
  },

  // Marcar un vale como pagado
  async marcarComoPagado(valeId) {
    try {
      console.log('valesService: Marcando vale como pagado, ID:', valeId);
      const response = await ApiService.marcarComoPagado(valeId);
      console.log('valesService: Respuesta de marcarComoPagado:', response);
      return response;
    } catch (error) {
      console.error('valesService: Error en marcarComoPagado:', error);
      return { success: false, message: 'Error al marcar vale como pagado' };
    }
  },

  // Exportar vales a CSV
  async exportarCSV() {
    try {
      console.log('valesService: Exportando vales a CSV');
      const response = await ApiService.exportarValesCSV();
      console.log('valesService: Respuesta de exportarValesCSV:', response);
      return response;
    } catch (error) {
      console.error('valesService: Error en exportarCSV:', error);
      return { success: false, message: 'Error al exportar vales' };
    }
  }
};

export default valesService;
