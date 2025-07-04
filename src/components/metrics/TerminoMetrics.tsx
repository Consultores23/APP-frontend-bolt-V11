import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Termino } from '../../types/termino';
import { Responsable } from '../../types/responsable';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Clock, TrendingUp, Users, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TerminoMetricsProps {
  processId: string;
}

interface TerminoMetrics {
  total: number;
  byStatus: { [key: string]: number };
  byPriority: { [key: string]: number };
  byResponsable: { [key: string]: { count: number; name: string } };
  completionRate: number;
  avgDuration: number;
  expiredTerminos: number;
}

const TerminoMetrics: React.FC<TerminoMetricsProps> = ({ processId }) => {
  const [metrics, setMetrics] = useState<TerminoMetrics>({
    total: 0,
    byStatus: {},
    byPriority: {},
    byResponsable: {},
    completionRate: 0,
    avgDuration: 0,
    expiredTerminos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTerminoMetrics = useCallback(async () => {
    if (!processId) return;

    setIsLoading(true);
    try {
      // Fetch terminos
      const { data: terminos, error: terminosError } = await supabase
        .from('terminos')
        .select('*')
        .eq('process_id', processId);

      if (terminosError) throw terminosError;

      // Fetch responsables
      const { data: responsables, error: responsablesError } = await supabase
        .from('responsables')
        .select('id, nombre, apellido')
        .eq('estado', 'Activo');

      if (responsablesError) throw responsablesError;

      // Calculate metrics
      const total = terminos?.length || 0;
      const byStatus: { [key: string]: number } = {};
      const byPriority: { [key: string]: number } = {};
      const byResponsable: { [key: string]: { count: number; name: string } } = {};

      let completedTerminos = 0;
      let totalDuration = 0;
      let terminosWithDuration = 0;
      let expiredTerminos = 0;
      const now = new Date();

      terminos?.forEach((termino: Termino) => {
        // Count by status
        byStatus[termino.estado] = (byStatus[termino.estado] || 0) + 1;

        // Count by priority
        if (termino.prioridad) {
          byPriority[termino.prioridad] = (byPriority[termino.prioridad] || 0) + 1;
        }

        // Count by responsable
        if (termino.responsable_id) {
          const responsable = responsables?.find(r => r.id === termino.responsable_id);
          if (responsable) {
            const responsableName = `${responsable.nombre} ${responsable.apellido}`;
            if (!byResponsable[termino.responsable_id]) {
              byResponsable[termino.responsable_id] = { count: 0, name: responsableName };
            }
            byResponsable[termino.responsable_id].count++;
          }
        }

        // Calculate completion rate
        if (termino.estado === 'Finalizado') {
          completedTerminos++;
        }

        // Calculate average duration
        if (termino.fecha_inicio_termino && termino.fecha_finaliza_termino) {
          const inicio = new Date(termino.fecha_inicio_termino);
          const fin = new Date(termino.fecha_finaliza_termino);
          const duration = Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // days
          totalDuration += duration;
          terminosWithDuration++;

          // Check if expired (past end date and not completed)
          if (fin < now && termino.estado !== 'Finalizado') {
            expiredTerminos++;
          }
        }
      });

      const completionRate = total > 0 ? (completedTerminos / total) * 100 : 0;
      const avgDuration = terminosWithDuration > 0 ? totalDuration / terminosWithDuration : 0;

      setMetrics({
        total,
        byStatus,
        byPriority,
        byResponsable,
        completionRate,
        avgDuration,
        expiredTerminos,
      });
    } catch (err: any) {
      console.error('Error fetching termino metrics:', err.message);
      toast.error('Error al cargar las métricas de términos.');
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    fetchTerminoMetrics();
  }, [fetchTerminoMetrics]);

  // Chart configurations
  const statusChartData = {
    labels: Object.keys(metrics.byStatus),
    datasets: [
      {
        label: 'Términos por Estado',
        data: Object.values(metrics.byStatus),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)', // Pendiente - Yellow
          'rgba(59, 130, 246, 0.8)', // En Proceso - Blue
          'rgba(34, 197, 94, 0.8)', // Finalizado - Green
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(metrics.byPriority),
    datasets: [
      {
        label: 'Términos por Prioridad',
        data: Object.values(metrics.byPriority),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Alta - Red
          'rgba(251, 191, 36, 0.8)', // Media - Yellow
          'rgba(34, 197, 94, 0.8)', // Baja - Green
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const responsableChartData = {
    labels: Object.values(metrics.byResponsable).map(r => r.name),
    datasets: [
      {
        label: 'Términos por Responsable',
        data: Object.values(metrics.byResponsable).map(r => r.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#ffffff',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-green-500" size={24} />
        <h3 className="text-xl font-semibold text-white">Métricas de Términos</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Términos</p>
              <p className="text-2xl font-bold text-white">{metrics.total}</p>
            </div>
            <Clock className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-white">{metrics.completionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Duración Promedio</p>
              <p className="text-2xl font-bold text-white">{metrics.avgDuration.toFixed(1)} días</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Términos Vencidos</p>
              <p className="text-2xl font-bold text-white">{metrics.expiredTerminos}</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Términos por Estado</h4>
          {Object.keys(metrics.byStatus).length > 0 ? (
            <Doughnut data={statusChartData} options={doughnutOptions} />
          ) : (
            <div className="text-center text-gray-400 py-8">No hay datos disponibles</div>
          )}
        </div>

        {/* Priority Chart */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Términos por Prioridad</h4>
          {Object.keys(metrics.byPriority).length > 0 ? (
            <Doughnut data={priorityChartData} options={doughnutOptions} />
          ) : (
            <div className="text-center text-gray-400 py-8">No hay datos disponibles</div>
          )}
        </div>

        {/* Responsable Chart */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-6 lg:col-span-2">
          <h4 className="text-lg font-semibold text-white mb-4">Términos por Responsable</h4>
          {Object.keys(metrics.byResponsable).length > 0 ? (
            <Bar data={responsableChartData} options={chartOptions} />
          ) : (
            <div className="text-center text-gray-400 py-8">No hay datos disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminoMetrics;