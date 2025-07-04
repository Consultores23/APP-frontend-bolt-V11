import React, { useEffect, useState } from 'react';
import Header from '../components/ui/Header';
import { Search } from 'lucide-react';

const CodigosPage: React.FC = () => {
  const [isWidgetScriptLoaded, setIsWidgetScriptLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cloud.google.com/ai/gen-app-builder/client?hl=es_419';
    script.async = true;
    script.onload = () => setIsWidgetScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full">
      <Header title="Códigos" />

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <div className="space-y-6 w-full">
          {/* Search Section */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              {isWidgetScriptLoaded && (
                <gen-search-widget
                  configId="6cd6fa81-d643-467e-9622-785d5ba42061"
                  location="us"
                  triggerId="searchWidgetTrigger">
                </gen-search-widget>
              )}
              <input 
                id="searchWidgetTrigger"
                type="text"
                placeholder="Buscar en códigos legales..."
                className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Código Civil</h3>
              <p className="text-gray-400">Normativa fundamental que regula las relaciones civiles entre personas.</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Código Penal</h3>
              <p className="text-gray-400">Conjunto de normas que regulan las conductas punibles y sus sanciones.</p>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-secondary-500 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-white mb-3">Código Comercial</h3>
              <p className="text-gray-400">Marco legal que regula las actividades comerciales y mercantiles.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodigosPage;