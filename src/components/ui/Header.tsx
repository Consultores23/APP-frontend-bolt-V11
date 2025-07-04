import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-dark-800 border-b border-dark-700 px-8 py-4">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </header>
  );
};

export default Header;