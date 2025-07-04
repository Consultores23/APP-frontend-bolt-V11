import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Actividad } from '../../types/actividad';
import { Responsable } from '../../types/responsable';
import KanbanColumn from './KanbanColumn';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Search, Plus, Filter } from 'lucide-react';

interface KanbanBoardProps {
  // Paginated activities for each column
  paginatedPendientes: Actividad[];
  paginatedEnProceso: Actividad[];
  paginatedFinalizadas: Actividad[];
  
  // Pagination state for each column
  currentPagePendientes: number;
  currentPageEnProceso: number;
  currentPageFinalizadas: number;
  totalPagesPendientes: number;
  totalPagesEnProceso: number;
  totalPagesFinalizadas: number;
  
  // Pagination handlers for each column
  onPageChangePendientes: (page: number) => void;
  onPageChangeEnProceso: (page: number) => void;
  onPageChangeFinalizadas: (page: number) => void;
  
  // Other props
  responsables: Responsable[];
  searchTerm: string;
  selectedResponsable: string;
  dateFilter: string;
  onSearchChange: (value: string) => void;
  onResponsableFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onDragEnd: (result: DropResult) => void;
  onEdit: (actividad: Actividad) => void;
  onDelete: (id: string) => void;
  onViewDetails: (actividad: Actividad) => void;
  onCreateActivity: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  paginatedPendientes,
  paginatedEnProceso,
  paginatedFinalizadas,
  currentPagePendientes,
  currentPageEnProceso,
  currentPageFinalizadas,
  totalPagesPendientes,
  totalPagesEnProceso,
  totalPagesFinalizadas,
  onPageChangePendientes,
  onPageChangeEnProceso,
  onPageChangeFinalizadas,
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
  onCreateActivity,
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
              placeholder="Buscar por nombre de actividad..."
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
        
        <Button onClick={onCreateActivity}>
          <Plus size={18} className="mr-2" /> Nueva Actividad
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <KanbanColumn
            title="Pendientes"
            droppableId="Pendiente"
            actividades={paginatedPendientes}
            responsables={responsables}
            currentPage={currentPagePendientes}
            totalPages={totalPagesPendientes}
            onPageChange={onPageChangePendientes}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            title="En Proceso"
            droppableId="En Proceso"
            actividades={paginatedEnProceso}
            responsables={responsables}
            currentPage={currentPageEnProceso}
            totalPages={totalPagesEnProceso}
            onPageChange={onPageChangeEnProceso}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            title="Finalizado"
            droppableId="Finalizado"
            actividades={paginatedFinalizadas}
            responsables={responsables}
            currentPage={currentPageFinalizadas}
            totalPages={totalPagesFinalizadas}
            onPageChange={onPageChangeFinalizadas}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;