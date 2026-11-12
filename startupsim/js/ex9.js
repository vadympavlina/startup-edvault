// Симулятор стартапу · додаткові вправи етапів 5–9: торг з інвестором, A/B-тест, подорож клієнта, складна розмова, ціна години, шахрайство, складні відсотки.
import { esc, sideChart } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, mk, hash, clamp, sumOf, money0, pc } from './ex-core.js';

const len = s => String(s || '').trim().length;
const fm = n => Math.round(n).toLocaleString('uk-UA').replace(/\s/g, ' ');

/* ═════════ Торг з інвестором ═════════ */
const TRAC = [['clients', 'Є 20 платних клієнтів', 1500000], ['proto', 'Є працюючий прототип', 900000], ['team', 'Команда з трьох людей', 900000], ['rev', 'Дохід від 30 тис. ₴ на місяць', 2500000], ['press', 'Є відгуки й згадки в медіа', 400000]];
const fairV = d => 1500000 + sumOf(TRAC.filter(t => d.tr.includes(t[0])).map(t => t[2]));
const BURN = 60000;
reg({
  id: 'negotiate', stage: 4, opt: true, cols: true, t: 'Переговори з інвестором', d: 'Запропонуйте суму й частку та проведіть торг із бізнес-ангелом.', icon: 'handshake', min: 18,
  intro: `Інвестор купує частку компанії, і ціна залежить від того, що ви вже довели. Оберіть, що у вас є, запропонуйте суму й частку, яку віддасте. Якщо попросите задорого, інвестор поверне зустрічну пропозицію: ви можете погодитись, поторгуватись або піти.`,
  data: () => ({ tr: [], m: 1000000, e: 15, st: 'open', r: 0, log: [], cnt: null, deal: null }),
  view(S, d) {
    const open = d.st === 'open', cnt = d.st === 'counter';
    return `${box('Що ви вже маєте', `<div class="xrow">${TRAC.map(t => xp('negotiate', 'tr', t[0], t[1], d.tr.includes(t[0]), { set: 'tog' })).join('')}</div><p class="sm muted">Інвестор бачить лише те, що ви можете показати. Чим більше доказів, тим вища оцінка.</p>`, { ic: 'star' })}
    ${box('Ваша пропозиція', `<div class="xg c2">${xsl('negotiate', 'm', d, { min: 200000, max: 3000000, step: 50000, label: 'Скільки просите', u: ' ₴' })}${xsl('negotiate', 'e', d, { min: 3, max: 40, step: 1, label: 'Яку частку віддаєте', u: '%' })}</div>
      <p class="sm">Це означає, що ви оцінюєте компанію в <b>${money0(d.m / (d.e / 100))}</b>.</p>
      <div class="xrow">${open ? xb('negotiate', 'offer', 'Запропонувати інвестору', { cls: 'primary', ic: 'handshake' }) : ''}${cnt ? `${xb('negotiate', 'accept', `Погодитись на ${d.cnt.e}%`, { cls: 'primary', ic: 'check' })}${d.cnt.final ? '' : xb('negotiate', 'mid', `Запропонувати ${Math.round((d.e + d.cnt.e) / 2)}%`, { ic: 'handshake' })}${xb('negotiate', 'walk', 'Піти з переговорів', { ic: 'x' })}` : ''}${d.st !== 'open' ? xb('negotiate', 'reset', 'Почати заново', { cls: 'ghost', ic: 'refresh' }) : ''}</div>`, { ic: 'coins' })}`;
  },
  live(S, d) {
    const dl = d.deal;
    return `${box('Розмова з Іриною, бізнес-ангелом', d.log.length ? `<div class="chat">${d.log.map(x => `<div class="msg ${x[0] === 'me' ? 'me' : 'her'}">${x[0] === 'me' ? '' : '<b>Ірина</b>'}<span>${esc(x[1])}</span></div>`).join('')}</div>` : `<p class="muted">Оберіть, що у вас є, і зробіть першу пропозицію.</p>`, { ic: 'users' })}
    ${dl ? box('Угоду укладено', `<div class="kpis3"><div><small>Інвестор отримує</small><b>${dl.e}%</b></div><div><small>Оцінка компанії</small><b>${money0(dl.m / (dl.e / 100))}</b></div><div><small>Грошей вистачить на</small><b>+${Math.round(dl.m / BURN)} міс.</b></div></div>${bar((100 - dl.e) / 100, { color: 'var(--acc)', label: 'Ваша частка' })}<p class="sm muted">Вам лишається ${100 - dl.e}% компанії. Після наступних раундів частка зменшуватиметься: це називається розмиванням.</p>`, { ic: 'check' }) : d.st === 'out' ? tip('Ви пішли з переговорів. Інколи це правильно, але гроші потрібні: спробуйте ще раз із іншою пропозицією.', 'bad') : ''}`;
  },
  acts: {
    offer(S, d, el, C) {
      if (!d.tr.length) { C?.toast?.('Спершу оберіть, що у вас є', 'bad'); return false; }
      const V = fairV(d), vo = d.m / (d.e / 100); d.r++; d.log.push(['me', `Пропоную ${fm(d.m)} ₴ за ${d.e}%. Це оцінка ${fm(vo)} ₴.`]);
      if (vo <= V * 1.1) { d.st = 'deal'; d.deal = { m: d.m, e: d.e }; d.log.push(['her', vo > V * 1.6 ? `Згодна, умови для мене дуже вигідні.` : 'Згодна, пропозиція чесна. Підписуємо.']); }
      else { const ec = clamp(Math.ceil(d.m / V * 100), 3, 49); d.cnt = { e: ec, final: false }; d.st = 'counter'; d.log.push(['her', `Така оцінка завелика для компанії, яка має ${d.tr.length === 1 ? 'лише одне підтвердження' : 'стільки підтверджень'}. Я вклала б ${fm(d.m)} ₴, якщо частка буде ${ec}%.`]); }
    },
    accept(S, d) { if (d.st !== 'counter') return false; d.deal = { m: d.m, e: d.cnt.e }; d.st = 'deal'; d.log.push(['me', `Погоджуюсь на ${d.cnt.e}%.`], ['her', 'Чудово, працюємо.']); },
    mid(S, d) {
      if (d.st !== 'counter' || d.cnt.final) return false;
      const em = Math.round((d.e + d.cnt.e) / 2), V = fairV(d); d.r++; d.log.push(['me', `Давайте посередині: ${em}%.`]);
      if (d.m / (em / 100) <= V * 1.2) { d.deal = { m: d.m, e: em }; d.st = 'deal'; d.log.push(['her', 'Гаразд, зустрінемось посередині.']); }
      else { d.cnt.final = true; d.log.push(['her', `Це все ще дорого. Моя остаточна пропозиція: ${d.cnt.e}%.`]); }
    },
    walk(S, d) { if (d.st !== 'counter') return false; d.st = 'out'; d.log.push(['me', 'Дякую, але я пошукаю інші варіанти.']); },
    reset(S, d) { d.st = 'open'; d.r = 0; d.log = []; d.cnt = null; d.deal = null; },
  },
  ready(S, d) {
    if (!d.deal) return { ok: false, msg: 'Укладіть угоду з інвестором' };
    const ef = d.deal.m / fairV(d) * 100;
    return { ok: true, stars: 1 + (d.deal.e <= ef + 3 ? 1 : 0) + (d.r <= 2 ? 1 : 0) };
  },
});

/* ═════════ A/B-тест ═════════ */
// [заголовок, справжня ймовірність кліку, пояснення]
const HL = [['Домашка без сліз за п’ять хвилин', 3.4, 'Конкретна вигода й час'], ['Найкращий застосунок для навчання', 1.2, 'Загальні слова без доказів'], ['Станьте відмінником без репетитора', 2.6, 'Обіцянка, але без деталей'], ['Допомога з уроками: сім днів безкоштовно', 4.1, 'Є що отримати й нічого не ризикуєш'], ['Революція в освіті вже тут', .9, 'Гучно, та незрозуміло, про що це'], ['Пояснюємо кожен крок, а не лише відповідь', 2.9, 'Показує відмінність від конкурентів']];
const BUD = 12000;
const phi = z => { const t = 1 / (1 + .2316419 * Math.abs(z)), p = .3989423 * Math.exp(-z * z / 2) * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
const conf = (ca, na, cb, nb) => { const pa = ca / na, pb = cb / nb, p = (ca + cb) / (na + nb); if (!p || p === 1) return 0; const z = (pa - pb) / Math.sqrt(p * (1 - p) * (1 / na + 1 / nb)); return clamp(2 * phi(Math.abs(z)) - 1, 0, .999); };
const spent = d => sumOf(d.runs.map(r => r.n * 2));
reg({
  id: 'abtest', stage: 5, opt: true, cols: true, t: 'A/B-тест заголовка', d: 'Порівняйте два заголовки на живих відвідувачах і зробіть висновок без самообману.', icon: 'chart', min: 15,
  intro: `Який заголовок краще, не вгадаєш: треба перевірити. Оберіть два варіанти, запустіть тест і подивіться, чи різниця справжня, чи просто випадок. Чим більше відвідувачів, тим надійніший висновок, але кожен відвідувач коштує гроші: бюджет ${money0(BUD)}.`,
  data: () => ({ a: null, b: null, n: 300, runs: [], win: null, why: '' }),
  view(S, d) {
    const left = BUD - spent(d), cost = d.n * 2;
    return `${box('Оберіть два заголовки', `<div class="xcol1 qlist">${HL.map((h, i) => `<div class="hl"><b>${esc(h[0])}</b><span class="xrow">${xp('abtest', 'a', i, 'Варіант A', d.a === i, { t: 'n' })}${xp('abtest', 'b', i, 'Варіант B', d.b === i, { t: 'n' })}</span></div>`).join('')}</div>`, { ic: 'search' })}
    ${box('Запустіть тест', `${xsl('abtest', 'n', d, { min: 100, max: 3000, step: 100, label: 'Відвідувачів на кожен варіант', u: '' })}<p class="sm">Тест коштує <b>${money0(cost)}</b>, у бюджеті лишилось <b>${money0(left)}</b>.</p><div class="xrow">${xb('abtest', 'run', 'Запустити тест', { cls: 'primary', ic: 'play', dis: d.a == null || d.b == null || d.a === d.b || cost > left })}${d.runs.length ? xb('abtest', 'clear', 'Скинути тести', { cls: 'ghost', ic: 'refresh' }) : ''}</div>`, { ic: 'play', side: `бюджет: ${money0(left)}` })}`;
  },
  live(S, d) {
    const tested = [...new Set(d.runs.flatMap(r => [r.a, r.b]))];
    return `${box('Результати', d.runs.length ? `<div class="xscroll"><table class="xtable"><thead><tr><th>Тест</th><th>Варіант A</th><th>Варіант B</th><th class="num">Надійність</th></tr></thead><tbody>${d.runs.map((r, i) => { const c = conf(r.ca, r.n, r.cb, r.n); return `<tr><td>${i + 1}. ${fm(r.n)} відвідувачів</td><td>${r.ca} кліків (${pc(r.ca / r.n, 1)})</td><td>${r.cb} кліків (${pc(r.cb / r.n, 1)})</td><td class="num"><b class="${c >= .95 ? 'pos' : c < .8 ? 'neg' : ''}">${Math.round(c * 100)}%</b></td></tr>`; }).join('')}</tbody></table></div><p class="sm muted">Надійність показує, наскільки ймовірно, що різниця не випадкова. Для рішення потрібно хоча б 90–95%.</p>` : `<p class="muted">Оберіть два заголовки й запустіть перший тест.</p>`, { ic: 'chart' })}
    ${tested.length ? box('Ваш вибір', `<p class="sm muted">Який заголовок ви залишаєте?</p><div class="xrow">${tested.map(i => xp('abtest', 'win', i, esc(HL[i][0]), d.win === i, { t: 'n' })).join('')}</div>${xin('abtest', 'why', d, { area: true, rows: 2, max: 200, label: 'Чому ви впевнені у виборі?', ph: 'Різниця стабільна, бо ми перевіряли на…' })}`, { ic: 'flag' }) : ''}`;
  },
  acts: {
    run(S, d, el, C) {
      if (d.a == null || d.b == null || d.a === d.b) { C?.toast?.('Оберіть два різні заголовки', 'bad'); return false; }
      if (d.n * 2 > BUD - spent(d)) { C?.toast?.('Не вистачає бюджету', 'bad'); return false; }
      const r = mk(hash(`${d.a}|${d.b}|${d.n}|${d.runs.length}`)), ct = i => { const p = HL[i][1] / 100; return clamp(Math.round(r.norm(d.n * p, Math.sqrt(d.n * p * (1 - p)))), 0, d.n); };
      d.runs.push({ a: d.a, b: d.b, n: d.n, ca: ct(d.a), cb: ct(d.b) });
    },
    clear(S, d) { d.runs = []; d.win = null; },
  },
  ready(S, d) {
    if (!d.runs.length) return { ok: false, msg: 'Запустіть хоча б один тест' };
    if (d.win == null) return { ok: false, msg: 'Оберіть заголовок-переможець' };
    if (len(d.why) < 15) return { ok: false, msg: 'Поясніть, чому ви впевнені' };
    const tested = [...new Set(d.runs.flatMap(r => [r.a, r.b]))], best = tested.reduce((m, i) => HL[i][1] > HL[m][1] ? i : m, tested[0]);
    const c = Math.max(0, ...d.runs.filter(r => r.a === d.win || r.b === d.win).map(r => conf(r.ca, r.n, r.cb, r.n)));
    return { ok: true, stars: 1 + (d.win === best ? 1 : 0) + (c >= .9 ? 1 : 0) };
  },
});

/* ═════════ Подорож клієнта ═════════ */
const JS = [['aware', 'Дізнався', ['Реклама в соцмережах', 'Порада друга', 'Пошук у Google', 'Допис блогера']], ['compare', 'Порівняв', ['Сайт із цінами', 'Відгуки клієнтів', 'Консультація в чаті', 'Таблиця порівняння']], ['buy', 'Купив', ['Оплата в один клік', 'Реєстрація з паролем', 'Дзвінок менеджеру', 'Оплата частинами']], ['use', 'Користується', ['Підказки першого запуску', 'Відеоінструкція', 'Підтримка в чаті', 'Без жодних пояснень']], ['share', 'Радить', ['Реферальна програма', 'Запит відгуку', 'Спільнота клієнтів', 'Розсилка новин']]];
reg({
  id: 'journey', stage: 5, opt: true, cols: true, t: 'Подорож клієнта', d: 'Пройдіть шляхом клієнта від першої реклами до поради друзям і знайдіть, де він розчаровується.', icon: 'compass', min: 15,
  intro: `Клієнт не купує за одну мить: він проходить кілька кроків, і на кожному відчуває різне. Для кожного кроку оберіть точку контакту, оцініть настрій клієнта й запишіть, що може піти не так. Найнижча точка кривої показує, де ви втрачаєте людей.`,
  data: () => ({ tp: {}, em: { aware: 3, compare: 3, buy: 3, use: 3, share: 3 }, pain: {}, fix: '' }),
  view(S, d) {
    return JS.map(([k, n, tps], i) => box(`${i + 1}. ${n}`, `<div class="xrow">${tps.map(t => xp('journey', `tp.${k}`, t, t, d.tp[k] === t)).join('')}</div><div class="xg c2" style="margin-top:8px">${xsl('journey', `em.${k}`, d, { min: 1, max: 5, step: 1, label: 'Настрій клієнта: від 1 (злий) до 5 (в захваті)' })}${xin('journey', `pain.${k}`, d, { label: 'Що може піти не так?', ph: 'Клієнт не розуміє, як…', max: 100 })}</div>`, { ic: ['megaphone', 'search', 'card', 'rocket', 'heart'][i] })).join('');
  },
  live(S, d) {
    const pts = JS.map(([k], i) => [50 + i * 100, 118 - (d.em[k] - 1) * 24]), low = JS.reduce((m, [k], i) => d.em[k] < d.em[JS[m][0]] ? i : m, 0);
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('');
    return `${box('Крива настрою', `<svg class="jcurve" viewBox="0 0 500 160" role="img" aria-label="Крива настрою клієнта"><path d="M50,22H450M50,70H450M50,118H450" stroke="#e1e6ea" stroke-width="1"/><path d="${path}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === low ? 8 : 5.5}" fill="${i === low ? '#e0503f' : '#6366f1'}" stroke="#fff" stroke-width="2"/><text x="${p[0]}" y="150" text-anchor="middle" font-size="13" font-weight="600" fill="#44506a">${JS[i][1]}</text>`).join('')}</svg>
      ${tip(`Найнижча точка: <b>«${JS[low][1]}»</b> (${d.em[JS[low][0]]} з 5). Саме тут клієнти йдуть, тож почніть із цього кроку.`, d.em[JS[low][0]] <= 2 ? 'bad' : '')}${xin('journey', 'fix', d, { area: true, rows: 2, max: 200, label: `Що ви зміните на кроці «${JS[low][1]}»?`, ph: 'Додам підказку, спростити оплату…' })}`, { ic: 'chart' })}`;
  },
  ready(S, d) {
    const miss = JS.filter(([k]) => !d.tp[k]).length, pains = JS.filter(([k]) => len(d.pain[k]) >= 5);
    if (miss) return { ok: false, msg: `Оберіть точку контакту на кожному кроці: лишилось ${miss}` };
    if (pains.length < 2) return { ok: false, msg: 'Опишіть, що може піти не так, хоча б на двох кроках' };
    if (len(d.fix) < 15) return { ok: false, msg: 'Напишіть, що зміните на найнижчій точці' };
    const low = JS.reduce((m, [k]) => d.em[k] < d.em[m] ? k : m, JS[0][0]);
    return { ok: true, stars: 1 + (len(d.pain[low]) >= 5 ? 1 : 0) + (pains.length >= 4 ? 1 : 0) };
  },
});

/* ═════════ Складна розмова ═════════ */
// наслідки: [результат, стосунки, швидкість]
const CON = [
  { s: 'Дизайнерка вже вчетверте здає роботу із запізненням. Вона виглядає втомленою, а у вас дедлайн.', o: [['Публічно нагадати всій команді про терміни', [1, -2, 1], 'Публічний докір швидко працює, але псує довіру.'], ['Поговорити наодинці: що саме заважає?', [2, 2, 0], 'Спершу з’ясовуємо причину: це часто перевантаження чи нечіткі вимоги.', 1], ['Мовчки переробити самому чи самій', [1, -1, -2], 'Проблема лишилась, а ви ще й перевантажились.']] },
  { s: 'Двоє розробників сперечаються, яку технологію взяти. Робота стоїть.', o: [['Вирішити самому й закрити тему', [0, -2, 2], 'Швидко, але люди відчують, що їх не почули.'], ['Дати по дню на прототип і порівняти за критеріями', [2, 1, 0], 'Рішення спирається на факти, а не на гордість.', 1], ['Голосувати без обговорення', [0, -1, 1], 'Більшість не завжди має рацію, а меншість ображається.']] },
  { s: 'Клієнт просить змінити половину проєкту в останній день. Команда обурена.', o: [['Погодитись на все, аби не сваритись', [0, -2, -2], 'Команда виснажена, а клієнт зрозуміє, що так можна завжди.'], ['Показати, що змінить кожна правка, й запропонувати варіанти', [2, 1, 0], 'Клієнт бачить ціну змін і сам обирає, а команда почувається почутою.', 1], ['Відмовити: усе вже закрито', [-1, 0, 1], 'Чесно, але ви можете втратити клієнта без спроби домовитись.']] },
];
const MET = ['Результат', 'Стосунки', 'Швидкість'];
reg({
  id: 'conflict', stage: 6, opt: true, cols: true, t: 'Складна розмова', d: 'Розв’яжіть три конфліктні ситуації в команді й подивіться, що станеться з результатом і стосунками.', icon: 'users', min: 12,
  intro: `Керівник проводить більшу частину часу у складних розмовах. У кожному варіанті є ціна: щось виграєте, щось втратите. Оберіть дію для кожної ситуації, подивіться на шкали «Результат», «Стосунки» й «Швидкість» і підготуйте першу фразу розмови.`,
  data: () => ({ a: {}, say: '' }),
  view(S, d) {
    return `${CON.map((c, i) => box(`Ситуація ${i + 1}`, `<p class="jt" style="margin:0 0 8px">${esc(c.s)}</p><div class="xcol1 qlist">${c.o.map(([t, , why, best], k) => `<div class="opt ${d.a[i] === k ? (best ? 'ok' : 'warn') : ''}">${xp('conflict', `a.${i}`, k, esc(t), d.a[i] === k, { t: 'n', cls: 'card' })}${d.a[i] === k ? `<p class="sm">${esc(why)}</p>` : ''}</div>`).join('')}</div>`, { ic: 'users' })).join('')}
    ${box('Перша фраза', xin('conflict', 'say', d, { area: true, rows: 2, max: 200, label: 'З якої фрази ви почнете найважчу розмову?', ph: 'Помічаю, що… Допоможи мені зрозуміти, що…', hint: 'Говоріть про факти й свої відчуття, а не про характер людини.' }), { ic: 'mic' })}`;
  },
  live(S, d) {
    const v = MET.map((n, j) => 5 + sumOf(CON.map((c, i) => d.a[i] != null ? c.o[d.a[i]][1][j] : 0)));
    return `${box('Стан команди', MET.map((n, j) => `<div class="cmt"><span>${n}</span>${bar(clamp(v[j], 0, 10) / 10, { color: v[j] >= 6 ? 'var(--ok)' : v[j] <= 3 ? '#d33' : '#e0a100', label: n })}<b>${clamp(v[j], 0, 10)}</b></div>`).join('') + `<p class="sm muted">Початкове значення кожної шкали: 5. Хороша розмова піднімає результат і стосунки одночасно.</p>`, { ic: 'chart' })}`;
  },
  ready(S, d) {
    const n = CON.filter((c, i) => d.a[i] != null).length, best = CON.filter((c, i) => d.a[i] != null && c.o[d.a[i]][3]).length;
    if (n < CON.length) return { ok: false, msg: `Оберіть дію в кожній ситуації: лишилось ${CON.length - n}` };
    if (len(d.say) < 15) return { ok: false, msg: 'Напишіть першу фразу розмови' };
    return { ok: true, stars: clamp(best, 1, 3) };
  },
});

/* ═════════ Ціна години фрилансера ═════════ */
const PKG = [['Старт', 0, 5], ['Стандарт', .05, 12], ['Преміум', .1, 25]];
const rate = d => { const days = d.days - d.vac / 12, billable = Math.max(1, days * d.hrs * d.bill / 100), gross = (d.inc + 1760) / .95; return { billable, gross, rate: gross / billable }; };
reg({
  id: 'rate', stage: 7, opt: true, cols: true, t: 'Ціна години фрилансера', d: 'Порахуйте свою ставку та зберіть три пакети послуг.', icon: 'wallet', min: 18,
  intro: `Початківці беруть ціну «з голови» й ображаються, що грошей мало. Але не вся ваша робота оплачується: потрібен час на пошук клієнтів, листування, відпустку й хвороби. Порахуйте ставку від бажаного доходу й зберіть три пакети: Старт, Стандарт і Преміум.`,
  data: () => ({ inc: 40000, days: 21, hrs: 6, bill: 65, vac: 20, pk: PKG.map(p => ({ n: p[0], h: p[2] })), pitch: '' }),
  view(S, d) {
    return `${box('Ваш місяць', `<div class="xg c2">${xsl('rate', 'inc', d, { min: 15000, max: 120000, step: 1000, label: 'Бажаний дохід «на руки»', u: ' ₴' })}${xsl('rate', 'days', d, { min: 15, max: 23, step: 1, label: 'Робочих днів на місяць', u: '' })}${xsl('rate', 'hrs', d, { min: 3, max: 9, step: 1, label: 'Годин роботи на день', u: ' год' })}${xsl('rate', 'bill', d, { min: 30, max: 95, step: 5, label: 'Яка частка часу оплачується клієнтами', u: '%' })}${xsl('rate', 'vac', d, { min: 0, max: 45, step: 1, label: 'Днів відпустки й хвороби на рік', u: '' })}</div><p class="sm muted">Решта часу йде на пошук клієнтів, листування, навчання й організацію роботи. Для більшості фрилансерів оплачується 50–70% часу.</p>`, { ic: 'clock' })}
    ${box('Три пакети', d.pk.map((p, i) => `<div class="xg c2 pkrow">${xin('rate', `pk.${i}.n`, d, { label: `Пакет ${i + 1}: назва`, max: 20 })}${xsl('rate', `pk.${i}.h`, d, { min: 1, max: 60, step: 1, label: 'Скільки годин роботи входить', u: ' год' })}</div>`).join('') + xin('rate', 'pitch', d, { area: true, rows: 2, max: 200, label: 'Що отримує клієнт у пакеті «Преміум», чого немає в інших?', ph: 'Правки без обмежень, підтримка 30 днів, пріоритетна відповідь…' }), { ic: 'box' })}`;
  },
  live(S, d) {
    const r = rate(d), lvl = r.rate < 350 ? 'початківець' : r.rate < 700 ? 'середній рівень' : 'досвідчений спеціаліст';
    const pr = d.pk.map((p, i) => Math.round(r.rate * p.h * (1 - PKG[i][1]) / 10) * 10);
    return `${box('Ваша ставка', `<div class="kpis3"><div><small>Потрібно «до податків»</small><b>${money0(r.gross)}</b></div><div><small>Оплачуваних годин</small><b>${Math.round(r.billable)}</b></div><div><small>Ставка за годину</small><b>${money0(r.rate)}</b></div></div><p class="sm muted">Враховано єдиний податок 5% і приблизно ${money0(1760)} єдиного внеску на місяць (навчальні цифри). Така ставка відповідає рівню: ${lvl}.</p>`, { ic: 'coins' })}
    ${box('Пакети', `<div class="pkgs">${d.pk.map((p, i) => `<div class="pkg ${i === 2 ? 'best' : ''}"><b>${esc(p.n || `Пакет ${i + 1}`)}</b><strong>${money0(pr[i])}</strong><small>${p.h} год · знижка ${Math.round(PKG[i][1] * 100)}%</small></div>`).join('')}</div>${checks([[pr[0] < pr[1] && pr[1] < pr[2], 'Ціни зростають від пакета до пакета'], [pr[1] >= pr[0] * 1.2 && pr[2] >= pr[1] * 1.2, 'Між пакетами різниця хоча б 20%', 'Збільште різницю в годинах, щоб клієнт бачив вигоду від переходу'], [d.bill <= 75, 'Частка оплачуваного часу реалістична', 'Майже ніхто не працює 100% часу: додайте час на пошук клієнтів і організацію']])}`, { ic: 'box' })}`;
  },
  ready(S, d) {
    const r = rate(d), pr = d.pk.map((p, i) => r.rate * p.h * (1 - PKG[i][1]));
    if (d.pk.some(p => len(p.n) < 3)) return { ok: false, msg: 'Назвіть усі три пакети' };
    if (!(pr[0] < pr[1] && pr[1] < pr[2])) return { ok: false, msg: 'Ціни пакетів мають зростати: додайте годин у старших' };
    if (pr[1] < pr[0] * 1.2 || pr[2] < pr[1] * 1.2) return { ok: false, msg: 'Між пакетами має бути різниця хоча б 20%' };
    if (d.bill > 90) return { ok: false, msg: 'Не вийде оплачувати 90% часу: зменште частку' };
    return { ok: true, stars: 1 + (d.bill <= 75 ? 1 : 0) + (len(d.pitch) >= 20 ? 1 : 0) };
  },
});

/* ═════════ Шахрайство чи ні ═════════ */
const SC = [
  ['SMS', '«Вашу картку заблоковано. Перейдіть за посиланням bank-secure.top і введіть дані картки».', 'scam', 'Незнайомий сайт, тиск часом і прохання ввести дані картки. Справжній банк так не пише.'],
  ['Застосунок банку', '«Платіж 320 ₴ у кав’ярні. Це ви? Якщо ні, зателефонуйте за номером на звороті картки».', 'safe', 'Повідомлення в офіційному застосунку, без посилань; телефон вам відомий із картки.'],
  ['Повідомлення в месенджері', '«Я з підтримки маркетплейсу. Продиктуйте код із SMS, щоб підтвердити оголошення».', 'scam', 'Коди з SMS не диктують нікому й ніколи: ними підтверджують платежі й входи.'],
  ['Лист', '«Рахунок №4821 за хостинг: 249 ₴. Оплатіть в особистому кабінеті» (ви справді користуєтесь цим сервісом).', 'safe', 'Знайомий сервіс, очікуваний платіж, оплата в кабінеті, а не за чужим посиланням.'],
  ['Замовник у чаті', '«Вам помилково переплачено 5 000 ₴, поверніть різницю на іншу картку».', 'scam', 'Класична схема з переплатою: перший платіж потім скасовується, а ваші гроші зникають.'],
  ['Лист', '«Вітаємо! Ви виграли 50 000 ₴. Сплатіть комісію 500 ₴, щоб отримати приз».', 'scam', 'За справжній виграш не просять платити наперед.'],
  ['Месенджер', 'Знайомий із нового номера: «Скинь 2 000 до зарплати, я в скруті».', 'scam', 'Акаунт могли зламати. Спершу зателефонуйте йому на старий номер.'],
  ['Лист', 'Бухгалтерія нагадує сплатити ЄСВ до 20 числа; реквізити лежать у кабінеті податкової, яким ви користуєтесь.', 'safe', 'Очікуване нагадування, реквізити береться з вашого кабінету, а не з листа.'],
];
const RULES = [['code', 'Не диктую нікому коди з SMS і застосунків'], ['link', 'Не переходжу за посиланнями з повідомлень: відкриваю сайт сам'], ['call', 'Якщо щось тривожить, телефоную в банк за номером із картки'], ['rush', 'Коли тиснуть «зараз або ніколи», роблю паузу'], ['name', 'Перевіряю відправника: адресу, номер, домен']];
reg({
  id: 'scam', stage: 8, opt: true, t: 'Шахрайство чи ні?', d: 'Розпізнайте шахрайські повідомлення й складіть свої правила безпеки.', icon: 'shield', min: 12,
  intro: `Шахраї рідко ламають банк: вони ламають людину. Вони тиснуть часом, налякують або обіцяють легкі гроші. Прочитайте вісім повідомлень, позначте, які з них небезпечні, і складіть набір власних правил.`,
  data: () => ({ a: {}, rules: [] }),
  view(S, d) {
    return `${box('Що з цього шахрайство?', SC.map(([ch, txt, ok, why], i) => `<div class="quiz"><span class="xtag">${esc(ch)}</span> <b>${esc(txt)}</b><div class="xrow" style="margin-top:6px">${xp('scam', `a.${i}`, 'safe', 'Безпечно', d.a[i] === 'safe', { cls: d.a[i] ? (ok === 'safe' ? 'right' : d.a[i] === 'safe' ? 'wrong' : '') : '' })}${xp('scam', `a.${i}`, 'scam', 'Шахрайство', d.a[i] === 'scam', { cls: d.a[i] ? (ok === 'scam' ? 'right' : d.a[i] === 'scam' ? 'wrong' : '') : '' })}</div>${d.a[i] ? `<p class="x-tip ${d.a[i] === ok ? 'ok' : 'warn'}">${icon(d.a[i] === ok ? 'check' : 'info', 16)}<span>${d.a[i] === ok ? 'Так. ' : 'Ні. '}${esc(why)}</span></p>` : ''}</div>`).join(''), { ic: 'alert', side: `правильно ${SC.filter(([, , ok], i) => d.a[i] === ok).length} з ${SC.length}` })}
    ${box('Мої правила безпеки', `<div class="xrow">${RULES.map(([k, t]) => xp('scam', 'rules', k, t, d.rules.includes(k), { set: 'tog' })).join('')}</div><p class="sm muted">Обрано: <b>${d.rules.length} з ${RULES.length}</b>.</p>`, { ic: 'shield' })}`;
  },
  ready(S, d) {
    const n = Object.keys(d.a).length, ok = SC.filter(([, , o], i) => d.a[i] === o).length;
    if (n < SC.length) return { ok: false, msg: `Оцініть усі повідомлення: лишилось ${SC.length - n}` };
    if (ok < 6) return { ok: false, msg: 'Забагато помилок: перечитайте пояснення й виправте відповіді' };
    if (d.rules.length < 3) return { ok: false, msg: 'Оберіть хоча б три правила безпеки' };
    return { ok: true, stars: 1 + (ok === SC.length ? 1 : 0) + (d.rules.length >= 4 ? 1 : 0) };
  },
});

/* ═════════ Час і відсотки ═════════ */
const STR = { mat: ['Під матрац', 0, '#94a3b8'], dep: ['Депозит', 9, '#16a34a'], bond: ['Облігації', 12, '#f59e0b'], etf: ['Індексний фонд', 11, '#6366f1'] };
function grow(d, k) {
  const rm = Math.pow(1 + STR[k][1] / 100, 1 / 12) - 1, nom = [d.start], real = [d.start];
  let b = d.start;
  for (let y = 1; y <= d.yrs; y++) { for (let m = 0; m < 12; m++) b = b * (1 + rm) + d.mo; nom.push(b); real.push(b / Math.pow(1 + d.inf / 100, y)); }
  return { nom, real };
}
reg({
  id: 'compound', stage: 8, opt: true, cols: true, t: 'Час і відсотки', d: 'Подивіться, як гроші ростуть з часом і що з ними робить інфляція.', icon: 'trend', min: 15,
  intro: `Гроші, що лежать без діла, не просто стоять на місці: інфляція щороку їх «з’їдає». Складні відсотки працюють навпаки: відсотки починають приносити відсотки. Оберіть стратегії, змініть суму й строк і порівняйте, що станеться з реальною купівельною спроможністю. Цифри дохідності умовні й навчальні.`,
  data: () => ({ pick: ['mat', 'dep'], mo: 2000, start: 10000, yrs: 10, inf: 8, real: false, q: '', note: '' }),
  view(S, d) {
    return `${box('Що порівнюємо', `<div class="xrow">${Object.entries(STR).map(([k, s]) => xp('compound', 'pick', k, s[0], d.pick.includes(k), { set: 'tog', sub: `умовно ${s[1]}% на рік` })).join('')}</div>`, { ic: 'trend' })}
    ${box('Параметри', `<div class="xg c2">${xsl('compound', 'start', d, { min: 0, max: 100000, step: 1000, label: 'Початкова сума', u: ' ₴' })}${xsl('compound', 'mo', d, { min: 0, max: 20000, step: 500, label: 'Щомісячний внесок', u: ' ₴' })}${xsl('compound', 'yrs', d, { min: 1, max: 30, step: 1, label: 'Строк', u: ' р.' })}${xsl('compound', 'inf', d, { min: 0, max: 20, step: 1, label: 'Інфляція на рік', u: '%' })}</div>
      <div class="xrow" style="margin-top:10px">${xp('compound', 'real', '0', 'Номінальні суми', !d.real, { t: 'b' })}${xp('compound', 'real', '1', 'З урахуванням інфляції', d.real, { t: 'b' })}</div>`, { ic: 'wrench' })}
    ${box('Правило 72', `<p class="sm">Щоб приблизно дізнатись, за скільки років гроші подвоїться, поділіть 72 на річний відсоток. За скільки років подвоїться сума під <b>12%</b> на рік?</p><div class="xg c2">${xin('compound', 'q', d, { max: 3, label: 'Відповідь у роках', ph: '…' })}</div>${d.q !== '' ? `<p class="x-tip ${Math.abs(+d.q - 6) <= 1 ? 'ok' : 'warn'}">${icon(Math.abs(+d.q - 6) <= 1 ? 'check' : 'info', 16)}<span>${Math.abs(+d.q - 6) <= 1 ? 'Так: 72 ÷ 12 = 6 років.' : '72 ÷ 12 = 6 років. Спробуйте ще раз або перерахуйте.'}</span></p>` : ''}${xin('compound', 'note', d, { area: true, rows: 2, max: 240, label: 'Що ви зрозуміли про гроші й час?', ph: 'Чим раніше починаю, тим…' })}`, { ic: 'bulb' })}`;
  },
  live(S, d) {
    const rows = d.pick.map(k => ({ k, g: grow(d, k) })), put = d.start + d.mo * 12 * d.yrs, key = d.real ? 'real' : 'nom';
    return `${box(d.real ? 'Реальна вартість грошей' : 'Скільки буде грошей', rows.length ? `${sideChart(rows.map(r => ({ v: r.g[key], color: STR[r.k][2], label: STR[r.k][0] })), { labels: Array.from({ length: d.yrs + 1 }, (_, i) => String(i)), fmt: x => x >= 1e6 ? (x / 1e6).toFixed(1) + 'M' : Math.round(x / 1000) + 'k' })}
      <div class="xscroll"><table class="xtable"><thead><tr><th>Стратегія</th><th class="num">Номінально</th><th class="num">З інфляцією</th><th class="num">Відсотки принесли</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(STR[r.k][0])}</td><td class="num">${money0(r.g.nom.at(-1))}</td><td class="num">${money0(r.g.real.at(-1))}</td><td class="num pos">+${money0(r.g.nom.at(-1) - put)}</td></tr>`).join('')}</tbody></table></div>
      <p class="sm muted">Ви внесете власних грошей: ${money0(put)}. «З інфляцією»: скільки ці гроші купили б у сьогоднішніх цінах. Різниця між першою й другою колонкою — те, що забрала інфляція.</p>` : `<p class="muted">Оберіть хоча б одну стратегію.</p>`, { ic: 'chart' })}`;
  },
  ready(S, d) {
    if (d.pick.length < 2) return { ok: false, msg: 'Порівняйте хоча б дві стратегії' };
    if (!d.real) return { ok: false, msg: 'Подивіться на суми з урахуванням інфляції' };
    if (Math.abs(+d.q - 6) > 1 || d.q === '') return { ok: false, msg: 'Дайте відповідь на запитання про правило 72' };
    if (len(d.note) < 15) return { ok: false, msg: 'Запишіть, що ви зрозуміли' };
    return { ok: true, stars: 1 + (d.yrs >= 10 ? 1 : 0) + (d.pick.length >= 3 ? 1 : 0) };
  },
});
