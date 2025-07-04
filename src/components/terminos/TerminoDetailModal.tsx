import React from 'react';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';
import Modal from '../ui/Modal';

interface TerminoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  termino: Termino | null;
  responsable?: Responsable;
}

const TerminoDetailModal: React.FC<TerminoDetailModalProps> = ({
  isOpen,
  onClose,
  termino,
  responsable,
}) => {
  if (!termino) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Término">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Descripción</h4>
          <div className="text-white bg-dark-700 rounded-md p-3 whitespace-pre-wrap">
            {termino.descripcion}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Estado</h4>
            <div className="bg-dark-700 rounded-md p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(termino.estado)}`}>
                {termino.estado}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Prioridad</h4>
            <div className="bg-dark-700 rounded-md p-3">
              {termino.prioridad ? (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(termino.prioridad)}`}>
                  {termino.prioridad}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha Inicio Término</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {formatDate(termino.fecha_inicio_termino)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha Finaliza Término</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {formatDate(termino.fecha_finaliza_termino)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Creación</h4>
          <p className="text-white bg-dark-700 rounded-md p-3">
            {formatDateTime(termino.fecha_creacion)}
          </p>
        </div>

        {termino.fecha_inicio_termino && termino.fecha_finaliza_termino && (
          <div className="bg-dark-700 rounded-md p-3 border-l-4 border-secondary-500">
            <h4 className="text-sm font-medium text-gray-200 mb-1">Duración del Término</h4>
            <p className="text-white">
              {(() => {
                const inicio = new Date(termino.fecha_inicio_termino!);
                const fin = new Date(termino.fecha_finaliza_termino!);
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

export default TerminoDetailModal;