// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './modules/dashboard/DashboardView';
import { InsumosView } from './modules/insumos/InsumosView';
import { ProveedoresView } from './modules/proveedores/ProveedoresView';
import { CatalogosView } from './modules/catalogos/CatalogosView';
import { SubRecetasModule } from './modules/subrecetas/SubRecetasModule';
import { CoctelView } from './modules/coctel/CoctelView';
import { CartaView } from './modules/carta/CartaView';
import { UiKitView } from './modules/uikit/UiKitView';

// Componente Placeholder temporal para los módulos que construiremos después
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-emerald-400 mb-2">{title}</h2>
    <p className="text-slate-400">Módulo en desarrollo dentro del plan paso a paso...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Contenedor principal de la aplicación */}
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* Menú Lateral (Sidebar) */}
        <Sidebar />
        
        {/* Área de Trabajo Central */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Header Superior Topbar */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>📅</span><span className="font-mono">{new Date().toLocaleDateString('es-CL')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-400 font-mono border border-slate-700">
                Entorno: Producción Local
              </div>
            </div>
          </header>

          {/* Vistas Dinámicas por Ruta */}
          <div className="flex-1 overflow-y-auto bg-slate-950">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/insumos" element={<InsumosView />} />
              <Route path="/subrecetas" element={<SubRecetasModule />} />
              <Route path="/cocteles" element={<CoctelView />} />
              <Route path="/cartas" element={<CartaView />} />
              <Route path="/bartender" element={<Placeholder title="📱 Modo Bartender (Servicio)" />} />
              <Route path="/proveedores" element={<ProveedoresView />} />
              {/* Ruta conectada al Módulo Funcional de Catálogos */}
              <Route path="/catalogos" element={<CatalogosView />} />
              <Route path="/uikit" element={<UiKitView />} />
            </Routes>
          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;