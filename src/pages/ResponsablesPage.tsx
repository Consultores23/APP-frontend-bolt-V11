import React, { useState, useEffect, useCallback } from 'react';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import ResponsableTable from '../components/responsables/ResponsableTable';
import ResponsableForm from '../components/responsables/ResponsableForm';
import ResponsableDetailModal from '../components/responsables/ResponsableDetailModal';
import Modal from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Responsable } from '../types/responsable';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const ResponsablesPage: React.FC = () => {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResponsables, setTotalResponsables] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingResponsable, setEditingResponsable] = useState<Responsable | null>(null);
  const [selectedResponsable, setSelectedResponsable] = useState<Responsable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResponsables = useCallback(async (page: number) => {
    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase
        .from('responsables')
        .select('*', { count: 'exact' })
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setResponsables(data || []);
      setTotalResponsables(count || 0);
    } catch (err: any) {
      console.error('Error fetching responsables:', err.message);
      toast.error('Error al cargar los responsables.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponsables(currentPage);
  }, [currentPage, fetchResponsables]);

  const totalPages = Math.ceil(totalResponsables / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateResponsable = () => {
    setEditingResponsable(null);
    setIsModalOpen(true);
  };

  const handleEditResponsable = (responsable: Responsable) => {
    setEditingResponsable(responsable);
    setIsModalOpen(true);
  };

  const handleDeleteResponsable = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este responsable?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('responsables')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast.success('Responsable eliminado correctamente.');
        fetchResponsables(currentPage);
      } catch (err: any) {
        console.error('Error deleting responsable:', err.message);
        toast.error('Error al eliminar el responsable.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    const responsable = responsables.find(r => r.id === id);
    if (responsable) {
      setSelectedResponsable(responsable);
      setIsDetailModalOpen(true);
    }
  };

  const handleFormSubmit = async (formData: Omit<Responsable, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingResponsable) {
        // Update responsable
        const { error } = await supabase
          .from('responsables')
          .update(formData)
          .eq('id', editingResponsable.id);

        if (error) {
          throw error;
        }
        toast.success('Responsable actualizado correctamente.');
      } else {
        // Create new responsable
        const { error } = await supabase
          .from('responsables')
          .insert(formData);

        if (error) {
          throw error;
        }
        toast.success('Responsable creado correctamente.');
      }
      setIsModalOpen(false);
      setEditingResponsable(null);
      fetchResponsables(currentPage);
    } catch (err: any) {
      console.error('Error saving responsable:', err.message);
      toast.error(`Error al guardar el responsable: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      <SidebarMenu />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Responsables" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-white">Lista de Responsables</h1>
              <Button onClick={handleCreateResponsable}>
                <Plus size={18} className="mr-2" />
                Crear Responsable
              </Button>
            </div>

            <ResponsableTable
              responsables={responsables}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditResponsable}
              onDelete={handleDeleteResponsable}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResponsable ? 'Editar Responsable' : 'Crear Nuevo Responsable'}
      >
        <ResponsableForm
          initialData={editingResponsable}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <ResponsableDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        responsable={selectedResponsable}
      />
    </div>
  );
};

export default ResponsablesPage;
