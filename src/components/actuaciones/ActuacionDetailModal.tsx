import React from 'react';
import { Actuacion } from '../../types/actuacion';
import Modal from '../ui/Modal';

interface ActuacionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  actuacion: Actuacion | null;
}

const ActuacionDetailModal: React.FC<ActuacionDetailModalProps> = ({
  isOpen,
  onClose,
  actuacion,
}) => {
  if (!actuacion) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la Actuación">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Actuación</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {formatDate(actuacion.fecha_actuacion)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Registro</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {formatDateTime(actuacion.fecha_registro)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Actuación</h4>
          <div className="text-white bg-dark-700 rounded-md p-3 min-h-[100px] whitespace-pre-wrap">
            {actuacion.actuacion_texto}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Anotación</h4>
          <div className="text-white bg-dark-700 rounded-md p-3 min-h-[100px] whitespace-pre-wrap">
            {actuacion.anotacion}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha Inicio Término</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {actuacion.fecha_inicio_termino ? formatDate(actuacion.fecha_inicio_termino) : 'No especificada'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha Finaliza Término</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {actuacion.fecha_finaliza_termino ? formatDate(actuacion.fecha_finaliza_termino) : 'No especificada'}
            </p>
          </div>
        </div>

        {actuacion.fecha_inicio_termino && actuacion.fecha_finaliza_termino && (
          <div className="bg-dark-700 rounded-md p-3 border-l-4 border-secondary-500">
            <h4 className="text-sm font-medium text-gray-200 mb-1">Duración del Término</h4>
            <p className="text-white">
              {(() => {
                const inicio = new Date(actuacion.fecha_inicio_termino!);
                const fin = new Date(actuacion.fecha_finaliza_termino!);
                const diffTime = Math.abs(fin.getTime() - inicio.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
              })()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ActuacionDetailModal;