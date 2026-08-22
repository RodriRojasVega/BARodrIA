// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// 1. Inicializamos el cliente de caché global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evitamos peticiones innecesarias cuando cambias de ventana y vuelves
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Inyectamos el proveedor de estado envolviendo toda la aplicación */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)