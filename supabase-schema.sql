-- Esquema de base de datos para Sistema de Préstamos en Supabase
-- Este archivo debe ejecutarse en el SQL Editor de Supabase

-- Habilitar Row Level Security (RLS) por defecto
-- Esto es importante para la seguridad en Supabase

-- Tabla de usuarios (locales)
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  usuario TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios pueden leer todos los usuarios" ON usuarios
  FOR SELECT USING (true);

-- Política para usuarios: permitir inserción solo a usuarios autenticados
CREATE POLICY "Usuarios pueden crear usuarios" ON usuarios
  FOR INSERT WITH CHECK (true);

-- Tabla de vales de préstamo
CREATE TABLE IF NOT EXISTS vales (
  id BIGSERIAL PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  local_origen_id BIGINT NOT NULL REFERENCES usuarios(id),
  local_destino_id BIGINT NOT NULL REFERENCES usuarios(id),
  persona_responsable TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en vales
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- Política para vales: permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Usuarios pueden gestionar vales" ON vales
  FOR ALL USING (true);

-- Tabla de items de mercadería en cada vale
CREATE TABLE IF NOT EXISTS items_mercaderia (
  id BIGSERIAL PRIMARY KEY,
  vale_id BIGINT NOT NULL REFERENCES vales(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL
);

-- Habilitar RLS en items_mercaderia
ALTER TABLE items_mercaderia ENABLE ROW LEVEL SECURITY;

-- Política para items_mercaderia: permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Usuarios pueden gestionar items de mercadería" ON items_mercaderia
  FOR ALL USING (true);

-- Insertar los 6 locales iniciales
INSERT INTO usuarios (nombre, usuario, password) VALUES
  ('Local Central', 'central', '$2b$10$example_hash_1'),
  ('Local Norte', 'norte', '$2b$10$example_hash_2'),
  ('Local Sur', 'sur', '$2b$10$example_hash_3'),
  ('Local Este', 'este', '$2b$10$example_hash_4'),
  ('Local Oeste', 'oeste', '$2b$10$example_hash_5'),
  ('Local Centro', 'centro', '$2b$10$example_hash_6')
ON CONFLICT (usuario) DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_vales_local_origen ON vales(local_origen_id);
CREATE INDEX IF NOT EXISTS idx_vales_local_destino ON vales(local_destino_id);
CREATE INDEX IF NOT EXISTS idx_vales_fecha ON vales(fecha);
CREATE INDEX IF NOT EXISTS idx_vales_estado ON vales(estado);
CREATE INDEX IF NOT EXISTS idx_items_vale_id ON items_mercaderia(vale_id);

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Tabla de usuarios/locales del sistema';
COMMENT ON TABLE vales IS 'Tabla de vales de préstamo entre locales';
COMMENT ON TABLE items_mercaderia IS 'Tabla de items de mercadería incluidos en cada vale';

COMMENT ON COLUMN usuarios.nombre IS 'Nombre descriptivo del local';
COMMENT ON COLUMN usuarios.usuario IS 'Nombre de usuario para login';
COMMENT ON COLUMN usuarios.password IS 'Contraseña hasheada';

COMMENT ON COLUMN vales.fecha IS 'Fecha del vale de préstamo';
COMMENT ON COLUMN vales.local_origen_id IS 'ID del local que presta la mercadería';
COMMENT ON COLUMN vales.local_destino_id IS 'ID del local que recibe la mercadería';
COMMENT ON COLUMN vales.persona_responsable IS 'Nombre de la persona responsable del vale';
COMMENT ON COLUMN vales.estado IS 'Estado del vale: pendiente, completado, cancelado';

COMMENT ON COLUMN items_mercaderia.descripcion IS 'Descripción del item de mercadería';

