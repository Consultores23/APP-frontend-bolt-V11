import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';
import TerminoCard from './TerminoCard';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TerminoKanbanColumnProps {
  title: string;
  droppableId: string;
  terminos: Termino[];
  responsables: Responsable[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (termino: Termino) => void;
  onDelete: (id: string) => void;
  onViewDetails: (termino: Termino) => void;
}

const TerminoKanbanColumn: React.FC<TerminoKanbanColumnProps> = ({
  title,
  droppableId,
  terminos,
  responsables,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const getResponsableById = (responsableId?: string) => {
    return responsableId ? responsables.find(r => r.id === responsableId) : undefined;
  };

  return (
    <div className="bg-dark-800/50 rounded-lg shadow-md w-full md:w-1/3 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-dark-700 pb-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
          {terminos.length}
        </span>
      </div>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] flex-1 transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-secondary-500/10 rounded-lg' : ''
            }`}
          >
            {terminos.map((termino, index) => (
              <TerminoCard
                key={termino.id}
                termino={termino}
                responsable={getResponsableById(termino.responsable_id)}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
              />
            ))}
            {provided.placeholder}
            
            {terminos.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>No hay términos en esta columna</p>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-xs"
            >
              <ChevronLeft size={14} />
            </Button>
            
            <span className="text-xs text-gray-400">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-xs"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminoKanbanColumn;