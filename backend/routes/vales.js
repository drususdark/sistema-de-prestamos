const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const Vale = require('../models/Vale');

// Crear un nuevo vale
router.post('/', verifyToken, async (req, res) => {
  try {
    const { fecha, local_destino_id, persona_responsable, items } = req.body;
    
    // Validar datos de entrada
    if (!fecha || !local_destino_id || !persona_responsable || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, complete todos los campos requeridos'
      });
    }
    
    // Crear datos del vale
    const valeData = {
      fecha,
      local_origen_id: req.user.id, // El local que crea el vale es el origen
      local_destino_id,
      persona_responsable
    };
    
    // Crear el vale con sus items
    const nuevoVale = await Vale.create(valeData, items);
    
    res.status(201).json({
      success: true,
      vale: nuevoVale
    });
  } catch (error) {
    console.error('Error al crear vale:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Obtener todos los vales
router.get('/', verifyToken, async (req, res) => {
  try {
    const vales = await Vale.getAll();
    
    res.json({
      success: true,
      vales
    });
  } catch (error) {
    console.error('Error al obtener vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Buscar vales con filtros
router.get('/buscar', verifyToken, async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, localOrigen, localDestino, mercaderia, estado } = req.query;
    
    // Crear objeto de filtros
    const filtros = {};
    
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;
    if (localOrigen) filtros.localOrigen = localOrigen;
    if (localDestino) filtros.localDestino = localDestino;
    if (mercaderia) filtros.mercaderia = mercaderia;
    if (estado) filtros.estado = estado;
    
    const vales = await Vale.buscarVales(filtros);
    
    res.json({
      success: true,
      vales
    });
  } catch (error) {
    console.error('Error al buscar vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Marcar vale como pagado
router.put('/:id/pagar', verifyToken, async (req, res) => {
  try {
    const valeId = req.params.id;
    const usuarioId = req.user.id;
    
    const resultado = await Vale.marcarComoPagado(valeId, usuarioId);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al marcar vale como pagado:', error);
    res.status(error.message.includes('permiso') ? 403 : 500).json({
      success: false,
      message: error.message || 'Error al marcar vale como pagado'
    });
  }
});

// Exportar CSV de vales
router.get('/exportar', verifyToken, async (req, res) => {
  try {
    const vales = await Vale.getAll();
    
    // Crear cabecera CSV
    let csv = 'ID,Fecha,Local Origen,Local Destino,Persona Responsable,Estado,Items\n';
    
    // Agregar filas
    vales.forEach(vale => {
      const items = vale.items.map(item => item.descripcion).join(' | ');
      csv += `${vale.id},${vale.fecha},${vale.origen_nombre},${vale.destino_nombre},${vale.persona_responsable},${vale.estado},"${items}"\n`;
    });
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vales.csv');
    
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar vales:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

module.exports = router;
