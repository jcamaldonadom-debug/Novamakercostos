import { useMemo } from 'react'
import { calcMototoolRate, formatCOP } from '../utils/calc.js'

export default function PostProcessing({ enabled, onToggle, sede, items, onItemsChange }) {
  const mototoolRate = useMemo(() => calcMototoolRate(sede), [sede])

  function handleQtyChange(id, value) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, qty: value } : item
    )
    onItemsChange(updated)
  }

  return (
    <div>
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
          enabled
            ? 'bg-nm-green/10 border-nm-green/40 text-nm-green'
            : 'bg-nm-surface border-nm-border text-nm-muted'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            enabled ? 'bg-nm-green/20' : 'bg-white/5'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Posprocesado</div>
            <div className={`text-xs ${enabled ? 'text-nm-green/70' : 'text-nm-muted'}`}>
              {enabled ? 'Activo — ajusta materiales abajo' : 'Toca para activar'}
            </div>
          </div>
        </div>
        {/* Switch visual */}
        <div className={`w-12 h-6 rounded-full transition-all duration-200 flex items-center px-1 ${
          enabled ? 'bg-nm-green' : 'bg-nm-border'
        }`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </div>
      </button>

      {/* Items list */}
      {enabled && (
        <div className="mt-3 bg-nm-surface border border-nm-border rounded-xl overflow-hidden">
          {items.map((item, idx) => {
            const rate = item.dynamic ? mototoolRate : (item.copPerUnit ?? 0)
            const qty = Number(item.qty) || 0
            const cost = rate * qty

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  idx < items.length - 1 ? 'border-b border-nm-border' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-nm-text text-sm font-medium truncate">{item.label}</div>
                  <div className="text-nm-muted text-xs">
                    {formatCOP(rate)}/{item.unit}
                    {item.dynamic && <span className="ml-1 text-nm-accent/70">(según sede)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    step={item.unit === 'pliego' || item.unit === 'rollo' ? '0.1' : '1'}
                    value={item.qty}
                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                    className="w-20 text-right bg-nm-bg border border-nm-border rounded-lg px-2 py-1.5
                      text-nm-text text-sm focus:outline-none focus:border-nm-accent"
                  />
                  <span className="text-nm-muted text-xs w-8">{item.unit}</span>
                </div>
                <div className="text-nm-text text-sm font-medium text-right w-20 flex-shrink-0">
                  {formatCOP(cost)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
