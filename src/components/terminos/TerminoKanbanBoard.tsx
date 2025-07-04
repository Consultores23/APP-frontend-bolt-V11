import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';
import TerminoKanbanColumn from './TerminoKanbanColumn';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Search, Plus, Filter } from 'lucide-react';

interface TerminoKanbanBoardProps {
  // Paginated terminos for each column
  paginatedPendientes: Termino[];
  paginatedEnProceso: Termino[];
  paginatedFinalizados: Termino[];
  
  // Pagination state for each column
  currentPagePendientes: number;
  currentPageEnProceso: number;
  currentPageFinalizados: number;
  totalPagesPendientes: number;
  totalPagesEnProceso: number;
  totalPagesFinalizados: number;
  
  // Pagination handlers for each column
  onPageChangePendientes: (page: number) => void;
  onPageChangeEnProceso: (page: number) => void;
  onPageChangeFinalizados: (page: number) => void;
  
  // Other props
  responsables: Responsable[];
  searchTerm: string;
  selectedResponsable: string;
  dateFilter: string;
  onSearchChange: (value: string) => void;
  onResponsableFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onDragEnd: (result: DropResult) => void;
  onEdit: (termino: Termino) => void;
  onDelete: (id: string) => void;
  onViewDetails: (termino: Termino) => void;
  onCreateTermino: () => void;
}

const TerminoKanbanBoard: React.FC<TerminoKanbanBoardProps> = ({
  paginatedPendientes,
  paginatedEnProceso,
  paginatedFinalizados,
  currentPagePendientes,
  currentPageEnProceso,
  currentPageFinalizados,
  totalPagesPendientes,
  totalPagesEnProceso,
  totalPagesFinalizados,
  onPageChangePendientes,
  onPageChangeEnProceso,
  onPageChangeFinalizados,
  responsables,
  searchTerm,
  selectedResponsable,
  dateFilter,
  onSearchChange,
  onResponsableFilterChange,
  onDateFilterChange,
  onDragEnd,
  onEdit,
  onDelete,
  onViewDetails,
  onCreateTermino,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <Input
              label=""
              name="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={<Search size={18} />}
              placeholder="Buscar por descripción de término..."
            />
          </div>
          
          <div className="flex gap-2">
            <div className="min-w-[200px]">
              <select
                value={selectedResponsable}
                onChange={(e) => onResponsableFilterChange(e.target.value)}
                className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              >
                <option value="">Todos los responsables</option>
                {responsables.map((responsable) => (
                  <option key={responsable.id} value={responsable.id}>
                    {responsable.nombre} {responsable.apellido}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="min-w-[150px]">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
                title="Filtrar por fecha de creación"
              />
            </div>
          </div>
        </div>
        
        <Button onClick={onCreateTermino}>
          <Plus size={18} className="mr-2" /> Nuevo Término
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <TerminoKanbanColumn
            title="Pendientes"
            droppableId="Pendiente"
            terminos={paginatedPendientes}
            responsables={responsables}
            currentPage={currentPagePendientes}
            totalPages={totalPagesPendientes}
            onPageChange={onPageChangePendientes}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
          <TerminoKanbanColumn
            title="En Proceso"
            droppableId="En Proceso"
            terminos={paginatedEnProceso}
            responsables={responsables}
            currentPage={currentPageEnProceso}
            totalPages={totalPagesEnProceso}
            onPageChange={onPageChangeEnProceso}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
          <TerminoKanbanColumn
            title="Finalizado"
            droppableId="Finalizado"
            terminos={paginatedFinalizados}
            responsables={responsables}
            currentPage={currentPageFinalizados}
            totalPages={totalPagesFinalizados}
            onPageChange={onPageChangeFinalizados}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        </div>
      </DragDropContext>
    </div>
  );
};

export default TerminoKanbanBoard;