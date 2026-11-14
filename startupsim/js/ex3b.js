// Симулятор стартапу · вправи етапу 5 «Гроші на старт»: джерела фінансування, інвестиції в стартап, гранти й конкурси.
import { esc, term, donut } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, X, mk, hash, clamp, sumOf, pc, money0, quiz, quizOk, quizDone } from './ex-core.js';

const len = s => String(s || '').trim().length;
const dots = n => `<span class="dots5" aria-label="${n} з 5">${'●'.repeat(n)}<i>${'●'.repeat(5 - n)}</i></span>`;

/* ═════════ Джерела фінансування ═════════ */
const SRC = [
  { k: 'own', t: 'Власні гроші', max: 300000, sp: 5, cost: 5, ctl: 5, acc: 5, tag: 'свої', note: 'Найдешевше й найшвидше, але ризикуєте власними заощадженнями.', col: '#6366f1' },
  { k: 'fff', t: 'Родина й друзі', max: 300000, sp: 4, cost: 3, ctl: 4, acc: 4, eq: true, tag: 'частка', note: 'Вірять у вас, а не в бізнес-план. Оформіть угоду письмово, щоб не зіпсувати стосунки.', col: '#ec4899' },
  { k: 'loan', t: 'Банківський кредит', max: 500000, sp: 3, cost: 2, ctl: 5, acc: 2, rate: .22, tag: '22% річних', note: 'Потрібні ФОП чи ТОВ та історія доходів. Платити треба, навіть якщо не вийшло.', col: '#f59e0b' },
  { k: 'crowd', t: 'Краудфандинг', max: 300000, sp: 3, cost: 3, ctl: 5, acc: 3, fee: .12, tag: 'комісія 12%', note: 'Потрібна аудиторія. Обіцяні нагороди треба виконати вчасно.', col: '#14b8a6' },
  { k: 'pre', t: 'Передзамовлення', max: 200000, sp: 3, cost: 5, ctl: 5, acc: 3, tag: 'від клієнтів', note: 'Клієнти платять наперед: і гроші, і доказ, що продукт потрібен.', col: '#16a34a' },
  { k: 'angel', t: 'Бізнес-ангел', max: 1500000, sp: 2, cost: 2, ctl: 3, acc: 2, eq: true, tag: 'частка', note: 'Дає гроші, досвід і знайомства в обмін на частку компанії.', col: '#8b5cf6' },
  { k: 'accel', t: 'Акселератор', max: 250000, sp: 2, cost: 3, ctl: 4, acc: 2, eq: true, tag: 'частка', note: 'Невеликі гроші, ментори й зв’язки за кілька відсотків частки. Потрібна участь у програмі.', col: '#0ea5e9' },
  { k: 'vc', t: 'Венчурний фонд', max: 10000000, sp: 1, cost: 1, ctl: 2, acc: 1, eq: true, tag: 'частка', note: 'Великі гроші, але фонд чекає швидкого зростання в рази й вимагає місце в раді.', col: '#111827' },
  { k: 'grant', t: 'Грант', max: 300000, sp: 1, cost: 5, ctl: 5, acc: 2, chance: .3, tag: 'шанс ≈ 30%', note: 'Гроші не треба повертати, але заявки довгі, а конкуренція висока. Ви можете й не отримати.', col: '#84cc16' },
];
function srcCalc(d) {
  let raised = 0, eqAmt = 0, interest = 0, kinds = new Set(), nonDil = false;
  for (const s of SRC) { const a = +d.mix[s.k] || 0; if (!a) continue; kinds.add(s.k); const net = a * (s.fee ? 1 - s.fee : 1) * (s.chance || 1); raised += net; if (s.eq) eqAmt += a; if (s.rate) interest += a * s.rate; if (!s.eq) nonDil = true; }
  const dil = eqAmt ? eqAmt / (d.pre + eqAmt) : 0;
  return { raised, eqAmt, interest, dil, kinds: kinds.size, cover: d.need ? raised / d.need : 0, nonDil };
}
reg({
  id: 'sources', stage: 4, t: 'Джерела фінансування', d: 'Порівняйте дев’ять джерел грошей і складіть свій набір.', icon: 'coins', min: 15,
  intro: `У кожного джерела грошей своя ціна: відсотки, ${term('Розмивання', 'частка компанії')}, комісія чи час на заявки. Скільки вам потрібно? Підберіть набір джерел, який покриє потребу й не віддасть зайвого. Для грантів рахуємо ймовірність отримання.`,
  data: S => { const fp = X(S, 'finplan'); return { need: Math.max(100000, Math.round((fp.needNow || 300000) / 50000) * 50000), pre: 3000000, mix: {}, why: '', ch: 0 }; },
  onSet: (S, d) => { d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    const card = s => { const a = +d.mix[s.k] || 0; return `<article class="srcard ${a ? 'on' : ''}" style="--c:${s.col}"><header><b>${s.t}</b><span class="xtag">${s.tag}</span></header><p>${s.note}</p>
      <div class="rt"><span>Швидкість ${dots(s.sp)}</span><span>Дешевизна ${dots(s.cost)}</span><span>Контроль ${dots(s.ctl)}</span><span>Доступність ${dots(s.acc)}</span></div>${xsl('sources', `mix.${s.k}`, d, { min: 0, max: s.max, step: s.max >= 1000000 ? 100000 : 10000, label: 'Скільки беремо', u: ' ₴', v: a })}</article>`; };
    return `${box('Скільки потрібно грошей', `<div class="xg c2">${xsl('sources', 'need', d, { min: 50000, max: 3000000, step: 50000, label: 'Потреба', u: ' ₴' })}${xsl('sources', 'pre', d, { min: 1000000, max: 20000000, step: 500000, label: 'Оцінка компанії до вкладень', u: ' ₴' })}</div><div class="xrow mt">${xb('sources', 'needFromPlan', 'Взяти потребу з фінансового плану', { ic: 'refresh', cls: 'sm' })}</div><p class="sm muted">Оцінка компанії визначає, яку частку віддасте за гроші інвестора.</p>`, { ic: 'wallet' })}
    <div class="xg c2">${SRC.map(card).join('')}</div>
    ${box('Перші гроші для вашої компанії', S.hasFff() ? tip('Родина й друзі вже вклали 300 000 ₴ в обмін на 10% компанії.', 'ok') : `<p class="sm">Найпростіше джерело на старті: родина й друзі. У грі це справжні гроші: 300 000 ₴ одразу на рахунок в обмін на 10% компанії. Вирішуйте самі, чи брати їх зараз.</p>${xb('sources', 'takeFff', 'Взяти 300 000 ₴ за 10%', { cls: 'primary', ic: 'coins' })}`, { ic: 'users' })}`;
  },
  acts: {
    needFromPlan(S, d, el, C) { const n = X(S, 'finplan').needNow; if (!n) { C.toast('У фінплані гроші не закінчуються, тож потреба невелика. Поставте суму вручну.'); return false; } d.need = clamp(Math.round(n / 50000) * 50000, 50000, 3000000); C.toast('Потребу взято з фінансового плану', 'good'); },
    takeFff(S, d, el, C) { if (!S.takeFff()) return false; C?.toast?.('Родина й друзі вклали 300 000 ₴', 'good'); },
  },
  live(S, d) {
    const c = srcCalc(d), items = SRC.filter(s => +d.mix[s.k] > 0).map(s => ({ v: +d.mix[s.k], color: s.col, t: s.t }));
    return `${box('Ваш набір', `<div class="srcsum">${items.length ? donut(items, { size: 130 }) : '<div class="muted">Оберіть джерела вище</div>'}<div class="srcl">${items.map(i => `<span><i style="background:${i.color}"></i>${esc(i.t)} <b>${money0(i.v)}</b></span>`).join('')}</div></div>
      <div class="kpis3 mt"><div><small>Очікувано отримаємо</small><b>${money0(d.need ? c.raised : 0)}</b></div><div><small>Покриття потреби</small><b class="${c.cover >= .9 ? 'pos' : 'neg'}">${pc(c.cover)}</b></div><div><small>Частка, яку віддаєте</small><b class="${c.dil > .35 ? 'neg' : ''}">${pc(c.dil, 1)}</b></div></div>
      ${bar(c.cover, { color: c.cover >= .9 ? 'var(--ok)' : '#e0a100', label: 'Покриття' })}<p class="sm muted">Відсотки по кредиту за рік: ${money0(c.interest)} · Для грантів і краудфандингу враховано ймовірність і комісію.</p>
      ${checks([[c.cover >= .9, 'Набір покриває потребу (хоча б 90%)', 'Додайте ще джерел або зменште потребу'], [c.kinds >= 2, 'Є хоча б два різних джерела', 'Не покладайтесь на одне джерело'], [c.dil <= .35, 'Віддаєте не більше третини компанії', 'Забагато частки: вам лишиться мало контролю'], [c.nonDil, 'Є джерело без розмивання частки']])}
      ${xin('sources', 'why', d, { label: 'Чому саме такий набір?', area: true, rows: 2, max: 240, ph: 'Ми обрали ці джерела, тому що…', cls: 'mt' })}`, { ic: 'check' })}`;
  },
  ready(S, d) {
    const c = srcCalc(d);
    if (c.cover < .9) return { ok: false, msg: 'Набір покриває менше 90% потреби' };
    if (c.kinds < 2) return { ok: false, msg: 'Оберіть хоча б два джерела' };
    if (c.dil > .35) return { ok: false, msg: 'Ви віддаєте понад третину компанії: зменште частку' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    return { ok: true, stars: 1 + (c.dil <= .2 ? 1 : 0) + (c.nonDil && c.kinds >= 3 ? 1 : 0) };
  },
});

/* ═════════ Інвестиції в стартап ═════════ */
const EQQ = [
  { q: 'Інвестор вкладає 1 млн ₴ у компанію, оцінену до вкладення в 4 млн ₴. Яку частку він отримає?', a: ['20%', '25%', '33%', '50%'], ok: 0, why: 'Оцінка після вкладення — 5 млн ₴; 1 / 5 = 20%.' },
  { q: 'Що таке вестинг?', a: ['Податок на акції', 'Поступове отримання засновниками своїх часток за кілька років', 'Виплата прибутку інвесторам', 'Оцінка компанії'], ok: 1, why: 'Вестинг (зазвичай 4 роки) захищає компанію, якщо співзасновник піде за пів року.' },
  { q: 'Навіщо резервувати частку (ESOP) для майбутніх співробітників?', a: ['Щоб платити менше податків', 'Щоб мати чим мотивувати сильних людей, коли грошей на зарплати бракує', 'Цього вимагає закон', 'Для інвесторів'], ok: 1, why: 'Опціони допомагають наймати сильних людей, поки гроші обмежені.' },
];
reg({
  id: 'equity', stage: 4, t: 'Інвестиції в стартап', d: 'Подивіться, як раунди розмивають вашу частку, і відповідайте на питання.', icon: 'handshake', min: 15,
  intro: `Інвестор дає гроші за частку, і ваша частка ${term('Розмивання', 'розмивається')}. Підберіть суму й оцінку для двох раундів і подивіться, скільки залишиться вам. Пам’ятайте: 10% від великого — краще, ніж 100% від нічого, але контроль теж має значення.`,
  data: () => ({ r1: 500000, p1: 3000000, r2: 3000000, p2: 12000000, esop: 10, q: {}, ch: 0 }),
  onSet: (S, d, p) => { if (p !== 'q' && !p.startsWith('q.')) d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    return `${box('Раунди', `<div class="xg c2"><div><h4 class="h4s">Перший раунд: ангел</h4>${xsl('equity', 'r1', d, { min: 100000, max: 3000000, step: 100000, label: 'Скільки вкладають', u: ' ₴' })}${xsl('equity', 'p1', d, { min: 1000000, max: 15000000, step: 500000, label: 'Оцінка до вкладення', u: ' ₴' })}</div>
      <div><h4 class="h4s">Другий раунд: фонд</h4>${xsl('equity', 'r2', d, { min: 500000, max: 20000000, step: 500000, label: 'Скільки вкладають', u: ' ₴' })}${xsl('equity', 'p2', d, { min: 3000000, max: 100000000, step: 1000000, label: 'Оцінка до вкладення', u: ' ₴' })}</div></div>
      ${xsl('equity', 'esop', d, { min: 0, max: 25, step: 1, label: 'Резерв частки для співробітників (ESOP)', u: '%' })}`, { ic: 'wrench' })}`;
  },
  live(S, d) {
    const start = S.stake(), f0 = start * (1 - d.esop / 100), i1 = d.r1 / (d.p1 + d.r1), i2 = d.r2 / (d.p2 + d.r2), f1 = f0 * (1 - i1), f2 = f1 * (1 - i2), post2 = d.p2 + d.r2, others0 = 1 - start;
    const rows = [['Зараз', start, 0, 0, 0, 1], ['Після ESOP', f0, d.esop / 100, 0, 0, 1], ['Після першого раунду', f1, d.esop / 100 * (1 - i1), i1, 0, d.p1 + d.r1], ['Після другого раунду', f2, d.esop / 100 * (1 - i1) * (1 - i2), i1 * (1 - i2), i2, post2]];
    const parts = [{ v: f2, color: '#6366f1' }, { v: others0 * (1 - i1) * (1 - i2) * (1 - d.esop / 100), color: '#ec4899' }, { v: d.esop / 100 * (1 - i1) * (1 - i2), color: '#f59e0b' }, { v: i1 * (1 - i2), color: '#8b5cf6' }, { v: i2, color: '#111827' }];
    return `${box('Хто чим володіє після двох раундів', `<div class="srcsum">${donut(parts, { size: 150 })}<div class="srcl"><span><i style="background:#6366f1"></i>Ви <b>${pc(f2, 1)}</b></span>${others0 > .001 ? `<span><i style="background:#ec4899"></i>Родина й друзі <b>${pc(others0 * (1 - i1) * (1 - i2) * (1 - d.esop / 100), 1)}</b></span>` : ''}<span><i style="background:#f59e0b"></i>Співробітники (ESOP) <b>${pc(d.esop / 100 * (1 - i1) * (1 - i2), 1)}</b></span><span><i style="background:#8b5cf6"></i>Ангел <b>${pc(i1 * (1 - i2), 1)}</b></span><span><i style="background:#111827"></i>Фонд <b>${pc(i2, 1)}</b></span></div></div>
      <div class="kpis3 mt"><div><small>Ваша частка</small><b class="${f2 < .2 ? 'neg' : ''}">${pc(f2, 1)}</b></div><div><small>Ваша частка в гривнях</small><b>${money0(f2 * post2)}</b></div><div><small>Усього залучено</small><b>${money0(d.r1 + d.r2)}</b></div></div>
      ${f2 < .2 ? tip('Ваша частка менша за 20%: вам може бракувати мотивації й контролю. Спробуйте залучити менше або за вищої оцінки.', 'bad') : f2 > .6 ? tip('Ви зберегли більшість компанії. Але чи вистачить грошей на зростання?', 'warn') : tip('Збалансований варіант: у вас значна частка, а інвестори отримали стільки, щоб їм було цікаво.', 'ok')}
      <div class="xscroll"><table class="xtable"><thead><tr><th></th><th class="num">Ви</th><th class="num">ESOP</th><th class="num">Ангел</th><th class="num">Фонд</th><th class="num">Оцінка</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">${pc(r[1], 1)}</td><td class="num">${pc(r[2], 1)}</td><td class="num">${pc(r[3], 1)}</td><td class="num">${pc(r[4], 1)}</td><td class="num">${r[5] > 1 ? money0(r[5]) : '—'}</td></tr>`).join('')}</tbody></table></div>`, { ic: 'chart' })}
    ${box('Перевірте себе', quiz('equity', 'q', d, EQQ), { ic: 'bulb', side: `правильно ${quizOk(d, 'q', EQQ)} з ${EQQ.length}` })}`;
  },
  ready(S, d) {
    if ((d.ch || 0) < 1) return { ok: false, msg: 'Спробуйте свої суми й оцінку: змініть хоча б одне значення' };
    if (quizDone(d, 'q', EQQ) < EQQ.length) return { ok: false, msg: 'Дайте відповідь на всі запитання' };
    const ok = quizOk(d, 'q', EQQ);
    if (ok < 2) return { ok: false, msg: 'Перечитайте пояснення й виправте відповіді: потрібно хоча б 2 правильні' };
    return { ok: true, stars: ok === 3 ? 3 : 2 };
  },
});

/* ═════════ Гранти й конкурси ═════════ */
const talksOf = S => sumOf(Object.values(S.s.know).map(k => k.n));
const PROG = [
  { k: 'start', t: 'Старт-грант для молодих підприємців', prize: 100000, diff: 55, who: 'Для тих, хто починає: потрібна ідея, план і розмови з клієнтами.', kw: /клієнт|ринок|ціль/i, req: S => [['Заповнено хоча б три блоки бізнес-плану', S.canvasFilled() >= 3], ['Проведено хоча б три інтерв’ю', talksOf(S) >= 3]] },
  { k: 'school', t: 'Шкільний конкурс бізнес-ідей', prize: 20000, diff: 40, who: 'Приз за кращу ідею. Оцінюють ясність і оригінальність.', kw: /ідея|нов|унікал|вирішу/i, req: S => [['Описано проблему в бізнес-плані', (S.s.canvas?.problem || '').trim().length >= 10]] },
  { k: 'tech', t: 'Грант для технологічних стартапів', prize: 250000, diff: 70, who: 'Для тих, хто вже має продукт: оцінюють команду, прототип і потенціал росту.', kw: /продукт|технолог|масштаб|користувач/i, req: S => [['Запущена перша версія продукту', !!S.s.product.launched], ['Зареєстровано ФОП чи ТОВ', S.s.company.form !== 'none'], ['У команді є хоча б ще одна людина', S.s.team.length >= 1]] },
  { k: 'social', t: 'Соціальний грант', prize: 150000, diff: 62, who: 'Для проєктів, що допомагають людям. Оцінюють користь для суспільства.', kw: /допомог|суспіль|доступн|громад|діт/i, req: S => [['Описано, для кого цей проєкт', !!S.s.canvas?.segment], ['Проєкт розв’язує соціальну проблему (ваше твердження)', !!X(S, 'grants').social]] },
  { k: 'accel', t: 'Програма акселератора', prize: 30000, diff: 60, who: 'Невелика сума й ментори. Беруть тих, у кого вже є перша версія.', kw: /команд|зростан|клієнт|рух/i, req: S => [['Є перша версія або функції в розробці', S.s.product.launched || S.s.product.built.length > 0 || S.s.product.queue.length > 0]] },
  { k: 'world', t: 'Міжнародний конкурс стартапів', prize: 500000, diff: 80, who: 'Потрібні реальні клієнти й заявка англійською. Конкуренція дуже висока.', kw: /scal|growth|market|traction|клієнт/i, req: S => [['Щонайменше 100 платних клієнтів', S.paidUsers() >= 100], ['Підготовлено заявку англійською (ваше твердження)', !!X(S, 'grants').english]] },
];
const FIELDS = [['problem', 'Проблема й для кого', 'Школярі витрачають по 2 години на домашку й не розуміють пояснень…', 40], ['solution', 'Ваше рішення', 'Застосунок, який крок за кроком пояснює розв’язок…', 40], ['team', 'Команда', 'Я — засновник, розробляю продукт; допомагає…', 20], ['plan', 'На що підуть гроші й які результати очікуєте (з цифрами)', 'Реклама — 40%, розробка — 60%. За 6 місяців: 500 користувачів, 50 платних…', 40]];
function appScore(a, P) {
  const f = FIELDS.filter(([k, , , m]) => len(a[k]) >= m).length, txt = FIELDS.map(([k]) => a[k] || '').join(' '), nums = (txt.match(/\d+/g) || []).length;
  const parts = [['Заповнено всі розділи', f / FIELDS.length * 40, f === FIELDS.length], ['Конкретні цифри й терміни', Math.min(20, nums * 5), nums >= 4], ['Зрозуміло й без води', len(txt) >= 180 && len(txt) <= 900 ? 20 : len(txt) > 900 ? 12 : 8, len(txt) >= 180 && len(txt) <= 900], ['Відповідає критеріям програми', P.kw.test(txt) ? 20 : 6, P.kw.test(txt)]];
  return { score: Math.round(sumOf(parts.map(x => x[1]))), parts };
}
reg({
  id: 'grants', stage: 4, t: 'Гранти й конкурси', d: 'Перевірте, чи підходите, подайте заявку й дізнайтеся рішення журі.', icon: 'award', min: 20,
  intro: `Гранти й конкурси — гроші без відсотків і без частки, але їх треба заслужити. Перевірте критерії, напишіть заявку з цифрами й подайте її. Журі оцінить заявку й може відмовити: це нормальна частина процесу, а відгук допомагає покращити наступну.`,
  data: () => ({ prog: 'start', social: false, english: false, a: { start: {}, school: {}, tech: {}, social: {}, accel: {}, world: {} }, res: {} }),
  view(S, d) {
    const P = PROG.find(p => p.k === d.prog), reqs = P.req(S), ok = reqs.every(r => r[1]), a = d.a[P.k], sc = appScore(a, P);
    return `${box('Оберіть програму', `<div class="xg c2">${PROG.map(p => { const e = p.req(S).every(r => r[1]), r = d.res[p.k]; return `<div class="chcard ${d.prog === p.k ? 'on' : ''}">${xp('grants', 'prog', p.k, esc(p.t), d.prog === p.k, { cls: 'card' })}<small><b>${money0(p.prize)}</b> · ${e ? '<span class="xtag ok">підходите</span>' : '<span class="xtag">ще не підходите</span>'}${r ? ` · <span class="xtag ${r.res === 'win' ? 'ok' : r.res === 'fin' ? 'warn' : 'bad'}">${{ win: 'отримали', fin: 'фіналіст', no: 'відмова' }[r.res]}</span>` : ''}</small><p>${esc(p.who)}</p></div>`; }).join('')}</div>`, { ic: 'award' })}
    ${box(`Критерії: ${P.t}`, `${checks(reqs.map(r => [r[1], r[0]]))}${P.k === 'social' ? `<label class="switch" style="margin-top:8px"><input type="checkbox" data-exi="grants" data-p="social" ${d.social ? 'checked' : ''}><span></span>Так, наш проєкт розв’язує суспільну проблему</label>` : ''}${P.k === 'world' ? `<label class="switch" style="margin-top:8px"><input type="checkbox" data-exi="grants" data-p="english" ${d.english ? 'checked' : ''}><span></span>Заявку підготовлено англійською</label>` : ''}${ok ? '' : tip('Поки що ви не відповідаєте всім критеріям. Заявку можна написати, але журі, найімовірніше, відмовить. Краще повернутися, коли виконаєте вимоги.', 'warn')}`, { ic: 'check' })}
    ${box('Заявка', `${FIELDS.map(([k, l, ph]) => xin('grants', `a.${P.k}.${k}`, d, { label: l, area: true, rows: 3, max: 400, ph, cls: 'mt' })).join('')}`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const P = PROG.find(p => p.k === d.prog), a = d.a[P.k], sc = appScore(a, P), ok = P.req(S).every(r => r[1]), r = d.res[P.k];
    return `${box('Перевірка заявки', `<div class="uscore"><b>${sc.score}</b><span>з 100 · прохідний орієнтир журі ≈ ${P.diff}</span></div>${checks(sc.parts.map(x => [x[2], x[0]]))}<div class="xrow mt">${xb('grants', 'submit', r ? 'Подати ще раз' : 'Подати заявку', { cls: 'primary', ic: 'rocket', dis: sc.score < 30 })}${sc.score < 30 ? '<small class="muted">Спершу заповніть заявку хоча б наполовину.</small>' : ''}</div>
      ${r ? `<div class="jury ${r.res}"><h4>${r.res === 'win' ? 'Заявку підтримано!' : r.res === 'fin' ? 'Ви серед фіналістів' : 'Цього разу відмовили'}</h4><p>${esc(r.msg)}</p></div>` : ''}`, { ic: 'check' })}`;
  },
  acts: {
    submit(S, d, el, C) {
      const P = PROG.find(p => p.k === d.prog), a = d.a[P.k], sc = appScore(a, P), ok = P.req(S).every(r => r[1]), rr = mk(hash(P.k + JSON.stringify(a) + S.s.week)), cut = P.diff + rr.norm(0, 6) + (ok ? 0 : 25);
      const weak = sc.parts.filter(x => !x[2]).map(x => x[0].toLowerCase());
      const was = d.res[P.k]?.res === 'win'; let res = sc.score >= cut ? 'win' : sc.score >= cut - 12 ? 'fin' : 'no', msg;
      if (res === 'win') {
        msg = `Журі високо оцінило заявку (${sc.score} балів). ${was ? 'Гроші за цю програму ви вже отримали раніше.' : `На рахунок надійшло ${money0(P.prize)}.`}`;
        if (!was) { S.s.cash += P.prize; S.s.ledgerIn = (S.s.ledgerIn || 0) + P.prize; S.log?.(`Отримано грант: «${P.t}» — ${money0(P.prize)}.`); S.mail({ from: 'Журі конкурсу', kind: 'finance', title: `Вітаємо: «${P.t}»`, body: `Вашу заявку підтримано. Сума ${money0(P.prize)} зарахована на рахунок компанії.` }); }
      } else msg = `Заявка набрала ${sc.score} балів, а прохідний орієнтир цього разу — близько ${Math.round(cut)}. ${weak.length ? `Що покращити: ${weak.join('; ')}.` : 'Конкуренція була високою.'}${ok ? '' : ' Ви ще й не відповідали всім критеріям програми.'}`;
      d.res[P.k] = { res, score: sc.score, msg, w: S.s.week }; C.toast(res === 'win' ? `Грант отримано: ${money0(P.prize)}` : res === 'fin' ? 'Ви серед фіналістів' : 'Цього разу відмовили', res === 'win' ? 'good' : '');
    },
  },
  ready(S, d) {
    const rs = Object.values(d.res);
    if (!rs.length) return { ok: false, msg: 'Подайте хоча б одну заявку' };
    return { ok: true, stars: rs.some(r => r.res === 'win') ? 3 : rs.some(r => r.res === 'fin') || rs.length >= 2 ? 2 : 1 };
  },
});

/* ═════════ Пітч за хвилину (необов'язкова) ═════════ */
const PIT = [['problem', 'Проблема', 'Школярі витрачають по дві години на домашку й не розуміють пояснень учителя.'], ['solution', 'Рішення', 'Наш застосунок крок за кроком пояснює розв’язок за фото умови.'], ['market', 'Ринок', 'В Україні 900 тисяч школярів 12–17 років, і більшість має смартфон.'], ['trac', 'Що вже зроблено', 'За два тижні 40 учнів користувалися, 6 заплатили 70 ₴.'], ['team', 'Команда', 'Я пишу код; допомагає вчителька математики з 10-річним досвідом.'], ['ask', 'Що просите', 'Шукаю 300 тисяч ₴ на 6 місяців: реклама й розробка.']];
const wordsOf = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const pitchSc = d => { const p = d.p || {}, f = k => len(p[k]) >= 25, num = k => /\d/.test(p[k] || ''); const all = PIT.map(([k]) => p[k] || '').join(' ');
  return { angel: clamp((f('team') ? 30 : 0) + (num('trac') ? 30 : 0) + (f('problem') ? 20 : 0) + (f('ask') && num('ask') ? 20 : 0), 0, 100), fund: clamp((num('market') ? 30 : 0) + (num('trac') ? 30 : 0) + (f('solution') ? 15 : 0) + (f('ask') && num('ask') ? 25 : 0), 0, 100), accel: clamp((f('problem') ? 25 : 0) + (f('team') ? 25 : 0) + (f('solution') ? 25 : 0) + (num('trac') ? 25 : 0), 0, 100), words: wordsOf(all) }; };
reg({
  id: 'pitch', stage: 4, opt: true, t: 'Пітч за хвилину', d: 'Розкажіть про компанію інвестору за 60 секунд.', icon: 'mic', min: 12,
  intro: `${term('Пітч-дек', 'Пітч')} — коротка розповідь для інвестора: проблема, рішення, ринок, перші результати, команда й що ви просите. У нього є хвилина: говоріть конкретно й з цифрами. Складіть пітч і подивіться, кому з трьох типів інвесторів він сподобається.`,
  data: () => ({ p: {} }),
  view(S, d) { return `<div class="xg c2">${PIT.map(([k, t, ph], i) => `<div class="xbox"><header><span class="xtag">${i + 1}</span><h3>${t}</h3></header>${xin('pitch', `p.${k}`, d, { area: true, rows: 2, max: 160, ph: 'наприклад: ' + ph })}</div>`).join('')}</div>`; },
  live(S, d) {
    const r = pitchSc(d), w = r.words, sec = Math.round(w / 2.5);
    return `${box('Хто зацікавиться', `${[['angel', 'Бізнес-ангел', 'шукає сильну команду й перші результати'], ['fund', 'Венчурний фонд', 'шукає великий ринок і швидке зростання'], ['accel', 'Акселератор', 'шукає чітку проблему й готовність вчитися']].map(([k, t, h]) => `<div class="cmp"><span>${t}<small class="muted" style="display:block">${h}</small></span>${bar(r[k] / 100, { color: r[k] >= 70 ? 'var(--ok)' : '#e0a100', label: t })}<b>${r[k]}%</b></div>`).join('')}<p class="sm muted">Слів: ${w}. Це приблизно ${sec} с мовлення. ${sec > 70 ? 'Задовго: скоротіть до хвилини.' : sec < 25 ? 'Занадто коротко.' : 'Вкладаєтесь у хвилину.'}</p>`, { ic: 'chart' })}`;
  },
  ready(S, d) { const r = pitchSc(d); if (PIT.some(([k]) => len(d.p[k]) < 20)) return { ok: false, msg: 'Заповніть усі шість розділів хоча б одним реченням' }; if (!/\d/.test(d.p.trac || '') || !/\d/.test(d.p.ask || '')) return { ok: false, msg: 'Додайте цифри в «Що вже зроблено» й «Що просите»' }; return { ok: true, stars: 1 + (r.angel >= 70 ? 1 : 0) + (r.fund >= 70 ? 1 : 0) }; },
});
