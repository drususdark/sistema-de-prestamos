const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_prestamos_app';

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Validar datos de entrada
    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione usuario y contraseña'
      });
    }

    // Buscar usuario en la base de datos
    const user = await User.findByUsername(usuario);
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await User.verifyPassword(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar respuesta exitosa
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  // Obtener token del header
  const token = req.headers['x-auth-token'] || req.headers['authorization'];

  // Verificar si hay token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó token de autenticación'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    
    // Agregar usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Ruta para verificar token y obtener usuario actual
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario
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

// Exportar router y middleware
module.exports = router;
module.exports.verifyToken = verifyToken;
