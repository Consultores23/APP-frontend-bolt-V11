import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import HorizontalMenu from '../components/ui/HorizontalMenu';
import Button from '../components/ui/Button';
import ProcessTable from '../components/processes/ProcessTable';
import ProcessForm from '../components/processes/ProcessForm';
import Modal from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Process } from '../types/process';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 5;
const CLOUD_STORAGE_API_URL = import.meta.env.VITE_CLOUD_STORAGE_API_URL;

const ClientProcessesPage: React.FC = () => {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProcesses, setTotalProcesses] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuItems = [
    { name: 'Detalle Cliente', path: `/clientes/${clientId}` },
    { name: 'Procesos', path: `/clientes/${clientId}/procesos` },
  ];

  const fetchProcesses = useCallback(async (page: number) => {
    if (!clientId) return;

    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase
        .from('procesos')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId)
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setProcesses(data || []);
      setTotalProcesses(count || 0);
    } catch (err: any) {
      console.error('Error fetching processes:', err.message);
      toast.error('Error al cargar los procesos.');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchProcesses(currentPage);
  }, [currentPage, fetchProcesses]);

  const totalPages = Math.ceil(totalProcesses / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateProcess = () => {
    setEditingProcess(null);
    setIsModalOpen(true);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const handleDeleteProcess = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proceso?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('procesos')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast.success('Proceso eliminado correctamente.');
        fetchProcesses(currentPage);
      } catch (err: any) {
        console.error('Error deleting process:', err.message);
        toast.error('Error al eliminar el proceso.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createBucket = async (bucketName: string) => {
    const response = await fetch(`${CLOUD_STORAGE_API_URL}/buckets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify({ bucket_name: bucketName }),
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const createDefaultDirectories = async (bucketName: string) => {
    const directories = [
      'Actuaciones',
      'Documentos Entregados Cliente',
      'Documentos Trabajo',
      'Documentos Estudio'
    ];

    for (const directory of directories) {
      try {
        const formData = new FormData();
        
        // Create an empty placeholder file
        const placeholderFile = new Blob([''], { type: 'text/plain' });
        formData.append('file', placeholderFile, '.keep');
        
        // Add the object prefix (directory path)
        const directoryPath = `${directory}/`;
        formData.append('object_prefix', directoryPath);

        const response = await fetch(
          `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          console.error(`Error creating directory ${directory}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error creating directory ${directory}:`, error);
      }
    }
  };

  const handleFormSubmit = async (formData: Omit<Process, 'id' | 'fecha_creacion' | 'bucket_path'>) => {
    setIsSubmitting(true);
    try {
      if (editingProcess) {
        // Update existing process
        const { error } = await supabase
          .from('procesos')
          .update(formData)
          .eq('id', editingProcess.id);

        if (error) {
          throw error;
        }
        toast.success('Proceso actualizado correctamente.');
      } else {
        // Create new process
        const { data, error } = await supabase
          .from('procesos')
          .insert(formData)
          .select('id')
          .single();

        if (error) {
          throw error;
        }

        const newProcessId = data.id;
        const bucketName = `process-${newProcessId}`;

        try {
          // Try to create the bucket with improved error handling
          const bucketDetails = await createBucket(bucketName);
          const bucketPath = bucketDetails.bucket_details.name;

          // Create default directories in the bucket
          await createDefaultDirectories(bucketName);

          // Update the process record with the bucket path
          const { error: updateError } = await supabase
            .from('procesos')
            .update({ bucket_path: bucketPath })
            .eq('id', newProcessId);

          if (updateError) {
            throw updateError;
          }
          toast.success('Proceso, bucket y directorios creados correctamente.');
        } catch (bucketError: any) {
          console.error('Error creating bucket:', bucketError);
          
          // Delete the process if bucket creation fails
          const { error: deleteError } = await supabase
            .from('procesos')
            .delete()
            .eq('id', newProcessId);

          if (deleteError) {
            console.error('Error cleaning up process after bucket creation failure:', deleteError);
          }

          throw new Error(`Error al crear el bucket: ${bucketError.message}`);
        }
      }
      
      setIsModalOpen(false);
      setEditingProcess(null);
      fetchProcesses(currentPage);
    } catch (err: any) {
      console.error('Error saving process:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/procesos/${id}/detalle`);
  };

  return (
    <div className="flex h-screen bg-dark-900">
      <SidebarMenu />
      <div className="flex-1 flex flex-col">
        <Header title="Procesos del Cliente" />
        <HorizontalMenu items={menuItems} />
        <main className="flex-1">
          <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-end mb-6">
              <Button onClick={handleCreateProcess}>
                <Plus size={18} className="mr-2" /> Crear Proceso
              </Button>
            </div>

            <ProcessTable
              processes={processes}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditProcess}
              onDelete={handleDeleteProcess}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProcess ? 'Editar Proceso' : 'Crear Nuevo Proceso'}
      >
        <ProcessForm
          initialData={editingProcess}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
          clientId={clientId || ''}
        />
      </Modal>
    </div>
  );
};

export default ClientProcessesPage;