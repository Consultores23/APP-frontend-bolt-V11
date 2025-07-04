import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Responsable } from '../../types/responsable';

interface ResponsableFormProps {
  initialData?: Responsable | null;
  onSubmit: (responsable: Omit<Responsable, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const ResponsableForm: React.FC<ResponsableFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Omit<Responsable, 'id' | 'fecha_creacion'>>({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    roles: [],
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
        telefono: initialData.telefono || '',
        correo: initialData.correo || '',
        roles: initialData.roles || [],
        estado: initialData.estado,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        roles: [],
        estado: 'Activo',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      setFormData((prev) => ({ ...prev, [name]: value.split(',').map(role => role.trim()).filter(role => role !== '') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
        <label htmlFor="roles" className="block text-sm font-medium text-gray-200 mb-1.5">
          Roles (separados por comas)
        </label>
        <textarea
          id="roles"
          name="roles"
          value={formData.roles?.join(', ') || ''}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          placeholder="Ej: Administrador, Editor"
        />
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
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear responsable'}
        </Button>
      </div>
    </form>
  );
};

export default ResponsableForm;
