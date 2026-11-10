// Повний прогін гри в браузері: усі вправи всіх етапів (через кнопки) і всі 104 тижні, з перевіркою екранів
//   node tests/startup-full-e2e.mjs [idea ...]
import { readFileSync } from 'node:fs';
import { startServer, launch, newPage } from './_harness.mjs';

const ideas = process.argv.slice(2).length ? process.argv.slice(2) : ['homework'];
const src = readFileSync(new URL('./startup-ex.test.mjs', import.meta.url), 'utf8');
const fillSrc = src.slice(src.indexOf("const long = "), src.indexOf('\n};', src.indexOf('const FILL = {')) + 3);
const server = await startServer(), browser = await launch();
const report = [];
for (const idea of ideas) {
  const errors = [], probs = [];
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await newPage(ctx, errors); p.setDefaultTimeout(8000);
  await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
  await p.click('[data-w="next"]'); await p.click(`[data-v="${idea}"]`); await p.click('[data-w="next"]');
  await p.fill('[data-w="name"]', 'Марта Коваль'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main');
  await p.waitForTimeout(500);
  await p.evaluate(fs => { const m = new Function('EX', 'X', fs + '\nreturn FILL;'); window.__fill = m; }, fillSrc).catch(() => {});
  const clearModals = async () => { for (let i = 0; i < 8; i++) { const n = await p.locator('.md:visible').count(); if (!n) return; const b = p.locator('.md:visible .btn.primary, .md:visible [data-md-close]').last(); if (await b.count()) await b.click({ timeout: 2000 }).catch(() => {}); else await p.keyboard.press('Escape'); await p.waitForTimeout(120); } };
  const scan = async tag => {
    const r = await p.evaluate(() => { const t = document.querySelector('#main')?.innerText || ''; const m = t.match(/undefined|NaN|\[object|Infinity/); return { bad: m && m[0], over: document.documentElement.scrollWidth > innerWidth + 1 }; });
    if (r.bad) probs.push(`${tag}: у тексті «${r.bad}»`); if (r.over) probs.push(`${tag}: горизонтальна прокрутка`);
  };
  // 1. усі вправи: заповнення й завершення кнопкою
  const ids = await p.evaluate(async () => { const m = await import('/startupsim/js/ex-core.js'); return m.exAll().map(e => [e.id, e.stage]); });
  await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
  let done = 0;
  for (const [id] of ids) {
    const res = await p.evaluate(async id => {
      const m = await import('/startupsim/js/ex-core.js'), S = window.Startup.sim, C = window.Startup.C;
      const FILL = window.__fill(m.EX, m.X); const d = m.X(S, id);
      try { FILL[id]?.(S, d); } catch (e) { return 'fill:' + e.message; }
      C.go('ex-' + id); return 'ok';
    }, id);
    if (res !== 'ok') { probs.push(`${id}: ${res}`); continue; }
    await p.waitForTimeout(80); await scan('ex-' + id);
    const b = p.locator('[data-act="exDone"]').first();
    if (!(await b.count()) || await b.isDisabled()) { probs.push(`${id}: кнопку завершення недоступно`); continue; }
    await b.click(); await clearModals();
    if (await p.evaluate(id => !!window.Startup.sim.s.ex.done[id], id)) done++; else probs.push(`${id}: не зараховано`);
  }
  // 2. усі тижні
  const VIEWS = ['dash', 'inbox', 'customers', 'plan', 'product', 'brand', 'marketing', 'promo', 'pricing', 'finance', 'payments', 'investors', 'invest', 'team', 'freelance', 'help', 'report'];
  let weeks = 0, over = null;
  for (let w = 0; w < 110; w++) {
    const st = await p.evaluate(() => { const S = window.Startup.sim; return { over: S.s.over?.kind || null, week: S.s.week, cash: S.s.cash }; });
    if (st.over) { over = st; break; }
    await p.evaluate(() => { const S = window.Startup.sim; if (S.s.cash < 150000) S.s.cash = 400000; S.s.inbox.filter(m => m.choices && !m.done).forEach(m => { try { S.choose(m.id, 0); m.read = true; } catch {} }); window.Startup.C.go('dash'); });
    await clearModals();
    if (w % 13 === 0) for (const v of VIEWS) { await p.evaluate(v => window.Startup.C.go(v), v); await p.waitForTimeout(40); await scan(`тиждень ${w + 1} · ${v}`); await clearModals(); }
    await p.evaluate(() => window.Startup.C.go('dash')); await p.waitForTimeout(40);
    const btn = p.locator('.end-week'); if (await btn.isDisabled()) break;
    await btn.click(); await p.waitForTimeout(60); await clearModals(); weeks++;
  }
  const fin = await p.evaluate(() => { const S = window.Startup.sim; return { week: S.s.week + 1, over: S.s.over?.kind || 'триває', cash: Math.round(S.s.cash), stage: (S.s.flags.st9 || 0) + 1, ex: Object.keys(S.s.ex.done).length, ach: Object.keys(S.s.ach).length }; });
  await p.evaluate(() => window.Startup.C.go('report')); await p.waitForTimeout(200); await scan('підсумковий звіт');
  report.push({ idea, exercisesDone: `${done}/${ids.length}`, weeksPlayed: weeks, final: fin, problems: probs, consoleErrors: errors });
  await ctx.close();
}
console.log(JSON.stringify(report, null, 1));
await browser.close(); server.close();
