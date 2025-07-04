import React, { useState, useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Actuacion } from '../../types/actuacion';

interface ActuacionFormProps {
  initialData?: Actuacion | null;
  onSubmit: (actuacion: Omit<Actuacion, 'id'>, files: FileList | null) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  processId: string;
}

const ActuacionForm: React.FC<ActuacionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  processId,
}) => {
  const [formData, setFormData] = useState<Omit<Actuacion, 'id'>>({
    process_id: processId,
    fecha_actuacion: '',
    actuacion_texto: '',
    anotacion: '',
    fecha_inicio_termino: '',
    fecha_finaliza_termino: '',
    fecha_registro: '',
    storage_path: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState({
    fecha_actuacion: '',
    actuacion_texto: '',
    anotacion: '',
    fecha_registro: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        process_id: initialData.process_id,
        fecha_actuacion: initialData.fecha_actuacion,
        actuacion_texto: initialData.actuacion_texto,
        anotacion: initialData.anotacion,
        fecha_inicio_termino: initialData.fecha_inicio_termino || '',
        fecha_finaliza_termino: initialData.fecha_finaliza_termino || '',
        fecha_registro: initialData.fecha_registro ? 
          new Date(initialData.fecha_registro).toISOString().slice(0, 16) : '',
        storage_path: initialData.storage_path || '',
      });
    } else {
      // Set current date and time as default for new actuaciones
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      
      setFormData({
        process_id: processId,
        fecha_actuacion: '',
        actuacion_texto: '',
        anotacion: '',
        fecha_inicio_termino: '',
        fecha_finaliza_termino: '',
        fecha_registro: localDateTime,
        storage_path: '',
      });
    }
  }, [initialData, processId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const validate = () => {
    let valid = true;
    const newErrors = { 
      fecha_actuacion: '', 
      actuacion_texto: '', 
      anotacion: '',
      fecha_registro: ''
    };

    if (!formData.fecha_actuacion) {
      newErrors.fecha_actuacion = 'La fecha de actuación es obligatoria';
      valid = false;
    }

    if (!formData.actuacion_texto.trim()) {
      newErrors.actuacion_texto = 'El texto de la actuación es obligatorio';
      valid = false;
    }

    if (!formData.anotacion.trim()) {
      newErrors.anotacion = 'La anotación es obligatoria';
      valid = false;
    }

    if (!formData.fecha_registro) {
      newErrors.fecha_registro = 'La fecha de registro es obligatoria';
      valid = false;
    }

    // Validate date logic if both termino dates are provided
    if (formData.fecha_inicio_termino && formData.fecha_finaliza_termino) {
      if (new Date(formData.fecha_inicio_termino) > new Date(formData.fecha_finaliza_termino)) {
        newErrors.fecha_actuacion = 'La fecha de inicio del término no puede ser posterior a la fecha de finalización';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Clean up empty optional fields and convert fecha_registro to ISO string
      const cleanedData = {
        ...formData,
        fecha_inicio_termino: formData.fecha_inicio_termino || undefined,
        fecha_finaliza_termino: formData.fecha_finaliza_termino || undefined,
        fecha_registro: new Date(formData.fecha_registro).toISOString(),
        storage_path: formData.storage_path || undefined,
      };
      await onSubmit(cleanedData, selectedFiles);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Fecha de Actuación"
        name="fecha_actuacion"
        type="date"
        value={formData.fecha_actuacion}
        onChange={handleChange}
        error={errors.fecha_actuacion}
        required
      />

      <div>
        <label htmlFor="actuacion_texto" className="block text-sm font-medium text-gray-200 mb-1.5">
          Actuación *
        </label>
        <textarea
          id="actuacion_texto"
          name="actuacion_texto"
          value={formData.actuacion_texto}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          placeholder="Describe la actuación realizada..."
        />
        {errors.actuacion_texto && <p className="mt-1.5 text-sm text-red-400">{errors.actuacion_texto}</p>}
      </div>

      <div>
        <label htmlFor="anotacion" className="block text-sm font-medium text-gray-200 mb-1.5">
          Anotación *
        </label>
        <textarea
          id="anotacion"
          name="anotacion"
          value={formData.anotacion}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          placeholder="Añade una anotación..."
        />
        {errors.anotacion && <p className="mt-1.5 text-sm text-red-400">{errors.anotacion}</p>}
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
      />

      <Input
        label="Fecha de Registro"
        name="fecha_registro"
        type="datetime-local"
        value={formData.fecha_registro}
        onChange={handleChange}
        error={errors.fecha_registro}
        required
      />

      <div>
        <label htmlFor="files" className="block text-sm font-medium text-gray-200 mb-1.5">
          Archivos Relacionados (Opcional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="files"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary-500 file:text-white hover:file:bg-secondary-600 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
        />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">
              {selectedFiles.length} archivo(s) seleccionado(s):
            </p>
            <ul className="text-sm text-gray-300 mt-1">
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index} className="truncate">• {file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Los archivos se guardarán en el directorio "Actuaciones" del proceso.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Guardar cambios' : 'Crear actuación'}
        </Button>
      </div>
    </form>
  );
};

export default ActuacionForm;