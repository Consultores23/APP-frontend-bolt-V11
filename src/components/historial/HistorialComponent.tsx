import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { AuditLog } from '../../types/auditLog';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import Datepicker from 'react-tailwindcss-datepicker'; // Import Datepicker

interface HistorialComponentProps {
  processId: string;
}

const ITEMS_PER_PAGE = 5;

const HistorialComponent: React.FC<HistorialComponentProps> = ({ processId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  const fetchAuditLogs = useCallback(async (page: number) => {
    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .or(`record_id.eq.${processId},new_data->>client_id.eq.${processId},old_data->>client_id.eq.${processId},new_data->>process_id.eq.${processId},old_data->>process_id.eq.${processId}`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        // This is a basic text search. For more advanced full-text search,
        // you might need PostgreSQL's full-text search features.
        query = query.or(`table_name.ilike.%${searchTerm}%,operation_type.ilike.%${searchTerm}%,new_data::text.ilike.%${searchTerm}%,old_data::text.ilike.%${searchTerm}%`);
      }

      if (dateRange.startDate && dateRange.endDate) {
        query = query.gte('created_at', dateRange.startDate.toISOString());
        query = query.lte('created_at', dateRange.endDate.toISOString());
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setAuditLogs(data || []);
      setTotalLogs(count || 0);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err.message);
      toast.error('Error al cargar el historial de auditoría.');
    } finally {
      setIsLoading(false);
    }
  }, [processId, searchTerm, dateRange]);

  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage, fetchAuditLogs]);

  const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDateRangeChange = (newDateRange: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange(newDateRange);
    setCurrentPage(1); // Reset to first page on date filter change
  };

  const formatJson = (json: Record<string, any> | null) => {
    if (!json) return 'N/A';
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            label="Buscar por palabra clave"
            name="searchTerm"
            value={searchTerm}
            onChange={handleSearchChange}
            icon={<Search size={18} />}
            placeholder="Tabla, operación, datos..."
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-200 mb-1.5">
            Filtrar por fecha
          </label>
          <Datepicker
            value={dateRange}
            onChange={handleDateRangeChange}
            showShortcuts={true}
            configs={{
              shortcuts: {
                today: 'Hoy',
                yesterday: 'Ayer',
                past: (period) => `Últimos ${period} días`,
                currentMonth: 'Mes actual',
                pastMonth: 'Mes pasado',
              },
            }}
            inputClassName="w-full rounded-md py-2.5 px-4 bg-dark-700 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            toggleClassName="absolute left-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            primaryColor={"blue"}
            placeholder="Selecciona un rango de fechas"
            displayFormat={"DD/MM/YYYY"}
            separator="a"
            i18n={"es"}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-dark-700">
          <thead className="bg-dark-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tabla
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Operación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID Registro
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Datos Antiguos
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Datos Nuevos
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Usuario ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                  Cargando historial...
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                  No hay registros de historial para mostrar.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {new Date(log.created_at).toLocaleString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.table_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.operation_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 break-all">
                    {log.record_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs overflow-auto">
                    <pre className="text-xs bg-dark-700 p-2 rounded-md max-h-24 overflow-auto custom-scrollbar">
                      {formatJson(log.old_data)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs overflow-auto">
                    <pre className="text-xs bg-dark-700 p-2 rounded-md max-h-24 overflow-auto custom-scrollbar">
                      {formatJson(log.new_data)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 break-all">
                    {log.user_id || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-dark-800 flex items-center justify-between border-t border-dark-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="rounded-r-none"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                    className="rounded-none"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="rounded-l-none"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={16} />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialComponent;
