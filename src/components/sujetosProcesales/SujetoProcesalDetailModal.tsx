import React from 'react';
import { SujetoProcesal } from '../../types/sujetoProcesal';
import Modal from '../ui/Modal';

interface SujetoProcesalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sujetoProcesal: SujetoProcesal | null;
}

const SujetoProcesalDetailModal: React.FC<SujetoProcesalDetailModalProps> = ({
  isOpen,
  onClose,
  sujetoProcesal,
}) => {
  if (!sujetoProcesal) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Sujeto Procesal">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Nombre</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {sujetoProcesal.nombre}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Tipo</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {sujetoProcesal.tipo}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Creación</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {formatDateTime(sujetoProcesal.fecha_creacion)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SujetoProcesalDetailModal;
