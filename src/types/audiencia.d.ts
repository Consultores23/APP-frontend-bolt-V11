// src/types/audiencia.d.ts
export interface Audiencia {
  id: string;
  process_id: string;
  descripcion: string;
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado';
  prioridad?: 'Alta' | 'Media' | 'Baja';
  responsable_id?: string;
  link?: string;
  fecha_hora: string; // ISO timestamp string
  fecha_creacion: string; // ISO timestamp string
  archivos_adjuntos?: string[]; // Nueva propiedad
}