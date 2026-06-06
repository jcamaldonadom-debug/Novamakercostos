// Novamaker Cotizador — Apps Script Backend
// Hoja: "COTIZACIONES" con headers en fila 1
// Sincroniza también con CLIENTES en el spreadsheet maestro (Novamaker_FINAL)

var SHEET_NAME = 'COTIZACIONES';
var MAESTRO_ID = '18yn_Q7D_d8SWXgvnIjMqcnPDZ0W0Vp9W_Qcc046OP8o'; // Novamaker_FINAL en Drive
var CLIENTES_SHEET = 'CLIENTES';

var HEADERS = [
  'ID', 'Fecha', 'Autor', 'Tipo', 'Cliente', 'Descripción',
  'Sede', 'Material', 'Minutos', 'Gramos', 'Cantidad',
  'CostoMaterial', 'CostoElectricidad', 'CostoPosprocesado',
  'CostoVariable', 'PrecioPieza', 'PrecioTotal', 'Margen',
  'Canal', 'Estado', 'Notas'
];

// Mapeo de campos JSON → columna del header
var FIELD_MAP = {
  id:                 'ID',
  fecha:              'Fecha',
  autor:              'Autor',
  tipo:               'Tipo',
  cliente:            'Cliente',
  descripcion:        'Descripción',
  sede:               'Sede',
  material:           'Material',
  minutos:            'Minutos',
  gramos:             'Gramos',
  cantidad:           'Cantidad',
  costoMaterial:      'CostoMaterial',
  costoElectricidad:  'CostoElectricidad',
  costoPosprocesado:  'CostoPosprocesado',
  costoVariable:      'CostoVariable',
  precioPieza:        'PrecioPieza',
  precioTotal:        'PrecioTotal',
  margen:             'Margen',
  canal:              'Canal',
  estado:             'Estado',
  notas:              'Notas'
};

function getSheet() {
  return SpreadsheetApp.openById(MAESTRO_ID).getSheetByName(SHEET_NAME);
}

function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── GET: retorna todas las cotizaciones ────────────────────────────────────
function doGet(e) {
  try {
    var sheet = getSheet();
    if (!sheet) {
      return makeResponse({ error: 'Hoja COTIZACIONES no encontrada' });
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return makeResponse([]);
    }

    var headers = data[0];
    var rows = data.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });

    return makeResponse(rows);
  } catch (err) {
    return makeResponse({ error: err.message });
  }
}

// ─── POST: guardar cotización o actualizar estado ────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.action === 'updateStatus') {
      return handleUpdateStatus(body.id, body.status);
    } else {
      return handleSaveQuote(body);
    }
  } catch (err) {
    return makeResponse({ ok: false, error: err.message });
  }
}

function handleSaveQuote(data) {
  var sheet = getSheet();
  if (!sheet) {
    return makeResponse({ ok: false, error: 'Hoja COTIZACIONES no encontrada' });
  }

  // Asegurar que los headers estén en fila 1
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var hasHeaders = firstRow[0] === 'ID';
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  // Construir fila en el orden de HEADERS
  var row = HEADERS.map(function(header) {
    var field = Object.keys(FIELD_MAP).find(function(k) { return FIELD_MAP[k] === header; });
    return field && data[field] !== undefined ? data[field] : '';
  });

  sheet.appendRow(row);

  // Sincronizar con hoja CLIENTES del spreadsheet maestro (Novamaker_FINAL)
  syncToClientes(data);

  return makeResponse({ ok: true });
}

// ─── Sync a CLIENTES en el spreadsheet maestro ──────────────────────────────
// Schema CLIENTES: N° | Fecha cotización | Responsable | Cliente | Producto
//                  Cantidad | Precio unit. | Total cotización | Estado | Fecha cierre | Ingreso cobrado | Comentarios
function buildComentarios(data) {
  var resumen = '[ID: ' + (data.id || '') + ' | Tipo: ' + (data.tipo || '') +
    ' | Canal: ' + (data.canal || '') + ' | Sede: ' + (data.sede || '') + ']';
  var costos = 'Mat: $' + Math.round(data.costoMaterial || 0).toLocaleString('es-CO') +
    ' | Luz: $' + Math.round(data.costoElectricidad || 0).toLocaleString('es-CO') +
    ' | Posproc: $' + Math.round(data.costoPosprocesado || 0).toLocaleString('es-CO') +
    ' | Total: $' + Math.round(data.precioTotal || 0).toLocaleString('es-CO');
  var gramos = 'Material: ' + (data.material || '') + ' · ' + (data.gramos || 0) + 'g · ' + (data.minutos || 0) + 'min';
  var lines = [resumen, costos, gramos];
  if (data.notas && String(data.notas).trim()) {
    lines.push('Notas: "' + String(data.notas).trim() + '"');
  }
  return lines.join('\n');
}

function syncToClientes(data) {
  try {
    var ss = SpreadsheetApp.openById(MAESTRO_ID);
    var ws = ss.getSheetByName(CLIENTES_SHEET);
    if (!ws) return; // hoja no encontrada, no bloquear

    var lastRow = ws.getLastRow();
    var nextRow = lastRow + 1;

    // N° correlativo desde la primera fila de datos
    var DATA_START = 8;
    var numero = Math.max(lastRow - DATA_START + 1, 1);

    var fecha    = data.fecha      || new Date().toLocaleDateString('es-CO');
    var autor    = data.autor      || '';
    var cliente  = data.cliente    || '';
    var producto = (data.tipo || '') + (data.descripcion ? ' — ' + data.descripcion : '');
    var cantidad = data.cantidad   || 1;
    var precioUnit = data.precioPieza || 0;
    var totalCot   = data.precioTotal || (precioUnit * cantidad);
    var estado   = data.estado     || 'Cotización enviada';
    var comentarios = buildComentarios(data);

    // Columnas B-M (2-13) según estructura de la hoja CLIENTES
    ws.getRange(nextRow, 2, 1, 12).setValues([[
      numero,      // B: N°
      fecha,       // C: Fecha cotización
      autor,       // D: Responsable
      cliente,     // E: Cliente
      producto,    // F: Producto
      cantidad,    // G: Cantidad
      precioUnit,  // H: Precio unit. (COP)
      totalCot,    // I: Total cotización (COP)
      estado,      // J: Estado
      '',          // K: Fecha cierre (se llena manual)
      '',          // L: Ingreso cobrado (se llena manual)
      comentarios  // M: Comentarios (auto-generado)
    ]]);
  } catch (e) {
    // Fallo silencioso — no interrumpe el guardado principal
    Logger.log('syncToClientes error: ' + e.message);
  }
}

function handleUpdateStatus(id, status) {
  var sheet = getSheet();
  if (!sheet) {
    return makeResponse({ ok: false, error: 'Hoja COTIZACIONES no encontrada' });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return makeResponse({ ok: false, error: 'Sin datos' });
  }

  var headers = data[0];
  var idCol = headers.indexOf('ID');
  var statusCol = headers.indexOf('Estado');

  if (idCol === -1 || statusCol === -1) {
    return makeResponse({ ok: false, error: 'Columnas ID o Estado no encontradas' });
  }

  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      found = true;
      break;
    }
  }

  if (!found) {
    return makeResponse({ ok: false, error: 'Cotización no encontrada: ' + id });
  }

  // Sincronizar Estado en CLIENTES (busca por ID en columna Comentarios)
  try {
    var ss = SpreadsheetApp.openById(MAESTRO_ID);
    var ws = ss.getSheetByName(CLIENTES_SHEET);
    if (ws && ws.getLastRow() > 1) {
      var clientData = ws.getDataRange().getValues();
      var idTag = '[ID: ' + id + ' |';
      // Comentarios está en columna M = índice 12 (col 13, base 1)
      var COMENTARIOS_COL = 13;
      var ESTADO_COL = 10; // columna J = índice 9 (col 10, base 1)
      for (var j = 1; j < clientData.length; j++) {
        var comentario = String(clientData[j][COMENTARIOS_COL - 1]);
        if (comentario.indexOf(idTag) === 0) {
          ws.getRange(j + 1, ESTADO_COL).setValue(status);
          break;
        }
      }
    }
  } catch (e) {
    Logger.log('syncEstadoClientes error: ' + e.message);
  }

  return makeResponse({ ok: true });
}
