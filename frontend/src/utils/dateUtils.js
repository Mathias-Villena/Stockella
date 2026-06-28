/**
 * UTILIDADES DE FECHA - Hora Peruana (UTC-5)
 *
 * Peru NO usa horario de verano, siempre es UTC-5.
 * Enfoque manual con offsets para máxima compatibilidad entre navegadores.
 */

const PERU_OFFSET_MS = -5 * 60 * 60 * 1000; // UTC-5 en milisegundos

/**
 * Parsea cualquier string de fecha como UTC.
 * Si el string no tiene indicador de zona horaria, se le agrega 'Z' para forzar UTC.
 * Esto resuelve el problema de Sequelize/PostgreSQL que puede devolver
 * fechas sin sufijo de zona horaria.
 */
function parseUTC(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  const hasOffset = str.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(str);
  const date = new Date(hasOffset ? str : str + "Z");
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Convierte una fecha UTC a hora peruana (UTC-5)
 * retornando un objeto Date desplazado manualmente.
 */
function toPeruDate(utcDate) {
  return new Date(utcDate.getTime() + PERU_OFFSET_MS);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Formatea fecha+hora en hora peruana.
 * Resultado: "26/06/2026, 19:08"
 */
export function formatPeru(value) {
  const utc = parseUTC(value);
  if (!utc) return "—";
  const d = toPeruDate(utc);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/**
 * Solo la fecha en hora peruana.
 * Resultado: "26/06/2026"
 */
export function formatPeruDate(value) {
  const utc = parseUTC(value);
  if (!utc) return "—";
  const d = toPeruDate(utc);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/**
 * Solo la hora en hora peruana.
 * Resultado: "19:08"
 */
export function formatPeruTime(value) {
  const utc = parseUTC(value);
  if (!utc) return "—";
  const d = toPeruDate(utc);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
