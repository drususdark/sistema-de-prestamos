const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importar configuración de Supabase
const { testConnection } = require('./supabase');

// Verificar conexión con Supabase al iniciar
testConnection();

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.get('/api', (req, res) => {
  res.json({ message: 'API de Sistema de Préstamos entre Locales' });
});

// Importar rutas
const authRoutes = require('./routes/auth');
const valesRoutes = require('./routes/vales');
const usuariosRoutes = require('./routes/usuarios');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/vales', valesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  // Verificar si la carpeta build existe
  const buildPath = path.join(__dirname, '../frontend/build');
  try {
    // Intentar acceder a la carpeta build
    require('fs').accessSync(buildPath);
    console.log('Carpeta frontend/build encontrada, sirviendo archivos estáticos');
    
    // Servir archivos estáticos
    app.use(express.static(buildPath));
    
    // Ruta para manejar todas las solicitudes que no coincidan con rutas API
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } catch (error) {
    console.error('Error al acceder a la carpeta frontend/build:', error);
    console.log('Sirviendo solo la API sin frontend');
    
    // Si no existe la carpeta build, solo servir la API
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API de Sistema de Préstamos entre Locales', 
        error: 'Frontend no encontrado. Por favor acceda a través de la URL de Vercel.'
      });
    });
  }
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = app;
