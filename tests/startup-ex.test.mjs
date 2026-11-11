// Симулятор стартапу · вправи етапів: усі вправи відкриваються, малюються без помилок, їх можна завершити, прогрес зберігається.
//   node --test tests/startup-ex.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, okState, Sim } from '../startupsim/js/sim.js';
import { packGame, unpackGame } from '../startupsim/js/file.js';

await Promise.all(['ex1', 'ex-need', 'ex-start', 'ex1b', 'ex-aud', 'ex-brand', 'ex-bbook', 'ex2', 'ex3', 'ex3b', 'ex4', 'ex5', 'ex6', 'ex7', 'ex8', 'ex9'].map(m => import(`../startupsim/js/${m}.js`)));
const { EX, X, exDone, exCount, exPage, exAll } = await import('../startupsim/js/ex-core.js');
const { STAGES, stageInfo, syncStage, isOpen } = await import('../startupsim/js/stages.js');
const { stageRail, stageSheet, stageBar, goalCard } = await import('../startupsim/js/v-stages.js');

import { makeFill, long, lorem, SW } from './fill.mjs';
const BAD = /undefined|NaN|\[object|Infinity(?!\s*·)/;
const FILL = makeFill(EX, X);
const CUSTOM = { name: 'Свічки ручної роботи', problem: 'нудні подарунки', pitch: 'Свічки з ароматами на замовлення.', kind: 'goods', unitCost: 80, batchMin: 30, leadTime: 2, scope: 'city',
  segments: [{ name: 'Студенти', arch: 'students', size: 20000, price: 250 }, { name: 'Кав’ярні', arch: 'smb' }], features: [{ name: 'Аромати', size: 's', core: true, segs: [0] }, { name: 'Гравіювання', size: 'm', segs: [0, 1] }, { name: 'Доставка', size: 's', segs: [1] }], competitors: [{ name: 'Маркетплейс', price: 300, weak: 'Однакові свічки', segs: [0] }] };
const GAMES = [['homework', {}], ['plant', {}], ['english', {}], ['booking', {}], ['custom', { custom: CUSTOM }]];
const make = (idea, o) => newGame({ idea, founder: 'Тест', company: 'Тест', seed: 11, ...o });
const html = (S, def, d) => [def.view(S, d, { ui: {}, done: null }), def.live ? def.live(S, d, { ui: {}, done: null }) : ''].join('\n');

test('кожна вправа має опис, а її сторінка малюється без помилок для всіх ідей', () => {
  for (const [idea, o] of GAMES) {
    const S = make(idea, o);
    assert.ok(exAll().length >= 36);
    for (const def of exAll()) {
      for (const k of ['id', 'stage', 't', 'd', 'icon', 'intro', 'view', 'ready']) assert.ok(def[k] !== undefined, `${def.id}: немає ${k}`);
      const d = X(S, def.id);
      const page = exPage(def)(S, {});
      assert.ok(page.includes(`data-ex-root="${def.id}"`));
      assert.doesNotMatch(html(S, def, d), BAD, `${idea}/${def.id}: у розмітці порожні значення`);
      const r = def.ready(S, d); assert.equal(typeof r.ok, 'boolean', def.id);
    }
  }
});

test('кожну вправу можна заповнити й завершити, прогрес етапів зростає', () => {
  for (const [idea, o] of GAMES) {
    const S = make(idea, o);
    for (const st of STAGES) {
      for (const def of exAll().filter(e => e.stage === st.i)) {
        const d = X(S, def.id);
        FILL[def.id](S, d);
        const r = def.ready(S, d);
        assert.ok(r.ok, `${idea}/${def.id}: не вдається завершити (${r.msg})`);
        assert.doesNotMatch(html(S, def, d), BAD, `${idea}/${def.id}: розмітка після заповнення`);
        def.finish?.(S, d, { toast() {}, go() {} });
        S.s.ex.done[def.id] = { w: S.s.week, s: r.stars || 2 };
      }
    }
    assert.equal(exCount(S), exAll().length);
    // після виконання всього етапи обов'язкових справ пройдено, коли ще виконано бізнес-план
    S.s.canvas = { problem: 'Учні не розуміють домашку', segment: S.s.target, uvp: 'Пояснення за п’ять хвилин', solution: ['x'], channels: ['ads'] };
    const info = syncStage(S);
    assert.ok(info.allDone, `${idea}: усі етапи пройдено; не пройдено: ${info.list.filter(x => !x.done).map(x => x.t + ' ' + x.req.filter(r => !r.ok).map(r => r.t).join('/')).join('; ')}`);
    assert.equal(info.reached, 8);
    for (const v of ['product', 'brand', 'pricing', 'investors', 'marketing', 'team', 'freelance', 'invest', 'payments', 'ex-trading']) assert.ok(isOpen(S, v, info), v);
    assert.doesNotMatch(stageRail(S, {}, info) + stageSheet(S, {}, info) + stageBar(S, info) + goalCard(S), BAD);
  }
});

test('збереження: вправи, SMART-ціль і логотип живуть у файлі й повертаються назад', () => {
  const S = make('homework', {});
  FILL.logo(S, X(S, 'logo')); const lg = X(S, 'logo'); lg.shape = 'hex'; lg.c1 = '#0ea5e9'; lg.grad = true; lg.c2 = '#14b8a6'; EX.logo.finish(S, lg);
  FILL.smart(S, X(S, 'smart')); EX.smart.finish(S, X(S, 'smart'));
  FILL.swot(S, X(S, 'swot')); S.s.ex.done.swot = { w: 0, s: 3 };
  assert.equal(S.s.company.mk.shape, 'hex'); assert.ok(S.s.goal && S.s.goal.target === 200);
  const file = JSON.stringify(packGame(S, { view: 'ex-swot' }));
  const res = unpackGame(file);
  assert.ok(res.ok && !res.edited && okState(res.state));
  const T = new Sim(res.state);
  assert.equal(exDone(T, 'swot'), true);
  assert.deepEqual(T.s.ex.d.swot.items.length, S.s.ex.d.swot.items.length);
  assert.equal(T.s.company.mk.c2, '#14b8a6'); assert.equal(T.s.goal.metric, 'users');
  // стан гри лишається придатним і після місяця гри
  for (let i = 0; i < 6; i++) T.endWeek();
  assert.ok(okState(T.s) && T.s.ex.d.swot.items.length);
});

test('вправи з наслідками для гри: ціна, модель, назва компанії, бізнес-план, грант', () => {
  const S = make('homework', {});
  FILL.costs(S, X(S, 'costs')); FILL.price(S, X(S, 'price'));
  const pr = X(S, 'price'); EX.price.acts.apply(S, pr, {}, { toast() {} });
  assert.equal(S.s.price[S.s.target], pr.final);
  FILL.usp(S, X(S, 'usp')); EX.usp.acts.toPlan(S, X(S, 'usp'), {}, { toast() {} });
  assert.match(S.s.canvas.uvp, /Для школярів/);
  FILL.naming(S, X(S, 'naming')); EX.naming.acts.rename(S, X(S, 'naming'), {}, { toast() {} });
  assert.equal(S.s.company.name, 'Знайка');
  FILL.mvp(S, X(S, 'mvp')); EX.mvp.acts.apply(S, X(S, 'mvp'), {}, { toast() {} });
  assert.ok(S.s.product.queue.length >= 1);
  const gm = X(S, 'grants'); gm.prog = 'school'; S.s.canvas.problem = 'Учні не розуміють домашку';
  Object.assign(gm.a.school, { problem: 'Школярі витрачають 2 години на домашку, і 40% не розуміють пояснень учителя.', solution: 'Застосунок крок за кроком пояснює розв’язок і нова ідея для 500 учнів.', team: 'Я — засновник і розробник', plan: 'Розробка 60%, реклама 40%. За 6 місяців: 500 користувачів, 50 платних клієнтів.' });
  const cash = S.s.cash; let wins = 0;
  for (let w = 0; w < 6 && !wins; w++) { S.s.week = w; EX.grants.acts.submit(S, gm, {}, { toast() {} }); if (gm.res.school.res === 'win') wins++; }
  if (wins) assert.ok(S.s.cash > cash, 'грант зараховано на рахунок');
});


test('до кожної вправи є приклади промптів для ШІ, підстановки заповнено', async () => {
  const { aiPrompts, AI_PROMPTS } = await import('../startupsim/js/ai.js');
  for (const [idea, o] of GAMES) {
    const S = make(idea, o);
    for (const def of exAll()) {
      assert.ok(AI_PROMPTS[def.id]?.length >= 2, `${def.id}: немає власних промптів`);
      for (const x of aiPrompts(S, def)) { assert.ok(x.t && x.p.length > 30, def.id); assert.doesNotMatch(x.p, /\{(idea|pitch|company|title)\}|undefined|null/, `${idea}/${def.id}`); }
    }
  }
});
