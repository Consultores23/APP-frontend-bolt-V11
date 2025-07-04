import React from 'react';
import Header from '../components/ui/Header';
import { Search } from 'lucide-react';

const LeyesPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full">
      <Header title="Leyes" />

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <div className="space-y-6 w-full">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar leyes..."
              className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Leyes Orgánicas</h3>
              <p className="text-gray-400">Regulan aspectos fundamentales del Estado.</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Leyes Ordinarias</h3>
              <p className="text-gray-400">Regulan materias específicas según la necesidad legislativa.</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Leyes Marco</h3>
              <p className="text-gray-400">Establecen los principios generales para materias específicas.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeyesPage;