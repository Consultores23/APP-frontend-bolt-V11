export interface Client {
  id: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string; // ISO string
}
