import React from 'react';
import { useParams } from 'react-router-dom';
import ActivityMetrics from '../../../components/metrics/ActivityMetrics';
import AudienciaMetrics from '../../../components/metrics/AudienciaMetrics';
import TerminoMetrics from '../../../components/metrics/TerminoMetrics';
import ReunionMetrics from '../../../components/metrics/ReunionMetrics';
import { BarChart3 } from 'lucide-react';

const MetricasTableroPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();

  if (!processId) {
    return (
      <div className="text-center text-red-400 py-8">
        ID de proceso no encontrado para las métricas.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-secondary-500" size={28} />
        <div>
          <h2 className="text-2xl font-semibold text-white">Métricas del Proceso</h2>
          <p className="text-gray-400">
            Análisis en tiempo real de actividades, audiencias, términos y reuniones del proceso.
          </p>
        </div>
      </div>

      {/* Activity Metrics Section */}
      <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-6">
        <ActivityMetrics processId={processId} />
      </div>

      {/* Audiencia Metrics Section */}
      <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-6">
        <AudienciaMetrics processId={processId} />
      </div>

      {/* Termino Metrics Section */}
      <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-6">
        <TerminoMetrics processId={processId} />
      </div>

      {/* Reunion Metrics Section */}
      <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-6">
        <ReunionMetrics processId={processId} />
      </div>
    </div>
  );
};

export default MetricasTableroPage;