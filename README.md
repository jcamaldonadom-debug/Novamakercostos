# Novamaker — Cotizador de Impresión 3D

Aplicación web interna para cotizar trabajos de impresión 3D y posprocesado. Desarrollada con React + Vite, deploy en GitHub Pages, Google Sheets como base de datos compartida.

## Instalación local

### Requisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/jcamaldonadom-debug/Novamakercostos.git
cd Novamakercostos

# 2. Instalar dependencias
npm install

# 3. Configurar variable de entorno
cp .env.example .env
# Editar .env y pegar la URL del Apps Script Web App

# 4. Levantar en desarrollo
npm run dev
```

Abre [http://localhost:5173/Novamakercostos/](http://localhost:5173/Novamakercostos/)

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SHEETS_URL` | URL del Apps Script Web App desplegado como aplicación web |

Si no configuras `VITE_SHEETS_URL`, la app funciona normalmente pero **no guarda en Sheets** ni carga el historial.

## Deploy a GitHub Pages

```bash
npm run build && npm run deploy
```

La app queda disponible en `https://jcamaldonadom-debug.github.io/Novamakercostos/`

> **Primera vez:** Asegúrate de que el repositorio tenga habilitado GitHub Pages desde la rama `gh-pages` en la configuración del repo (`Settings → Pages → Source: gh-pages`).

## Conectar Google Sheets

Ver [apps-script/SETUP.md](apps-script/SETUP.md) para instrucciones paso a paso.

## Estructura del proyecto

```
src/
  App.jsx              — Router principal (5 pantallas)
  config/config.js     — Precios, materiales, sedes, catálogo, tiers de modelado
  utils/calc.js        — Lógica de cálculo pura (sin estado)
  services/sheets.js   — Fetch al Apps Script Web App
  components/
    UserSelector.jsx   — Pantalla 0: selección de usuario
    SedeSelector.jsx   — Selector de sede (Bonilla / Sebas / 50-50)
    QuoteCustom.jsx    — Pantalla 2A: cotización custom
    QuoteCatalog.jsx   — Pantalla 2B: cotización catálogo
    PostProcessing.jsx — Toggle + lista de materiales de acabado
    ModeladoSelector.jsx — Add-on opcional: diseño / modelado 3D (5 tiers)
    PriceSummary.jsx   — Banner sticky de precios en tiempo real
    History.jsx        — Pantalla 4: historial con filtros
apps-script/
  Codigo.gs            — Backend Google Apps Script
  SETUP.md             — Guía de configuración
```

## Lógica de precios

```
Costo material     = gramos × COP/gramo
Costo electricidad = minutos × COP/minuto (según sede)
Costo posprocesado = Σ (cantidad × COP/unidad por material)
Costo variable     = (material + electricidad + posprocesado) × piezas
Precio sugerido    = costo_variable / (1 − margen)
Margen real        = (precio_total − costo_total) / precio_total
```

Para productos de catálogo se aplica adicionalmente un descuento por volumen sobre el precio sugerido.

### Modelado 3D (add-on opcional)

La mano de obra de **diseño / modelado 3D** (trabajo CAD/escultórico previo a imprimir) se cobra aparte y es **opcional**: se activa con un toggle dentro de la cotización Custom o Catálogo (igual que el posprocesado) y se suma al total como **cargo único del pedido** (no por pieza).

```
Precio modelado = horas_tier × tarifa/h
  tarifa detal     = $25.000/h  (margen 40% incorporado)
  tarifa mayorista = $21.429/h  (= costo/h implícito 15.000 / (1 − 0.30))
```

5 niveles de complejidad (horas estimadas): Express 0.5h · Simple 1.5h · Medio 4h · Complejo 8.5h · Paramétrico 17h. El canal (Detal/Mayorista) de la cotización determina la tarifa aplicada.

El modelado queda registrado en Sheets embebido en `Descripción`/`Notas` y sumado al `PrecioTotal`. Además `Codigo.gs` incluye columnas `ModeladoTier`/`ModeladoHoras`/`ModeladoPrecio`; para poblarlas hay que **redeployar el Web App** del Apps Script.

## Modificar precios y materiales

Editar `src/config/config.js`. Todos los valores están en un solo lugar: tarifas de electricidad por sede, precios de materiales, costos de posprocesado, productos de catálogo, descuentos por volumen y los tiers/tarifas de modelado 3D.

Después de editar: `npm run build && npm run deploy`.
