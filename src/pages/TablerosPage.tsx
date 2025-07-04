import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import HorizontalMenu from '../components/ui/HorizontalMenu';

const TablerosPage: React.FC = () => {
  const menuItems = [
    { name: 'Métricas', path: '/tableros/metricas' },
    { name: 'Actividades', path: '/tableros/actividades' },
    { name: 'Audiencias', path: '/tableros/audiencias' },
    { name: 'Términos', path: '/tableros/terminos' },
    { name: 'Reuniones', path: '/tableros/reuniones' },
  ];

  return (
    <div className="flex h-screen bg-dark-900">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <Header title="Tableros" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <HorizontalMenu items={menuItems} />
            <div className="bg-dark-800 border border-dark-700 rounded-xl mt-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TablerosPage;