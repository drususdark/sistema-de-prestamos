# 🚀 Guía de Configuración: Sistema de Préstamos con Supabase

## 📋 Resumen

Tu sistema de préstamos ha sido completamente integrado con Supabase. Ahora todos los datos (usuarios y vales) se almacenarán en la nube en lugar de localmente.

## ⚡ Configuración Rápida (5 minutos)

### Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub (recomendado)
4. Crea un nuevo proyecto:
   - **Name:** `sistema-prestamos`
   - **Database Password:** Elige una contraseña segura
   - **Region:** Selecciona la más cercana a tu ubicación
5. Espera 2-3 minutos a que se cree el proyecto

### Paso 2: Configurar Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de base de datos)
2. Crea una nueva query
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en **RUN** para ejecutar el script
5. ✅ Deberías ver las tablas creadas: `usuarios`, `vales`, `items_mercaderia`

### Paso 3: Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon public key** (clave larga que empieza con `eyJ...`)

### Paso 4: Configurar Variables de Entorno

1. En la carpeta `backend/`, crea un archivo `.env`
2. Copia el contenido de `.env.example` y completa con tus datos:

```env
PORT=10000
NODE_ENV=development
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
JWT_SECRET=mi-secreto-super-seguro-123
```

### Paso 5: Probar Localmente

```bash
# Instalar dependencias del backend
cd backend
npm install

# Inicializar datos (opcional - ya están en el schema)
node initSupabase.js

# Iniciar servidor backend
npm start
```

```bash
# En otra terminal, instalar dependencias del frontend
cd frontend
npm install

# Iniciar frontend
npm start
```

### Paso 6: Probar Login

Usa cualquiera de estos usuarios para probar:

| Local | Usuario | Contraseña |
|-------|---------|------------|
| Local Central | `central` | `central123` |
| Local Norte | `norte` | `norte123` |
| Local Sur | `sur` | `sur123` |
| Local Este | `este` | `este123` |
| Local Oeste | `oeste` | `oeste123` |
| Local Centro | `centro` | `centro123` |

## 🌐 Despliegue en Producción

### Backend (Render/Railway/Heroku)

1. Sube tu código a GitHub
2. En tu plataforma de despliegue, configura estas variables de entorno:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-clave-anonima
   JWT_SECRET=tu-secreto-jwt
   ```

### Frontend (Vercel)

1. En `frontend/src/services/ApiService.js`, actualiza la línea 3:
   ```javascript
   const API_URL = 'https://tu-backend-desplegado.com/api';
   ```
2. Despliega en Vercel como siempre

## 🔧 Funcionalidades Nuevas

### ✅ Lo que ya funciona:
- **Persistencia real:** Los datos se guardan en Supabase
- **Múltiples usuarios:** Varios locales pueden usar el sistema simultáneamente
- **Backup automático:** Supabase respalda tus datos
- **Escalabilidad:** Maneja crecimiento automáticamente
- **Seguridad:** Row Level Security implementado

### 🆕 Nuevas capacidades:
- **API REST automática:** Supabase genera API para todas las tablas
- **Tiempo real:** Posibilidad de actualizaciones en vivo
- **Dashboard:** Panel de administración en Supabase
- **Métricas:** Estadísticas de uso automáticas

## 🛠️ Comandos Útiles

```bash
# Verificar conexión con Supabase
cd backend
node -e "require('./supabase').testConnection()"

# Reinicializar datos (CUIDADO: borra todo)
node initSupabase.js

# Ver logs del servidor
npm start

# Instalar dependencias si hay problemas
npm install
```

## 🔍 Solución de Problemas

### Error: "Las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas"
- ✅ Verifica que el archivo `.env` existe en `backend/`
- ✅ Verifica que las variables están correctamente escritas
- ✅ Reinicia el servidor después de cambiar `.env`

### Error: "Error al conectar con Supabase"
- ✅ Verifica que la URL de Supabase es correcta
- ✅ Verifica que la clave anónima es correcta
- ✅ Verifica que el proyecto de Supabase está activo

### Error: "Token inválido" en el frontend
- ✅ Verifica que JWT_SECRET está configurado
- ✅ Limpia localStorage del navegador
- ✅ Intenta hacer login nuevamente

### No aparecen los usuarios iniciales
- ✅ Ejecuta el script SQL en Supabase nuevamente
- ✅ O ejecuta `node initSupabase.js` en el backend

## 📊 Monitoreo

En tu dashboard de Supabase puedes ver:
- **Database:** Tablas y datos en tiempo real
- **Auth:** Usuarios y sesiones (si implementas auth de Supabase)
- **API:** Logs de requests
- **Logs:** Errores y actividad

## 🎯 Próximos Pasos Recomendados

1. **Personalizar usuarios:** Agrega/modifica los locales según tu negocio
2. **Backup manual:** Exporta datos importantes regularmente
3. **Monitoreo:** Configura alertas en Supabase
4. **Optimización:** Revisa queries lentas en el dashboard
5. **Seguridad:** Considera implementar RLS más específico

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Revisa los logs del servidor backend
3. Verifica el dashboard de Supabase
4. Consulta la documentación de Supabase: https://supabase.com/docs

---

¡Tu sistema de préstamos ahora es completamente funcional con base de datos en la nube! 🎉

