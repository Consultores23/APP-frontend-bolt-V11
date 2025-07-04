/*
  # Crear tabla terminos

  1. Nueva Tabla
    - `terminos`
      - `id` (uuid, primary key)
      - `process_id` (uuid, foreign key a procesos)
      - `descripcion` (text, requerido)
      - `estado` (text, default 'Pendiente')
      - `prioridad` (text, default 'Media')
      - `responsable_id` (uuid, foreign key a responsables, opcional)
      - `fecha_inicio_termino` (date, opcional)
      - `fecha_finaliza_termino` (date, opcional)
      - `fecha_creacion` (timestamp, default now())

  2. Seguridad
    - Habilitar RLS en la tabla `terminos`
    - Agregar políticas para usuarios autenticados para SELECT, INSERT, UPDATE, DELETE

  3. Índices
    - Índices en process_id, responsable_id, fecha_creacion para optimizar consultas
*/

CREATE TABLE IF NOT EXISTS public.terminos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL,
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'Pendiente'::text,
  prioridad text DEFAULT 'Media'::text,
  responsable_id uuid,
  fecha_inicio_termino date,
  fecha_finaliza_termino date,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT terminos_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.procesos(id) ON DELETE CASCADE,
  CONSTRAINT terminos_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.responsables(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS terminos_process_id_idx ON public.terminos USING btree (process_id);
CREATE INDEX IF NOT EXISTS terminos_responsable_id_idx ON public.terminos USING btree (responsable_id);
CREATE INDEX IF NOT EXISTS terminos_fecha_creacion_idx ON public.terminos USING btree (fecha_creacion DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.terminos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Allow authenticated users to select terminos"
ON public.terminos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert terminos"
ON public.terminos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update terminos"
ON public.terminos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete terminos"
ON public.terminos FOR DELETE
TO authenticated
USING (true);