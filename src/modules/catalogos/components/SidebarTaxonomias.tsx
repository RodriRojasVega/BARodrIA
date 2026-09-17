import { ChevronDown, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { SelectableCard } from '@/components/ui/SelectableCard';
import type { NombreTabla, GrupoTaxonomia } from '../types';

interface SidebarTaxonomiasProps {
  tablaActiva: NombreTabla;
  setTablaActiva: (id: NombreTabla) => void;
  panelIzquierdoColapsado: boolean;
  setPanelIzquierdoColapsado: (val: boolean) => void;
  gruposAbiertos: Record<string, boolean>;
  toggleGrupo: (id: string) => void;
  tablasConfig: { id: NombreTabla; label: string; icon: React.ReactNode }[];
  gruposTaxonomias: GrupoTaxonomia[];
}

export function SidebarTaxonomias({
  tablaActiva,
  setTablaActiva,
  panelIzquierdoColapsado,
  setPanelIzquierdoColapsado,
  gruposAbiertos,
  toggleGrupo,
  tablasConfig,
  gruposTaxonomias
}: SidebarTaxonomiasProps) {
  return (
    <div className={`transition-all duration-300 ease-in-out shrink-0 ${panelIzquierdoColapsado ? 'w-full lg:w-16 overflow-hidden' : 'w-full lg:w-72'}`}>
      <div className="bg-background/30 backdrop-blur-md border border-border/40 rounded-2xl p-3 shadow-none relative">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
          {!panelIzquierdoColapsado && (
            <div className="flex items-center gap-2">
              <Database size={15} className="text-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">Taxonomías</span>
            </div>
          )}
          <button 
            onClick={() => setPanelIzquierdoColapsado(!panelIzquierdoColapsado)}
            className={`p-1.5 rounded-xl hover:bg-background/60 text-muted hover:text-foreground transition-colors flex items-center justify-center ${panelIzquierdoColapsado ? 'mx-auto' : 'ml-auto'}`}
            title={panelIzquierdoColapsado ? "Expandir Panel" : "Ocultar Panel"}
          >
            {panelIzquierdoColapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {panelIzquierdoColapsado ? (
          <div className="flex flex-col items-center gap-2 py-1">
            {tablasConfig.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTablaActiva(tab.id)}
                className={`p-2 rounded-xl transition-all ${tablaActiva === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground hover:bg-background/50'}`}
                title={tab.label}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1">
            {gruposTaxonomias.map(grupo => {
              const estaAbierto = gruposAbiertos[grupo.id] ?? true;
              return (
                <div key={grupo.id} className="space-y-1">
                  <button 
                    onClick={() => toggleGrupo(grupo.id)}
                    className="w-full flex items-center justify-between px-1 py-1 text-xs font-mono uppercase text-muted hover:text-foreground font-bold tracking-wider transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {grupo.icon}
                      <span className="truncate">{grupo.nombre}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${estaAbierto ? 'transform rotate-180' : ''}`} />
                  </button>
                  {estaAbierto && (
                    <div className="space-y-1 pl-1 animate-fade-in">
                      {grupo.tablas.map(tab => (
                        <SelectableCard
                          key={tab.id}
                          title={tab.label}
                          isActive={tablaActiva === tab.id}
                          onClick={() => setTablaActiva(tab.id)}
                          icon={tab.icon}
                          className="text-sm py-1.5 px-2.5 bg-background/20 backdrop-blur-sm border-border/30 shadow-none"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
