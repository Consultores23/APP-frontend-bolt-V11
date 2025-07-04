// src/pages/process_details/tableros/ActividadesTableroPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabase';
import { Actividad } from '../../../types/actividad';
import { Responsable } from '../../../types/responsable';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../../../components/actividades/KanbanBoard';
import Modal from '../../../components/ui/Modal';
import ActivityForm from '../../../components/actividades/ActivityForm';
import ActivityDetailModal from '../../../components/actividades/ActivityDetailModal';

const ITEMS_PER_PAGE = 5;

const ActividadesTableroPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();
  
  // State for activities and responsables
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]); // This holds all responsables
  const [filteredActividades, setFilteredActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states for each column
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
  const [currentPageFinalizadas, setCurrentPageFinalizadas] = useState(1);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch responsables
  const fetchResponsables = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('responsables')
        .select('*')
        .eq('estado', 'Activo')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setResponsables(data || []);
    } catch (err: any) {
      console.error('Error fetching responsables:', err.message);
      toast.error('Error al cargar los responsables.');
    }
  }, []);

  // Fetch activities
  const fetchActividades = useCallback(async () => {
    if (!processId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('process_id', processId)
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      setActividades(data || []);
    } catch (err: any) {
      console.error('Error fetching actividades:', err.message);
      toast.error('Error al cargar las actividades.');
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...actividades];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(actividad =>
        actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (actividad.descripcion && actividad.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by responsable
    if (selectedResponsable) {
      filtered = filtered.filter(actividad => actividad.responsable_id === selectedResponsable);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(actividad => {
        const actividadDate = new Date(actividad.fecha_registro).toISOString().split('T')[0];
        return actividadDate === dateFilter;
      });
    }

    setFilteredActividades(filtered);
  }, [actividades, searchTerm, selectedResponsable, dateFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchResponsables();
    fetchActividades();
  }, [fetchResponsables, fetchActividades]);

  // Separate activities by status
  const pendientes = filteredActividades.filter(a => a.estado === 'Pendiente');
  const enProceso = filteredActividades.filter(a => a.estado === 'En Proceso');
  const finalizadas = filteredActividades.filter(a => a.estado === 'Finalizado');

  // Calculate pagination for each column
  const totalPagesPendientes = Math.ceil(pendientes.length / ITEMS_PER_PAGE);
  const totalPagesEnProceso = Math.ceil(enProceso.length / ITEMS_PER_PAGE);
  const totalPagesFinalizadas = Math.ceil(finalizadas.length / ITEMS_PER_PAGE);

  // Get paginated activities for each column
  const getPaginatedActivities = (activities: Actividad[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return activities.slice(startIndex, endIndex);
  };

  const paginatedPendientes = getPaginatedActivities(pendientes, currentPagePendientes);
  const paginatedEnProceso = getPaginatedActivities(enProceso, currentPageEnProceso);
  const paginatedFinalizadas = getPaginatedActivities(finalizadas, currentPageFinalizadas);

  // Pagination handlers
  const handlePageChangePendientes = (page: number) => {
    setCurrentPagePendientes(page);
  };

  const handlePageChangeEnProceso = (page: number) => {
    setCurrentPageEnProceso(page);
  };

  const handlePageChangeFinalizadas = (page: number) => {
    setCurrentPageFinalizadas(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPagePendientes(1);
    setCurrentPageEnProceso(1);
    setCurrentPageFinalizadas(1);
  }, [searchTerm, selectedResponsable, dateFilter]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const actividad = actividades.find(a => a.id === draggableId);
    if (!actividad) return;

    const newEstado = destination.droppableId as 'Pendiente' | 'En Proceso' | 'Finalizado';
    const currentTimestamp = new Date().toISOString();

    let updateData: Partial<Actividad> = { estado: newEstado };

    // Update dates based on state change
    if (newEstado === 'En Proceso' && actividad.estado === 'Pendiente') {
      updateData.fecha_inicio = currentTimestamp;
    } else if (newEstado === 'Finalizado') {
      updateData.fecha_fin = currentTimestamp;
      // If moving directly from Pendiente to Finalizado, also set fecha_inicio
      if (actividad.estado === 'Pendiente') {
        updateData.fecha_inicio = currentTimestamp;
      }
    }

    try {
      const { error } = await supabase
        .from('actividades')
        .update(updateData)
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setActividades(prev => prev.map(a => 
        a.id === draggableId ? { ...a, ...updateData } : a
      ));

      toast.success(`Actividad movida a ${newEstado}`);
    } catch (err: any) {
      console.error('Error updating actividad:', err.message);
      toast.error('Error al actualizar la actividad.');
    }
  };

  // CRUD operations
  const handleCreateActividad = () => {
    setEditingActividad(null);
    setIsCreateModalOpen(true);
  };

  const handleEditActividad = (actividad: Actividad) => {
    setEditingActividad(actividad);
    setIsEditModalOpen(true);
  };

  const handleDeleteActividad = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        const { error } = await supabase
          .from('actividades')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setActividades(prev => prev.filter(a => a.id !== id));
        toast.success('Actividad eliminada correctamente.');
      } catch (err: any) {
        console.error('Error deleting actividad:', err.message);
        toast.error('Error al eliminar la actividad.');
      }
    }
  };

  const handleViewDetails = (actividad: Actividad) => {
    setSelectedActividad(actividad);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Actividad, 'id' | 'fecha_registro'>) => {
    setIsSubmitting(true);
    try {
      if (editingActividad) {
        // Update existing actividad
        const { error } = await supabase
          .from('actividades')
          .update(formData)
          .eq('id', editingActividad.id);

        if (error) throw error;

        setActividades(prev => prev.map(a => 
          a.id === editingActividad.id ? { ...a, ...formData } : a
        ));
        toast.success('Actividad actualizada correctamente.');
        setIsEditModalOpen(false);
      } else {
        // Create new actividad
        const { data, error } = await supabase
          .from('actividades')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        setActividades(prev => [data, ...prev]);
        toast.success('Actividad creada correctamente.');
        setIsCreateModalOpen(false);
      }

      setEditingActividad(null);
    } catch (err: any) {
      console.error('Error saving actividad:', err.message);
      toast.error(`Error al guardar la actividad: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponsableById = (responsableId: string) => {
    return responsables.find(r => r.id === responsableId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Tablero de Actividades</h2>
        <p className="text-gray-400">
          Gestiona las actividades del proceso usando el tablero Kanban. Arrastra las tarjetas entre columnas para cambiar su estado.
        </p>
      </div>

      {/* Renderizado condicional del KanbanBoard */}
      {!isCreateModalOpen && !isEditModalOpen && (
        <KanbanBoard
          paginatedPendientes={paginatedPendientes}
          paginatedEnProceso={paginatedEnProceso}
          paginatedFinalizadas={paginatedFinalizadas}
          currentPagePendientes={currentPagePendientes}
          currentPageEnProceso={currentPageEnProceso}
          currentPageFinalizadas={currentPageFinalizadas}
          totalPagesPendientes={totalPagesPendientes}
          totalPagesEnProceso={totalPagesEnProceso}
          totalPagesFinalizadas={totalPagesFinalizadas}
          onPageChangePendientes={handlePageChangePendientes}
          onPageChangeEnProceso={handlePageChangeEnProceso}
          onPageChangeFinalizadas={handlePageChangeFinalizadas}
          responsables={responsables}
          searchTerm={searchTerm}
          selectedResponsable={selectedResponsable}
          dateFilter={dateFilter}
          onSearchChange={setSearchTerm}
          onResponsableFilterChange={setSelectedResponsable}
          onDateFilterChange={setDateFilter}
          onDragEnd={handleDragEnd}
          onEdit={handleEditActividad}
          onDelete={handleDeleteActividad}
          onViewDetails={handleViewDetails}
          onCreateActivity={handleCreateActividad}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Actividad"
      >
        <ActivityForm
          initialData={null}
          responsables={responsables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
          processId={processId || ''}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Actividad"
      >
        <ActivityForm
          initialData={editingActividad}
          responsables={responsables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
          processId={processId || ''}
        />
      </Modal>

      {/* Detail Modal - Updated to include processId */}
      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        actividad={selectedActividad}
        responsable={selectedActividad ? getResponsableById(selectedActividad.responsable_id) : undefined}
        allResponsables={responsables}
        processId={processId || ''} // Pass processId to the modal
      />
    </div>
  );
};

export default ActividadesTableroPage;