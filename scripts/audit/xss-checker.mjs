// Безпека: те саме для сторінки викладача (startup-check): чужий файл збереження не має виконувати код. npm run audit:xss
import { readFileSync } from 'node:fs';
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const src = readFileSync(new URL('../../tests/startup-ex.test.mjs', import.meta.url), 'utf8');
const fillSrc = src.slice(src.indexOf("const long = "), src.indexOf('\n};', src.indexOf('const FILL = {')) + 3);
const server = await startServer(), b = await launch(), errors = [];
const g = await newPage(await b.newContext(), errors); g.setDefaultTimeout(10000);
await g.goto(server.url + '/'); await g.evaluate(() => localStorage.clear()); await g.reload(); await g.waitForSelector('.wizard');
await g.click('[data-w="next"]'); await g.click('[data-w="next"]'); await g.fill('[data-w="name"]', 'Марта'); await g.fill('[data-w="company"]', 'Записатись'); await g.click('[data-w="next"]'); await g.waitForSelector('#main .ws');
const json = await g.evaluate(async fs => {
  const m = await import('/startupsim/js/ex-core.js'), S = window.Startup.sim, FILL = new Function('EX', 'X', fs + '\nreturn FILL;')(m.EX, m.X);
  for (let i = 0; i < 14; i++) S.endWeek(); for (const e of m.exAll()) { const d = m.X(S, e.id); try { FILL[e.id]?.(S, d); } catch {} S.s.ex.done[e.id] = { w: 1, s: 2 }; }
  const PAY = '<img src=x onerror=window.__xss=(window.__xss||0)+1>';
  const walk = o => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string' && /[^\w\-:.]/.test(v) && !/^(#|rgb|data:|https?:)/.test(v)) o[k] = PAY; else walk(v); } };
  walk(S.s); return JSON.stringify({ app: 'edvault-startup', format: 1, state: S.s });
}, fillSrc);
const p = await newPage(await b.newContext(), errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/startup-check'); await p.evaluate(() => { window.__xss = 0; });
await p.evaluate(t => window.Checker.open(new File([t], 'x.json')), json); await p.waitForSelector('.ck-who');
const out = [];
for (const tab of ['over', 'ex', 'brand', 'plan', 'iv', 'rep']) {
  await p.click(`[data-tab="${tab}"]`).catch(() => {}); await p.waitForTimeout(150);
  if (tab === 'ex') { await p.evaluate(() => document.querySelectorAll('.ck-ex').forEach(d => { d.open = true; })); await p.waitForTimeout(600); }
  out.push(`${tab}: виконань ${await p.evaluate(() => window.__xss)}`);
}
console.log(out.join(' | ')); if (out.some(s => !/виконань 0$/.test(s))) process.exitCode = 1; console.log('помилки', errors.slice(0, 2)); await b.close(); server.close();
