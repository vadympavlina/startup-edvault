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

const BAD = /undefined|NaN|\[object|Infinity(?!\s*·)/;
const long = 'Це змістовне пояснення з кількох слів, яке має достатню довжину.';
const lorem = 'Школярі витрачають 2 години на домашку й не розуміють пояснень, тому потрібен 1 зрозумілий застосунок';
const SW = ['S', 'W', 'O', 'T'];

// Заповнює вправу так, щоб її можна було завершити
const FILL = {
  niche: (S, d) => { d.touched = 3; d.why = long; },
  market: (S, d) => { while (d.comps.length < 3) d.comps.push({ t: 'Ще один', type: 'sub', price: 0, r: {}, plus: '', minus: '' }); d.comps.forEach(c => { c.plus = 'зручно'; c.minus = 'дорого'; }); d.t = 3; d.why = long; },
  needs: (S, d) => { S.s.know[S.segIds[0]].n = 3; d.pains = [{ t: 'Не розумію тему', s: 4, f: 'often' }, { t: 'Це дорого', s: 3, f: 'some' }, { t: 'Немає кому допомогти', s: 2, f: 'rare' }]; d.now = ['питаю друзів']; d.jtbd = { when: 'вечір перед контрольною', want: 'швидко зрозуміти', so: 'не втрачати вечір' }; },
  mvp: (S, d) => { Object.entries(S.I.features).forEach(([id, f], i) => { d.cls[id] = f.core || f.pay ? 'must' : i < 7 ? 'should' : 'could'; }); d.applied = true; d.budget = 80; },
  bmodel: (S, d) => { d.pick = S.I.models[0]; d.why = long; },
  w5: (S, d) => { while (d.segs.length < 2) d.segs.push({ id: 'c1', link: null, name: 'Інший сегмент', a: {}, size: 3, pay: 3, reach: 3 }); d.segs.slice(0, 2).forEach(s => { s.a = { what: 'Підписку', who: 'Батьки', why: 'Заощадити час', when: 'Щодня', where: 'В інтернеті' }; }); d.main = d.segs[0].id; },
  strategy: (S, d) => { d.goal = 'Перші продажі'; d.msg = 'Домашка за п’ять хвилин, а не за дві години'; d.ch = ['social', 'ads']; d.budget = 20000; d.met = ['Охоплення', 'Реєстрації']; },
  smart: (S, d) => { d.metric = 'users'; d.target = 200; d.weeks = 12; d.why = long; },
  logo: (S, d) => { d.t = 3; },
  brandvoice: (S, d) => { d.vals = ['Чесність', 'Простота', 'Турбота']; d.t = 2; d.slogan = 'Домашка без сліз і метушні'; },
  swot: (S, d) => { d.items.forEach(x => { if (x.src === 'game') x.q = x.k; }); let id = Math.max(...d.items.map(x => x.id)) + 1; for (const k of SW) for (let i = 0; i < 2; i++) d.items.push({ id: id++, t: 'Власний пункт ' + k + i, q: k, k, src: 'own' }); d.tows = { so: 'Використати команду для запуску реклами', wo: 'Знайти партнера з досвідом', st: '', wt: '' }; },
  usp: (S, d) => { const v = { who: 'школярів 7–11 класів', prob: 'не розуміють, як розв’язати задачу', prod: 'наш застосунок', cat: 'персональний репетитор', gain: 'пояснює кожен крок за 5 хвилин', vs: 'сайтів із готовими відповідями', proof: 'пояснення перевіряють учителі' }; d.a = { ...v }; d.b = { ...v, gain: 'пояснює за 3 хвилини' }; d.test = [{ v: 'a', q: 'добре' }, { v: 'a', q: 'добре' }, { v: 'b', q: 'ок' }, { v: 'a', q: 'ок' }, { v: 'n', q: 'ні' }]; d.pick = 'a'; },
  naming: (S, d) => { d.short = ['Знайка', 'Розумник', 'Лексик']; d.vote = { Знайка: 2, Розумник: 2, Лексик: 1 }; d.final = 'Знайка'; },
  pr: (S, d) => { d.hooks = ['launch']; d.head = 'Команда запустила застосунок, що пояснює домашку за 5 хвилин'; d.lead = 'Сьогодні команда запустила застосунок, який крок за кроком пояснює розв’язок домашнього завдання школярам.'; d.quote = '«Ми хотіли, щоб домашка перестала бути стресом», — каже засновник.'; d.media = ['local', 'blog']; d.crisis = 'fix'; },
  reviews: (S, d) => { d.r = { 0: 0, 1: 0, 2: 0, 3: 0 }; },
  costs: (S, d) => { d.price = Math.max(d.price, d.unit.reduce((a, x) => a + (+x.v || 0), 0) * 3 + 100); },
  price: (S, d) => { const u = X(S, 'costs').unit.reduce((a, x) => a + (+x.v || 0), 0); d.pick = 'cost'; d.markup = 100; d.final = Math.round(u * 2.5 + 100); d.why = long; },
  finplan: (S, d) => { d.ch = 3; d.action = 'Скорочу витрати на рекламу й залучу інвестора'; },
  assort: (S, d) => { d.items = [{ t: 'Базовий', price: 100, cost: 40, share: 50 }, { t: 'Стандарт', price: 200, cost: 80, share: 35 }, { t: 'Преміум', price: 400, cost: 150, share: 15 }]; d.why = long; },
  sources: (S, d) => { d.need = 300000; d.mix = { own: 200000, fff: 100000 }; d.why = long; },
  equity: (S, d) => { d.ch = 3; d.q = { 0: 0, 1: 1, 2: 1 }; },
  grants: (S, d) => { d.res = { start: { res: 'no', score: 50, msg: 'x', w: 0 } }; },
  pitch: (S, d) => { d.p = { problem: lorem, solution: lorem, market: lorem, trac: lorem, team: lorem, ask: 'Шукаю 300 тисяч ₴ на шість місяців' }; },
  channels: (S, d) => { d.sel = ['social', 'ads', 'flyers']; d.grid = Object.fromEntries(d.sel.map(k => [k, [true, true, true, true, false, false]])); d.budget = 150000; d.why = long; },
  funnel: (S, d) => { d.picks = ['site', 'onb']; d.why = long; },
  promomix: (S, d) => { d.s[1] = { mech: 'gift', par: 10, weeks: 2 }; d.pick = 0; d.why = long; },
  ad: (S, d) => { d.head = 'Домашка за 5 хвилин'; d.cta = 'Спробуй безкоштовно'; d.badge = '−20%'; d.t = 3; },
  leadership: (S, d) => { d.a = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, i % 3])); d.mine = 'd'; d.rule = long; },
  roles: (S, d) => { d.own = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, i < 5 ? 'dev' : 'me'])); d.first = ['dev']; d.why = long; },
  agile: (S, d) => { d.sprints = 1; d.log = [{ plan: 7, done: 7, val: 10, maxVal: 10, burn: [7, 0], ideal: [7, 0], ev: [] }]; d.retro = { good: 'добре', bad: 'мало часу', act: 'менше задач' }; d.kb.slice(0, 4).forEach(c => { c.col = 'done'; c.cyc = 1; }); d.q = { 0: 0, 1: 1, 2: 1 }; },
  hiring: (S, d) => { d.req = ['exp', 'team', 'learn']; d.q = { 0: 1, 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 1, 7: 0 }; d.pick = 'Ірина'; d.why = long; },
  remote: (S, d) => { d.tools = ['chat', 'video', 'tasks']; d.rit = ['daily', 'demo']; d.q = { 0: 1, 1: 1 }; },
  exchanges: (S, d) => { d.pick = 'ua'; d.why = long; d.sc = { 0: 1, 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 }; },
  resume: (S, d) => { d.title = 'Дизайнер'; d.about = 'Створюю прості інтерфейси для шкільних застосунків. За рік зробив 5 проєктів для 3 шкіл.'; d.skills = [{ t: 'Figma', l: 4 }, { t: 'Тексти', l: 3 }, { t: 'Прототипи', l: 3 }]; d.exp = [{ t: 'Фріланс-проєкти', r: 'збільшив конверсію на 20%' }]; d.port = ['Сайт кав’ярні']; d.mail = 'name@example.com'; },
  client: (S, d) => { d.txt[0] = 'Добрий день, Олено! Я прочитав опис сайту для кав’ярні «Ранок»: меню, фото й карта. Маю досвід: зробив 4 схожі сайти. Роботу виконаю за 8000 грн за 14 днів. Підкажіть, будь ласка, чи є у вас готові фото й логотип? Із задоволенням надішлю приклади робіт.'; d.dlg = { 0: 0, 1: 0, 2: 0 }; },
  fop: (S, d) => { d.form = 'fop'; d.ord = [0, 1, 2, 3, 4, 5]; d.q = { 0: 0, 1: 1 }; },
  paytools: (S, d) => { d.a = Object.fromEntries(['onecard', 'wallet', 'vcard', 'iban', 'link', 'cash', 'p2p', 'card'].map((k, i) => [i, k])); d.sec = ['d3', 'push', 'limit']; },
  money: (S, d) => { d.g = { 'Готівка': [1, 1, 1, 0, 0, 1, 0, 0], 'Гроші на картці': [1, 0, 1, 0, 0, 1, 1, 0], 'Електронні гроші (гаманець)': [0, 0, 0, 0, 0, 0, 1, 0], 'Криптовалюта': [0, 0, 0, 1, 1, 0, 1, 0], 'Золото й метали': [0, 1, 0, 0, 1, 0, 0, 0], 'Бонуси магазину': [0, 0, 0, 0, 0, 0, 1, 1], 'Ігрова валюта': [0, 0, 0, 0, 0, 0, 1, 1] }; d.q = { 0: 1, 1: 0, 2: 1 }; },
  portfolio: (S, d) => { d.al = { dep: 20, ovdp: 25, corp: 10, etf: 30, gold: 10, pif: 5 }; d.ran = true; d.tol = 70; d.why = long; },
  trading: (S, d) => { d.day = 30; d.done = true; d.q = { 0: 1, 1: 0, 2: 1, 3: 1 }; d.why = 'Я зрозумів, що торгівля — це ризик, а гарантованого прибутку не буває.'; },
  interview: (S, d) => { d.ask = [1, 3, 5, 7, 9]; EX.interview.acts.run(S, d, {}, { toast() {} }); d.note = long; },
  bbook: (S, d) => { d.promise = 'Допомагаємо школярам робити домашку за п’ять хвилин, а батькам не сидіти поруч'; d.dos = ['Звертаємось на «ви»', 'Пишемо просто', '']; d.donts = ['Не лякаємо штрафами', 'Не обіцяємо неможливого', '']; },
  palette: (S, d) => { d.name = 'Ранкова кава'; d.why = long; },
  premortem: (S, d) => { const R = [[3, 3], [2, 3], [3, 2], [2, 3], [2, 2], [1, 3], [2, 1], [3, 2], [2, 2], [2, 3], [1, 3], [2, 1]]; R.forEach(([p, i], k) => { d.r[k] = { p, i }; }); d.top = [0, 1, 3]; d.mit = { 0: long, 1: long, 3: long }; },
  cashflow: (S, d) => { d.w = { adv: 1, mat: 9, ads: 10, sub: 11, tax: 12 }; },
  negotiate: (S, d) => { d.tr = ['clients', 'proto', 'team', 'rev']; EX.negotiate.acts.offer(S, d, {}, { toast() {} }); },
  abtest: (S, d) => { d.a = 3; d.b = 1; d.n = 1500; EX.abtest.acts.run(S, d, {}, { toast() {} }); d.win = 3; d.why = long; },
  journey: (S, d) => { ['aware', 'compare', 'buy', 'use', 'share'].forEach((k, i) => { d.tp[k] = ['Реклама в соцмережах', 'Відгуки клієнтів', 'Оплата в один клік', 'Відеоінструкція', 'Запит відгуку'][i]; }); d.pain.aware = 'Реклама не зрозуміла'; d.pain.buy = 'Складна реєстрація'; d.pain.use = 'Не знає, з чого почати'; d.fix = long; },
  conflict: (S, d) => { d.a = { 0: 1, 1: 1, 2: 1 }; d.say = long; },
  rate: (S, d) => { d.pitch = long; },
  scam: (S, d) => { d.a = Object.fromEntries(['scam', 'safe', 'scam', 'safe', 'scam', 'scam', 'scam', 'safe'].map((k, i) => [i, k])); d.rules = ['code', 'link', 'call']; },
  compound: (S, d) => { d.pick = ['dep', 'etf', 'bond']; d.real = true; d.q = '6'; d.note = long; },
};
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
