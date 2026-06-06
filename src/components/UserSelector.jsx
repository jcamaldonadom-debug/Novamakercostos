import { USERS } from '../config/config.js'

const USER_META = {
  Bonilla:      { initials: 'BO', color: 'from-emerald-500 to-teal-600' },
  Sebastian:    { initials: 'SE', color: 'from-blue-500 to-indigo-600' },
  'Juan Camilo': { initials: 'JC', color: 'from-violet-500 to-purple-600' },
}

export default function UserSelector({ onSelect }) {
  return (
    <div className="min-h-screen bg-nm-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nm-accent/10 border border-nm-accent/20 mb-4">
            <svg className="w-8 h-8 text-nm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6m-6 4h6m-6 4h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-nm-text">Novamaker</h1>
          <p className="text-nm-muted text-sm mt-1">Cotizador de impresión 3D</p>
        </div>

        <p className="text-nm-muted text-sm text-center mb-5">¿Quién está cotizando?</p>

        <div className="space-y-3">
          {USERS.map((user) => {
            const meta = USER_META[user] || { initials: user.slice(0, 2).toUpperCase(), color: 'from-slate-500 to-slate-600' }
            return (
              <button
                key={user}
                onClick={() => onSelect(user)}
                className="w-full flex items-center gap-4 bg-nm-surface border border-nm-border rounded-2xl p-4
                  hover:border-nm-accent/50 hover:bg-nm-surface/80 active:scale-98 transition-all duration-150"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{meta.initials}</span>
                </div>
                <div className="text-left">
                  <div className="text-nm-text font-semibold">{user}</div>
                  <div className="text-nm-muted text-xs">Novamaker Studio</div>
                </div>
                <svg className="w-4 h-4 text-nm-muted ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
