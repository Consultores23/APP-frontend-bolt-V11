import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Reunion } from '../../types/reunion';
import { Responsable } from '../../types/responsable';
import { Edit, Trash2, Eye, User, Calendar, Flag, Link } from 'lucide-react';
import Button from '../ui/Button';

interface ReunionCardProps {
  reunion: Reunion;
  responsable?: Responsable;
  index: number;
  onEdit: (reunion: Reunion) => void;
  onDelete: (id: string) => void;
  onViewDetails: (reunion: Reunion) => void;
}

const ReunionCard: React.FC<ReunionCardProps> = ({
  reunion,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Draggable draggableId={reunion.id} index={index}>
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
              {reunion.descripcion}
            </h4>
            {reunion.prioridad && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reunion.prioridad)}`}>
                <Flag size={12} className="inline mr-1" />
                {reunion.prioridad}
              </span>
            )}
          </div>

          <div className="space-y-2 mb-3">
            {responsable && (
              <div className="flex items-center text-xs text-gray-300">
                <User size={12} className="mr-1" />
                <span>{responsable.nombre} {responsable.apellido}</span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-300">
              <Calendar size={12} className="mr-1" />
              <span>Reunión: {formatDateTime(reunion.fecha_hora)}</span>
            </div>

            <div className="flex items-center text-xs text-gray-300">
              <Calendar size={12} className="mr-1" />
              <span>Creado: {formatDate(reunion.fecha_creacion)}</span>
            </div>

            {reunion.link && (
              <div className="flex items-center text-xs text-gray-300">
                <Link size={12} className="mr-1" />
                <a 
                  href={reunion.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-secondary-300 truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  Enlace de reunión
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reunion);
              }}
              title="Editar reunión"
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(reunion.id);
              }}
              title="Eliminar reunión"
            >
              <Trash2 size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(reunion);
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

export default ReunionCard;