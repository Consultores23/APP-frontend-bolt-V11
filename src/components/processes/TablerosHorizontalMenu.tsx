import React from 'react';
import { NavLink } from 'react-router-dom';

interface MenuItem {
  name: string;
  path: string;
}

interface TablerosHorizontalMenuProps {
  processId: string;
}

const TablerosHorizontalMenu: React.FC<TablerosHorizontalMenuProps> = ({ processId }) => {
  const baseUrl = `/procesos/${processId}/tableros`;
  
  const menuItems: MenuItem[] = [
    { name: 'Métricas', path: `${baseUrl}/metricas` },
    { name: 'Actividades', path: `${baseUrl}/actividades` },
    { name: 'Audiencias', path: `${baseUrl}/audiencias` },
    { name: 'Términos', path: `${baseUrl}/terminos` },
    { name: 'Reuniones', path: `${baseUrl}/reuniones` },
  ];

  return (
    <nav className="w-full bg-dark-800 border border-dark-700 rounded-xl p-2 flex flex-wrap gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-secondary-500 text-white'
                : 'text-gray-300 hover:bg-dark-700 hover:text-white'
            }`
          }
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default TablerosHorizontalMenu;
