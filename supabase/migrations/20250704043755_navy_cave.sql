/*
  # Crear tabla reuniones

  1. Nueva Tabla
    - `reuniones`
      - `id` (uuid, primary key)
      - `process_id` (uuid, foreign key a procesos)
      - `descripcion` (text, requerido)
      - `estado` (text, default 'Pendiente')
      - `prioridad` (text, default 'Media')
      - `responsable_id` (uuid, foreign key a responsables, opcional)
      - `link` (text, opcional)
      - `fecha_hora` (timestamptz, requerido)
      - `fecha_creacion` (timestamptz, default now())

  2. Seguridad
    - Habilitar RLS en la tabla `reuniones`
    - Agregar políticas para usuarios autenticados para SELECT, INSERT, UPDATE, DELETE

  3. Índices
    - Índices en process_id, responsable_id, fecha_hora, fecha_creacion para optimizar consultas
*/

CREATE TABLE IF NOT EXISTS public.reuniones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL,
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'Pendiente'::text,
  prioridad text DEFAULT 'Media'::text,
  responsable_id uuid,
  link text,
  fecha_hora timestamp with time zone NOT NULL,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reuniones_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.procesos(id) ON DELETE CASCADE,
  CONSTRAINT reuniones_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.responsables(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS reuniones_process_id_idx ON public.reuniones USING btree (process_id);
CREATE INDEX IF NOT EXISTS reuniones_responsable_id_idx ON public.reuniones USING btree (responsable_id);
CREATE INDEX IF NOT EXISTS reuniones_fecha_hora_idx ON public.reuniones USING btree (fecha_hora DESC);
CREATE INDEX IF NOT EXISTS reuniones_fecha_creacion_idx ON public.reuniones USING btree (fecha_creacion DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.reuniones ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Allow authenticated users to select reuniones"
ON public.reuniones FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert reuniones"
ON public.reuniones FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update reuniones"
ON public.reuniones FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete reuniones"
ON public.reuniones FOR DELETE
TO authenticated
USING (true);