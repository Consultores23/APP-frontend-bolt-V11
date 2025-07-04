import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SujetoProcesal } from '../../types/sujetoProcesal';

interface SujetoProcesalFormProps {
  initialData?: SujetoProcesal | null;
  onSubmit: (sujeto: Omit<SujetoProcesal, 'id' | 'fecha_creacion'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  processId: string;
}

const SujetoProcesalForm: React.FC<SujetoProcesalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  processId,
}) => {
  const [formData, setFormData] = useState<Omit<SujetoProcesal, 'id' | 'fecha_creacion'>>({
    process_id: processId,
    nombre: '',
    tipo: '',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    tipo: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        process_id: initialData.process_id,
        nombre: initialData.nombre,
        tipo: initialData.tipo,
      });
    } else {
      setFormData({
        process_id: processId,
        nombre: '',
        tipo: '',
      });
    }
  }, [initialData, processId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { nombre: '', tipo: '' };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo es obligatorio';
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
        label="Tipo"
        name="tipo"
        value={formData.tipo}
        onChange={handleChange}
        error={errors.tipo}
        required
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear Sujeto Procesal'}
        </Button>
      </div>
    </form>
  );
};

export default SujetoProcesalForm;
