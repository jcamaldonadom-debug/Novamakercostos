const SHEETS_URL = import.meta.env.VITE_SHEETS_URL;

export async function saveQuote(data) {
  if (!SHEETS_URL) {
    console.warn('VITE_SHEETS_URL no configurada — cotización guardada solo localmente.');
    return { ok: true, local: true };
  }
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      // text/plain evita el preflight OPTIONS (CORS simple request)
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow',
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loadQuotes() {
  if (!SHEETS_URL) {
    return { ok: false, error: 'VITE_SHEETS_URL no configurada', rows: [] };
  }
  try {
    const res = await fetch(SHEETS_URL, { redirect: 'follow' });
    const rows = await res.json();
    return { ok: true, rows: Array.isArray(rows) ? rows : [] };
  } catch (e) {
    return { ok: false, error: e.message, rows: [] };
  }
}

export async function updateStatus(id, status) {
  if (!SHEETS_URL) return { ok: false, error: 'VITE_SHEETS_URL no configurada' };
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateStatus', id, status }),
      redirect: 'follow',
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
