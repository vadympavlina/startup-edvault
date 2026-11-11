// Доступність: axe-core (WCAG 2.1 A/AA) на майстрі, екранах, вправах і модальному вікні. npm run audit:a11y (потрібен npm install; код виходу 1 при critical/serious)
import { readFileSync } from 'node:fs';
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const axeSrc = readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const server = await startServer(), b = await launch(), errors = [];
const p = await newPage(await b.newContext({ viewport: { width: 1366, height: 900 }, bypassCSP: true }), errors); p.setDefaultTimeout(10000);
const agg = new Map();
const scan = async tag => {
  await p.evaluate(s => { if (!window.axe) (0, eval)(s); }, axeSrc);
  const r = await p.evaluate(async () => { const x = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'], resultTypes: ['violations'] }); return x.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes.slice(0, 3).map(n => n.target.join(' ').slice(0, 50) + ' ' + (n.any[0]?.data?.fgColor ? n.any[0].data.fgColor + '/' + n.any[0].data.bgColor + ' ' + n.any[0].data.contrastRatio : '')).join(' ; '), html: v.nodes[0].html.slice(0, 90) })); });
  for (const v of r) { const a = agg.get(v.id) || { ...v, n: 0, where: new Set() }; a.n += v.n; a.where.add(tag); agg.set(v.id, a); }
};
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await scan('майстер: привітання'); await p.click('[data-w="next"]'); await scan('майстер: ніша'); await p.click('[data-w="next"]'); await scan('майстер: ви й компанія');
await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
for (const v of ['dash','inbox','customers','plan','product','brand','marketing','pricing','finance','team','help','report','ex-niche','ex-logo','ex-market','ex-bmodel','ex-cashflow','ex-interview']) { await p.evaluate(v => window.Startup.C.go(v), v); await p.waitForTimeout(150); await scan(v); }
await p.evaluate(() => window.Startup.C.go('customers')); await p.waitForTimeout(150); await p.click('[data-act="interview"]'); await p.waitForSelector('.iv-qs'); await p.waitForTimeout(700); await scan('модальне: інтерв’ю');
const rows = [...agg.values()].sort((a, b) => ({ critical: 0, serious: 1, moderate: 2, minor: 3 }[a.impact] - { critical: 0, serious: 1, moderate: 2, minor: 3 }[b.impact]) || b.n - a.n);
for (const r of rows) console.log(`${(r.impact || '').padEnd(9)} ${r.id.padEnd(34)} вузлів ${String(r.n).padStart(4)}  екранів ${r.where.size}  ${r.help.slice(0, 60)}\n          напр. ${r.sample} | ${r.html}`);
console.log('помилки', errors.slice(0, 2)); if (rows.some(r => r.impact === 'critical' || r.impact === 'serious')) process.exitCode = 1;
await b.close(); server.close();
