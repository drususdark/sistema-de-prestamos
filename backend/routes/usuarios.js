const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const User = require('../models/User');

// Obtener todos los usuarios (locales)
router.get('/', verifyToken, async (req, res) => {
  try {
    const usuarios = await User.getAll();
    
    res.json({
      success: true,
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Obtener un usuario específico por ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        usuario: usuario.usuario
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

module.exports = router;
