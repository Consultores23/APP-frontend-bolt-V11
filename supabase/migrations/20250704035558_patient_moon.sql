/*
  # Crear tabla audiencias

  1. Nueva Tabla
    - `audiencias`
      - `id` (uuid, primary key)
      - `process_id` (uuid, foreign key to procesos)
      - `descripcion` (text, required)
      - `estado` (text, default 'Pendiente')
      - `prioridad` (text, default 'Media')
      - `responsable_id` (uuid, foreign key to responsables, optional)
      - `link` (text, optional)
      - `fecha_hora` (timestamptz, required)
      - `fecha_creacion` (timestamptz, auto-generated)

  2. Seguridad
    - Habilitar RLS en la tabla `audiencias`
    - Agregar políticas para usuarios autenticados

  3. Índices
    - Índices para optimizar consultas por process_id, responsable_id y fecha_hora
*/

CREATE TABLE IF NOT EXISTS public.audiencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL,
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'Pendiente'::text,
  prioridad text DEFAULT 'Media'::text,
  responsable_id uuid,
  link text,
  fecha_hora timestamp with time zone NOT NULL,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audiencias_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.procesos(id) ON DELETE CASCADE,
  CONSTRAINT audiencias_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.responsables(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS audiencias_process_id_idx ON public.audiencias USING btree (process_id);
CREATE INDEX IF NOT EXISTS audiencias_responsable_id_idx ON public.audiencias USING btree (responsable_id);
CREATE INDEX IF NOT EXISTS audiencias_fecha_hora_idx ON public.audiencias USING btree (fecha_hora DESC);
CREATE INDEX IF NOT EXISTS audiencias_fecha_creacion_idx ON public.audiencias USING btree (fecha_creacion DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.audiencias ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Allow authenticated users to select audiencias"
ON public.audiencias FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert audiencias"
ON public.audiencias FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update audiencias"
ON public.audiencias FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete audiencias"
ON public.audiencias FOR DELETE
TO authenticated
USING (true);