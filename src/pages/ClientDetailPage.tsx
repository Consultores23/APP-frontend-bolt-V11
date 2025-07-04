import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import HorizontalMenu from '../components/ui/HorizontalMenu';
import { supabase } from '../lib/supabase';
import { Client } from '../types/client';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuItems = [
    { name: 'Detalle Cliente', path: `/clientes/${id}` },
    { name: 'Procesos', path: `/clientes/${id}/procesos` },
  ];

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) {
        setError('ID de cliente no proporcionado.');
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setClient(data);
        } else {
          setError('Cliente no encontrado.');
        }
      } catch (err: any) {
        console.error('Error fetching client:', err.message);
        setError('Error al cargar los datos del cliente.');
        toast.error('Error al cargar los datos del cliente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dark-900">
        <SidebarMenu />
        <div className="flex-1 flex flex-col">
          <Header title="Detalle del Cliente" />
          <HorizontalMenu items={menuItems} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-dark-900">
        <SidebarMenu />
        <div className="flex-1 flex flex-col">
          <Header title="Detalle del Cliente" />
          <HorizontalMenu items={menuItems} />
          <main className="flex-1">
            <div className="p-8 max-w-4xl mx-auto">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 text-red-400">
                <p>{error}</p>
                <Button onClick={() => navigate('/clientes')} className="mt-4">
                  <ArrowLeft size={16} className="mr-2" /> Volver a Clientes
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-screen bg-dark-900">
        <SidebarMenu />
        <div className="flex-1 flex flex-col">
          <Header title="Detalle del Cliente" />
          <HorizontalMenu items={menuItems} />
          <main className="flex-1">
            <div className="p-8 max-w-4xl mx-auto">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 text-gray-400">
                <p>No se encontró el cliente.</p>
                <Button onClick={() => navigate('/clientes')} className="mt-4">
                  <ArrowLeft size={16} className="mr-2" /> Volver a Clientes
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-900">
      <SidebarMenu />
      <div className="flex-1 flex flex-col">
        <Header title="Detalle del Cliente" />
        <HorizontalMenu items={menuItems} />
        <main className="flex-1">
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {client.nombre} {client.apellido}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold text-gray-200">Correo:</p>
                  <p>{client.correo || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Teléfono:</p>
                  <p>{client.telefono || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Estado:</p>
                  <p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.estado}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Fecha de Creación:</p>
                  <p>{new Date(client.fecha_creacion).toLocaleDateString()} {new Date(client.fecha_creacion).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={() => navigate('/clientes')}>
                  <ArrowLeft size={16} className="mr-2" /> Volver a Clientes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDetailPage;