import React from 'react';
import { Actuacion } from '../../types/actuacion';
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface ActuacionTableProps {
  actuaciones: Actuacion[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (actuacion: Actuacion) => void;
  onDelete: (id: string) => void;
  onViewDetails: (actuacion: Actuacion) => void;
  isLoading: boolean;
}

const ActuacionTable: React.FC<ActuacionTableProps> = ({
  actuaciones,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { return 'Fecha inválida'; }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Fecha inválida'; }
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    if (typeof text !== 'string') return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="h-full flex flex-col bg-dark-800 border border-dark-700 rounded-xl">
      <div className="flex-grow overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-700">
          <thead className="bg-dark-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Fecha Actuación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actuación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Anotación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Inicio Término</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Finaliza Término</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Fecha Registro</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-400">Cargando actuaciones...</td></tr>
            ) : actuaciones.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-400">No hay actuaciones para mostrar.</td></tr>
            ) : (
              actuaciones.map((actuacion) => (
                <tr key={actuacion.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatDate(actuacion.fecha_actuacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" title={actuacion.actuacion_texto}>{truncateText(actuacion.actuacion_texto)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" title={actuacion.anotacion}>{truncateText(actuacion.anotacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{actuacion.fecha_inicio_termino ? formatDate(actuacion.fecha_inicio_termino) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{actuacion.fecha_finaliza_termino ? formatDate(actuacion.fecha_finaliza_termino) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDateTime(actuacion.fecha_registro)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(actuacion)} title="Editar actuación"><Edit size={16} /></Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(actuacion.id)} title="Eliminar actuación"><Trash2 size={16} /></Button>
                      <Button variant="outline" size="sm" onClick={() => onViewDetails(actuacion)} title="Ver detalles"><Eye size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex-shrink-0 px-6 py-4 bg-dark-800 flex items-center justify-between border-t border-dark-700">
          <div>
            <p className="text-sm text-gray-400">
              Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="rounded-r-none"><ChevronLeft size={16} /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={page === currentPage ? 'primary' : 'outline'} size="sm" onClick={() => onPageChange(page)} disabled={isLoading} className="rounded-none">{page}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="rounded-l-none"><ChevronRight size={16} /></Button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ActuacionTable;
