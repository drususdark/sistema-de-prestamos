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
