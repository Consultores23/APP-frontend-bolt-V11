import React from 'react';
import { useParams } from 'react-router-dom';
import HistorialComponent from '../../components/historial/HistorialComponent'; // Import the new component

const HistorialPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();

  if (!processId) {
    return (
      <div className="p-6 text-red-400">
        ID de proceso no encontrado para el historial.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Historial del Proceso</h2>
      <p className="text-gray-400 mb-6">
        Aquí puedes ver el historial de operaciones CRUD para las tablas de Proceso y Actuaciones relacionadas con este proceso.
      </p>
      <HistorialComponent processId={processId} />
    </div>
  );
};

export default HistorialPage;
