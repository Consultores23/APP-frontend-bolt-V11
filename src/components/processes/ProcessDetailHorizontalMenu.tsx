import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, History } from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
}

interface ProcessDetailHorizontalMenuProps {
  processId: string;
}

const ProcessDetailHorizontalMenu: React.FC<ProcessDetailHorizontalMenuProps> = ({ processId }) => {
  const baseUrl = `/procesos/${processId}`;
  
  const mainMenuItems: MenuItem[] = [
    { name: 'Detalle Proceso', path: `${baseUrl}/detalle` },
    { name: 'Actuaciones', path: `${baseUrl}/actuaciones` },
    { name: 'Consulta Proceso', path: `${baseUrl}/consulta` },
  ];

  const toolsMenuItems: MenuItem[] = [
    { name: 'Archivos', path: `/procesos/${processId}/archivos` },
    { name: 'Calendario', path: `${baseUrl}/calendario` },
    { name: 'Tableros', path: `${baseUrl}/tableros` },
    { name: 'Metricas', path: `${baseUrl}/metricas` },
  ];

  return (
    <div className="w-full bg-dark-800 border-b border-dark-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-secondary-500 text-white'
                    : 'border-b-2 border-transparent text-gray-400 hover:border-gray-500 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <Menu as="div" className="relative">
            <Menu.Button className="px-3 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center border-b-2 border-transparent hover:border-gray-500">
              Herramientas
              <ChevronDown className="ml-1 h-4 w-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-lg bg-dark-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-1 py-1">
                  {toolsMenuItems.map((item) => (
                    <Menu.Item key={item.path}>
                      {({ active }) => (
                        <NavLink
                          to={item.path}
                          end
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm rounded-lg ${
                              isActive || active
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-300 hover:bg-dark-600'
                            }`
                          }
                        >
                          {item.name}
                        </NavLink>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          
          <NavLink
            to={`${baseUrl}/historial`}
            end
            className={({ isActive }) =>
              `px-3 py-3 text-sm font-medium transition-colors flex items-center ${
                isActive
                  ? 'border-b-2 border-secondary-500 text-white'
                  : 'border-b-2 border-transparent text-gray-400 hover:border-gray-500 hover:text-white'
              }`
            }
          >
            <History size={16} className="mr-1" />
            Historial
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default ProcessDetailHorizontalMenu;
