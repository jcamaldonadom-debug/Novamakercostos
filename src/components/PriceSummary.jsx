import { formatCOP, formatPct } from '../utils/calc.js'

export default function PriceSummary({ calc, margenObjetivo = 0.4, quantity = 1 }) {
  if (!calc) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-sm mx-auto bg-nm-surface/95 backdrop-blur border-t border-nm-border px-4 py-3">
          <p className="text-nm-muted text-sm text-center">Completa los datos para ver el precio</p>
        </div>
      </div>
    )
  }

  const margenOk = calc.margenReal >= margenObjetivo - 0.005
  const margenColor = margenOk ? 'text-nm-green' : 'text-red-400'
  const badgeBg = margenOk ? 'bg-nm-green/15 text-nm-green' : 'bg-red-500/15 text-red-400'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-sm mx-auto bg-nm-surface/97 backdrop-blur-sm border-t border-nm-border px-4 pt-3 pb-4">
        {/* Top row — costs breakdown */}
        <div className="flex justify-between text-xs text-nm-muted mb-2">
          <span>Material: {formatCOP(calc.printCost?.materialCost)}</span>
          <span>Electricidad: {formatCOP(calc.printCost?.electricityCost)}</span>
          {calc.ppTotal > 0 && <span>Posprocesado: {formatCOP(calc.ppTotal)}</span>}
        </div>

        {/* Main row */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-nm-muted text-xs">Precio / pieza</div>
            <div className="text-nm-text text-xl font-bold">{formatCOP(calc.precioPieza)}</div>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeBg}`}>
              <span>{margenOk ? '▲' : '▼'}</span>
              <span>{formatPct(calc.margenReal)}</span>
            </div>
            <div className="text-nm-muted text-xs mt-0.5">margen real</div>
          </div>

          <div className="text-right">
            <div className="text-nm-muted text-xs">Total pedido ({quantity} pz)</div>
            <div className="text-nm-green text-2xl font-extrabold leading-none">
              {formatCOP(calc.precioTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
