import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import ClientTable from '../components/clients/ClientTable';
import ClientForm from '../components/clients/ClientForm';
import Modal from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { Client } from '../types/client';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import ClientFilterBar from '../components/clients/ClientFilterBar';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 5;

const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    nombre: '',
    estado: '',
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const activeFilters = useMemo(() => ({
    ...filters,
    nombre: debouncedSearchTerm,
  }), [filters, debouncedSearchTerm]);


  const fetchClients = useCallback(async (page: number, currentFilters: { nombre: string; estado: string }) => {
    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query = supabase.from('clientes').select('*', { count: 'exact' });

      if (currentFilters.nombre) {
        query = query.ilike('nombre', `%${currentFilters.nombre}%`);
      }
      if (currentFilters.estado) {
        query = query.eq('estado', currentFilters.estado);
      }

      const { data, error, count } = await query
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setClients(data || []);
      setTotalClients(count || 0);
    } catch (err: any) {
      console.error('Error fetching clients:', err.message);
      toast.error('Error al cargar los clientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(currentPage, activeFilters);
  }, [currentPage, activeFilters, fetchClients]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  const totalPages = Math.ceil(totalClients / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClearFilters = () => {
    setFilters({ nombre: '', estado: '' });
    setSearchTerm('');
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase.from('clientes').delete().eq('id', id);
        if (error) throw error;
        toast.success('Cliente eliminado correctamente.');
        fetchClients(currentPage, activeFilters);
      } catch (err: any) {
        console.error('Error deleting client:', err.message);
        toast.error('Error al eliminar el cliente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async (formData: Omit<Client, 'id' | 'fecha_creacion'>) => {
    setIsSubmitting(true);
    try {
      if (editingClient) {
        const { error } = await supabase.from('clientes').update(formData).eq('id', editingClient.id);
        if (error) throw error;
        toast.success('Cliente actualizado correctamente.');
      } else {
        const { error } = await supabase.from('clientes').insert(formData);
        if (error) throw error;
        toast.success('Cliente creado correctamente.');
      }
      setIsModalOpen(false);
      setEditingClient(null);
      fetchClients(currentPage, activeFilters);
    } catch (err: any) {
      console.error('Error saving client:', err.message);
      toast.error(`Error al guardar el cliente: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      <SidebarMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-white">Lista de Clientes</h1>
              <Button onClick={handleCreateClient}>
                <Plus size={18} className="mr-2" />
                Crear Cliente
              </Button>
            </div>

            <ClientFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              searchTerm={searchTerm}
              onSearchTermChange={handleSearchTermChange}
            />

            <ClientTable
              clients={clients}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ClientesPage;
