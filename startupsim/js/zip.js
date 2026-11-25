// Читання ZIP-архіву в браузері без бібліотек: лише для сторінки викладача, щоб відкрити роботи всього класу з одного архіву.
// Підтримано способи «без стискання» і «deflate» (так пакують усі звичайні програми). Є межі проти «бомб»: кількість файлів і розмір.
export const ZIP_LIMITS = { files: 500, each: 20e6, total: 200e6 };
const u16 = (v, o) => v.getUint16(o, true), u32 = (v, o) => v.getUint32(o, true);
const WANT = /\.(edvault|json)$/i;

export const isZip = async file => { try { const h = new Uint8Array(await file.slice(0, 4).arrayBuffer()); return h[0] === 0x50 && h[1] === 0x4b && (h[2] === 3 || h[2] === 5) && (h[3] === 4 || h[3] === 6); } catch { return false; } };

async function inflate(bytes) {
  const s = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = s.getReader(), chunks = []; let n = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; n += value.length; if (n > ZIP_LIMITS.each) { reader.cancel(); throw new Error('файл усередині архіву завеликий'); } chunks.push(value); }
  const out = new Uint8Array(n); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; } return out;
}

// повертає { entries: [{ name, text }], skipped: [текст], error?: текст }
export async function readZip(file, limits = ZIP_LIMITS) {
  const res = { entries: [], skipped: [] };
  let buf; try { buf = await file.arrayBuffer(); } catch { return { ...res, error: 'архів не вдалося прочитати' }; }
  const v = new DataView(buf), bytes = new Uint8Array(buf);
  let eocd = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 22 - 65535); i--) if (u32(v, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return { ...res, error: 'це не схоже на ZIP-архів (або він пошкоджений)' };
  const count = u16(v, eocd + 10); let p = u32(v, eocd + 16);
  if (count === 0xffff || p === 0xffffffff) return { ...res, error: 'такі великі ZIP64-архіви не підтримуються' };
  if (count > limits.files) return { ...res, error: `в архіві забагато файлів (${count}, ліміт ${limits.files})` };
  let total = 0; const dec = new TextDecoder('utf-8');
  for (let k = 0; k < count; k++) {
    if (p + 46 > buf.byteLength || u32(v, p) !== 0x02014b50) return { ...res, error: 'архів пошкоджений' };
    const flags = u16(v, p + 8), method = u16(v, p + 10), cs = u32(v, p + 20), us = u32(v, p + 24), nl = u16(v, p + 28), el = u16(v, p + 30), cl = u16(v, p + 32), lo = u32(v, p + 42);
    const full = dec.decode(bytes.subarray(p + 46, p + 46 + nl)); p += 46 + nl + el + cl;
    const base = full.split('/').pop();
    if (full.endsWith('/') || /(^|\/)(__MACOSX|\.)/.test(full) || !WANT.test(base)) continue;   // папки, службові файли macOS, не збереження
    if (flags & 1) { res.skipped.push(`${base}: файл захищено паролем`); continue; }
    if (us > limits.each) { res.skipped.push(`${base}: завеликий (${Math.round(us / 1e6)} МБ)`); continue; }
    total += us; if (total > limits.total) return { ...res, error: 'усі файли разом завеликі для відкриття' };
    if (lo + 30 > buf.byteLength || u32(v, lo) !== 0x04034b50) { res.skipped.push(`${base}: пошкоджений запис`); continue; }
    const start = lo + 30 + u16(v, lo + 26) + u16(v, lo + 28), data = bytes.subarray(start, start + cs);
    try {
      let out; if (method === 0) out = data; else if (method === 8) out = await inflate(data); else { res.skipped.push(`${base}: невідомий спосіб стиснення`); continue; }
      if (out.length > limits.each) { res.skipped.push(`${base}: завеликий`); continue; }
      res.entries.push({ name: base, text: dec.decode(out) });
    } catch (e) { res.skipped.push(`${base}: ${e.message || 'не вдалося розпакувати'}`); }
  }
  return res;
}
