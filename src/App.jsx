import { useState, useEffect } from 'react'
import UserSelector from './components/UserSelector.jsx'
import QuoteCustom from './components/QuoteCustom.jsx'
import QuoteCatalog from './components/QuoteCatalog.jsx'
import History from './components/History.jsx'
import { formatCOP } from './utils/calc.js'

const LS_KEY = 'nm_user'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)
  const [lastQuote, setLastQuote] = useState(null)

  // Restore user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      setCurrentUser(saved)
      setScreen('home')
    }
  }, [])

  function handleUserSelect(user) {
    localStorage.setItem(LS_KEY, user)
    setCurrentUser(user)
    setScreen('home')
  }

  function handleQuoteSaved(data) {
    setLastQuote(data)
    setScreen('confirm')
  }

  function handleCopyQuote() {
    if (!lastQuote) return
    const text = [
      '📦 Cotización Novamaker Studio',
      `Cliente: ${lastQuote.cliente}`,
      `Producto: ${lastQuote.descripcion}`,
      `Cantidad: ${lastQuote.cantidad} ${lastQuote.cantidad === 1 ? 'pieza' : 'piezas'}`,
      `Sede: ${lastQuote.sede}`,
      `Precio/pieza: ${formatCOP(lastQuote.precioPieza)}`,
      `Total: ${formatCOP(lastQuote.precioTotal)}`,
      `Canal: ${lastQuote.canal}`,
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
  }

  // PANTALLA 0 — Login
  if (screen === 'login') {
    return <UserSelector onSelect={handleUserSelect} />
  }

  // PANTALLA 1 — Home
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-nm-bg flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-nm-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-nm-accent/10 border border-nm-accent/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-nm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6" />
                </svg>
              </div>
              <span className="text-nm-text font-bold">Novamaker</span>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(LS_KEY)
              setCurrentUser(null)
              setScreen('login')
            }}
            className="flex items-center gap-1.5 text-nm-muted text-xs hover:text-nm-text transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-nm-surface border border-nm-border flex items-center justify-center">
              <span className="text-xs font-semibold">{currentUser?.slice(0, 1)}</span>
            </div>
            <span>{currentUser}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 py-6 max-w-sm mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-nm-text text-2xl font-bold">Nueva cotización</h1>
            <p className="text-nm-muted text-sm mt-1">¿Qué tipo de trabajo vas a cotizar?</p>
          </div>

          <div className="space-y-3">
            {/* Custom */}
            <button
              onClick={() => setScreen('custom')}
              className="w-full flex items-center gap-4 bg-nm-surface border border-nm-border hover:border-nm-accent/50
                rounded-2xl p-5 text-left transition-all active:scale-98"
            >
              <div className="w-12 h-12 rounded-xl bg-nm-accent/10 border border-nm-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-nm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="text-nm-text font-bold text-base">+ Trabajo Custom</div>
                <div className="text-nm-muted text-sm mt-0.5">Ingresa gramos, tiempo y material</div>
              </div>
              <svg className="w-4 h-4 text-nm-muted ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Catálogo */}
            <button
              onClick={() => setScreen('catalog')}
              className="w-full flex items-center gap-4 bg-nm-surface border border-nm-border hover:border-nm-green/50
                rounded-2xl p-5 text-left transition-all active:scale-98"
            >
              <div className="w-12 h-12 rounded-xl bg-nm-green/10 border border-nm-green/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-nm-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <div className="text-nm-text font-bold text-base">Producto Catálogo</div>
                <div className="text-nm-muted text-sm mt-0.5">Cajas y productos predefinidos</div>
              </div>
              <svg className="w-4 h-4 text-nm-muted ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Historial link */}
          <div className="mt-auto pt-8">
            <button
              onClick={() => setScreen('history')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-nm-border
                text-nm-muted hover:text-nm-text hover:border-nm-muted/50 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver historial de cotizaciones
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PANTALLA 2A — Custom
  if (screen === 'custom') {
    return (
      <QuoteCustom
        currentUser={currentUser}
        onSaved={handleQuoteSaved}
        onBack={() => setScreen('home')}
      />
    )
  }

  // PANTALLA 2B — Catálogo
  if (screen === 'catalog') {
    return (
      <QuoteCatalog
        currentUser={currentUser}
        onSaved={handleQuoteSaved}
        onBack={() => setScreen('home')}
      />
    )
  }

  // PANTALLA 3 — Confirmación
  if (screen === 'confirm' && lastQuote) {
    return (
      <div className="min-h-screen bg-nm-bg flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Success icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-nm-green/10 border border-nm-green/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-nm-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-nm-text text-2xl font-bold">¡Cotización guardada!</h1>
            <p className="text-nm-muted text-sm mt-1">Registrada en Google Sheets</p>
          </div>

          {/* Quote card */}
          <div className="bg-nm-surface border border-nm-border rounded-2xl p-5 mb-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-nm-muted text-xs uppercase tracking-wide">Cliente</div>
                <div className="text-nm-text font-bold text-lg mt-0.5">{lastQuote.cliente}</div>
              </div>
              <span className="bg-nm-accent/10 text-nm-accent border border-nm-accent/20 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {lastQuote.tipo}
              </span>
            </div>

            <div className="text-nm-muted text-sm">{lastQuote.descripcion}</div>

            <div className="border-t border-nm-border pt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-nm-muted text-xs">Precio / pieza</div>
                <div className="text-nm-text font-semibold">{formatCOP(lastQuote.precioPieza)}</div>
              </div>
              <div>
                <div className="text-nm-muted text-xs">Cantidad</div>
                <div className="text-nm-text font-semibold">{lastQuote.cantidad} pz</div>
              </div>
              <div>
                <div className="text-nm-muted text-xs">Sede</div>
                <div className="text-nm-text font-semibold">{lastQuote.sede}</div>
              </div>
              <div>
                <div className="text-nm-muted text-xs">Canal</div>
                <div className="text-nm-text font-semibold">{lastQuote.canal}</div>
              </div>
            </div>

            <div className="border-t border-nm-border pt-3">
              <div className="text-nm-muted text-xs mb-1">Total del pedido</div>
              <div className="text-nm-green text-3xl font-extrabold">{formatCOP(lastQuote.precioTotal)}</div>
              <div className="text-nm-muted text-xs mt-0.5">Margen real: {lastQuote.margen}%</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleCopyQuote}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                bg-nm-surface border border-nm-border text-nm-text text-sm font-medium
                hover:border-nm-accent/50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copiar resumen
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setLastQuote(null); setScreen('home') }}
                className="py-3 rounded-xl bg-nm-accent text-white text-sm font-semibold
                  hover:bg-blue-400 transition-all"
              >
                Nueva cotización
              </button>
              <button
                onClick={() => setScreen('history')}
                className="py-3 rounded-xl bg-nm-surface border border-nm-border text-nm-text text-sm font-semibold
                  hover:border-nm-muted/50 transition-all"
              >
                Ver historial
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PANTALLA 4 — Historial
  if (screen === 'history') {
    return (
      <History
        currentUser={currentUser}
        onBack={() => setScreen(lastQuote ? 'confirm' : 'home')}
      />
    )
  }

  return null
}
