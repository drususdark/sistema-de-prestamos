// Servicio para interactuar con la API del backend
// URL AUTOCONFIGURADA - Maneja URLs con y sin /api automáticamente
let API_URL = process.env.REACT_APP_API_URL || 'https://sistema-de-prestamos-jkbk.onrender.com';

// Auto-corregir URL si no termina en /api
if (!API_URL.endsWith('/api')) {
  API_URL += '/api';
}

// DEBUG: Verificar configuración
console.log('🔧 Variable de entorno original:', process.env.REACT_APP_API_URL);
console.log('🔧 URL final de API:', API_URL);

// Servicio para interactuar con la API del backend
const ApiService = {
  // Almacenar token en localStorage (solo para autenticación)
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token guardado en localStorage:', token.substring(0, 15) + '...');
    } else {
      localStorage.removeItem('token');
      console.log('Token eliminado de localStorage');
    }
  },

  // Obtener token de localStorage
  getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('Token obtenido de localStorage:', token ? (token.substring(0, 15) + '...') : 'null');
    return token;
  },

  // Configuración para las peticiones con autenticación
  getAuthHeaders() {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Headers de autenticación configurados con token');
    } else {
      console.log('Headers de autenticación configurados sin token');
    }
    
    return headers;
  },

  // Iniciar sesión - IMPLEMENTACIÓN MEJORADA
  async login(usuario, password) {
    try {
      // Usar URL de la variable de configuración
      const loginUrl = `${API_URL}/auth/login`;
      console.log(`Intentando iniciar sesión en URL: ${loginUrl}`);
      console.log(`Datos de login: usuario=${usuario}, password=****`);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ usuario, password })
      });

      console.log(`Respuesta del servidor: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error de servidor: ${response.status} ${response.statusText}`);
        // Intentar leer el cuerpo de la respuesta incluso si hay error
        try {
          const errorData = await response.json();
          console.error('Detalles del error:', errorData);
          return { 
            success: false, 
            message: errorData.message || `Error del servidor: ${response.status}` 
          };
        } catch (parseError) {
          return { 
            success: false, 
            message: `Error del servidor: ${response.status}` 
          };
        }
      }

      const data = await response.json();
      console.log('Respuesta de login procesada:', data.success ? 'éxito' : 'fallo');
      
      if (data.success && data.token) {
        // Guardar token en localStorage
        this.setAuthToken(data.token);
        // Guardar usuario en localStorage para acceso rápido
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        console.log('Usuario guardado en localStorage:', data.user);
      } else {
        console.error('Login fallido:', data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, message: 'Error al iniciar sesión: ' + error.message };
    }
  },
  
  // Cerrar sesión
  logout() {
    try {
      // Eliminar token y usuario del localStorage
      this.setAuthToken(null);
      localStorage.removeItem('currentUser');
      console.log('Sesión cerrada correctamente');
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
        console.log('No hay token para verificar');
        return { success: false, message: 'No autorizado' };
      }
      
      // Verificar si hay un usuario en localStorage
      const cachedUser = localStorage.getItem('currentUser');
      if (cachedUser) {
        // Usar usuario en caché para respuesta rápida
        console.log('Usuario encontrado en caché');
        return { success: true, user: JSON.parse(cachedUser) };
      }
      
      // Usar URL de la variable de configuración
      const userUrl = `${API_URL}/auth/user`;
      console.log(`Verificando token en URL: ${userUrl}`);
      
      // Si no hay usuario en caché, verificar con el servidor
      const response = await fetch(userUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Respuesta de verificación: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al verificar token: ${response.status}`);
        this.setAuthToken(null); // Limpiar token inválido
        return { success: false, message: 'Token inválido' };
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar usuario en localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        console.log('Usuario actualizado en localStorage:', data.user);
        return { success: true, user: data.user };
      } else {
        // Limpiar token inválido
        this.setAuthToken(null);
        console.error('Verificación fallida:', data.message);
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
      console.log('No hay usuario actual autenticado');
      return null;
    }
    console.log('Usuario actual:', auth.user);
    return auth.user;
  },
  
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      console.log(`Obteniendo usuarios desde: ${API_URL}/usuarios`);
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`Respuesta de getUsuarios: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al obtener usuarios: ${response.status}`);
        return { success: false, message: `Error al obtener usuarios: ${response.status}` };
      }
      
      const data = await response.json();
      console.log(`Usuarios obtenidos: ${data.success ? data.usuarios?.length || 0 : 0}`);
      return data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { success: false, message: 'Error al obtener usuarios' };
    }
  },
  
  // Obtener todos los vales
  async getVales() {
    try {
      console.log(`Obteniendo vales desde: ${API_URL}/vales`);
      const response = await fetch(`${API_URL}/vales`, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`Respuesta de getVales: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al obtener vales: ${response.status}`);
        return { success: false, message: `Error al obtener vales: ${response.status}` };
      }
      
      const data = await response.json();
      console.log(`Vales obtenidos: ${data.success ? data.vales?.length || 0 : 0}`);
      return data;
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
      
      const url = `${API_URL}/vales/buscar?${queryParams.toString()}`;
      console.log(`Buscando vales en: ${url}`);
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`Respuesta de buscarVales: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al buscar vales: ${response.status}`);
        return { success: false, message: `Error al buscar vales: ${response.status}` };
      }
      
      const data = await response.json();
      console.log(`Vales encontrados: ${data.success ? data.vales?.length || 0 : 0}`);
      return data;
    } catch (error) {
      console.error('Error al buscar vales:', error);
      return { success: false, message: 'Error al buscar vales' };
    }
  },
  
  // Marcar vale como pagado
  async marcarComoPagado(valeId) {
    try {
      const url = `${API_URL}/vales/${valeId}/pagar`;
      console.log(`Marcando vale como pagado: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      console.log(`Respuesta de marcarComoPagado: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al marcar vale como pagado: ${response.status}`);
        return { success: false, message: `Error al actualizar vale: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Vale marcado como pagado:', data.success);
      return data;
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      return { success: false, message: 'Error al actualizar vale' };
    }
  },
  
  // Exportar vales a CSV
  async exportarValesCSV() {
    try {
      console.log(`Exportando vales a CSV desde: ${API_URL}/vales/exportar`);
      
      const response = await fetch(`${API_URL}/vales/exportar`, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`Respuesta de exportarValesCSV: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al exportar vales: ${response.status}`);
        return { success: false, message: `Error al exportar vales: ${response.status}` };
      }
      
      const csv = await response.text();
      console.log('CSV generado correctamente');
      return { success: true, csv };
    } catch (error) {
      console.error('Error al exportar vales:', error);
      return { success: false, message: 'Error al exportar vales' };
    }
  },
  
  // Crear un nuevo vale
  async crearVale(valeData) {
    try {
      console.log(`Creando nuevo vale en: ${API_URL}/vales`);
      console.log('Datos del vale:', valeData);
      
      const response = await fetch(`${API_URL}/vales`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(valeData)
      });
      
      console.log(`Respuesta de crearVale: status=${response.status}`);
      
      if (!response.ok) {
        console.error(`Error al crear vale: ${response.status}`);
        return { success: false, message: `Error al crear vale: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Vale creado:', data.success);
      
      // Si el vale se creó correctamente, actualizar la lista de vales
      if (data.success) {
        console.log('Vale creado correctamente, actualizando lista de vales');
        // Aquí podríamos implementar alguna lógica para actualizar la lista de vales
        // o dejar que el componente que usa este servicio lo haga
      }
      
      return data;
    } catch (error) {
      console.error('Error al crear vale:', error);
      return { success: false, message: 'Error al crear vale' };
    }
  }
};

export default ApiService;
