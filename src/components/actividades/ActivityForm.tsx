// src/components/actividades/ActivityForm.tsx
import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Actividad } from '../../types/actividad';
import { Responsable } from '../../types/responsable';
import HorizontalMenu from '../ui/HorizontalMenu'; // Import HorizontalMenu
import FilesSelection from './FilesSelection'; // Import FilesSelection

interface ActivityFormProps {
  initialData?: Actividad | null;
  responsables: Responsable[];
  onSubmit: (actividad: Omit<Actividad, 'id' | 'fecha_registro'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  processId: string;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  responsables,
  onSubmit,
  onCancel,
  isLoading,
  processId,
}) => {
  const [formData, setFormData] = useState<Omit<Actividad, 'id' | 'fecha_registro'>>({
    process_id: processId,
    responsable_id: '',
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    archivos_adjuntos: [], // Initialize with empty array
  });

  const [errors, setErrors] = useState({
    nombre: '',
    responsable_id: '',
  });

  const [activeTab, setActiveTab] = useState<'detalle' | 'archivos'>('detalle');
  const [selectedFilesForActivity, setSelectedFilesForActivity] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        process_id: initialData.process_id,
        responsable_id: initialData.responsable_id,
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || '',
        fecha_inicio: initialData.fecha_inicio
          ? new Date(initialData.fecha_inicio).toISOString().slice(0, 16)
          : '',
        fecha_fin: initialData.fecha_fin
          ? new Date(initialData.fecha_fin).toISOString().slice(0, 16)
          : '',
        estado: initialData.estado,
        prioridad: initialData.prioridad || 'Media',
        archivos_adjuntos: initialData.archivos_adjuntos || [], // Load existing files
      });
      setSelectedFilesForActivity(initialData.archivos_adjuntos || []);
    } else {
      setFormData({
        process_id: processId,
        responsable_id: '',
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'Pendiente',
        prioridad: 'Media',
        archivos_adjuntos: [],
      });
      setSelectedFilesForActivity([]);
    }
  }, [initialData, processId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFilesSelectionChange = (files: string[]) => {
    setSelectedFilesForActivity(files);
  };

  const validate = () => {
    let valid = true;
    const newErrors = { nombre: '', responsable_id: '' };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (!formData.responsable_id) {
      newErrors.responsable_id = 'El responsable es obligatorio';
      valid = false;
    }

    // Validate date logic if both dates are provided
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
        newErrors.nombre = 'La fecha de inicio no puede ser posterior a la fecha de fin';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Clean up empty optional fields and convert datetime-local to ISO string
      const cleanedData = {
        ...formData,
        descripcion: formData.descripcion || undefined,
        fecha_inicio: formData.fecha_inicio
          ? new Date(formData.fecha_inicio).toISOString()
          : undefined,
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : undefined,
        prioridad: formData.prioridad || undefined,
        archivos_adjuntos: selectedFilesForActivity, // Include selected files
      };
      await onSubmit(cleanedData);
    }
  };

  const menuItems = [
    {
      name: 'Detalle',
      path: '#',
      onClick: () => setActiveTab('detalle'),
      isActive: activeTab === 'detalle',
    },
    {
      name: 'Archivos',
      path: '#',
      onClick: () => setActiveTab('archivos'),
      isActive: activeTab === 'archivos',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <HorizontalMenu items={menuItems} />
      </div>

      {activeTab === 'detalle' && (
        <>
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-200 mb-1.5">
              Descripción (Opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              placeholder="Describe la actividad..."
            />
          </div>

          <div>
            <label htmlFor="responsable_id" className="block text-sm font-medium text-gray-200 mb-1.5">
              Responsable *
            </label>
            <select
              id="responsable_id"
              name="responsable_id"
              value={formData.responsable_id}
              onChange={handleChange}
              className="w-full rounded-md py-2.5 bg-dark-700 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            >
              <option value="">Seleccionar responsable</option>
              {responsables.map((responsable) => (
                <option key={responsable.id} value={responsable.id}>
                  {responsable.nombre} {responsable.apellido}
                </option>
              ))}
            </select>
            {errors.responsable_id && <p className="mt-1.5 text-sm text-red-400">{errors.responsable_id}</p>}
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-200 mb-1.5">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full rounded-md py-2.5 bg-dark-700 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-200 mb-1.5">
              Prioridad
            </label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="w-full rounded-md py-2.5 bg-dark-700 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <Input
            label="Fecha de Inicio (Opcional)"
            name="fecha_inicio"
            type="datetime-local"
            value={formData.fecha_inicio}
            onChange={handleChange}
          />

          <Input
            label="Fecha de Fin (Opcional)"
            name="fecha_fin"
            type="datetime-local"
            value={formData.fecha_fin}
            onChange={handleChange}
          />
        </>
      )}

      {activeTab === 'archivos' && (
        <FilesSelection
          processId={processId}
          onSelectionChange={handleFilesSelectionChange}
          initialSelectedFiles={initialData?.archivos_adjuntos}
        />
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear actividad'}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
