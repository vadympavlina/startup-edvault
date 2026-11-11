// Безпека: підставляємо <img onerror> у всі текстові поля збереження й дивимось, чи виконується він на екранах гри. npm run audit:xss (код виходу 1 при спрацюванні)
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const server = await startServer(), b = await launch(), errors = [];
const p = await newPage(await b.newContext({ viewport: { width: 1366, height: 900 } }), errors); p.setDefaultTimeout(10000);
p.on('dialog', d => d.dismiss());
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
const res = await p.evaluate(async () => {
  const m = await import('/startupsim/js/ex-core.js'), S = window.Startup.sim, C = window.Startup.C, FILL = (await import('/tests/fill.mjs')).makeFill(m.EX, m.X);
  S.s.flags.st9 = 8; for (let i = 0; i < 14; i++) S.endWeek();
  for (const e of m.exAll()) { const d = m.X(S, e.id); try { FILL[e.id]?.(S, d); } catch {} }
  const PAY = ['<img src=x onerror=window.__xss=(window.__xss||0)+1>', '" autofocus onfocus="window.__xss=(window.__xss||0)+1" x="', '</textarea><img src=x onerror=window.__xss=(window.__xss||0)+1>'];
  const views = ['dash','inbox','customers','plan','product','brand','marketing','promo','pricing','finance','payments','investors','invest','team','freelance','help','report', ...m.exAll().map(e => 'ex-' + e.id)];
  const out = []; let changed = 0;
  for (const [pi, pay] of PAY.entries()) {
    const walk = (o, path) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string' && /[^\w\-:.]/.test(v) && !/^(#|rgb|data:|https?:)/.test(v)) { o[k] = pay; changed++; } else walk(v, path + '.' + k); } };
    walk(S.s, '');
    window.__xss = 0; window.__prev = 0;
    for (const v of views) {
      try { C.go(v); } catch (e) { out.push(`${v}: виняток ${e.message.slice(0, 60)}`); continue; }
      await new Promise(r => setTimeout(r, 20));
      const els = [...document.querySelectorAll('#main img[src="x"], #main [onerror], #main [onfocus], #main [onmouseover]')];
      const delta = window.__xss - (window.__prev || 0); window.__prev = window.__xss;
      if (els.length || delta) out.push(`пейлоад ${pi + 1} · ${v}: нових виконань ${delta}, елементів ${els.length}; ` + els.slice(0, 1).map(e => (e.parentElement?.className || e.parentElement?.tagName) + ' > ' + e.outerHTML.slice(0, 90)).join(''));
    }
  }
  // модальні вікна з підказками для ШІ (використовують назву компанії й ідеї зі збереження)
  for (const e of m.exAll()) {
    try { m.exActs.exAi(C, { dataset: { ex: e.id } }); } catch (err) { out.push(`модальне ${e.id}: виняток ${err.message.slice(0, 50)}`); continue; }
    const els = document.querySelectorAll('.md img[src="x"], .md [onerror], .md [onfocus]');
    if (els.length || window.__xss) out.push(`модальне «підказки ШІ» · ${e.id}: елементів ${els.length}, виконано ${window.__xss}`);
    document.querySelector('.md [data-md-close]')?.click(); await new Promise(r => setTimeout(r, 30));
  }
  return { changed, out: [...new Set(out)] };
});
console.log('змінено рядків:', res.changed); console.log(res.out.length ? res.out.join('\n') : 'ЖОДНОГО спрацювання'); console.log('помилки сторінки:', errors.slice(0, 3));
process.exitCode = res.out.length ? 1 : 0;
await b.close(); server.close();
