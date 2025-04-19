// Servicio para interactuar con la API del backend
const API_URL = process.env.REACT_APP_API_URL || 'https://sistema-de-prestamos-zeqj.onrender.com/api';

// Servicio para interactuar con la API del backend
const ApiService = {
  // Almacenar token en localStorage (solo para autenticación)
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  // Obtener token de localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  },

  // Configuración para las peticiones con autenticación
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Iniciar sesión
  async login(usuario, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario, password })
      });

      const data = await response.json();
      
      if (data.success) {
        // Guardar token en localStorage
        this.setAuthToken(data.token);
        // Guardar usuario en localStorage para acceso rápido
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  },
  
  // Cerrar sesión
  logout() {
    try {
      // Eliminar token y usuario del localStorage
      this.setAuthToken(null);
      localStorage.removeItem('currentUser');
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, message: 'Error al cerrar sesión' };
    }
  },
  
  // Verificar token de autenticación
  async verificarToken() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, message: 'No autorizado' };
      }
      
      // Verificar si hay un usuario en localStorage
      const cachedUser = localStorage.getItem('currentUser');
      if (cachedUser) {
        // Usar usuario en caché para respuesta rápida
        return { success: true, user: JSON.parse(cachedUser) };
      }
      
      // Si no hay usuario en caché, verificar con el servidor
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar usuario en localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        // Limpiar token inválido
        this.setAuthToken(null);
        return { success: false, message: data.message || 'Token inválido' };
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      return { success: false, message: 'Error de autenticación' };
    }
  },
  
  // Obtener usuario actual
  async getUsuarioActual() {
    const auth = await this.verificarToken();
    if (!auth.success) {
      return null;
    }
    return auth.user;
  },
  
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { success: false, message: 'Error al obtener usuarios' };
    }
  },
  
  // Obtener todos los vales
  async getVales() {
    try {
      const response = await fetch(`${API_URL}/vales`, {
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener vales:', error);
      return { success: false, message: 'Error al obtener vales' };
    }
  },
  
  // Buscar vales con filtros
  async buscarVales(filtros) {
    try {
      // Construir query string a partir de filtros
      const queryParams = new URLSearchParams();
      
      if (filtros.estado && filtros.estado !== 'todos') {
        queryParams.append('estado', filtros.estado);
      }
      
      if (filtros.localId) {
        queryParams.append('localOrigen', filtros.localId);
        queryParams.append('localDestino', filtros.localId);
      }
      
      if (filtros.fechaDesde) {
        queryParams.append('fechaDesde', filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        queryParams.append('fechaHasta', filtros.fechaHasta);
      }
      
      const response = await fetch(`${API_URL}/vales/buscar?${queryParams.toString()}`, {
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error al buscar vales:', error);
      return { success: false, message: 'Error al buscar vales' };
    }
  },
  
  // Marcar vale como pagado
  async marcarComoPagado(valeId) {
    try {
      const response = await fetch(`${API_URL}/vales/${valeId}/pagar`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      return { success: false, message: 'Error al actualizar vale' };
    }
  },
  
  // Exportar vales a CSV
  async exportarValesCSV() {
    try {
      const response = await fetch(`${API_URL}/vales/exportar`, {
        headers: this.getAuthHeaders()
      });
      
      const csv = await response.text();
      return { success: true, csv };
    } catch (error) {
      console.error('Error al exportar vales:', error);
      return { success: false, message: 'Error al exportar vales' };
    }
  },
  
  // Crear un nuevo vale
  async crearVale(valeData) {
    try {
      const response = await fetch(`${API_URL}/vales`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(valeData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear vale:', error);
      return { success: false, message: 'Error al crear vale' };
    }
  }
};

export default ApiService;
