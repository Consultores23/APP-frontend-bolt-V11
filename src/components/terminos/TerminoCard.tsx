import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';
import { Edit, Trash2, Eye, User, Calendar, Flag, Clock } from 'lucide-react';
import Button from '../ui/Button';

interface TerminoCardProps {
  termino: Termino;
  responsable?: Responsable;
  index: number;
  onEdit: (termino: Termino) => void;
  onDelete: (id: string) => void;
  onViewDetails: (termino: Termino) => void;
}

const TerminoCard: React.FC<TerminoCardProps> = ({
  termino,
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = () => {
    if (!termino.fecha_inicio_termino || !termino.fecha_finaliza_termino) return null;
    
    const inicio = new Date(termino.fecha_inicio_termino);
    const fin = new Date(termino.fecha_finaliza_termino);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <Draggable draggableId={termino.id} index={index}>
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
              {termino.descripcion}
            </h4>
            {termino.prioridad && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(termino.prioridad)}`}>
                <Flag size={12} className="inline mr-1" />
                {termino.prioridad}
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
              <span>Creado: {formatDate(termino.fecha_creacion)}</span>
            </div>

            {termino.fecha_inicio_termino && (
              <div className="flex items-center text-xs text-gray-300">
                <Calendar size={12} className="mr-1" />
                <span>Inicio: {formatDate(termino.fecha_inicio_termino)}</span>
              </div>
            )}

            {termino.fecha_finaliza_termino && (
              <div className="flex items-center text-xs text-gray-300">
                <Calendar size={12} className="mr-1" />
                <span>Fin: {formatDate(termino.fecha_finaliza_termino)}</span>
              </div>
            )}

            {calculateDuration() && (
              <div className="flex items-center text-xs text-secondary-400">
                <Clock size={12} className="mr-1" />
                <span>Duración: {calculateDuration()}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(termino);
              }}
              title="Editar término"
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(termino.id);
              }}
              title="Eliminar término"
            >
              <Trash2 size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(termino);
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

export default TerminoCard;