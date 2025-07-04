// src/types/actividad.d.ts
export interface Actividad {
  id: string;
  process_id: string;
  responsable_id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string; // ISO timestamp string (can store full datetime)
  fecha_fin?: string; // ISO timestamp string (can store full datetime)
  fecha_registro: string; // ISO timestamp string
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado';
  prioridad?: 'Alta' | 'Media' | 'Baja';
  archivos_adjuntos?: string[]; // Nueva propiedad para almacenar rutas de archivos adjuntos
}
