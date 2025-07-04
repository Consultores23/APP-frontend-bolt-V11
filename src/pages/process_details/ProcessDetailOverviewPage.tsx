import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Process } from '../../types/process';
import { SujetoProcesal } from '../../types/sujetoProcesal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Clipboard, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SujetoProcesalTable from '../../components/sujetosProcesales/SujetoProcesalTable';
import SujetoProcesalForm from '../../components/sujetosProcesales/SujetoProcesalForm';
import SujetoProcesalDetailModal from '../../components/sujetosProcesales/SujetoProcesalDetailModal';

interface ProcessContext {
  process: Process;
}

const ITEMS_PER_PAGE = 5;

const ProcessDetailOverviewPage: React.FC = () => {
  const { process } = useOutletContext<ProcessContext>();

  const [sujetosProcesales, setSujetosProcesales] = useState<SujetoProcesal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSujetosProcesales, setTotalSujetosProcesales] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingSujetoProcesal, setEditingSujetoProcesal] = useState<SujetoProcesal | null>(null);
  const [selectedSujetoProcesal, setSelectedSujetoProcesal] = useState<SujetoProcesal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSujetosProcesales = useCallback(async (page: number) => {
    if (!process?.id) return;

    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase
        .from('sujetos_procesales')
        .select('*', { count: 'exact' })
        .eq('process_id', process.id)
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setSujetosProcesales(data || []);
      setTotalSujetosProcesales(count || 0);
    } catch (err: any) {
      console.error('Error fetching sujetos procesales:', err.message);
      toast.error('Error al cargar los sujetos procesales.');
    } finally {
      setIsLoading(false);
    }
  }, [process?.id]);

  useEffect(() => {
    fetchSujetosProcesales(currentPage);
  }, [currentPage, fetchSujetosProcesales]);

  const totalPages = Math.ceil(totalSujetosProcesales / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCopyRadicado = async () => {
    if (process?.radicado) {
      try {
        await navigator.clipboard.writeText(process.radicado);
        toast.success('Radicado copiado al portapapeles.');
      } catch (err) {
        console.error('Error al copiar el radicado:', err);
        toast.error('Error al copiar el radicado.');
      }
    }
  };

  const handleCreateSujetoProcesal = () => {
    setEditingSujetoProcesal(null);
    setIsCreateModalOpen(true);
  };

  const handleEditSujetoProcesal = (sujeto: SujetoProcesal) => {
    setEditingSujetoProcesal(sujeto);
    setIsEditModalOpen(true);
  };

  const handleDeleteSujetoProcesal = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este sujeto procesal?')) {
      try {
        const { error } = await supabase
          .from('sujetos_procesales')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast.success('Sujeto procesal eliminado correctamente.');
        fetchSujetosProcesales(currentPage);
      } catch (err: any) {
        console.error('Error deleting sujeto procesal:', err.message);
        toast.error('Error al eliminar el sujeto procesal.');
      }
    }
  };

  const handleViewSujetoProcesalDetails = (sujeto: SujetoProcesal) => {
    setSelectedSujetoProcesal(sujeto);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<SujetoProcesal, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingSujetoProcesal) {
        // Update existing sujeto procesal
        const { error } = await supabase
          .from('sujetos_procesales')
          .update(formData)
          .eq('id', editingSujetoProcesal.id);

        if (error) {
          throw error;
        }
        toast.success('Sujeto procesal actualizado correctamente.');
        setIsEditModalOpen(false);
      } else {
        // Create new sujeto procesal
        const { error } = await supabase
          .from('sujetos_procesales')
          .insert(formData);

        if (error) {
          throw error;
        }
        toast.success('Sujeto procesal creado correctamente.');
        setIsCreateModalOpen(false);
      }

      setEditingSujetoProcesal(null);
      fetchSujetosProcesales(currentPage);
    } catch (err: any) {
      console.error('Error saving sujeto procesal:', err.message);
      toast.error(`Error al guardar el sujeto procesal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingSujetoProcesal(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSujetoProcesal(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSujetoProcesal(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Detalles del Proceso</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Nombre:</p>
          <p className="text-white">{process.nombre}</p>
        </div>
        <div>
          <p className="text-gray-400">Radicado:</p>
          <div className="flex items-center gap-2">
            <p className="text-white">{process.radicado}</p>
            {process.radicado && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRadicado}
                title="Copiar radicado"
              >
                <Clipboard size={16} />
              </Button>
            )}
          </div>
        </div>
        <div>
          <p className="text-gray-400">Estado:</p>
          <p className="text-white">{process.estado}</p>
        </div>
        <div>
          <p className="text-gray-400">Fecha de Creación:</p>
          <p className="text-white">
            {new Date(process.fecha_creacion).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Sujetos Procesales</h2>
            <p className="text-gray-400">
              Gestiona los sujetos procesales relacionados con este proceso.
            </p>
          </div>
          <Button onClick={handleCreateSujetoProcesal} disabled={isSubmitting}>
            <Plus size={18} className="mr-2" /> Crear Sujeto Procesal
          </Button>
        </div>

        <SujetoProcesalTable
          sujetosProcesales={sujetosProcesales}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEditSujetoProcesal}
          onDelete={handleDeleteSujetoProcesal}
          onViewDetails={handleViewSujetoProcesalDetails}
          isLoading={isLoading}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Crear Nuevo Sujeto Procesal"
      >
        <SujetoProcesalForm
          initialData={null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseCreateModal}
          isLoading={isSubmitting}
          processId={process?.id || ''}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Sujeto Procesal"
      >
        <SujetoProcesalForm
          initialData={editingSujetoProcesal}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseEditModal}
          isLoading={isSubmitting}
          processId={process?.id || ''}
        />
      </Modal>

      {/* Detail Modal */}
      <SujetoProcesalDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        sujetoProcesal={selectedSujetoProcesal}
      />
    </div>
  );
};

export default ProcessDetailOverviewPage;
