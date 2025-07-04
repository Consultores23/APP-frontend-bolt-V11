import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabase';
import { Reunion } from '../../../types/reunion';
import { Responsable } from '../../../types/responsable';
import { toast } from 'react-hot-toast';
import ReunionKanbanBoard from '../../../components/reuniones/ReunionKanbanBoard';
import Modal from '../../../components/ui/Modal';
import ReunionForm from '../../../components/reuniones/ReunionForm';
import ReunionDetailModal from '../../../components/reuniones/ReunionDetailModal';

const ITEMS_PER_PAGE = 5;

const ReunionesTableroPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();

  // State for reuniones and responsables
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filteredReuniones, setFilteredReuniones] = useState<Reunion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states for each column
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
  const [currentPageFinalizadas, setCurrentPageFinalizadas] = useState(1);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingReunion, setEditingReunion] = useState<Reunion | null>(null);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
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

  // Fetch reuniones
  const fetchReuniones = useCallback(async () => {
    if (!processId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reuniones')
        .select('*')
        .eq('process_id', processId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setReuniones(data || []);
    } catch (err: any) {
      console.error('Error fetching reuniones:', err.message);
      toast.error('Error al cargar las reuniones.');
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...reuniones];

    // Filter by search term (descripcion)
    if (searchTerm) {
      filtered = filtered.filter(reunion =>
        reunion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by responsable
    if (selectedResponsable) {
      filtered = filtered.filter(reunion => reunion.responsable_id === selectedResponsable);
    }

    // Filter by date (fecha_hora)
    if (dateFilter) {
      filtered = filtered.filter(reunion => {
        const reunionDate = new Date(reunion.fecha_hora).toISOString().split('T')[0];
        return reunionDate === dateFilter;
      });
    }

    setFilteredReuniones(filtered);
  }, [reuniones, searchTerm, selectedResponsable, dateFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchResponsables();
    fetchReuniones();
  }, [fetchResponsables, fetchReuniones]);

  // Separate reuniones by status
  const pendientes = filteredReuniones.filter(r => r.estado === 'Pendiente');
  const enProceso = filteredReuniones.filter(r => r.estado === 'En Proceso');
  const finalizadas = filteredReuniones.filter(r => r.estado === 'Finalizado');

  // Calculate pagination for each column
  const totalPagesPendientes = Math.ceil(pendientes.length / ITEMS_PER_PAGE);
  const totalPagesEnProceso = Math.ceil(enProceso.length / ITEMS_PER_PAGE);
  const totalPagesFinalizadas = Math.ceil(finalizadas.length / ITEMS_PER_PAGE);

  // Get paginated reuniones for each column
  const getPaginatedReuniones = (reuniones: Reunion[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return reuniones.slice(startIndex, endIndex);
  };

  const paginatedPendientes = getPaginatedReuniones(pendientes, currentPagePendientes);
  const paginatedEnProceso = getPaginatedReuniones(enProceso, currentPageEnProceso);
  const paginatedFinalizadas = getPaginatedReuniones(finalizadas, currentPageFinalizadas);

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

    const reunion = reuniones.find(r => r.id === draggableId);
    if (!reunion) return;

    const newEstado = destination.droppableId as 'Pendiente' | 'En Proceso' | 'Finalizado';

    try {
      const { error } = await supabase
        .from('reuniones')
        .update({ estado: newEstado })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setReuniones(prev => prev.map(r =>
        r.id === draggableId ? { ...r, estado: newEstado } : r
      ));

      toast.success(`Reunión movida a ${newEstado}`);
    } catch (err: any) {
      console.error('Error updating reunion:', err.message);
      toast.error('Error al actualizar la reunión.');
    }
  };

  // CRUD operations
  const handleCreateReunion = () => {
    setEditingReunion(null);
    setIsCreateModalOpen(true);
  };

  const handleEditReunion = (reunion: Reunion) => {
    setEditingReunion(reunion);
    setIsEditModalOpen(true);
  };

  const handleDeleteReunion = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reunión?')) {
      try {
        const { error } = await supabase
          .from('reuniones')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setReuniones(prev => prev.filter(r => r.id !== id));
        toast.success('Reunión eliminada correctamente.');
      } catch (err: any) {
        console.error('Error deleting reunion:', err.message);
        toast.error('Error al eliminar la reunión.');
      }
    }
  };

  const handleViewDetails = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Reunion, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingReunion) {
        // Update existing reunion
        const { error } = await supabase
          .from('reuniones')
          .update(formData)
          .eq('id', editingReunion.id);

        if (error) throw error;

        setReuniones(prev => prev.map(r =>
          r.id === editingReunion.id ? { ...r, ...formData } : r
        ));
        toast.success('Reunión actualizada correctamente.');
        setIsEditModalOpen(false);
      } else {
        // Create new reunion
        const { data, error } = await supabase
          .from('reuniones')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        setReuniones(prev => [data, ...prev]);
        toast.success('Reunión creada correctamente.');
        setIsCreateModalOpen(false);
      }

      setEditingReunion(null);
    } catch (err: any) {
      console.error('Error saving reunion:', err.message);
      toast.error(`Error al guardar la reunión: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponsableById = (responsableId?: string) => {
    return responsableId ? responsables.find(r => r.id === responsableId) : undefined;
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
        <h2 className="text-xl font-semibold text-white mb-2">Tablero de Reuniones</h2>
        <p className="text-gray-400">
          Gestiona las reuniones del proceso usando el tablero Kanban. Arrastra las tarjetas entre columnas para cambiar su estado.
        </p>
      </div>

      <ReunionKanbanBoard
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
        onEdit={handleEditReunion}
        onDelete={handleDeleteReunion}
        onViewDetails={handleViewDetails}
        onCreateReunion={handleCreateReunion}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Reunión"
      >
        <ReunionForm
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
        title="Editar Reunión"
      >
        <ReunionForm
          initialData={editingReunion}
          responsables={responsables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
          processId={processId || ''}
        />
      </Modal>

      {/* Detail Modal */}
      <ReunionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reunion={selectedReunion}
        responsable={selectedReunion ? getResponsableById(selectedReunion.responsable_id) : undefined}
      />
    </div>
  );
};

export default ReunionesTableroPage;