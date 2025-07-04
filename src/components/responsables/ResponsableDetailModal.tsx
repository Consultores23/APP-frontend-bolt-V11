import React from 'react';
import { Responsable } from '../../types/responsable';
import Modal from '../ui/Modal';

interface ResponsableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  responsable: Responsable | null;
}

const ResponsableDetailModal: React.FC<ResponsableDetailModalProps> = ({
  isOpen,
  onClose,
  responsable,
}) => {
  if (!responsable) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Responsable">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Nombre Completo</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable.nombre} {responsable.apellido}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Correo</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable.correo || 'N/A'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Teléfono</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable.telefono || 'N/A'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Roles</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable.roles && responsable.roles.length > 0 ? responsable.roles.join(', ') : 'N/A'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Estado</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable.estado}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Creación</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {formatDateTime(responsable.fecha_creacion)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ResponsableDetailModal;
