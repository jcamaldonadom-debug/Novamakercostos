import { useState, useMemo } from 'react'
import SedeSelector from './SedeSelector.jsx'
import PostProcessing from './PostProcessing.jsx'
import ModeladoSelector from './ModeladoSelector.jsx'
import PriceSummary from './PriceSummary.jsx'
import { MATERIALS, POST_PROCESSING_ITEMS, DEFAULT_MARGIN, WHOLESALE_MARGIN, MODELADO_TIERS } from '../config/config.js'
import {
  calcPrintCost,
  calcPostProcessing,
  calcPrice,
  calcModelado,
  formatCOP,
  formatDateCO,
} from '../utils/calc.js'
import { saveQuote } from '../services/sheets.js'

const INPUT_CLS =
  'w-full bg-nm-surface border border-nm-border rounded-xl px-3 py-2.5 text-nm-text text-sm ' +
  'focus:outline-none focus:border-nm-accent placeholder-nm-muted transition-colors'
const LABEL_CLS = 'block text-nm-muted text-xs font-medium mb-1.5 uppercase tracking-wide'

export default function QuoteCustom({ currentUser, onSaved, onBack }) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    cliente: '',
    descripcion: '',
    sede: 'Bonilla',
    material: 'PLA',
    gramos: '',
    minutos: '',
    cantidad: 1,
    margen: DEFAULT_MARGIN,
    canal: 'Detal',
  })

  const [postEnabled, setPostEnabled] = useState(false)
  const [postItems, setPostItems] = useState(
    POST_PROCESSING_ITEMS.map((item) => ({ ...item, qty: item.defaultQty }))
  )

  const [modeladoEnabled, setModeladoEnabled] = useState(false)
  const [modeladoTier, setModeladoTier] = useState(MODELADO_TIERS[0].id)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const calc = useMemo(() => {
    const grams = parseFloat(form.gramos)
    const minutes = parseFloat(form.minutos)
    const qty = Math.max(1, parseInt(form.cantidad) || 1)
    if (!grams || !minutes || grams <= 0 || minutes <= 0) return null

    const mat = MATERIALS[form.material]
    if (!mat?.copPerGram) return null

    const printCost = calcPrintCost(grams, minutes, form.material, form.sede)
    const processedPP = calcPostProcessing(postItems, form.sede)
    const ppTotal = postEnabled ? processedPP.reduce((s, i) => s + i.cost, 0) : 0
    const variablePerPiece = printCost.total + ppTotal
    const precioPieza = calcPrice(variablePerPiece, form.margen)
    const printTotal = precioPieza * qty

    // Modelado 3D — cargo único del pedido (no por pieza)
    const modelado = modeladoEnabled ? calcModelado(modeladoTier, form.canal) : null
    const modeladoPrecio = modelado ? modelado.precio : 0
    const modeladoCosto = modelado ? modelado.costo : 0
    const modeladoHoras = modelado ? modelado.horas : 0

    const precioTotal = printTotal + modeladoPrecio
    const variableTotal = variablePerPiece * qty + modeladoCosto
    const margenReal = precioTotal > 0 ? (precioTotal - variableTotal) / precioTotal : 0

    return { printCost, ppTotal, variablePerPiece, precioPieza, modeladoPrecio, modeladoHoras, precioTotal, variableTotal, margenReal }
  }, [form, postEnabled, postItems, modeladoEnabled, modeladoTier])

  function canGoNext() {
    return (
      form.cliente.trim() &&
      parseFloat(form.gramos) > 0 &&
      parseFloat(form.minutos) > 0 &&
      MATERIALS[form.material]?.copPerGram
    )
  }

  async function handleSave() {
    if (!calc) return
    setSaving(true)
    setError(null)

    const qty = Math.max(1, parseInt(form.cantidad) || 1)
    const now = new Date()
    const modeladoTierObj = modeladoEnabled ? MODELADO_TIERS.find((t) => t.id === modeladoTier) : null
    const baseDescripcion = form.descripcion.trim() || '—'
    const data = {
      id: now.toISOString(),
      fecha: formatDateCO(now),
      autor: currentUser,
      tipo: 'Custom',
      cliente: form.cliente.trim(),
      descripcion: modeladoTierObj ? `${baseDescripcion} + Modelado 3D: ${modeladoTierObj.label}` : baseDescripcion,
      sede: form.sede,
      material: form.material,
      minutos: parseFloat(form.minutos),
      gramos: parseFloat(form.gramos),
      cantidad: qty,
      costoMaterial: Math.round(calc.printCost.materialCost * qty),
      costoElectricidad: Math.round(calc.printCost.electricityCost * qty),
      costoPosprocesado: Math.round(calc.ppTotal * qty),
      costoVariable: Math.round(calc.variableTotal),
      precioPieza: Math.round(calc.precioPieza),
      precioTotal: Math.round(calc.precioTotal),
      margen: Math.round(calc.margenReal * 1000) / 10,
      canal: form.canal,
      estado: 'Pendiente',
      notas: modeladoTierObj
        ? `Modelado 3D — ${modeladoTierObj.label} (${calc.modeladoHoras}h): ${formatCOP(calc.modeladoPrecio)}`
        : '',
      modeladoTier: modeladoTierObj ? modeladoTierObj.label : '',
      modeladoHoras: modeladoTierObj ? calc.modeladoHoras : '',
      modeladoPrecio: modeladoTierObj ? Math.round(calc.modeladoPrecio) : '',
    }

    const result = await saveQuote(data)
    setSaving(false)
    if (!result.ok && !result.local) {
      setError('Error al guardar. Intenta de nuevo.')
      return
    }
    onSaved(data)
  }

  return (
    <div className="min-h-screen bg-nm-bg pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-nm-bg/95 backdrop-blur border-b border-nm-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-nm-muted hover:text-nm-text transition-colors p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-nm-text font-bold text-base">Trabajo Custom</h1>
          <p className="text-nm-muted text-xs">Paso {step} de 2</p>
        </div>
        {/* Step pills */}
        <div className="ml-auto flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-6 h-1.5 rounded-full transition-colors ${
                s === step ? 'bg-nm-accent' : s < step ? 'bg-nm-green' : 'bg-nm-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 max-w-sm mx-auto space-y-5">
        {step === 1 && (
          <>
            {/* Cliente */}
            <div>
              <label className={LABEL_CLS}>Cliente *</label>
              <input
                className={INPUT_CLS}
                placeholder="Nombre del cliente"
                value={form.cliente}
                onChange={(e) => set('cliente', e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className={LABEL_CLS}>Descripción del trabajo</label>
              <textarea
                className={INPUT_CLS + ' resize-none'}
                rows={2}
                placeholder="Ej: Soporte para cámara, lote 10 unidades..."
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
              />
            </div>

            {/* Sede */}
            <div>
              <label className={LABEL_CLS}>Sede de impresión</label>
              <SedeSelector value={form.sede} onChange={(v) => set('sede', v)} />
            </div>

            {/* Material */}
            <div>
              <label className={LABEL_CLS}>Material</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(MATERIALS).map(([key, mat]) => {
                  const available = mat.copPerGram !== null
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!available}
                      onClick={() => available && set('material', key)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        form.material === key
                          ? 'bg-nm-accent border-nm-accent text-white'
                          : available
                          ? 'bg-nm-surface border-nm-border text-nm-text hover:border-nm-accent/50'
                          : 'bg-nm-surface/50 border-nm-border/50 text-nm-muted/50 cursor-not-allowed'
                      }`}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
              {!MATERIALS[form.material]?.copPerGram && (
                <p className="text-yellow-400 text-xs mt-1.5">⚠ Material pendiente de precio</p>
              )}
            </div>

            {/* Gramos y Minutos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Gramos consumidos</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={INPUT_CLS}
                  placeholder="52.7"
                  value={form.gramos}
                  onChange={(e) => set('gramos', e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Minutos impresión</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={INPUT_CLS}
                  placeholder="78"
                  value={form.minutos}
                  onChange={(e) => set('minutos', e.target.value)}
                />
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className={LABEL_CLS}>Cantidad de piezas</label>
              <input
                type="number"
                min="1"
                step="1"
                className={INPUT_CLS}
                value={form.cantidad}
                onChange={(e) => set('cantidad', e.target.value)}
              />
            </div>

            {/* Canal */}
            <div>
              <label className={LABEL_CLS}>Canal de venta</label>
              <div className="grid grid-cols-2 gap-2">
                {['Detal', 'Mayorista'].map((canal) => (
                  <button
                    key={canal}
                    type="button"
                    onClick={() => {
                      set('canal', canal)
                      set('margen', canal === 'Mayorista' ? WHOLESALE_MARGIN : DEFAULT_MARGIN)
                    }}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      form.canal === canal
                        ? 'bg-nm-accent border-nm-accent text-white'
                        : 'bg-nm-surface border-nm-border text-nm-text hover:border-nm-accent/50'
                    }`}
                  >
                    {canal}
                  </button>
                ))}
              </div>
            </div>

            {/* Margen slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={LABEL_CLS + ' mb-0'}>Margen objetivo</label>
                <span className="text-nm-accent font-bold text-sm">{Math.round(form.margen * 100)}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="70"
                step="1"
                value={Math.round(form.margen * 100)}
                onChange={(e) => set('margen', parseInt(e.target.value) / 100)}
                className="w-full h-2 rounded-full accent-blue-500"
              />
              <div className="flex justify-between text-nm-muted text-xs mt-1">
                <span>20%</span>
                <span>70%</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canGoNext()}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                canGoNext()
                  ? 'bg-nm-accent text-white hover:bg-blue-400 active:scale-98'
                  : 'bg-nm-border text-nm-muted cursor-not-allowed'
              }`}
            >
              Siguiente — Posprocesado →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Resumen paso 1 */}
            <div className="bg-nm-surface border border-nm-border rounded-xl p-4 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-nm-muted">
                <span>Cliente:</span> <span className="text-nm-text font-medium">{form.cliente}</span>
                <span>Material:</span> <span className="text-nm-text">{form.material}</span>
                <span>Sede:</span> <span className="text-nm-text">{form.sede}</span>
                <span>Gramos / min:</span>
                <span className="text-nm-text">{form.gramos}g / {form.minutos}min</span>
                <span>Cantidad:</span> <span className="text-nm-text">{form.cantidad} pz</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-3 text-nm-accent text-xs hover:underline"
              >
                ← Editar datos
              </button>
            </div>

            {/* PostProcessing */}
            <div>
              <label className={LABEL_CLS}>¿Requiere posprocesado?</label>
              <PostProcessing
                enabled={postEnabled}
                onToggle={() => setPostEnabled((v) => !v)}
                sede={form.sede}
                items={postItems}
                onItemsChange={setPostItems}
              />
            </div>

            {/* Modelado 3D */}
            <div>
              <label className={LABEL_CLS}>¿Incluir diseño / modelado 3D?</label>
              <ModeladoSelector
                enabled={modeladoEnabled}
                onToggle={() => setModeladoEnabled((v) => !v)}
                tierId={modeladoTier}
                onTierChange={setModeladoTier}
                canal={form.canal}
              />
            </div>

            {/* Desglose */}
            {calc && (
              <div className="bg-nm-surface border border-nm-border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-nm-muted">
                  <span>Costo material</span>
                  <span className="text-nm-text">{formatCOP(calc.printCost.materialCost)}</span>
                </div>
                <div className="flex justify-between text-nm-muted">
                  <span>Electricidad impresión</span>
                  <span className="text-nm-text">{formatCOP(calc.printCost.electricityCost)}</span>
                </div>
                {calc.ppTotal > 0 && (
                  <div className="flex justify-between text-nm-muted">
                    <span>Posprocesado</span>
                    <span className="text-nm-text">{formatCOP(calc.ppTotal)}</span>
                  </div>
                )}
                <div className="border-t border-nm-border pt-2 flex justify-between font-semibold">
                  <span className="text-nm-muted">Costo variable / pieza</span>
                  <span className="text-nm-text">{formatCOP(calc.variablePerPiece)}</span>
                </div>
                {calc.modeladoPrecio > 0 && (
                  <div className="flex justify-between text-nm-accent pt-1">
                    <span>Modelado 3D ({calc.modeladoHoras}h) — cargo único</span>
                    <span>+ {formatCOP(calc.modeladoPrecio)}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!calc || saving}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                calc && !saving
                  ? 'bg-nm-green text-white hover:bg-emerald-400 active:scale-98'
                  : 'bg-nm-border text-nm-muted cursor-not-allowed'
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar cotización →'}
            </button>
          </>
        )}
      </div>

      {/* Sticky price banner */}
      <PriceSummary
        calc={calc}
        margenObjetivo={form.margen}
        quantity={Math.max(1, parseInt(form.cantidad) || 1)}
      />
    </div>
  )
}
