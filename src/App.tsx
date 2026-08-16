// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';

// Componentes "Placeholder" temporales para verificar las rutas
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-emerald-400 mb-2">{title}</h2>
    <p className="text-slate-400">Módulo en construcción...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Contenedor principal de la aplicación */}
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
        
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
                Esquema: public
              </div>
            </div>
          </header>

          {/* Vistas Dinámicas */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Placeholder title="📊 Dashboard General" />} />
              <Route path="/insumos" element={<Placeholder title="🛒 Maestro de Insumos" />} />
              <Route path="/subrecetas" element={<Placeholder title="🧪 Sub-recetas Artesanales" />} />
              <Route path="/cocteles" element={<Placeholder title="🍸 Cócteles y Fichas" />} />
              <Route path="/cartas" element={<Placeholder title="📜 Cartas y Eventos" />} />
              <Route path="/bartender" element={<Placeholder title="📱 Modo Bartender (Servicio)" />} />
              <Route path="/catalogos" element={<Placeholder title="⚙️ Catálogos Estáticos" />} />
            </Routes>
          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;