// Servicio para manejar el almacenamiento local
const LocalStorageService = {
  // Verificar token de autenticación
  verificarToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No autorizado' };
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Error al verificar token:', error);
      return { success: false, message: 'Error de autenticación' };
    }
  },
  
  // Obtener usuario actual
  getUsuarioActual() {
    const auth = this.verificarToken();
    if (!auth.success) {
      return null;
    }
    return auth.user;
  },
  
  // Obtener todos los usuarios
  getUsuarios() {
    try {
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      return { success: true, usuarios };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { success: false, message: 'Error al obtener usuarios' };
    }
  },
  
  // Obtener todos los vales
  getVales() {
    try {
      const vales = JSON.parse(localStorage.getItem('vales')) || [];
      return { success: true, vales };
    } catch (error) {
      console.error('Error al obtener vales:', error);
      return { success: false, message: 'Error al obtener vales' };
    }
  },
  
  // Buscar vales con filtros
  buscarVales(filtros) {
    try {
      const vales = JSON.parse(localStorage.getItem('vales')) || [];
      let resultados = [...vales];
      
      // Aplicar filtros
      if (filtros.estado && filtros.estado !== 'todos') {
        resultados = resultados.filter(vale => vale.estado.toLowerCase() === filtros.estado.toLowerCase());
      }
      
      if (filtros.localId) {
        resultados = resultados.filter(vale => 
          vale.local_origen_id === parseInt(filtros.localId) || 
          vale.local_destino_id === parseInt(filtros.localId)
        );
      }
      
      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        resultados = resultados.filter(vale => new Date(vale.fecha) >= fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59);
        resultados = resultados.filter(vale => new Date(vale.fecha) <= fechaHasta);
      }
      
      return { success: true, vales: resultados };
    } catch (error) {
      console.error('Error al buscar vales:', error);
      return { success: false, message: 'Error al buscar vales' };
    }
  },
  
  // Marcar vale como pagado
  marcarComoPagado(valeId) {
    try {
      const vales = JSON.parse(localStorage.getItem('vales')) || [];
      const index = vales.findIndex(v => v.id === valeId);
      
      if (index === -1) {
        return { success: false, message: 'Vale no encontrado' };
      }
      
      vales[index].estado = 'pagado';
      localStorage.setItem('vales', JSON.stringify(vales));
      
      return { success: true, vale: vales[index] };
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      return { success: false, message: 'Error al actualizar vale' };
    }
  },
  
  // Exportar vales a CSV
  exportarValesCSV() {
    try {
      const vales = JSON.parse(localStorage.getItem('vales')) || [];
      
      // Cabecera CSV
      let csv = 'ID,Fecha,Local Origen,Local Destino,Persona Responsable,Estado,Items\n';
      
      // Datos
      vales.forEach(vale => {
        const items = vale.items.map(item => item.descripcion).join(' | ');
        csv += `${vale.id},${vale.fecha},${vale.origen_nombre},${vale.destino_nombre},${vale.personaResponsable},${vale.estado},"${items}"\n`;
      });
      
      return { success: true, csv };
    } catch (error) {
      console.error('Error al exportar vales:', error);
      return { success: false, message: 'Error al exportar vales' };
    }
  },
  
  // Crear un nuevo vale
  crearVale(valeData) {
    const auth = this.verificarToken();
    if (!auth.success) {
      return { success: false, message: 'No autorizado' };
    }
    
    const { fecha, local_destino_id, persona_responsable, items } = valeData;
    
    // Validar datos
    if (!fecha || !local_destino_id || !persona_responsable || !items || items.length === 0) {
      return { success: false, message: 'Por favor, complete todos los campos requeridos' };
    }
    
    // Obtener datos
    const vales = JSON.parse(localStorage.getItem('vales'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    let nextValeId = parseInt(localStorage.getItem('nextValeId'));
    let nextItemId = parseInt(localStorage.getItem('nextItemId'));
    
    // Obtener nombres de locales
    const localOrigen = usuarios.find(u => u.id === auth.user.id);
    const localDestino = usuarios.find(u => u.id === parseInt(local_destino_id));
    
    if (!localOrigen || !localDestino) {
      return { success: false, message: 'Local no encontrado' };
    }
    
    // Crear nuevo vale
    const nuevoVale = {
      id: nextValeId,
      fecha,
      local_origen_id: auth.user.id,
      local_destino_id: parseInt(local_destino_id),
      origen_nombre: localOrigen.nombre,
      destino_nombre: localDestino.nombre,
      localPresta: localOrigen.nombre,
      localRecibe: localDestino.nombre,
      personaResponsable: persona_responsable,
      estado: 'pendiente', // Asegurar que sea en minúsculas
      creado_en: new Date().toISOString(),
      items: items.map(item => ({
        id: nextItemId++,
        descripcion: item.descripcion
      }))
    };
    
    // Guardar
    vales.push(nuevoVale);
    localStorage.setItem('vales', JSON.stringify(vales));
    localStorage.setItem('nextValeId', (nextValeId + 1).toString());
    localStorage.setItem('nextItemId', nextItemId.toString());
    
    return {
      success: true,
      vale: nuevoVale
    };
  }
};

export default LocalStorageService;
