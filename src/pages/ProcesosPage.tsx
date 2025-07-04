import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import { supabase } from '../lib/supabase';
import { ProcessWithClient } from '../types/process';
import { toast } from 'react-hot-toast';
import AllProcessesTable from '../components/processes/AllProcessesTable';
import AllProcessesFilterBar from '../components/processes/AllProcessesFilterBar';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 5;

const ProcesosPage: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    cliente: '',
    radicado: '',
    estado: '',
  });

  const debouncedFilters = useDebounce(filters, 500);

  const fetchProcesses = useCallback(async (page: number, currentFilters: typeof filters) => {
    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query = supabase
        .from('procesos')
        .select(`
          id,
          radicado,
          estado,
          clientes (
            nombre
          )
        `, { count: 'exact' });

      if (currentFilters.radicado) {
        query = query.ilike('radicado', `%${currentFilters.radicado}%`);
      }
      if (currentFilters.estado) {
        query = query.eq('estado', currentFilters.estado);
      }
      if (currentFilters.cliente) {
        query = query.ilike('clientes.nombre', `%${currentFilters.cliente}%`);
      }

      const { data, error, count } = await query
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      setProcesses(data as ProcessWithClient[] || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err: any) {
      console.error('Error fetching processes:', err.message);
      toast.error('Error al cargar los procesos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses(currentPage, debouncedFilters);
  }, [currentPage, debouncedFilters, fetchProcesses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      cliente: '',
      radicado: '',
      estado: '',
    });
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      <SidebarMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Procesos" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-white mb-6">Todos los Procesos</h1>
            
            <AllProcessesFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <AllProcessesTable
              processes={processes}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProcesosPage;
