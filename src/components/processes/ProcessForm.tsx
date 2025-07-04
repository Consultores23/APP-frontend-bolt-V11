import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Process } from '../../types/process';

interface ProcessFormProps {
  initialData?: Process | null;
  onSubmit: (process: Omit<Process, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  clientId: string;
}

const ProcessForm: React.FC<ProcessFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  clientId,
}) => {
  const [formData, setFormData] = useState<Omit<Process, 'id' | 'fecha_creacion'>>({
    client_id: clientId,
    nombre: '',
    radicado: '',
    estado: 'Activo',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    radicado: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id,
        nombre: initialData.nombre,
        radicado: initialData.radicado,
        estado: initialData.estado,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { nombre: '', radicado: '' };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (!formData.radicado.trim()) {
      newErrors.radicado = 'El radicado es obligatorio';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        error={errors.nombre}
        required
      />
      <Input
        label="Radicado"
        name="radicado"
        value={formData.radicado}
        onChange={handleChange}
        error={errors.radicado}
        required
      />
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
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear proceso'}
        </Button>
      </div>
    </form>
  );
};

export default ProcessForm;