export const USERS = ['Bonilla', 'Sebastian', 'Juan Camilo'];

export const SEDES = {
  Bonilla: {
    label: 'Bonilla (Cajicá)',
    copPerMin: 6.8305,
    tarifaKwh: 819.66,
  },
  Sebas: {
    label: 'Sebas (Bogotá)',
    copPerMin: 2.5956,
    tarifaKwh: 819.66,
  },
  '50-50': {
    label: '50% cada sede',
    copPerMin: 4.713,
    tarifaKwh: 819.66,
  },
};

export const MATERIALS = {
  PLA: { copPerGram: 63, label: 'PLA' },
  TPU: { copPerGram: 330, label: 'TPU' },
  ABS: { copPerGram: null, label: 'ABS (pendiente)' },
  'PET-G': { copPerGram: null, label: 'PET-G (pendiente)' },
};

export const POST_PROCESSING_ITEMS = [
  { id: 'masilla_auto', label: 'Masilla automotriz', copPerUnit: 32.7,   unit: 'ml',     defaultQty: 30  },
  { id: 'lijas',        label: 'Lijas',              copPerUnit: 2000,   unit: 'pliego', defaultQty: 0.5 },
  { id: 'aerosol',      label: 'Aerosol',            copPerUnit: 66.67,  unit: 'ml',     defaultQty: 30  },
  { id: 'pinturas',     label: 'Pinturas acrílicas', copPerUnit: 83.33,  unit: 'ml',     defaultQty: 20  },
  { id: 'barniz',       label: 'Barniz spray',       copPerUnit: 102.5,  unit: 'ml',     defaultQty: 25  },
  { id: 'masilla2',     label: 'Masilla 2 comp.',    copPerUnit: 42.28,  unit: 'ml',     defaultQty: 20  },
  { id: 'cinta',        label: 'Cinta enmascarar',   copPerUnit: 36000,  unit: 'rollo',  defaultQty: 0.1 },
  { id: 'thiner',       label: 'Thiner extrafino',   copPerUnit: 6.76,   unit: 'ml',     defaultQty: 15  },
  {
    id: 'mototool',
    label: 'Mototool',
    copPerUnit: null,
    unit: 'min',
    defaultQty: 15,
    dynamic: true,
  },
];

export const CATALOG_PRODUCTS = [
  {
    id: 'caja_pequena',
    label: 'Caja Pequeña',
    minutes: 78.1,
    grams: 52.686,
    material: 'PLA',
    volumeDiscounts: [
      { minQty: 50,   discount: 0.05 },
      { minQty: 100,  discount: 0.12 },
      { minQty: 500,  discount: 0.15 },
      { minQty: 1500, discount: 0.17 },
    ],
  },
  {
    id: 'caja_grande',
    label: 'Caja Grande',
    minutes: 143.6,
    grams: 87.0325,
    material: 'PLA',
    volumeDiscounts: [
      { minQty: 50,   discount: 0.05 },
      { minQty: 100,  discount: 0.12 },
      { minQty: 500,  discount: 0.15 },
      { minQty: 1000, discount: 0.17 },
    ],
  },
];

export const DEFAULT_MARGIN = 0.4;
export const WHOLESALE_MARGIN = 0.3;
