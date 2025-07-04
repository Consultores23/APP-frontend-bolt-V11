import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  ListTodo, 
  Bell, 
  Calendar, 
  LayoutDashboard, 
  Gavel, 
  UserCog,
  Briefcase,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const menuItems = [
  {
    title: 'Gestión Usuarios',
    icon: Briefcase,
    paths: ['/clientes', '/responsables'],
    subItems: [
      { title: 'Clientes', path: '/clientes', icon: Users },
      { title: 'Responsables', path: '/responsables', icon: UserCog },
    ],
  },
  {
    title: 'Gestión Procesos',
    icon: ListTodo,
    paths: ['/procesos', '/daily', '/tableros'],
    subItems: [
      { title: 'Procesos', path: '/procesos', icon: ListTodo },
      { title: 'Daily', path: '/daily', icon: Calendar },
      { title: 'Tableros', path: '/tableros', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Herramientas',
    icon: Wrench,
    paths: ['/calendario', '/buscador-legal', '/notificaciones'],
    subItems: [
      { title: 'Calendario', path: '/calendario', icon: Calendar },
      { title: 'Buscador Legal', path: '/buscador-legal', icon: Gavel },
      { title: 'Notificaciones', path: '/notificaciones', icon: Bell },
    ],
  },
];

const SidebarMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const activeMenu = menuItems.find(item => item.paths.includes(location.pathname));
    if (activeMenu) {
      setOpenMenu(activeMenu.title);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <div className={`relative h-screen bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className={`text-lg font-semibold text-white transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            COnsultores
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/inicio"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-secondary-500 text-white' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}
        >
          <Home size={20} className="flex-shrink-0" />
          <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            Inicio
          </span>
        </NavLink>
        
        {menuItems.map((item) => {
          const isMenuOpen = openMenu === item.title;
          const isMenuActive = item.paths.includes(location.pathname);

          return (
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isMenuActive ? 'text-white' : 'text-gray-400'} hover:bg-dark-700 hover:text-white`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                    {item.title}
                  </span>
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {!isCollapsed && isMenuOpen && (
                <div className="mt-1 pl-8 space-y-1">
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-secondary-400 font-semibold' : 'text-gray-400 hover:text-white'}`}
                    >
                      <subItem.icon size={16} className="flex-shrink-0" />
                      <span>{subItem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 hover:bg-dark-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  );
};

export default SidebarMenu;
