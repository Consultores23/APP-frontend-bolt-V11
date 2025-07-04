// src/types/termino.d.ts
export interface Termino {
  id: string;
  process_id: string;
  descripcion: string;
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado';
  prioridad?: 'Alta' | 'Media' | 'Baja';
  responsable_id?: string;
  fecha_inicio_termino?: string; // ISO date string (YYYY-MM-DD)
  fecha_finaliza_termino?: string; // ISO date string (YYYY-MM-DD)
  fecha_creacion: string; // ISO timestamp string
}