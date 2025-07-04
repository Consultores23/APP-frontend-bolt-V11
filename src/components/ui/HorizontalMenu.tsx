import React from 'react';
import { NavLink } from 'react-router-dom';

interface MenuItem {
  name: string;
  path: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface HorizontalMenuProps {
  items: MenuItem[];
}

const HorizontalMenu: React.FC<HorizontalMenuProps> = ({ items }) => {
  return (
    <div className="w-full bg-dark-800 border-b border-dark-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          {items.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.onClick}
              end // Add the end prop here
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
        </div>
      </nav>
    </div>
  );
};

export default HorizontalMenu;
