// src/types/comentarioAudiencia.d.ts
export interface ComentarioAudiencia {
  id: string;
  audiencia_id: string;
  responsable_id: string;
  comentario_texto: string;
  fecha_creacion: string; // ISO timestamp string
}