-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actuaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL,
  fecha_actuacion date NOT NULL,
  actuacion_texto text NOT NULL,
  anotacion text NOT NULL,
  fecha_inicio_termino date,
  fecha_finaliza_termino date,
  fecha_registro timestamp with time zone NOT NULL,
  storage_path text,
  CONSTRAINT actuaciones_pkey PRIMARY KEY (id),
  CONSTRAINT actuaciones_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.procesos(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation_type text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text,
  correo text UNIQUE,
  telefono text,
  estado text NOT NULL DEFAULT 'Activo'::text,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.procesos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  nombre text NOT NULL,
  radicado text NOT NULL,
  estado text NOT NULL DEFAULT 'Activo'::text,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  bucket_path text,
  CONSTRAINT procesos_pkey PRIMARY KEY (id),
  CONSTRAINT procesos_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.responsables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text,
  telefono text,
  correo text UNIQUE,
  roles ARRAY,
  estado text NOT NULL DEFAULT 'Activo'::text,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT responsables_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sujetos_procesales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL,
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sujetos_procesales_pkey PRIMARY KEY (id),
  CONSTRAINT sujetos_procesales_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.procesos(id)
);