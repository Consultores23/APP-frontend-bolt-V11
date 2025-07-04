import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabase';
import { Audiencia } from '../../../types/audiencia';
import { Responsable } from '../../../types/responsable';
import { toast } from 'react-hot-toast';
import AudienciaKanbanBoard from '../../../components/audiencias/AudienciaKanbanBoard';
import Modal from '../../../components/ui/Modal';
import AudienciaForm from '../../../components/audiencias/AudienciaForm';
import AudienciaDetailModal from '../../../components/audiencias/AudienciaDetailModal';

const ITEMS_PER_PAGE = 5;

const AudienciasTableroPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();

  // State for audiencias and responsables
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filteredAudiencias, setFilteredAudiencias] = useState<Audiencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states for each column
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
  const [currentPageFinalizadas, setCurrentPageFinalizadas] = useState(1);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingAudiencia, setEditingAudiencia] = useState<Audiencia | null>(null);
  const [selectedAudiencia, setSelectedAudiencia] = useState<Audiencia | null>(null);
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

  // Fetch audiencias
  const fetchAudiencias = useCallback(async () => {
    if (!processId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audiencias')
        .select('*')
        .eq('process_id', processId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setAudiencias(data || []);
    } catch (err: any) {
      console.error('Error fetching audiencias:', err.message);
      toast.error('Error al cargar las audiencias.');
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...audiencias];

    // Filter by search term (descripcion)
    if (searchTerm) {
      filtered = filtered.filter(audiencia =>
        audiencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by responsable
    if (selectedResponsable) {
      filtered = filtered.filter(audiencia => audiencia.responsable_id === selectedResponsable);
    }

    // Filter by date (fecha_hora)
    if (dateFilter) {
      filtered = filtered.filter(audiencia => {
        const audienciaDate = new Date(audiencia.fecha_hora).toISOString().split('T')[0];
        return audienciaDate === dateFilter;
      });
    }

    setFilteredAudiencias(filtered);
  }, [audiencias, searchTerm, selectedResponsable, dateFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchResponsables();
    fetchAudiencias();
  }, [fetchResponsables, fetchAudiencias]);

  // Separate audiencias by status
  const pendientes = filteredAudiencias.filter(a => a.estado === 'Pendiente');
  const enProceso = filteredAudiencias.filter(a => a.estado === 'En Proceso');
  const finalizadas = filteredAudiencias.filter(a => a.estado === 'Finalizado');

  // Calculate pagination for each column
  const totalPagesPendientes = Math.ceil(pendientes.length / ITEMS_PER_PAGE);
  const totalPagesEnProceso = Math.ceil(enProceso.length / ITEMS_PER_PAGE);
  const totalPagesFinalizadas = Math.ceil(finalizadas.length / ITEMS_PER_PAGE);

  // Get paginated audiencias for each column
  const getPaginatedAudiencias = (audiencias: Audiencia[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return audiencias.slice(startIndex, endIndex);
  };

  const paginatedPendientes = getPaginatedAudiencias(pendientes, currentPagePendientes);
  const paginatedEnProceso = getPaginatedAudiencias(enProceso, currentPageEnProceso);
  const paginatedFinalizadas = getPaginatedAudiencias(finalizadas, currentPageFinalizadas);

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

    const audiencia = audiencias.find(a => a.id === draggableId);
    if (!audiencia) return;

    const newEstado = destination.droppableId as 'Pendiente' | 'En Proceso' | 'Finalizado';

    try {
      const { error } = await supabase
        .from('audiencias')
        .update({ estado: newEstado })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setAudiencias(prev => prev.map(a =>
        a.id === draggableId ? { ...a, estado: newEstado } : a
      ));

      toast.success(`Audiencia movida a ${newEstado}`);
    } catch (err: any) {
      console.error('Error updating audiencia:', err.message);
      toast.error('Error al actualizar la audiencia.');
    }
  };

  // CRUD operations
  const handleCreateAudiencia = () => {
    setEditingAudiencia(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAudiencia = (audiencia: Audiencia) => {
    setEditingAudiencia(audiencia);
    setIsEditModalOpen(true);
  };

  const handleDeleteAudiencia = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta audiencia?')) {
      try {
        const { error } = await supabase
          .from('audiencias')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setAudiencias(prev => prev.filter(a => a.id !== id));
        toast.success('Audiencia eliminada correctamente.');
      } catch (err: any) {
        console.error('Error deleting audiencia:', err.message);
        toast.error('Error al eliminar la audiencia.');
      }
    }
  };

  const handleViewDetails = (audiencia: Audiencia) => {
    setSelectedAudiencia(audiencia);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Audiencia, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingAudiencia) {
        // Update existing audiencia
        const { error } = await supabase
          .from('audiencias')
          .update(formData)
          .eq('id', editingAudiencia.id);

        if (error) throw error;

        setAudiencias(prev => prev.map(a =>
          a.id === editingAudiencia.id ? { ...a, ...formData } : a
        ));
        toast.success('Audiencia actualizada correctamente.');
        setIsEditModalOpen(false);
      } else {
        // Create new audiencia
        const { data, error } = await supabase
          .from('audiencias')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        setAudiencias(prev => [data, ...prev]);
        toast.success('Audiencia creada correctamente.');
        setIsCreateModalOpen(false);
      }

      setEditingAudiencia(null);
    } catch (err: any) {
      console.error('Error saving audiencia:', err.message);
      toast.error(`Error al guardar la audiencia: ${err.message}`);
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
        <h2 className="text-xl font-semibold text-white mb-2">Tablero de Audiencias</h2>
        <p className="text-gray-400">
          Gestiona las audiencias del proceso usando el tablero Kanban. Arrastra las tarjetas entre columnas para cambiar su estado.
        </p>
      </div>

      <AudienciaKanbanBoard
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
        onEdit={handleEditAudiencia}
        onDelete={handleDeleteAudiencia}
        onViewDetails={handleViewDetails}
        onCreateAudiencia={handleCreateAudiencia}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Audiencia"
      >
        <AudienciaForm
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
        title="Editar Audiencia"
      >
        <AudienciaForm
          initialData={editingAudiencia}
          responsables={responsables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
          processId={processId || ''}
        />
      </Modal>

      {/* Detail Modal */}
      <AudienciaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        audiencia={selectedAudiencia}
        responsable={selectedAudiencia ? getResponsableById(selectedAudiencia.responsable_id) : undefined}
      />
    </div>
  );
};

export default AudienciasTableroPage;