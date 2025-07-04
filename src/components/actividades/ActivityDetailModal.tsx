import React, { useState } from 'react';
import { Actividad } from '../../types/actividad';
import { Responsable } from '../../types/responsable';
import Modal from '../ui/Modal';
import HorizontalMenu from '../ui/HorizontalMenu';
import ComentariosSection from './ComentariosSection';
import ActivityFilesSection from './ActivityFilesSection'; // Import the new component

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  actividad: Actividad | null;
  responsable?: Responsable;
  allResponsables: Responsable[];
  processId: string; // Add processId prop
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  actividad,
  responsable,
  allResponsables,
  processId, // Destructure new prop
}) => {
  const [activeTab, setActiveTab] = useState<'detalle' | 'comentarios' | 'archivos'>('detalle'); // Add 'archivos' to the type

  if (!actividad) return null;

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

  const menuItems = [
    { name: 'Detalle', path: 'detalle' },
    { name: 'Comentarios', path: 'comentarios' },
    { name: 'Archivos', path: 'archivos' }, // Add the new menu item
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la Actividad">
      <div className="mb-4">
        <HorizontalMenu
          items={menuItems.map(item => ({
            ...item,
            path: '#', // Path is not used for internal tab switching
            onClick: () => setActiveTab(item.path as 'detalle' | 'comentarios' | 'archivos'),
            isActive: activeTab === item.path, // Custom prop for active state
          }))}
        />
      </div>

      {activeTab === 'detalle' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Nombre</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {actividad.nombre}
            </p>
          </div>

          {actividad.descripcion && (
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Descripción</h4>
              <div className="text-white bg-dark-700 rounded-md p-3 whitespace-pre-wrap">
                {actividad.descripcion}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Estado</h4>
              <div className="bg-dark-700 rounded-md p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(actividad.estado)}`}>
                  {actividad.estado}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Prioridad</h4>
              <div className="bg-dark-700 rounded-md p-3">
                {actividad.prioridad ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(actividad.prioridad)}`}>
                    {actividad.prioridad}
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
              <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Inicio</h4>
              <p className="text-white bg-dark-700 rounded-md p-3">
                {formatDate(actividad.fecha_inicio)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Fin</h4>
              <p className="text-white bg-dark-700 rounded-md p-3">
                {formatDate(actividad.fecha_fin)}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Fecha de Creación</h4>
            <p className="text-white bg-dark-700 rounded-md p-3">
              {formatDateTime(actividad.fecha_registro)}
            </p>
          </div>

          {actividad.fecha_inicio && actividad.fecha_fin && (
            <div className="bg-dark-700 rounded-md p-3 border-l-4 border-secondary-500">
              <h4 className="text-sm font-medium text-gray-200 mb-1">Duración</h4>
              <p className="text-white">
                {(() => {
                  const inicio = new Date(actividad.fecha_inicio!);
                  const fin = new Date(actividad.fecha_fin!);
                  const diffTime = Math.abs(fin.getTime() - inicio.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                })()}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comentarios' && (
        <ComentariosSection activityId={actividad.id} responsables={allResponsables} />
      )}

      {activeTab === 'archivos' && (
        <ActivityFilesSection activityId={actividad.id} processId={processId} />
      )}
    </Modal>
  );
};

export default ActivityDetailModal;