import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';

interface TerminoFormProps {
  initialData?: Termino | null;
  responsables: Responsable[];
  onSubmit: (termino: Omit<Termino, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  processId: string;
}

const TerminoForm: React.FC<TerminoFormProps> = ({
  initialData,
  responsables,
  onSubmit,
  onCancel,
  isLoading,
  processId,
}) => {
  const [formData, setFormData] = useState<Omit<Termino, 'id' | 'fecha_creacion'>>({
    process_id: processId,
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    responsable_id: '',
    fecha_inicio_termino: '',
    fecha_finaliza_termino: '',
  });

  const [errors, setErrors] = useState({
    descripcion: '',
    fecha_finaliza_termino: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        process_id: initialData.process_id,
        descripcion: initialData.descripcion,
        estado: initialData.estado,
        prioridad: initialData.prioridad || 'Media',
        responsable_id: initialData.responsable_id || '',
        fecha_inicio_termino: initialData.fecha_inicio_termino || '',
        fecha_finaliza_termino: initialData.fecha_finaliza_termino || '',
      });
    } else {
      setFormData({
        process_id: processId,
        descripcion: '',
        estado: 'Pendiente',
        prioridad: 'Media',
        responsable_id: '',
        fecha_inicio_termino: '',
        fecha_finaliza_termino: '',
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
    const newErrors = { descripcion: '', fecha_finaliza_termino: '' };

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
      valid = false;
    }

    // Validate date logic if both dates are provided
    if (formData.fecha_inicio_termino && formData.fecha_finaliza_termino) {
      if (new Date(formData.fecha_inicio_termino) > new Date(formData.fecha_finaliza_termino)) {
        newErrors.fecha_finaliza_termino = 'La fecha de fin no puede ser anterior a la fecha de inicio';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Clean up empty optional fields
      const cleanedData = {
        ...formData,
        responsable_id: formData.responsable_id || undefined,
        fecha_inicio_termino: formData.fecha_inicio_termino || undefined,
        fecha_finaliza_termino: formData.fecha_finaliza_termino || undefined,
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
          placeholder="Describe el término..."
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
        label="Fecha Inicio Término (Opcional)"
        name="fecha_inicio_termino"
        type="date"
        value={formData.fecha_inicio_termino}
        onChange={handleChange}
      />

      <Input
        label="Fecha Finaliza Término (Opcional)"
        name="fecha_finaliza_termino"
        type="date"
        value={formData.fecha_finaliza_termino}
        onChange={handleChange}
        error={errors.fecha_finaliza_termino}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear término'}
        </Button>
      </div>
    </form>
  );
};

export default TerminoForm;