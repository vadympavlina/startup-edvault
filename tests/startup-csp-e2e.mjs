// Політика безпеки контенту (CSP): нічого не порушується під час звичайної гри, а вбудовані обробники подій блокуються.
//   node tests/startup-csp-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true }); // без bypassCSP: політика діє
await ctx.addInitScript(() => { window.__viol = []; document.addEventListener('securitypolicyviolation', e => window.__viol.push(`${e.violatedDirective} ${String(e.blockedURI).slice(0, 60)}`)); });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');

await step('звичайна гра не порушує політику: майстер, екрани, вправи, підказки ШІ, файл, логотип із фото', async () => {
  await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
  await p.evaluate(async () => {
    const m = await import('/startupsim/js/ex-core.js'), C = window.Startup.C; window.Startup.sim.s.flags.st9 = 8;
    for (const v of ['dash', 'inbox', 'customers', 'plan', 'product', 'brand', 'marketing', 'pricing', 'finance', 'team', 'help', 'report', ...m.exAll().map(e => 'ex-' + e.id)]) { C.go(v); await new Promise(r => setTimeout(r, 10)); }
    m.exActs.exAi(C, { dataset: { ex: 'niche' } }); document.querySelector('.md [data-md-close]')?.click();
    // фото логотипа (data:-зображення) через редактор
    C.go('ex-logo'); const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').fillRect(0, 0, 64, 64);
    const d = m.X(window.Startup.sim, 'logo'); d.imgO = d.img = d.imgS = c.toDataURL('image/png'); d.useImg = true; C.render();
  });
  await p.waitForTimeout(300);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => document.querySelector('[data-act="saveFile"]')?.click())]);
  assert.match(dl.suggestedFilename(), /\.edvault$/);
  assert.deepEqual(await p.evaluate(() => window.__viol), [], 'жодних порушень CSP');
});

await step('вбудований обробник onerror блокується політикою', async () => {
  const r = await p.evaluate(async () => {
    window.__csp = 0; const d = document.createElement('div'); document.body.appendChild(d);
    d.innerHTML = '<img src="x" onerror="window.__csp = 1">'; // у обхід фільтра: напряму
    await new Promise(r => setTimeout(r, 400)); const v = window.__viol.filter(x => /script-src/.test(x)).length; d.remove(); return { ran: window.__csp, violations: v };
  });
  assert.equal(r.ran, 0, 'код не виконався'); assert.ok(r.violations >= 1, 'політика зафіксувала спробу: ' + JSON.stringify(r));
});

await step('фільтр розмітки прибирає обробники й javascript:-посилання', async () => {
  const r = await p.evaluate(async () => {
    const { fill } = await import('/startupsim/js/ui.js'), d = document.createElement('div');
    fill(d, '<img src="x" onerror="1"><a href="javascript:alert(1)">a</a><script>1</script><iframe src="x"></iframe><b onclick="1">b</b><a href="https://ok.test">ok</a><style>*{}</style>');
    return d.innerHTML;
  });
  assert.doesNotMatch(r, /onerror|onclick|javascript:|<script|<iframe|<style/i, r); assert.match(r, /https:\/\/ok\.test/);
});

await step('сторінка викладача теж під політикою і працює', async () => {
  const q = await newPage(ctx, errors); await q.goto(server.url + '/startup-check'); await q.waitForSelector('#dz');
  assert.deepEqual(await q.evaluate(() => window.__viol), []);
});

await step('жодних несподіваних помилок у консолі (крім навмисної спроби з кроку 2)', async () => {
  const unexpected = errors.filter(e => !/Content Security Policy|inline event handler|Failed to load resource/i.test(e));
  assert.deepEqual(unexpected, []);
});
await browser.close(); server.close();
