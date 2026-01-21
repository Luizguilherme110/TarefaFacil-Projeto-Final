import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info)
    // Send error to backend for server-side logging (best-effort)
    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'errorBoundary',
          mensagem: error?.message || String(error),
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {})
    } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Ops — aconteceu um erro</h2>
            <p className="text-gray-600 mb-4">Algo deu errado ao carregar a aplicação. Tente recarregar a página.</p>
            <div className="space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary px-4 py-2"
              >Recarregar</button>
            </div>
            <pre className="text-xs text-left mt-4 overflow-auto max-h-40">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
