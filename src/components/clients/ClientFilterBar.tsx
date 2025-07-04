import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Search, X } from 'lucide-react';

interface ClientFilters {
  nombre: string;
  estado: string;
}

interface ClientFilterBarProps {
  filters: ClientFilters;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClientFilterBar: React.FC<ClientFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchTermChange,
}) => {
  const hasFilters = filters.nombre !== '' || filters.estado !== '';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Filtro por Nombre */}
        <div className="flex-grow" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
            Nombre del Cliente
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400" />
            </span>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={onSearchTermChange}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Filtro por Estado */}
        <div className="flex-grow" style={{ minWidth: '150px', maxWidth: '200px' }}>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-300 mb-1">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={filters.estado}
            onChange={onFilterChange}
            className="w-full bg-dark-800 border border-dark-700 rounded-md px-3 py-2 text-white h-[42px] focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* Botón de Limpiar */}
        <div className="flex-grow flex justify-end">
          {hasFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <X size={16} className="mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientFilterBar;
