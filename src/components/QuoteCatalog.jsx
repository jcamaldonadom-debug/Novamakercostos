import { useState, useMemo } from 'react'
import SedeSelector from './SedeSelector.jsx'
import PostProcessing from './PostProcessing.jsx'
import PriceSummary from './PriceSummary.jsx'
import { CATALOG_PRODUCTS, POST_PROCESSING_ITEMS, DEFAULT_MARGIN, WHOLESALE_MARGIN } from '../config/config.js'
import {
  calcPrintCost,
  calcPostProcessing,
  calcPrice,
  getVolumeDiscount,
  formatCOP,
  formatDateCO,
} from '../utils/calc.js'
import { saveQuote } from '../services/sheets.js'

const INPUT_CLS =
  'w-full bg-nm-surface border border-nm-border rounded-xl px-3 py-2.5 text-nm-text text-sm ' +
  'focus:outline-none focus:border-nm-accent placeholder-nm-muted transition-colors'
const LABEL_CLS = 'block text-nm-muted text-xs font-medium mb-1.5 uppercase tracking-wide'

export default function QuoteCatalog({ currentUser, onSaved, onBack }) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    cliente: '',
    productId: CATALOG_PRODUCTS[0].id,
    sede: 'Bonilla',
    cantidad: 1,
    canal: 'Detal',
    notas: '',
  })

  const [postEnabled, setPostEnabled] = useState(false)
  const [postItems, setPostItems] = useState(
    POST_PROCESSING_ITEMS.map((item) => ({ ...item, qty: item.defaultQty }))
  )

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const product = CATALOG_PRODUCTS.find((p) => p.id === form.productId)
  const margin = form.canal === 'Mayorista' ? WHOLESALE_MARGIN : DEFAULT_MARGIN

  const calc = useMemo(() => {
    const qty = Math.max(1, parseInt(form.cantidad) || 1)
    if (!product) return null

    const printCost = calcPrintCost(product.grams, product.minutes, product.material, form.sede)
    const processedPP = calcPostProcessing(postItems, form.sede)
    const ppTotal = postEnabled ? processedPP.reduce((s, i) => s + i.cost, 0) : 0
    const variablePerPiece = printCost.total + ppTotal

    const basePrice = calcPrice(variablePerPiece, margin)
    const volDiscount = getVolumeDiscount(qty, product.volumeDiscounts)
    const precioPieza = basePrice * (1 - volDiscount)
    const precioTotal = precioPieza * qty
    const variableTotal = variablePerPiece * qty
    const margenReal = precioTotal > 0 ? (precioTotal - variableTotal) / precioTotal : 0

    return {
      printCost,
      ppTotal,
      variablePerPiece,
      basePrice,
      volDiscount,
      precioPieza,
      precioTotal,
      variableTotal,
      margenReal,
    }
  }, [form, product, postEnabled, postItems, margin])

  function canGoNext() {
    return form.cliente.trim() && product
  }

  async function handleSave() {
    if (!calc) return
    setSaving(true)
    setError(null)

    const qty = Math.max(1, parseInt(form.cantidad) || 1)
    const now = new Date()
    const data = {
      id: now.toISOString(),
      fecha: formatDateCO(now),
      autor: currentUser,
      tipo: 'Catálogo',
      cliente: form.cliente.trim(),
      descripcion: product.label,
      sede: form.sede,
      material: product.material,
      minutos: product.minutes,
      gramos: product.grams,
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
      notas: form.notas.trim(),
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
          <h1 className="text-nm-text font-bold text-base">Producto Catálogo</h1>
          <p className="text-nm-muted text-xs">Paso {step} de 2</p>
        </div>
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

            {/* Selección de producto */}
            <div>
              <label className={LABEL_CLS}>Producto</label>
              <div className="space-y-2">
                {CATALOG_PRODUCTS.map((prod) => {
                  const isSelected = form.productId === prod.id
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => set('productId', prod.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
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
                      <div>
                        <div className="font-semibold text-sm">{prod.label}</div>
                        <div className="text-nm-muted text-xs mt-0.5">
                          {prod.minutes} min · {prod.grams}g · {prod.material}
                        </div>
                        <div className="text-nm-muted text-xs mt-0.5">
                          Vol. desc. desde {prod.volumeDiscounts[0]?.minQty} unidades
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sede */}
            <div>
              <label className={LABEL_CLS}>Sede de impresión</label>
              <SedeSelector value={form.sede} onChange={(v) => set('sede', v)} />
            </div>

            {/* Cantidad */}
            <div>
              <label className={LABEL_CLS}>Cantidad</label>
              <input
                type="number"
                min="1"
                step="1"
                className={INPUT_CLS}
                value={form.cantidad}
                onChange={(e) => set('cantidad', e.target.value)}
              />
              {/* Volume discount hint */}
              {product && (() => {
                const qty = parseInt(form.cantidad) || 0
                const nextDiscount = product.volumeDiscounts.find((d) => qty < d.minQty)
                const currentDiscount = getVolumeDiscount(qty, product.volumeDiscounts)
                return (
                  <div className="mt-1.5 text-xs">
                    {currentDiscount > 0 ? (
                      <span className="text-nm-green">
                        ✓ Descuento por volumen aplicado: {Math.round(currentDiscount * 100)}%
                      </span>
                    ) : nextDiscount ? (
                      <span className="text-nm-muted">
                        Pedí {nextDiscount.minQty}+ unidades para {Math.round(nextDiscount.discount * 100)}% descuento
                      </span>
                    ) : null}
                  </div>
                )
              })()}
            </div>

            {/* Canal */}
            <div>
              <label className={LABEL_CLS}>Canal de venta</label>
              <div className="grid grid-cols-2 gap-2">
                {['Detal', 'Mayorista'].map((canal) => (
                  <button
                    key={canal}
                    type="button"
                    onClick={() => set('canal', canal)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      form.canal === canal
                        ? 'bg-nm-accent border-nm-accent text-white'
                        : 'bg-nm-surface border-nm-border text-nm-text hover:border-nm-accent/50'
                    }`}
                  >
                    {canal}
                    <span className="block text-xs font-normal opacity-70">
                      {canal === 'Detal' ? '40% margen' : '30% margen'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className={LABEL_CLS}>Notas (opcional)</label>
              <textarea
                className={INPUT_CLS + ' resize-none'}
                rows={2}
                placeholder="Observaciones del pedido..."
                value={form.notas}
                onChange={(e) => set('notas', e.target.value)}
              />
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
            {/* Resumen */}
            <div className="bg-nm-surface border border-nm-border rounded-xl p-4 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-nm-muted">
                <span>Cliente:</span> <span className="text-nm-text font-medium">{form.cliente}</span>
                <span>Producto:</span> <span className="text-nm-text">{product?.label}</span>
                <span>Sede:</span> <span className="text-nm-text">{form.sede}</span>
                <span>Cantidad:</span> <span className="text-nm-text">{form.cantidad} unidades</span>
                {calc?.volDiscount > 0 && (
                  <>
                    <span>Descuento vol.:</span>
                    <span className="text-nm-green font-medium">
                      {Math.round(calc.volDiscount * 100)}%
                    </span>
                  </>
                )}
              </div>
              <button onClick={() => setStep(1)} className="mt-3 text-nm-accent text-xs hover:underline">
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

            {/* Desglose */}
            {calc && (
              <div className="bg-nm-surface border border-nm-border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-nm-muted">
                  <span>Costo material</span>
                  <span className="text-nm-text">{formatCOP(calc.printCost.materialCost)}</span>
                </div>
                <div className="flex justify-between text-nm-muted">
                  <span>Electricidad</span>
                  <span className="text-nm-text">{formatCOP(calc.printCost.electricityCost)}</span>
                </div>
                {calc.ppTotal > 0 && (
                  <div className="flex justify-between text-nm-muted">
                    <span>Posprocesado</span>
                    <span className="text-nm-text">{formatCOP(calc.ppTotal)}</span>
                  </div>
                )}
                <div className="border-t border-nm-border pt-2 flex justify-between text-nm-muted">
                  <span>Precio base / pieza</span>
                  <span className="text-nm-text">{formatCOP(calc.basePrice)}</span>
                </div>
                {calc.volDiscount > 0 && (
                  <div className="flex justify-between text-nm-green">
                    <span>— Descuento volumen ({Math.round(calc.volDiscount * 100)}%)</span>
                    <span>− {formatCOP(calc.basePrice * calc.volDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-nm-border pt-2 flex justify-between font-semibold">
                  <span className="text-nm-muted">Precio final / pieza</span>
                  <span className="text-nm-accent">{formatCOP(calc.precioPieza)}</span>
                </div>
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

      <PriceSummary
        calc={calc}
        margenObjetivo={margin}
        quantity={Math.max(1, parseInt(form.cantidad) || 1)}
      />
    </div>
  )
}
