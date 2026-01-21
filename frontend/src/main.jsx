import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Global handlers for uncaught errors and promise rejections
window.addEventListener('error', (event) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught error:', event.error || event.message)
  try {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'uncaught',
        mensagem: event.error?.message || event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(() => {})
  } catch (e) {}
})

window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', event.reason)
  try {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'unhandledrejection',
        mensagem: (event.reason && event.reason.message) || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(() => {})
  } catch (e) {}
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Registrar service worker (PWA)
// Registrar service worker (PWA)
if ('serviceWorker' in navigator) {
  // Em desenvolvimento, desregistrar qualquer service worker existente
  if (import.meta.env.DEV) {
    window.addEventListener('load', async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        for (const r of regs) await r.unregister()
        // tentar limpar caches para evitar servir bundles antigos
        if (caches && caches.keys) {
          const keys = await caches.keys()
          await Promise.all(keys.map(k => caches.delete(k)))
        }
        console.log('ServiceWorker desregistrado em modo DEV e caches limpos')
      } catch (e) {
        console.warn('Falha ao desregistrar ServiceWorker em DEV:', e)
      }
    })
  } else {
    // Em produção, registrar normalmente
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('ServiceWorker registrado com sucesso:', registration.scope)
        },
        (err) => {
          console.warn('Falha ao registrar ServiceWorker:', err)
        }
      )
    })
  }
}
