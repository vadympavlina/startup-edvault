// Швидкодія: завантаження, час відмальовування екранів, розмір збереження, час тижня, використання CSS. npm run audit:perf (код виходу 1, якщо перевищено бюджет)
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const server = await startServer(), b = await launch(), errors = [];
const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
let bytes = 0, reqs = 0; p.on('response', async r => { try { const h = r.headers()['content-length']; bytes += h ? +h : (await r.body()).length; reqs++; } catch {} });
await p.coverage.startJSCoverage(); await p.coverage.startCSSCoverage();
const t0 = Date.now();
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); bytes = 0; reqs = 0;
const nav = Date.now(); await p.reload(); await p.waitForSelector('.wizard'); const loadMs = Date.now() - nav;
const timing = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0], paint = performance.getEntriesByType('paint').map(x => [x.name, Math.round(x.startTime)]); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), paint, res: performance.getEntriesByType('resource').length }; });
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
const views = await p.evaluate(async () => { const m = await import('/startupsim/js/ex-core.js'); return ['dash','inbox','customers','plan','product','brand','marketing','promo','pricing','finance','payments','investors','invest','team','freelance','help','report', ...m.exAll().map(e => 'ex-' + e.id)]; });
const times = await p.evaluate(async views => { const out = []; for (const v of views) { const t = performance.now(); window.Startup.C.go(v); await new Promise(r => requestAnimationFrame(r)); out.push([v, +(performance.now() - t).toFixed(1)]); } return out; }, views);
times.sort((a, b) => b[1] - a[1]);
// заповнюємо всі вправи й міряємо збереження
const sv = await p.evaluate(async () => {
  const m = await import('/startupsim/js/ex-core.js'), S = window.Startup.sim, FILL = (await import('/tests/fill.mjs')).makeFill(m.EX, m.X);
  for (const e of m.exAll()) { const d = m.X(S, e.id); try { FILL[e.id]?.(S, d); } catch {} S.s.ex.done[e.id] = { w: 0, s: 3 }; }
  const t = performance.now(); const str = JSON.stringify({ s: S.s, view: 'dash' }); const ms = performance.now() - t;
  return { kb: +(str.length / 1024).toFixed(1), stringifyMs: +ms.toFixed(2) };
});
// 104 тижні: час тижня й розмір збереження
const wk = await p.evaluate(async () => { const S = window.Startup.sim, ts = []; S.s.cash = 5e6; for (let i = 0; i < 104; i++) { const t = performance.now(); try { S.endWeek(); } catch (e) { return { err: e.message, at: i }; } ts.push(performance.now() - t); if (S.s.over) break; } ts.sort((a, b) => a - b); return { weeks: ts.length, medianMs: +ts[ts.length >> 1].toFixed(2), maxMs: +ts.at(-1).toFixed(2), saveKb: +(JSON.stringify(S.s).length / 1024).toFixed(1), histLen: S.s.history.length, mailLen: S.s.inbox.length, journal: S.s.journal.length }; });
const heap = await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
const js = await p.coverage.stopJSCoverage(), css = await p.coverage.stopCSSCoverage();
const cov = list => list.filter(x => /startupsim/.test(x.url)).map(x => { const used = (x.ranges || []).reduce((a, r) => a + (r.end - r.start), 0), tot = (x.text || '').length; return { f: x.url.split('/').slice(-1)[0], tot, pct: +(used / tot * 100).toFixed(0) }; });
const jc = cov(js), cc = cov(css);
const sum = l => ({ tot: l.reduce((a, x) => a + x.tot, 0), used: l.reduce((a, x) => a + x.tot * x.pct / 100, 0) });
console.log('ЗАВАНТАЖЕННЯ', JSON.stringify({ loadMs, ...timing, requests: reqs, transferKB: Math.round(bytes / 1024) }));
console.log('РЕНДЕР найповільніші', JSON.stringify(times.slice(0, 6)), 'медіана', times[times.length >> 1][1], 'мс; екранів', times.length);
console.log('ЗБЕРЕЖЕННЯ (усі вправи)', JSON.stringify(sv)); console.log('ТИЖНІ', JSON.stringify(wk)); console.log('ПАМ\'ЯТЬ МБ', heap);
const s1 = sum(jc), s2 = sum(cc); console.log('JS використано', Math.round(s1.used / s1.tot * 100) + '%', 'з', Math.round(s1.tot / 1024), 'КБ'); console.log('CSS використано', Math.round(s2.used / s2.tot * 100) + '%', 'з', Math.round(s2.tot / 1024), 'КБ');
console.log('JS найменш використані', JSON.stringify(jc.filter(x => x.tot > 8000).sort((a, b) => a.pct - b.pct).slice(0, 6).map(x => `${x.f}:${x.pct}%`)));
console.log('CSS файли', JSON.stringify(cc.map(x => `${x.f}:${x.pct}%`)));
const budget = []; const slow = times[0][1]; if (slow > 150) budget.push(`екран ${times[0][0]} малюється ${slow} мс (бюджет 150)`); if (timing.dcl > 1500) budget.push(`DOMContentLoaded ${timing.dcl} мс (бюджет 1500)`); if (sv.kb > 600) budget.push(`збереження ${sv.kb} КБ (бюджет 600)`); if (wk.maxMs > 50) budget.push(`тиждень гри ${wk.maxMs} мс (бюджет 50)`);
console.log('помилки', errors); console.log(budget.length ? 'БЮДЖЕТ ПЕРЕВИЩЕНО:\n ' + budget.join('\n ') : 'у межах бюджету'); if (budget.length || errors.length) process.exitCode = 1;
await b.close(); server.close();
