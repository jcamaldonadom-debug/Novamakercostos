# Setup Google Apps Script — Novamaker Backend

El Google Sheet ya existe en Drive. Solo necesitas crear el Apps Script y conectarlo.

---

## Paso 1 — Crear el Apps Script standalone

1. Abre [script.google.com](https://script.google.com) en tu navegador.
2. Haz clic en **Nuevo proyecto**.
3. Borra todo el contenido que viene por defecto en el editor.
4. Copia el contenido completo de `Codigo.gs` (en esta misma carpeta) y pégalo.
5. Guarda el proyecto con **Ctrl+S**. Asígnale el nombre `Novamaker Backend`.

> El Sheet ID ya está hardcodeado en el script (`MAESTRO_ID`). No necesitas abrirlo desde dentro del Sheet.

---

## Paso 2 — Implementar como Aplicación Web

1. En Apps Script, haz clic en **Implementar → Nueva implementación**.
2. Configura así:
   - **Tipo:** Aplicación web
   - **Ejecutar como:** Yo (`tu@gmail.com`)
   - **Quién tiene acceso:** **Cualquier persona** *(sin esto la app React no puede hacer fetch)*
3. Haz clic en **Implementar**.
4. **Autoriza** los permisos cuando Google lo solicite (leer/escribir en Sheets).
5. Copia la **URL del Web App** — se ve así:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## Paso 3 — Configurar la variable de entorno en la app React

1. En la raíz del proyecto `Novamakercostos/`, crea el archivo `.env`:
   ```
   VITE_SHEETS_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
   ```
2. Reemplaza la URL con la que copiaste en el paso anterior.

---

## Paso 4 — Compilar y publicar

```bash
npm run build && npm run deploy
```

La app quedará disponible en:
```
https://jcamaldonadom-debug.github.io/Novamakercostos/
```

---

## Verificar que funciona

Al guardar una cotización desde la app:
- Debe aparecer una nueva fila en la hoja **COTIZACIONES** del Sheet maestro.
- Debe aparecer también en la sección **CLIENTES** con el resumen automático en la columna Comentarios.
- Al cambiar el estado desde el historial, debe actualizarse en **ambas** hojas.

---

## Actualizar el Apps Script (cambios futuros)

Si necesitas modificar el código:
1. Ve a **Implementar → Administrar implementaciones**.
2. Haz clic en el ícono de editar (lápiz) junto a la implementación activa.
3. Selecciona **Nueva versión** en el dropdown.
4. Haz clic en **Implementar**.

> La URL del Web App NO cambia al crear una nueva versión. No necesitas actualizar `.env`.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Historial muestra "Error al cargar" | `VITE_SHEETS_URL` no configurada o incorrecta | Verificar `.env` y rebuild |
| Error 401 al guardar | Apps Script con acceso restringido | Reimplementar con "Cualquier persona" |
| La cotización no aparece en Sheets | Apps Script no autorizado | Re-autorizar los permisos desde el editor |
| No aparece en hoja CLIENTES | El tab `CLIENTES` no existe en el Sheet | Crear el tab con ese nombre exacto |
| Los cambios en Codigo.gs no tienen efecto | No se creó nueva versión | Ver "Actualizar el Apps Script" arriba |
