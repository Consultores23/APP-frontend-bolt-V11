export interface Actuacion {
  id: string;
  process_id: string;
  fecha_actuacion: string; // ISO date string (YYYY-MM-DD)
  actuacion_texto: string;
  anotacion: string;
  fecha_inicio_termino?: string; // ISO date string (YYYY-MM-DD), optional
  fecha_finaliza_termino?: string; // ISO date string (YYYY-MM-DD), optional
  fecha_registro: string; // ISO timestamp string - now manually entered
  storage_path?: string; // Optional path for uploaded files
}