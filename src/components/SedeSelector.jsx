import { SEDES } from '../config/config.js'

const SEDE_STYLES = {
  Bonilla: {
    active: 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    inactive: 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60',
  },
  Sebas: {
    active: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20',
    inactive: 'border-blue-500/30 text-blue-400 hover:border-blue-500/60',
  },
  '50-50': {
    active: 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/20',
    inactive: 'border-violet-500/30 text-violet-400 hover:border-violet-500/60',
  },
}

const SEDE_LABELS = {
  Bonilla: 'Cajicá',
  Sebas: 'Bogotá',
  '50-50': '50 / 50',
}

export default function SedeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {Object.keys(SEDES).map((key) => {
        const styles = SEDE_STYLES[key]
        const isActive = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex-1 py-2.5 px-2 rounded-xl border text-sm font-semibold transition-all duration-150 ${
              isActive ? styles.active : `bg-transparent ${styles.inactive}`
            }`}
          >
            <div className="text-xs font-bold">{key === '50-50' ? '50/50' : key}</div>
            <div className={`text-xs font-normal mt-0.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
              {SEDE_LABELS[key]}
            </div>
          </button>
        )
      })}
    </div>
  )
}
