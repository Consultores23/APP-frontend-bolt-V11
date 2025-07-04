import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Client } from '../../types/client';

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (client: Omit<Client, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'fecha_creacion'>>({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    estado: 'Activo',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        apellido: initialData.apellido || '',
        correo: initialData.correo || '',
        telefono: initialData.telefono || '',
        estado: initialData.estado,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        estado: 'Activo',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { nombre: '', correo: '' };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
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
        label="Apellido"
        name="apellido"
        value={formData.apellido}
        onChange={handleChange}
      />
      <Input
        label="Correo"
        name="correo"
        type="email"
        value={formData.correo}
        onChange={handleChange}
        error={errors.correo}
      />
      <Input
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
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
          {initialData ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
