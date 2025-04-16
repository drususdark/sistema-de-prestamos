// LocalStorageService.js
// Este servicio reemplaza el backend con almacenamiento local en el navegador

class LocalStorageService {
  constructor() {
    // Inicializar el almacenamiento si no existe
    if (!localStorage.getItem('usuarios')) {
      this.inicializarDatos();
    }
  }

  // Inicializar datos de ejemplo
  inicializarDatos() {
    // Usuarios/locales predefinidos
    const usuarios = [
      { id: 1, nombre: 'Local 1', usuario: 'local1', password: 'local1' },
      { id: 2, nombre: 'Local 2', usuario: 'local2', password: 'local2' },
      { id: 3, nombre: 'Local 3', usuario: 'local3', password: 'local3' },
      { id: 4, nombre: 'Local 4', usuario: 'local4', password: 'local4' },
      { id: 5, nombre: 'Local 5', usuario: 'local5', password: 'local5' },
      { id: 6, nombre: 'Local 6', usuario: 'local6', password: 'local6' }
    ];

    // Vales de ejemplo
    const vales = [
      {
        id: 1,
        fecha: '2025-04-10',
        local_origen_id: 1,
        local_destino_id: 2,
        origen_nombre: 'Local 1',
        destino_nombre: 'Local 2',
        persona_responsable: 'Juan Pérez',
        estado: 'pendiente',
        creado_en: '2025-04-10T10:00:00',
        items: [
          { id: 1, descripcion: 'Caja de herramientas' },
          { id: 2, descripcion: 'Taladro eléctrico' },
          { id: 3, descripcion: 'Juego de destornilladores' }
        ]
      },
      {
        id: 2,
        fecha: '2025-04-12',
        local_origen_id: 2,
        local_destino_id: 3,
        origen_nombre: 'Local 2',
        destino_nombre: 'Local 3',
        persona_responsable: 'María González',
        estado: 'pendiente',
        creado_en: '2025-04-12T14:30:00',
        items: [
          { id: 4, descripcion: 'Impresora láser' },
          { id: 5, descripcion: 'Cartuchos de tinta' },
          { id: 6, descripcion: 'Resma de papel A4' }
        ]
      },
      {
        id: 3,
        fecha: '2025-04-15',
        local_origen_id: 3,
        local_destino_id: 1,
        origen_nombre: 'Local 3',
        destino_nombre: 'Local 1',
        persona_responsable: 'Carlos Rodríguez',
        estado: 'pagado',
        creado_en: '2025-04-15T09:15:00',
        items: [
          { id: 7, descripcion: 'Monitor 24"' },
          { id: 8, descripcion: 'Teclado inalámbrico' },
          { id: 9, descripcion: 'Mouse óptico' }
        ]
      }
    ];

    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('vales', JSON.stringify(vales));
    localStorage.setItem('nextValeId', '4');
    localStorage.setItem('nextItemId', '10');
  }

  // Autenticación
  login(usuario, password) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const user = usuarios.find(u => u.usuario === usuario && u.password === password);
    
    if (user) {
      // Generar un token simple (en una app real usaríamos JWT)
      const token = btoa(JSON.stringify({
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
      }));
      
      // Guardar en localStorage
      localStorage.setItem('token', token);
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          usuario: user.usuario
        }
      };
    }
    
    return {
      success: false,
      message: 'Usuario o contraseña incorrectos'
    };
  }

  // Verificar token
  verificarToken() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    try {
      const decoded = JSON.parse(atob(token));
      
      // Verificar expiración
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('token');
        return {
          success: false,
          message: 'Token expirado'
        };
      }
      
      return {
        success: true,
        user: {
          id: decoded.id,
          nombre: decoded.nombre,
          usuario: decoded.usuario
        }
      };
    } catch (error) {
      localStorage.removeItem('token');
      return {
        success: false,
        message: 'Token inválido'
      };
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    return {
      success: true,
      message: 'Sesión cerrada correctamente'
    };
  }

  // Obtener usuario actual
  getUsuarioActual() {
    const auth = this.verificarToken();
    return auth.success ? auth.user : null;
  }

  // Obtener todos los usuarios/locales
  getUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    // No devolver las contraseñas
    return {
      success: true,
      usuarios: usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        usuario: u.usuario
      }))
    };
  }

  // Crear un nuevo vale
  crearVale(valeData) {
    const auth = this.verificarToken();
    
    if (!auth.success) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    const { fecha, local_destino_id, persona_responsable, items } = valeData;
    
    // Validar datos
    if (!fecha || !local_destino_id || !persona_responsable || !items || items.length === 0) {
      return {
        success: false,
        message: 'Por favor, complete todos los campos requeridos'
      };
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
      return {
        success: false,
        message: 'Local no encontrado'
      };
    }
    
    // Crear nuevo vale
    const nuevoVale = {
      id: nextValeId,
      fecha,
      local_origen_id: auth.user.id,
      local_destino_id: parseInt(local_destino_id),
      origen_nombre: localOrigen.nombre,
      destino_nombre: localDestino.nombre,
      persona_responsable,
      estado: 'pendiente',
      creado_en: new Date().toISOString(),
      items: items.map(item => ({
        id: nextItemId++,
        descripcion: item
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

  // Obtener todos los vales
  getVales() {
    const auth = this.verificarToken();
    
    if (!auth.success) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    const vales = JSON.parse(localStorage.getItem('vales'));
    
    return {
      success: true,
      vales
    };
  }

  // Buscar vales con filtros
  buscarVales(filtros) {
    const auth = this.verificarToken();
    
    if (!auth.success) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    let vales = JSON.parse(localStorage.getItem('vales'));
    
    // Aplicar filtros
    if (filtros.fechaDesde) {
      vales = vales.filter(v => v.fecha >= filtros.fechaDesde);
    }
    
    if (filtros.fechaHasta) {
      vales = vales.filter(v => v.fecha <= filtros.fechaHasta);
    }
    
    if (filtros.localOrigen) {
      vales = vales.filter(v => v.local_origen_id === parseInt(filtros.localOrigen));
    }
    
    if (filtros.localDestino) {
      vales = vales.filter(v => v.local_destino_id === parseInt(filtros.localDestino));
    }
    
    if (filtros.mercaderia) {
      vales = vales.filter(v => 
        v.items.some(item => 
          item.descripcion.toLowerCase().includes(filtros.mercaderia.toLowerCase())
        )
      );
    }
    
    if (filtros.estado) {
      vales = vales.filter(v => v.estado === filtros.estado);
    }
    
    return {
      success: true,
      vales
    };
  }

  // Marcar vale como pagado
  marcarComoPagado(valeId) {
    const auth = this.verificarToken();
    
    if (!auth.success) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    const vales = JSON.parse(localStorage.getItem('vales'));
    const valeIndex = vales.findIndex(v => v.id === parseInt(valeId));
    
    if (valeIndex === -1) {
      return {
        success: false,
        message: 'Vale no encontrado'
      };
    }
    
    const vale = vales[valeIndex];
    
    // Verificar que el usuario es el dueño del vale
    if (vale.local_origen_id !== auth.user.id) {
      return {
        success: false,
        message: 'No tienes permiso para modificar este vale'
      };
    }
    
    // Actualizar estado
    vale.estado = 'pagado';
    vales[valeIndex] = vale;
    
    // Guardar
    localStorage.setItem('vales', JSON.stringify(vales));
    
    return {
      success: true,
      message: 'Vale marcado como pagado'
    };
  }

  // Exportar vales a CSV
  exportarValesCSV() {
    const auth = this.verificarToken();
    
    if (!auth.success) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }
    
    const vales = JSON.parse(localStorage.getItem('vales'));
    
    // Crear cabecera CSV
    let csv = 'ID,Fecha,Local Origen,Local Destino,Persona Responsable,Estado,Items\n';
    
    // Agregar filas
    vales.forEach(vale => {
      const items = vale.items.map(item => item.descripcion).join(' | ');
      csv += `${vale.id},${vale.fecha},${vale.origen_nombre},${vale.destino_nombre},${vale.persona_responsable},${vale.estado},"${items}"\n`;
    });
    
    return {
      success: true,
      csv
    };
  }
}

export default new LocalStorageService();
