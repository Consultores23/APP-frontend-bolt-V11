import React from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import TablerosHorizontalMenu from '../../components/processes/TablerosHorizontalMenu';

const TablerosProcesoPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!processId) {
    return (
      <div className="flex flex-col h-screen bg-dark-900 items-center justify-center">
        <p className="text-red-400">ID de proceso no encontrado.</p>
        <Button onClick={() => navigate('/procesos')} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Volver a Procesos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tableros del Proceso</h1>
        <Button onClick={() => navigate(`/procesos/${processId}/detalle`)} variant="outline">
          <ArrowLeft size={16} className="mr-2" /> Volver al Detalle
        </Button>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
          <TablerosHorizontalMenu processId={processId} />
          <div className="bg-dark-800 border border-dark-700 rounded-xl flex-1 p-6">
            <Outlet /> {/* This will render the nested routes for tablero sub-sections */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablerosProcesoPage;
