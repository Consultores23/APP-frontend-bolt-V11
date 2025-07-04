export interface ComentarioActividad {
  id: string;
  activity_id: string;
  responsable_id: string;
  comentario_texto: string;
  fecha_creacion: string; // ISO timestamp string
}
