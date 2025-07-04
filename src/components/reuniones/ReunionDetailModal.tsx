import React from 'react';
import { Reunion } from '../../types/reunion';
import { Responsable } from '../../types/responsable';
import Modal from '../ui/Modal';

interface ReunionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reunion: Reunion | null;
  responsable?: Responsable;
}

const ReunionDetailModal: React.FC<ReunionDetailModalProps> = ({
  isOpen,
  onClose,
  reunion,
  responsable,
}) => {
  if (!reunion) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridad?: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la Reunión">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Descripción</h4>
          <div className="text-white bg-dark-700 rounded-md p-3 whitespace-pre-wrap">
            {reunion.descripcion}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Estado</h4>
            <div className="bg-dark-700 rounded-md p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(reunion.estado)}`}>
                {reunion.estado}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Prioridad</h4>
            <div className="bg-dark-700 rounded-md p-3">
              {reunion.prioridad ? (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(reunion.prioridad)}`}>
                  {reunion.prioridad}
                </span>
              ) : (
                <span className="text-gray-400">No definida</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Responsable</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {responsable ? `${responsable.nombre} ${responsable.apellido}` : 'No asignado'}
          </p>
        </div>

        {reunion.link && (
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Enlace</h4>
            <div className="bg-dark-700 rounded-md p-3">
              <a 
                href={reunion.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-300 break-all"
              >
                {reunion.link}
              </a>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha y Hora de la Reunión</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {formatDateTime(reunion.fecha_hora)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Creación</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {formatDateTime(reunion.fecha_creacion)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReunionDetailModal;