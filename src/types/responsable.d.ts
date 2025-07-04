export interface Responsable {
  id: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  roles?: string[]; // Array of strings
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string; // ISO string
}
