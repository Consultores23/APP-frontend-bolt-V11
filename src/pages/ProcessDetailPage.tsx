import React, { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import ProcessDetailHorizontalMenu from '../components/processes/ProcessDetailHorizontalMenu';
import { supabase } from '../lib/supabase';
import { Process } from '../types/process';
import { toast } from 'react-hot-toast';

const ProcessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProcess = async () => {
      if (!id) {
        toast.error('ID del proceso no proporcionado');
        navigate('/procesos');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('procesos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProcess(data);
        } else {
          toast.error('Proceso no encontrado');
          navigate('/procesos');
        }
      } catch (error: any) {
        console.error('Error fetching process:', error.message);
        toast.error('Error al cargar los datos del proceso');
        navigate('/procesos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcess();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dark-900">
        <SidebarMenu />
        <div className="flex-1 flex flex-col">
          <Header title="Detalle del Proceso" />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!process) {
    return null;
  }

  return (
    <div className="flex h-screen bg-dark-900">
      <SidebarMenu />
      <div className="flex-1 flex flex-col">
        <Header title={`Proceso: ${process.nombre}`} />
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <ProcessDetailHorizontalMenu processId={id!} />
            <div className="bg-dark-800 border border-dark-700 rounded-xl">
              <Outlet context={{ process }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetailPage;