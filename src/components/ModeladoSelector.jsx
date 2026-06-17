import { MODELADO_TIERS } from '../config/config.js'
import { calcModelado, formatCOP } from '../utils/calc.js'

// Add-on opcional de Modelado 3D. Imita el patrón de PostProcessing:
// un toggle + (cuando está activo) un selector de los 5 tiers de complejidad.
// Props: { enabled, onToggle, tierId, onTierChange, canal }
export default function ModeladoSelector({ enabled, onToggle, tierId, onTierChange, canal }) {
  return (
    <div>
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
          enabled
            ? 'bg-nm-accent/10 border-nm-accent/40 text-nm-accent'
            : 'bg-nm-surface border-nm-border text-nm-muted'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            enabled ? 'bg-nm-accent/20' : 'bg-white/5'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Modelado 3D</div>
            <div className={`text-xs ${enabled ? 'text-nm-accent/70' : 'text-nm-muted'}`}>
              {enabled ? 'Activo — elige el nivel abajo' : 'Diseño CAD del modelo (opcional)'}
            </div>
          </div>
        </div>
        {/* Switch visual */}
        <div className={`w-12 h-6 rounded-full transition-all duration-200 flex items-center px-1 ${
          enabled ? 'bg-nm-accent' : 'bg-nm-border'
        }`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </div>
      </button>

      {/* Selector de tiers */}
      {enabled && (
        <div className="mt-3 space-y-2">
          {MODELADO_TIERS.map((tier) => {
            const { precio, horas } = calcModelado(tier.id, canal)
            const isSelected = tierId === tier.id
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onTierChange(tier.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-nm-accent/10 border-nm-accent text-nm-text'
                    : 'bg-nm-surface border-nm-border text-nm-text hover:border-nm-accent/40'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  isSelected ? 'border-nm-accent' : 'border-nm-border'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-nm-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{tier.label}</span>
                    <span className="text-nm-accent font-bold text-sm flex-shrink-0">{formatCOP(precio)}</span>
                  </div>
                  <div className="text-nm-muted text-xs mt-0.5">{tier.desc}</div>
                  <div className="text-nm-muted text-xs mt-0.5">
                    ~{horas}h · {canal === 'Mayorista' ? 'mayorista' : 'detal'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
