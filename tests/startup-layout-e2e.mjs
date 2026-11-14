// Верстка всіх вправ: блоки не накладаються й не стикаються рамками, нічого не виходить за екран. node tests/startup-layout-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const CARD = /xbox|card|pmeth|nmcard|chcard|srcard|article|section/;

async function audit(w, h) {
  const p = await newPage(await browser.newContext({ viewport: { width: w, height: h } }), errors);
  p.setDefaultTimeout(15000);
  await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
  await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
  await p.waitForSelector('#main .ws');
  await p.evaluate(async () => { const S = window.Startup.sim, core = await import('/startupsim/js/ex-core.js'), { makeFill } = await import('/tests/fill.mjs'); window.__FILL = makeFill(core.EX, core.X); window.__core = core; S.s.flags.st9 = 8; window.Startup.C.render(); });
  const ids = await p.evaluate(() => window.__core.exAll().map(e => e.id)), bad = [];
  for (const id of ids) {
    await p.evaluate(id => { const S = window.Startup.sim, c = window.__core, d = c.X(S, id); try { window.__FILL[id]?.(S, d); } catch { /* вправа без заповнення */ } window.Startup.C.go('ex-' + id); }, id);
    await p.waitForTimeout(100);
    const issues = await p.evaluate(re => {
      const rx = new RegExp(re), root = document.querySelector('.ex-body'), out = [];
      const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 4 && r.height > 4 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const lb = el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') + ':' + (el.textContent || '').trim().slice(0, 20);
      for (const par of root.querySelectorAll('*')) {
        if (par.closest('svg') || par.tagName === 'svg') continue;
        const kids = [...par.children].filter(k => !k.closest('svg') && k.tagName !== 'svg' && vis(k) && !['absolute', 'fixed'].includes(getComputedStyle(k).position));
        if (kids.length < 2 || kids.length > 40) continue;
        for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].getBoundingClientRect(), c = kids[j].getBoundingClientRect(), ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (kids[i].matches('.bc-f, .bc-b') || kids[j].matches('.bc-f, .bc-b')) continue; // макет візитки: задня сторона навмисно виглядає з-під передньої
          if (ix > 3 && iy > 3 && !/^(I|B|EM)$/.test(kids[i].tagName)) out.push('накладання ' + lb(kids[i]) + ' | ' + lb(kids[j]));
          else if (((ix > 10 && iy > -4 && iy <= .5) || (iy > 10 && ix > -4 && ix <= .5)) && rx.test(kids[i].className + kids[i].tagName) && rx.test(kids[j].className + kids[j].tagName)) out.push('впритул ' + lb(kids[i]) + ' | ' + lb(kids[j]));
        }
      }
      const sc = document.scrollingElement; if (sc.scrollWidth > innerWidth + 2) out.push('горизонтальна прокрутка ' + sc.scrollWidth);
      for (const el of root.querySelectorAll('button, .chip, b, span, p, h2, h3, label, small')) {
        if (!vis(el)) continue; const s = getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth + 3 && s.overflow !== 'visible' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0 && !el.closest('.xscroll, svg')) out.push('текст обрізано ' + lb(el));
      }
      return out.slice(0, 5);
    }, CARD.source);
    if (issues.length) bad.push(`${id}: ${issues.join('; ')}`);
  }
  await p.context().close();
  return bad;
}

await step('комп’ютер 1280: у жодній вправі блоки не накладаються, не стикаються й не виходять за екран', async () => assert.deepEqual(await audit(1280, 900), []));
await step('телефон 390: так само', async () => assert.deepEqual(await audit(390, 800), []));
await step('жодної помилки в консолі', async () => assert.deepEqual(errors, []));
await browser.close(); server.close();
