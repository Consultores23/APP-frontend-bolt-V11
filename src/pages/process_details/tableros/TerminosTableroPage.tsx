import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import { supabase } from '../../../lib/supabase';
import { Termino } from '../../../types/termino';
import { Responsable } from '../../../types/responsable';
import { toast } from 'react-hot-toast';
import TerminoKanbanBoard from '../../../components/terminos/TerminoKanbanBoard';
import Modal from '../../../components/ui/Modal';
import TerminoForm from '../../../components/terminos/TerminoForm';
import TerminoDetailModal from '../../../components/terminos/TerminoDetailModal';

const ITEMS_PER_PAGE = 5;

const TerminosTableroPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();

  // State for terminos and responsables
  const [terminos, setTerminos] = useState<Termino[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filteredTerminos, setFilteredTerminos] = useState<Termino[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states for each column
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
  const [currentPageFinalizados, setCurrentPageFinalizados] = useState(1);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTermino, setEditingTermino] = useState<Termino | null>(null);
  const [selectedTermino, setSelectedTermino] = useState<Termino | null>(null);
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

  // Fetch terminos
  const fetchTerminos = useCallback(async () => {
    if (!processId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('terminos')
        .select('*')
        .eq('process_id', processId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setTerminos(data || []);
    } catch (err: any) {
      console.error('Error fetching terminos:', err.message);
      toast.error('Error al cargar los términos.');
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...terminos];

    // Filter by search term (descripcion)
    if (searchTerm) {
      filtered = filtered.filter(termino =>
        termino.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by responsable
    if (selectedResponsable) {
      filtered = filtered.filter(termino => termino.responsable_id === selectedResponsable);
    }

    // Filter by date (fecha_creacion)
    if (dateFilter) {
      filtered = filtered.filter(termino => {
        const terminoDate = new Date(termino.fecha_creacion).toISOString().split('T')[0];
        return terminoDate === dateFilter;
      });
    }

    setFilteredTerminos(filtered);
  }, [terminos, searchTerm, selectedResponsable, dateFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchResponsables();
    fetchTerminos();
  }, [fetchResponsables, fetchTerminos]);

  // Separate terminos by status
  const pendientes = filteredTerminos.filter(t => t.estado === 'Pendiente');
  const enProceso = filteredTerminos.filter(t => t.estado === 'En Proceso');
  const finalizados = filteredTerminos.filter(t => t.estado === 'Finalizado');

  // Calculate pagination for each column
  const totalPagesPendientes = Math.ceil(pendientes.length / ITEMS_PER_PAGE);
  const totalPagesEnProceso = Math.ceil(enProceso.length / ITEMS_PER_PAGE);
  const totalPagesFinalizados = Math.ceil(finalizados.length / ITEMS_PER_PAGE);

  // Get paginated terminos for each column
  const getPaginatedTerminos = (terminos: Termino[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return terminos.slice(startIndex, endIndex);
  };

  const paginatedPendientes = getPaginatedTerminos(pendientes, currentPagePendientes);
  const paginatedEnProceso = getPaginatedTerminos(enProceso, currentPageEnProceso);
  const paginatedFinalizados = getPaginatedTerminos(finalizados, currentPageFinalizados);

  // Pagination handlers
  const handlePageChangePendientes = (page: number) => {
    setCurrentPagePendientes(page);
  };

  const handlePageChangeEnProceso = (page: number) => {
    setCurrentPageEnProceso(page);
  };

  const handlePageChangeFinalizados = (page: number) => {
    setCurrentPageFinalizados(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPagePendientes(1);
    setCurrentPageEnProceso(1);
    setCurrentPageFinalizados(1);
  }, [searchTerm, selectedResponsable, dateFilter]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const termino = terminos.find(t => t.id === draggableId);
    if (!termino) return;

    const newEstado = destination.droppableId as 'Pendiente' | 'En Proceso' | 'Finalizado';

    try {
      const { error } = await supabase
        .from('terminos')
        .update({ estado: newEstado })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setTerminos(prev => prev.map(t =>
        t.id === draggableId ? { ...t, estado: newEstado } : t
      ));

      toast.success(`Término movido a ${newEstado}`);
    } catch (err: any) {
      console.error('Error updating termino:', err.message);
      toast.error('Error al actualizar el término.');
    }
  };

  // CRUD operations
  const handleCreateTermino = () => {
    setEditingTermino(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTermino = (termino: Termino) => {
    setEditingTermino(termino);
    setIsEditModalOpen(true);
  };

  const handleDeleteTermino = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este término?')) {
      try {
        const { error } = await supabase
          .from('terminos')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setTerminos(prev => prev.filter(t => t.id !== id));
        toast.success('Término eliminado correctamente.');
      } catch (err: any) {
        console.error('Error deleting termino:', err.message);
        toast.error('Error al eliminar el término.');
      }
    }
  };

  const handleViewDetails = (termino: Termino) => {
    setSelectedTermino(termino);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Termino, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingTermino) {
        // Update existing termino
        const { error } = await supabase
          .from('terminos')
          .update(formData)
          .eq('id', editingTermino.id);

        if (error) throw error;

        setTerminos(prev => prev.map(t =>
          t.id === editingTermino.id ? { ...t, ...formData } : t
        ));
        toast.success('Término actualizado correctamente.');
        setIsEditModalOpen(false);
      } else {
        // Create new termino
        const { data, error } = await supabase
          .from('terminos')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;

        setTerminos(prev => [data, ...prev]);
        toast.success('Término creado correctamente.');
        setIsCreateModalOpen(false);
      }

      setEditingTermino(null);
    } catch (err: any) {
      console.error('Error saving termino:', err.message);
      toast.error(`Error al guardar el término: ${err.message}`);
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
        <h2 className="text-xl font-semibold text-white mb-2">Tablero de Términos</h2>
        <p className="text-gray-400">
          Gestiona los términos del proceso usando el tablero Kanban. Arrastra las tarjetas entre columnas para cambiar su estado.
        </p>
      </div>

      <TerminoKanbanBoard
        paginatedPendientes={paginatedPendientes}
        paginatedEnProceso={paginatedEnProceso}
        paginatedFinalizados={paginatedFinalizados}
        currentPagePendientes={currentPagePendientes}
        currentPageEnProceso={currentPageEnProceso}
        currentPageFinalizados={currentPageFinalizados}
        totalPagesPendientes={totalPagesPendientes}
        totalPagesEnProceso={totalPagesEnProceso}
        totalPagesFinalizados={totalPagesFinalizados}
        onPageChangePendientes={handlePageChangePendientes}
        onPageChangeEnProceso={handlePageChangeEnProceso}
        onPageChangeFinalizados={handlePageChangeFinalizados}
        responsables={responsables}
        searchTerm={searchTerm}
        selectedResponsable={selectedResponsable}
        dateFilter={dateFilter}
        onSearchChange={setSearchTerm}
        onResponsableFilterChange={setSelectedResponsable}
        onDateFilterChange={setDateFilter}
        onDragEnd={handleDragEnd}
        onEdit={handleEditTermino}
        onDelete={handleDeleteTermino}
        onViewDetails={handleViewDetails}
        onCreateTermino={handleCreateTermino}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Término"
      >
        <TerminoForm
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
        title="Editar Término"
      >
        <TerminoForm
          initialData={editingTermino}
          responsables={responsables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
          processId={processId || ''}
        />
      </Modal>

      {/* Detail Modal */}
      <TerminoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        termino={selectedTermino}
        responsable={selectedTermino ? getResponsableById(selectedTermino.responsable_id) : undefined}
      />
    </div>
  );
};

export default TerminosTableroPage;