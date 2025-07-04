import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Search, X } from 'lucide-react';

interface AllProcessesFilters {
  cliente: string;
  radicado: string;
  estado: string;
}

interface AllProcessesFilterBarProps {
  filters: AllProcessesFilters;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClearFilters: () => void;
}

const AllProcessesFilterBar: React.FC<AllProcessesFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasFilters = filters.cliente !== '' || filters.radicado !== '' || filters.estado !== '';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Filtro por Cliente */}
        <div className="col-span-1">
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-300 mb-1">
            Cliente
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400" />
            </span>
            <Input
              id="cliente"
              name="cliente"
              placeholder="Buscar por cliente..."
              value={filters.cliente}
              onChange={onFilterChange}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Filtro por Radicado */}
        <div className="col-span-1">
          <label htmlFor="radicado" className="block text-sm font-medium text-gray-300 mb-1">
            Radicado
          </label>
          <Input
            id="radicado"
            name="radicado"
            placeholder="Buscar por radicado..."
            value={filters.radicado}
            onChange={onFilterChange}
            className="w-full"
          />
        </div>

        {/* Filtro por Estado */}
        <div className="col-span-1">
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
        <div className="col-span-1 flex justify-end">
          {hasFilters && (
            <Button variant="outline" onClick={onClearFilters} className="w-full md:w-auto">
              <X size={16} className="mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProcessesFilterBar;
