import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Reunion } from '../../types/reunion';
import { Responsable } from '../../types/responsable';

interface ReunionFormProps {
  initialData?: Reunion | null;
  responsables: Responsable[];
  onSubmit: (reunion: Omit<Reunion, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  processId: string;
}

const ReunionForm: React.FC<ReunionFormProps> = ({
  initialData,
  responsables,
  onSubmit,
  onCancel,
  isLoading,
  processId,
}) => {
  const [formData, setFormData] = useState<Omit<Reunion, 'id' | 'fecha_creacion'>>({
    process_id: processId,
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    responsable_id: '',
    link: '',
    fecha_hora: '',
  });

  const [errors, setErrors] = useState({
    descripcion: '',
    fecha_hora: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        process_id: initialData.process_id,
        descripcion: initialData.descripcion,
        estado: initialData.estado,
        prioridad: initialData.prioridad || 'Media',
        responsable_id: initialData.responsable_id || '',
        link: initialData.link || '',
        fecha_hora: initialData.fecha_hora
          ? new Date(initialData.fecha_hora).toISOString().slice(0, 16)
          : '',
      });
    } else {
      setFormData({
        process_id: processId,
        descripcion: '',
        estado: 'Pendiente',
        prioridad: 'Media',
        responsable_id: '',
        link: '',
        fecha_hora: '',
      });
    }
  }, [initialData, processId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { descripcion: '', fecha_hora: '' };

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
      valid = false;
    }

    if (!formData.fecha_hora) {
      newErrors.fecha_hora = 'La fecha y hora de la reunión es obligatoria';
      valid = false;
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
        responsable_id: formData.responsable_id || undefined,
        link: formData.link || undefined,
        fecha_hora: new Date(formData.fecha_hora).toISOString(),
      };
      await onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-200 mb-1.5">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          placeholder="Describe la reunión..."
        />
        {errors.descripcion && <p className="mt-1.5 text-sm text-red-400">{errors.descripcion}</p>}
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

      <div>
        <label htmlFor="responsable_id" className="block text-sm font-medium text-gray-200 mb-1.5">
          Responsable (Opcional)
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
      </div>

      <Input
        label="Enlace (Opcional)"
        name="link"
        type="url"
        value={formData.link}
        onChange={handleChange}
        placeholder="https://ejemplo.com/reunion"
      />

      <Input
        label="Fecha y Hora de la Reunión"
        name="fecha_hora"
        type="datetime-local"
        value={formData.fecha_hora}
        onChange={handleChange}
        error={errors.fecha_hora}
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear reunión'}
        </Button>
      </div>
    </form>
  );
};

export default ReunionForm;