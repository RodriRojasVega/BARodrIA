// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './modules/dashboard/DashboardView';
import { InsumosView } from './modules/insumos/InsumosView';
import { ProveedoresView } from './modules/proveedores/ProveedoresView';
import { CatalogosView } from './modules/catalogos/CatalogosView';
import { SubRecetasModule } from './modules/subrecetas/SubRecetasView';
import { CoctelView } from './modules/coctel/CoctelView';
import { CartaView } from './modules/carta/CartaView';
import { UiKitView } from './modules/uikit/UiKitView';

function App() {
  return (
    <BrowserRouter>
      {/* Contenedor principal sin bloqueos de altura */}
      <div className="flex min-h-screen bg-background text-foreground font-sans relative">
        
        {/* LA MAGIA AQUÍ: Agregamos 'self-start' 
            Esto evita que el sidebar se estire al infinito y permite que 'sticky' funcione perfecto */}
        <div className="sticky top-0 h-screen shrink-0 z-50 self-start flex">
          <Sidebar />
        </div>
        
        {/* Columna Derecha de la App */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar pegajosa */}
          <div className="sticky top-0 z-40 w-full bg-background shadow-sm">
            <Topbar />
          </div>

          {/* Área Principal de Vistas */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/insumos" element={<InsumosView />} />
              <Route path="/subrecetas" element={<SubRecetasModule />} />
              <Route path="/cocteles" element={<CoctelView />} />
              <Route path="/cartas" element={<CartaView />} />
              <Route path="/bartender" element={<div className="p-8 text-muted">📱 Modo Bartender (En desarrollo)</div>} />
              <Route path="/proveedores" element={<ProveedoresView />} />
              <Route path="/catalogos" element={<CatalogosView />} />
              <Route path="/uikit" element={<UiKitView />} />
            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;