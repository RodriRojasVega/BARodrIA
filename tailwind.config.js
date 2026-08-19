/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondos
        background: '#020617',     // slate-950 (Fondo principal de la app)
        surface: '#0f172a',        // slate-900 (Tarjetas, modales, tablas)
        'surface-muted': '#1e293b',// slate-800 (Hover de filas, inputs)
        
        // Bordes
        border: '#1e293b',         // slate-800 (Divisores, bordes de tabla)
        'border-hover': '#334155', // slate-700 (Focus en inputs)
        
        // Textos
        foreground: '#f1f5f9',     // slate-100 (Texto principal)
        muted: '#94a3b8',          // slate-400 (Texto secundario, iconos)
        
        // Acentos (El color de la marca)
        primary: '#10b981',        // emerald-500
        'primary-hover': '#059669',// emerald-600
        
        // Estados
        danger: '#ef4444',         // red-500
        'danger-hover': '#dc2626', // red-600
        success: '#10b981',        // emerald-500 (o el tono verde que prefieras)
        warning: '#f59e0b',        // amber-500
        info: '#3b82f6',           // blue-500
        // El 'purple' lo puedes dejar si lo usas mucho para 'features especiales', 
        // o llamarlo 'accent': '#8b5cf6' (violet-500)
        accent: '#8b5cf6',
      }
    },
  },
  plugins: [],
}