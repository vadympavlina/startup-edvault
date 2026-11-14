// Набір тексту в усіх вправах: поле лишається активним, курсор не злітає. node tests/startup-typing-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const p = await newPage(await browser.newContext({ viewport: { width: 1280, height: 1000 } }), errors);
p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
const ids = await p.evaluate(async () => (await import('./startupsim/js/ex-core.js')).exAll().map(e => e.id));
const FIELDS = '.ex input[type=text], .ex input:not([type]), .ex textarea, .ex input[type=number], .ex input[type=search]';

await step(`усі ${ids.length} вправ: у кожне поле можна друкувати без втрати фокуса`, async () => {
  const bad = [];
  for (const id of ids) {
    await p.evaluate(id => window.Startup.C.go('ex-' + id), id); await p.waitForTimeout(120);
    const n = await p.locator(FIELDS).count();
    for (let i = 0; i < n; i++) {
      const el = p.locator(FIELDS).nth(i);
      if (!(await el.isVisible()) || !(await el.isEditable())) continue;
      const num = (await el.evaluate(e => e.type)) === 'number';
      await el.scrollIntoViewIfNeeded(); await el.click(); await el.fill('');
      await p.keyboard.type(num ? '123' : 'abc', { delay: 40 });
      await p.waitForTimeout(100);
      const r = await p.evaluate(() => ({ tag: document.activeElement?.tagName, v: document.activeElement?.value }));
      if (r.tag === 'BODY' || r.v !== (num ? '123' : 'abc')) bad.push(`${id} #${i}: ${r.tag} ${JSON.stringify(r.v)}`);
    }
  }
  assert.deepEqual(bad, [], 'поля, що втратили фокус');
});

await step('курсор у середині тексту не злітає в кінець (поле в блоці, що перемальовується)', async () => {
  await p.evaluate(() => window.Startup.C.go('ex-price')); await p.waitForSelector('[data-live] textarea');
  const ta = p.locator('[data-live] textarea').first();
  await ta.click(); await ta.fill(''); await p.keyboard.type('аб', { delay: 40 }); await p.keyboard.press('ArrowLeft'); await p.keyboard.type('в', { delay: 40 });
  assert.equal(await ta.inputValue(), 'авб');
});

await step('жодної помилки в консолі', async () => assert.deepEqual(errors, []));
await browser.close(); server.close();
