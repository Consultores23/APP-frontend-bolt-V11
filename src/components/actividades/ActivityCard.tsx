import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Actividad } from '../../types/actividad';
import { Responsable } from '../../types/responsable';
import { Edit, Trash2, Eye, User, Calendar, Flag } from 'lucide-react';
import Button from '../ui/Button';

interface ActivityCardProps {
  actividad: Actividad;
  responsable?: Responsable;
  index: number;
  onEdit: (actividad: Actividad) => void;
  onDelete: (id: string) => void;
  onViewDetails: (actividad: Actividad) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  actividad,
  responsable,
  index,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const getPriorityColor = (prioridad?: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'text-red-400 bg-red-900/20';
      case 'Media':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'Baja':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Draggable draggableId={actividad.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-dark-700 border border-dark-600 rounded-lg p-4 mb-3 transition-all duration-200 hover:border-secondary-500 ${
            snapshot.isDragging ? 'shadow-lg rotate-2 bg-dark-600' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-white font-medium text-sm line-clamp-2">
              {actividad.nombre}
            </h4>
            {actividad.prioridad && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(actividad.prioridad)}`}>
                <Flag size={12} className="inline mr-1" />
                {actividad.prioridad}
              </span>
            )}
          </div>

          {actividad.descripcion && (
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">
              {actividad.descripcion}
            </p>
          )}

          <div className="space-y-2 mb-3">
            {responsable && (
              <div className="flex items-center text-xs text-gray-300">
                <User size={12} className="mr-1" />
                <span>{responsable.nombre} {responsable.apellido}</span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-300">
              <Calendar size={12} className="mr-1" />
              <span>Creado: {formatDate(actividad.fecha_registro)}</span>
            </div>

            {actividad.fecha_inicio && (
              <div className="flex items-center text-xs text-gray-300">
                <Calendar size={12} className="mr-1" />
                <span>Inicio: {formatDateTime(actividad.fecha_inicio)}</span>
              </div>
            )}

            {actividad.fecha_fin && (
              <div className="flex items-center text-xs text-gray-300">
                <Calendar size={12} className="mr-1" />
                <span>Fin: {formatDateTime(actividad.fecha_fin)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(actividad);
              }}
              title="Editar actividad"
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(actividad.id);
              }}
              title="Eliminar actividad"
            >
              <Trash2 size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(actividad);
              }}
              title="Ver detalles"
            >
              <Eye size={12} />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ActivityCard;