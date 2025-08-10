# Integración del Sistema de Préstamos con Supabase

## Resumen del Proyecto

Este documento describe la integración del sistema de préstamos entre locales con Supabase como base de datos principal, reemplazando el almacenamiento local SQLite.

## Cambios Realizados

### 1. Backend - Configuración de Supabase

#### Archivos Nuevos:
- `backend/supabase.js` - Configuración del cliente Supabase
- `backend/initSupabase.js` - Script de inicialización de datos
- `backend/.env.example` - Ejemplo de variables de entorno
- `supabase-schema.sql` - Esquema SQL para crear las tablas en Supabase

#### Archivos Modificados:
- `backend/server.js` - Actualizado para usar Supabase
- `backend/models/User.js` - Reescrito para usar Supabase
- `backend/models/Vale.js` - Reescrito para usar Supabase

### 2. Frontend - Preparación para Supabase

#### Dependencias Agregadas:
- `@supabase/supabase-js` - Cliente JavaScript de Supabase

#### Archivos Existentes (compatibles):
- `frontend/src/services/ApiService.js` - Ya compatible con la nueva API
- Todos los componentes React mantienen compatibilidad

## Estructura de Base de Datos en Supabase

### Tablas Creadas:

#### 1. `usuarios`
- `id` (BIGSERIAL PRIMARY KEY)
- `nombre` (TEXT NOT NULL UNIQUE) - Nombre del local
- `usuario` (TEXT NOT NULL UNIQUE) - Username para login
- `password` (TEXT NOT NULL) - Contraseña hasheada
- `creado_en` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())

#### 2. `vales`
- `id` (BIGSERIAL PRIMARY KEY)
- `fecha` (TIMESTAMP WITH TIME ZONE NOT NULL)
- `local_origen_id` (BIGINT REFERENCES usuarios(id))
- `local_destino_id` (BIGINT REFERENCES usuarios(id))
- `persona_responsable` (TEXT NOT NULL)
- `estado` (TEXT DEFAULT 'pendiente')
- `creado_en` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())

#### 3. `items_mercaderia`
- `id` (BIGSERIAL PRIMARY KEY)
- `vale_id` (BIGINT REFERENCES vales(id) ON DELETE CASCADE)
- `descripcion` (TEXT NOT NULL)

### Datos Iniciales

Se incluyen 6 locales predefinidos:
1. Local Central (usuario: central, password: central123)
2. Local Norte (usuario: norte, password: norte123)
3. Local Sur (usuario: sur, password: sur123)
4. Local Este (usuario: este, password: este123)
5. Local Oeste (usuario: oeste, password: oeste123)
6. Local Centro (usuario: centro, password: centro123)

## Configuración Requerida

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend/` con:

```env
PORT=10000
NODE_ENV=development
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
JWT_SECRET=tu-secreto-jwt-muy-seguro
```

### Pasos de Configuración

1. **Crear proyecto en Supabase:**
   - Ir a https://supabase.com
   - Crear nuevo proyecto
   - Obtener URL y clave anónima

2. **Configurar base de datos:**
   - Ejecutar el contenido de `supabase-schema.sql` en el SQL Editor de Supabase
   - Esto creará las tablas y datos iniciales

3. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env`
   - Completar con los valores reales de Supabase

4. **Inicializar datos (opcional):**
   ```bash
   cd backend
   node initSupabase.js
   ```

## Funcionalidades Implementadas

### Backend API:
- ✅ Autenticación con JWT
- ✅ CRUD completo de usuarios
- ✅ CRUD completo de vales
- ✅ Búsqueda y filtrado de vales
- ✅ Exportación a CSV
- ✅ Gestión de items de mercadería

### Frontend:
- ✅ Login/logout
- ✅ Creación de vales
- ✅ Visualización de historial
- ✅ Filtros de búsqueda
- ✅ Interfaz responsive

## Ventajas de la Integración

1. **Persistencia Real:** Los datos se almacenan en la nube
2. **Escalabilidad:** Supabase maneja el crecimiento automáticamente
3. **Backup Automático:** Los datos están respaldados
4. **Acceso Múltiple:** Varios usuarios pueden acceder simultáneamente
5. **Seguridad:** Row Level Security (RLS) implementado
6. **API REST:** Supabase proporciona API automática
7. **Tiempo Real:** Capacidad de actualizaciones en tiempo real

## Estado Actual

- ✅ Código backend completamente migrado a Supabase
- ✅ Modelos actualizados con async/await
- ✅ Esquema SQL preparado para Supabase
- ✅ Script de inicialización creado
- ✅ Frontend compatible con nueva API
- ⚠️ Requiere configuración de Supabase por parte del usuario
- ⚠️ Requiere actualización de variables de entorno

## Próximos Pasos

1. Crear proyecto en Supabase
2. Ejecutar esquema SQL
3. Configurar variables de entorno
4. Probar la aplicación
5. Desplegar con nuevas configuraciones

## Notas Técnicas

- Se mantiene compatibilidad con el frontend existente
- Las rutas API no cambiaron
- Se agregó manejo de errores mejorado
- Se implementó Row Level Security para mayor seguridad
- Los passwords se hashean con bcrypt
- Se usan transacciones para operaciones complejas

