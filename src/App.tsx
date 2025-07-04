import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';
import LoginPage from './components/auth/LoginPage';
import { supabase } from './lib/supabase';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ClientesPage = lazy(() => import('./pages/ClientesPage'));
const ProcesosPage = lazy(() => import('./pages/ProcesosPage'));
const DailyPage = lazy(() => import('./pages/DailyPage'));
const NotificacionesPage = lazy(() => import('./pages/NotificacionesPage'));
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'));
const TablerosPage = lazy(() => import('./pages/TablerosPage'));
const BuscadorLegalPage = lazy(() => import('./pages/BuscadorLegalPage'));
const ClientDetailPage = lazy(() => import('./pages/ClientDetailPage'));
const ClientProcessesPage = lazy(() => import('./pages/ClientProcessesPage'));
const ProcessDetailPage = lazy(() => import('./pages/ProcessDetailPage'));
const CodigosPage = lazy(() => import('./pages/CodigosPage'));
const DecretosPage = lazy(() => import('./pages/DecretosPage'));
const LeyesPage = lazy(() => import('./pages/LeyesPage'));
const ResponsablesPage = lazy(() => import('./pages/ResponsablesPage'));

// Process Detail Pages
const ProcessDetailOverviewPage = lazy(() => import('./pages/process_details/ProcessDetailOverviewPage'));
const ActuacionesPage = lazy(() => import('./pages/process_details/ActuacionesPage'));
const ConsultaProcesoPage = lazy(() => import('./pages/process_details/ConsultaProcesoPage'));
const ArchivosPage = lazy(() => import('./pages/process_details/ArchivosPage'));
const CalendarioProcesoPage = lazy(() => import('./pages/process_details/CalendarioProcesoPage'));
const TablerosProcesoPage = lazy(() => import('./pages/process_details/TablerosProcesoPage'));
const MetricasPage = lazy(() => import('./pages/process_details/MetricasPage'));
const HistorialPage = lazy(() => import('./pages/process_details/HistorialPage'));

// Tablero Sub-pages (Process specific)
const MetricasTableroPage = lazy(() => import('./pages/process_details/tableros/MetricasTableroPage'));
const ActividadesTableroPage = lazy(() => import('./pages/process_details/tableros/ActividadesTableroPage'));
const AudienciasTableroPage = lazy(() => import('./pages/process_details/tableros/AudienciasTableroPage'));
const TerminosTableroPage = lazy(() => import('./pages/process_details/tableros/TerminosTableroPage'));
const ReunionesTableroPage = lazy(() => import('./pages/process_details/tableros/ReunionesTableroPage'));

// Main Tableros Sub-pages
const MetricasMainPage = lazy(() => import('./pages/tableros/MetricasPage'));
const ActividadesMainPage = lazy(() => import('./pages/tableros/ActividadesPage'));
const AudienciasMainPage = lazy(() => import('./pages/tableros/AudienciasPage'));
const TerminosMainPage = lazy(() => import('./pages/tableros/TerminosPage'));
const ReunionesMainPage = lazy(() => import('./pages/tableros/ReunionesPage'));

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const renderLoader = () => (
    <div className="h-screen flex items-center justify-center bg-dark-900">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
    </div>
  );

  if (isAuthenticated === null) {
    return renderLoader();
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Suspense fallback={renderLoader()}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/inicio" /> : <LoginPage />} />
            <Route path="/inicio" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
            <Route path="/clientes" element={isAuthenticated ? <ClientesPage /> : <Navigate to="/" />} />
            <Route path="/responsables" element={isAuthenticated ? <ResponsablesPage /> : <Navigate to="/" />} />
            <Route path="/clientes/:id" element={isAuthenticated ? <ClientDetailPage /> : <Navigate to="/" />} />
            <Route path="/clientes/:id/procesos" element={isAuthenticated ? <ClientProcessesPage /> : <Navigate to="/" />} />
            <Route path="/procesos" element={isAuthenticated ? <ProcesosPage /> : <Navigate to="/" />} />
            <Route path="/procesos/:id/archivos" element={isAuthenticated ? <ArchivosPage /> : <Navigate to="/" />} />
            <Route path="/procesos/:id/tableros" element={isAuthenticated ? <TablerosProcesoPage /> : <Navigate to="/" />} >
              <Route index element={<Navigate to="metricas" replace />} />
              <Route path="metricas" element={<MetricasTableroPage />} />
              <Route path="actividades" element={<ActividadesTableroPage />} />
              <Route path="audiencias" element={<AudienciasTableroPage />} />
              <Route path="terminos" element={<TerminosTableroPage />} />
              <Route path="reuniones" element={<ReunionesTableroPage />} />
            </Route>
            <Route path="/procesos/:id/*" element={isAuthenticated ? <ProcessDetailPage /> : <Navigate to="/" />} >
              <Route index element={<Navigate to="detalle" replace />} />
              <Route path="detalle" element={<ProcessDetailOverviewPage />} />
              <Route path="actuaciones" element={<ActuacionesPage />} />
              <Route path="consulta" element={<ConsultaProcesoPage />} />
              <Route path="calendario" element={<CalendarioProcesoPage />} />
              <Route path="metricas" element={<MetricasPage />} />
              <Route path="historial" element={<HistorialPage />} />
            </Route>
            <Route path="/daily" element={isAuthenticated ? <DailyPage /> : <Navigate to="/" />} />
            <Route path="/notificaciones" element={isAuthenticated ? <NotificacionesPage /> : <Navigate to="/" />} />
            <Route path="/calendario" element={isAuthenticated ? <CalendarioPage /> : <Navigate to="/" />} />
            <Route path="/tableros" element={isAuthenticated ? <TablerosPage /> : <Navigate to="/" />} >
              <Route index element={<Navigate to="metricas" replace />} />
              <Route path="metricas" element={<MetricasMainPage />} />
              <Route path="actividades" element={<ActividadesMainPage />} />
              <Route path="audiencias" element={<AudienciasMainPage />} />
              <Route path="terminos" element={<TerminosMainPage />} />
              <Route path="reuniones" element={<ReunionesMainPage />} />
            </Route>
            <Route path="/buscador-legal" element={isAuthenticated ? <BuscadorLegalPage /> : <Navigate to="/" />} >
              <Route index element={<Navigate to="codigos" replace />} />
              <Route path="codigos" element={<CodigosPage />} />
              <Route path="decretos" element={<DecretosPage />} />
              <Route path="leyes" element={<LeyesPage />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-dark-800 text-white border border-dark-700',
            style: { background: '#111111', color: '#fff' },
          }}
        />
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;