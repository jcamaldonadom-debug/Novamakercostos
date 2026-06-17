import {
  MATERIALS,
  SEDES,
  MODELADO_RATE_DETAL,
  MODELADO_RATE_MAYORISTA,
  MODELADO_COST_PER_HOUR,
  MODELADO_TIERS,
} from '../config/config.js';

export function calcPrintCost(grams, minutes, material, sede) {
  const mat = MATERIALS[material];
  const copPerGram = mat?.copPerGram ?? 0;
  const copPerMin = SEDES[sede]?.copPerMin ?? 0;
  const materialCost = grams * copPerGram;
  const electricityCost = minutes * copPerMin;
  return { materialCost, electricityCost, total: materialCost + electricityCost };
}

export function calcMototoolRate(sede) {
  const tarifaKwh = SEDES[sede]?.tarifaKwh ?? 819.66;
  return (0.1525 * tarifaKwh) / 60;
}

export function calcPostProcessing(items, sede) {
  return items.map((item) => {
    const qty = Number(item.qty) || 0;
    if (item.dynamic) {
      const copPerMin = calcMototoolRate(sede);
      return { ...item, copPerUnit: copPerMin, cost: copPerMin * qty };
    }
    return { ...item, cost: (item.copPerUnit ?? 0) * qty };
  });
}

export function calcPrice(totalCost, margin) {
  if (margin >= 1) return totalCost;
  return totalCost / (1 - margin);
}

export function getVolumeDiscount(qty, discounts) {
  const applicable = discounts.filter((d) => qty >= d.minQty);
  if (!applicable.length) return 0;
  return applicable[applicable.length - 1].discount;
}

// Modelado 3D — calcula precio (y costo implícito) de un tier según el canal.
// Devuelve null si el tier no existe.
export function calcModelado(tierId, canal) {
  const tier = MODELADO_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;
  const horas = tier.horas;
  const tarifa = canal === 'Mayorista' ? MODELADO_RATE_MAYORISTA : MODELADO_RATE_DETAL;
  const precio = horas * tarifa;
  const costo = horas * MODELADO_COST_PER_HOUR;
  return { tier, horas, tarifa, precio, costo };
}

const fmtCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(number) {
  if (number === null || number === undefined || isNaN(number)) return '$0';
  return fmtCOP.format(Math.round(number));
}

export function formatPct(decimal) {
  return `${(decimal * 100).toFixed(1)}%`;
}

export function formatDateCO(date) {
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
