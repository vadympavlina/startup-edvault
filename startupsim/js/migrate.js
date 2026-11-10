// Перенесення збереженої гри зі старої адреси (emulators.edvault.online/startup).
// Сховище браузера окреме для кожного сайту, тож стара сторінка-перенаправлення пакує збереження в частину адреси
// після «#», а тут ми його розпаковуємо. Дані нікуди не надсилаються: частина після «#» не передається на сервер.
const PREFIX = '#perenesennia=';
const fromB64Url = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };

async function inflate(bytes) {
  const ds = new DecompressionStream('deflate');
  const w = ds.writable.getWriter(); w.write(bytes); w.close();
  return new Response(ds.readable).text();
}

// Повертає { k, i } (сирі рядки збереження гри й останньої власної ідеї) або null. Адресу очищає.
export async function takeMigration() {
  if (!location.hash.startsWith(PREFIX)) return null;
  const raw = location.hash.slice(PREFIX.length);
  history.replaceState(null, '', location.pathname + location.search);
  try {
    const mode = raw.slice(0, 1), body = raw.slice(1);
    const text = mode === 'z' ? await inflate(fromB64Url(body)) : new TextDecoder().decode(fromB64Url(body));
    const d = JSON.parse(text);
    return d && typeof d.k === 'string' ? { k: d.k, i: typeof d.i === 'string' ? d.i : '' } : null;
  } catch (e) { return null; }
}
