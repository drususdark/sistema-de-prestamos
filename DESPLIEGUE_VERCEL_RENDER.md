# Guía de Despliegue: Vercel + Render

Esta guía te ayudará a desplegar tu aplicación de préstamos entre locales utilizando Vercel para el frontend y Render para el backend.

## Preparación del Repositorio

1. Sube tu código a GitHub con la siguiente estructura:
   ```
   /
   ├── backend/
   │   ├── models/
   │   ├── routes/
   │   ├── database.js
   │   ├── server.js
   │   └── package.json
   ├── frontend/
   │   ├── public/
   │   ├── src/
   │   └── package.json
   └── README.md
   ```

2. Asegúrate de tener un archivo `.gitignore` en la raíz con este contenido:
   ```
   # Dependencias
   node_modules/
   
   # Archivos de construcción
   build/
   dist/
   
   # Archivos de entorno
   .env
   .env.local
   
   # Base de datos SQLite
   *.db
   
   # Logs
   *.log
   
   # Archivos del sistema
   .DS_Store
   Thumbs.db
   ```

## Paso 1: Desplegar el Backend en Render

1. Crea una cuenta en [Render](https://render.com) si aún no la tienes.

2. Modifica el archivo `server.js` del backend para configurar CORS:
   ```javascript
   // Añade esto en tu archivo server.js
   const cors = require('cors');
   
   // Configura CORS para permitir solicitudes desde tu frontend
   app.use(cors({
     origin: ['https://tu-frontend-url.vercel.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

3. Crea un archivo `.env` en la carpeta backend con las variables de entorno:
   ```
   PORT=10000
   JWT_SECRET=tu_clave_secreta_muy_segura
   NODE_ENV=production
   ```

4. Inicia sesión en Render y haz clic en "New" → "Web Service".

5. Conecta tu repositorio de GitHub.

6. Configura el servicio:
   - **Name**: prestamos-app-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: node server.js
   - **Plan**: Free

7. En la sección "Environment", añade las siguientes variables:
   - `PORT`: 10000
   - `JWT_SECRET`: tu_clave_secreta_muy_segura
   - `NODE_ENV`: production

8. Haz clic en "Create Web Service".

9. Espera a que se complete el despliegue y anota la URL del servicio (será algo como `https://prestamos-app-backend.onrender.com`).

## Paso 2: Desplegar el Frontend en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no la tienes.

2. Crea un archivo `.env.production` en la carpeta frontend:
   ```
   REACT_APP_API_URL=https://tu-backend-url.onrender.com
   ```
   (Reemplaza con la URL de tu backend en Render)

3. Modifica el archivo `package.json` del frontend para asegurarte de que tenga:
   ```json
   {
     "name": "prestamos-app-frontend",
     "version": "1.0.0",
     "private": true,
     "dependencies": {
       // tus dependencias...
     },
     "scripts": {
       "start": "react-scripts start",
       "build": "react-scripts build",
       "test": "react-scripts test",
       "eject": "react-scripts eject"
     }
   }
   ```

4. Modifica los servicios del frontend para usar la URL del backend:
   - En `src/services/valesService.js`
   - En `src/services/usuariosService.js`
   - Asegúrate de que usen `process.env.REACT_APP_API_URL` como base para las llamadas API

5. Inicia sesión en Vercel y haz clic en "Add New" → "Project".

6. Importa tu repositorio de GitHub.

7. Configura el proyecto:
   - **Framework Preset**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: build

8. En la sección "Environment Variables", añade:
   - `REACT_APP_API_URL`: https://tu-backend-url.onrender.com
   (Reemplaza con la URL de tu backend en Render)

9. Haz clic en "Deploy".

10. Espera a que se complete el despliegue y anota la URL del frontend (será algo como `https://prestamos-app.vercel.app`).

## Paso 3: Actualizar CORS en el Backend

1. Vuelve a Render y edita tu servicio backend.

2. Actualiza la variable de entorno `CORS_ORIGIN` con la URL de tu frontend en Vercel.

3. Modifica el archivo `server.js` para usar esta variable:
   ```javascript
   app.use(cors({
     origin: [process.env.CORS_ORIGIN, 'http://localhost:3000'],
     credentials: true
   }));
   ```

4. Guarda los cambios y espera a que se complete el redespliegue.

## Paso 4: Probar la Aplicación

1. Abre la URL de tu frontend en Vercel.

2. Inicia sesión con uno de los usuarios predefinidos:
   - Usuario: local1, Contraseña: local1
   - Usuario: local2, Contraseña: local2
   - (Y así sucesivamente hasta local6)

3. Prueba todas las funcionalidades:
   - Crear vales
   - Ver historial
   - Marcar vales como pagados
   - Exportar a CSV

## Solución de Problemas Comunes

1. **Error de CORS**:
   - Verifica que la URL del frontend esté correctamente configurada en el backend
   - Asegúrate de que el backend permita solicitudes desde el origen del frontend

2. **Error de conexión a la base de datos**:
   - En Render, la base de datos SQLite se reiniciará cada vez que el servicio se reinicie
   - Considera migrar a una base de datos persistente como PostgreSQL (Render ofrece una versión gratuita)

3. **Error 404 en rutas de React**:
   - Asegúrate de que tu aplicación React maneje correctamente las rutas
   - Vercel ya está configurado para manejar aplicaciones de una sola página (SPA)

## Siguientes Pasos (Opcionales)

1. **Configurar un dominio personalizado**:
   - En Vercel, ve a "Settings" → "Domains"
   - Añade tu dominio personalizado
   - Sigue las instrucciones para configurar los registros DNS

2. **Mejorar la persistencia de datos**:
   - Migra de SQLite a PostgreSQL en Render
   - Configura copias de seguridad automáticas

3. **Configurar CI/CD**:
   - Vercel y Render ya tienen CI/CD integrado
   - Cada vez que hagas push a tu rama principal, se desplegará automáticamente
