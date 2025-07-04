import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import SidebarMenu from '../components/ui/SidebarMenu';
import Header from '../components/ui/Header';
import HorizontalMenu from '../components/ui/HorizontalMenu'; // Import HorizontalMenu

const BuscadorLegalPage: React.FC = () => {
  const menuItems = [
    { name: 'Códigos', path: '/buscador-legal/codigos' },
    { name: 'Decretos', path: '/buscador-legal/decretos' },
    { name: 'Leyes', path: '/buscador-legal/leyes' },
  ];

  return (
    <div className="flex h-screen bg-dark-900">
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        <Header title="Buscador Legal" />

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <HorizontalMenu items={menuItems} /> {/* Add the horizontal menu */}
            <Outlet /> {/* This will render the nested routes */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuscadorLegalPage;

