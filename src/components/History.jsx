import { useState, useEffect, useMemo } from 'react'
import { loadQuotes, updateStatus } from '../services/sheets.js'
import { formatCOP } from '../utils/calc.js'
import { USERS } from '../config/config.js'

const STATUSES = ['Pendiente', 'Enviada', 'Cerrada-Ganada', 'Cerrada-Perdida']

const STATUS_STYLES = {
  'Pendiente':       'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'Enviada':         'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Cerrada-Ganada':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Cerrada-Perdida': 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function History({ currentUser, onBack }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterAutor, setFilterAutor] = useState('Todos')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const result = await loadQuotes()
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Sort newest first
      const sorted = [...result.rows].sort((a, b) => {
        const da = new Date(a.ID || a.id || 0)
        const db = new Date(b.ID || b.id || 0)
        return db - da
      })
      setRows(sorted)
    }
    fetch()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const autor = row.Autor || row.autor || ''
      const estado = row.Estado || row.estado || ''
      const cliente = (row.Cliente || row.cliente || '').toLowerCase()
      if (filterAutor !== 'Todos' && autor !== filterAutor) return false
      if (filterEstado !== 'Todos' && estado !== filterEstado) return false
      if (search && !cliente.includes(search.toLowerCase())) return false
      return true
    })
  }, [rows, filterAutor, filterEstado, search])

  async function handleStatusChange(row, newStatus) {
    const id = row.ID || row.id
    setUpdatingId(id)
    // Optimistic update
    setRows((prev) =>
      prev.map((r) => {
        const rId = r.ID || r.id
        return rId === id ? { ...r, Estado: newStatus, estado: newStatus } : r
      })
    )
    await updateStatus(id, newStatus)
    setUpdatingId(null)
  }

  const SELECT_CLS =
    'bg-nm-bg border border-nm-border text-nm-text rounded-lg px-2 py-1.5 text-xs ' +
    'focus:outline-none focus:border-nm-accent'

  return (
    <div className="min-h-screen bg-nm-bg pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-nm-bg/95 backdrop-blur border-b border-nm-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-nm-muted hover:text-nm-text transition-colors p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-nm-text font-bold text-base">Historial</h1>
        <span className="ml-auto text-nm-muted text-xs">{filtered.length} cotizaciones</span>
      </div>

      <div className="px-4 py-4 max-w-sm mx-auto space-y-3">
        {/* Filtros */}
        <div className="space-y-2">
          <input
            className="w-full bg-nm-surface border border-nm-border rounded-xl px-3 py-2.5 text-nm-text text-sm
              focus:outline-none focus:border-nm-accent placeholder-nm-muted"
            placeholder="🔍  Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className={SELECT_CLS + ' flex-1'}
              value={filterAutor}
              onChange={(e) => setFilterAutor(e.target.value)}
            >
              <option>Todos</option>
              {USERS.map((u) => <option key={u}>{u}</option>)}
            </select>
            <select
              className={SELECT_CLS + ' flex-1'}
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option>Todos</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-nm-surface border border-nm-border rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-nm-border rounded w-1/3 mb-2" />
                <div className="h-4 bg-nm-border rounded w-2/3 mb-2" />
                <div className="h-3 bg-nm-border rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-4 text-center">
            <p className="text-red-400 text-sm font-medium">Error al cargar historial</p>
            <p className="text-red-400/70 text-xs mt-1">{error}</p>
            <p className="text-nm-muted text-xs mt-2">Verifica que VITE_SHEETS_URL esté configurada</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-nm-muted">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-nm-text/60">Sin cotizaciones</p>
            <p className="text-xs mt-1">
              {search || filterAutor !== 'Todos' || filterEstado !== 'Todos'
                ? 'Ajusta los filtros'
                : 'Aún no hay cotizaciones guardadas'}
            </p>
          </div>
        )}

        {/* Cotización cards */}
        {!loading && !error && filtered.map((row) => {
          const id = row.ID || row.id
          const fecha = row.Fecha || row.fecha || '—'
          const autor = row.Autor || row.autor || '—'
          const cliente = row.Cliente || row.cliente || '—'
          const tipo = row.Tipo || row.tipo || '—'
          const descripcion = row['Descripción'] || row.descripcion || row['Descripcion'] || '—'
          const sede = row.Sede || row.sede || '—'
          const precioTotal = parseFloat(row.PrecioTotal || row.precioTotal || 0)
          const margen = row.Margen || row.margen || '—'
          const canal = row.Canal || row.canal || '—'
          const estado = row.Estado || row.estado || 'Pendiente'
          const isUpdating = updatingId === id

          return (
            <div
              key={id}
              className="bg-nm-surface border border-nm-border rounded-xl p-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-nm-text font-semibold text-sm">{cliente}</div>
                  <div className="text-nm-muted text-xs mt-0.5">{descripcion}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-nm-green font-bold text-base">{formatCOP(precioTotal)}</div>
                  <div className="text-nm-muted text-xs">
                    {typeof margen === 'number' ? `${margen.toFixed(1)}%` : margen} margen
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="bg-nm-bg border border-nm-border rounded-md px-2 py-0.5 text-nm-muted">
                  {autor}
                </span>
                <span className="bg-nm-bg border border-nm-border rounded-md px-2 py-0.5 text-nm-muted">
                  {sede}
                </span>
                <span className="bg-nm-bg border border-nm-border rounded-md px-2 py-0.5 text-nm-muted">
                  {canal}
                </span>
                <span className="bg-nm-bg border border-nm-border rounded-md px-2 py-0.5 text-nm-muted">
                  {tipo}
                </span>
                <span className="bg-nm-bg border border-nm-border rounded-md px-2 py-0.5 text-nm-muted ml-auto">
                  {fecha}
                </span>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[estado] || STATUS_STYLES['Pendiente']}`}>
                  {estado}
                </span>
                <select
                  value={estado}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(row, e.target.value)}
                  className="ml-auto bg-nm-bg border border-nm-border text-nm-text rounded-lg px-2 py-1 text-xs
                    focus:outline-none focus:border-nm-accent disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {isUpdating && (
                  <svg className="w-4 h-4 text-nm-accent animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
