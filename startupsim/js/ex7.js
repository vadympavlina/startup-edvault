// Симулятор стартапу · вправи етапу 9 «Платежі й капітал»: платіжні інструменти, види грошей, інвестиційний портфель, крипта й трейдинг.
import { esc, term, wideChart } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, mk, hash, clamp, sumOf, pc, money0, quiz, quizOk, quizDone } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Віртуальні банки й картки ═════════ */
const TOOLS = { card: 'Фізична картка', vcard: 'Віртуальна картка з лімітом', onecard: 'Одноразова картка', wallet: 'Apple Pay / Google Pay', p2p: 'Переказ за номером картки', iban: 'Рахунок (IBAN)', link: 'Платіжне посилання або QR', cash: 'Готівка' };
const SIT = [
  ['Ви купуєте річну підписку на новому, малознайомому сайті.', 'onecard', 'Одноразова картка знищується після платежу: сайт не зможе списати зайве.'],
  ['Платите за каву в кафе, вам лінь діставати гаманець.', 'wallet', 'Apple/Google Pay зручний і безпечний: номер вашої картки продавець не бачить.'],
  ['Ви купуєте в інтернет-магазині, який знаєте давно.', 'vcard', 'Віртуальна картка з лімітом: навіть якщо дані витечуть, більше за ліміт не спишуть.'],
  ['Клієнт-фрилансер із іншої країни має заплатити вам 1 000 € за роботу.', 'iban', 'Для приймання «серйозних» платежів потрібен рахунок із IBAN: так зручно й прозоро для обох.'],
  ['Ви хочете швидко отримати від клієнта невелику оплату за послугу в чаті.', 'link', 'Платіжне посилання або QR: клієнт платить за секунди, а ви бачите платіж у кабінеті.'],
  ['Ви в маленькому селі, де не приймають картки й немає терміналів.', 'cash', 'Є місця, де працює лише готівка.'],
  ['Друг просить скинути йому гроші на каву. У вас немає його IBAN.', 'p2p', 'Переказ за номером картки зручний між знайомими. Незнайомцям так не переказуйте.'],
  ['Ви їдете в поїздку: треба платити за таксі, готелі, їжу.', 'card', 'Фізична картка потрібна, якщо десь не працює телефон. Доповніть її мобільним гаманцем.'],
];
const SEC = [['d3', 'Увімкнено підтвердження платежів (3-D Secure)'], ['push', 'Сповіщення про кожну операцію'], ['limit', 'Встановлено денний ліміт'], ['sep', 'Окрема картка лише для інтернету'], ['pin', 'Не зберігаю дані картки на чужих пристроях']];
reg({
  id: 'paytools', stage: 8, t: 'Віртуальні банки й картки', d: 'Оберіть найкращий платіжний інструмент і налаштуйте захист.', icon: 'card', min: 15,
  intro: `Сьогодні гроші — це не лише готівка. ${term('Віртуальна картка', 'Віртуальні картки')}, мобільні гаманці, рахунки IBAN, платіжні посилання: у кожного своє призначення й свої ризики. Обирайте інструмент під ситуацію й налаштуйте захист.`,
  data: () => ({ a: {}, sec: [], lim: 5000, q: {} }),
  view(S, d) {
    return `${box('Що обрати в кожній ситуації?', SIT.map(([q, ok, why], i) => `<div class="quiz"><b>${esc(q)}</b><div class="xrow">${Object.entries(TOOLS).map(([k, t]) => xp('paytools', `a.${i}`, k, t, d.a[i] === k, { cls: d.a[i] ? (k === ok ? 'right' : d.a[i] === k ? 'wrong' : '') : '' })).join('')}</div>${d.a[i] ? `<p class="x-tip ${d.a[i] === ok ? 'ok' : 'warn'}">${icon(d.a[i] === ok ? 'check' : 'info', 16)}<span>${d.a[i] === ok ? 'Так. ' : `Краще: ${TOOLS[ok].toLowerCase()}. `}${esc(why)}</span></p>` : ''}</div>`).join(''), { ic: 'card', side: `правильно ${SIT.filter(([, ok], i) => d.a[i] === ok).length} з ${SIT.length}` })}
    ${box('Мій безпечний набір', `<div class="xrow">${SEC.map(([k, t]) => xp('paytools', 'sec', k, t, d.sec.includes(k), { set: 'tog' })).join('')}</div>${d.sec.includes('limit') ? xsl('paytools', 'lim', d, { min: 500, max: 50000, step: 500, label: 'Денний ліміт на інтернет-платежі', u: ' ₴' }) : ''}<p class="sm muted">Безпека: <b>${d.sec.length} з ${SEC.length}</b>. ${d.sec.length >= 4 ? 'Ваші гроші добре захищені.' : 'Додайте ще кілька налаштувань.'}</p>`, { ic: 'shield' })}`;
  },
  ready(S, d) {
    const n = Object.keys(d.a).length, ok = SIT.filter(([, o], i) => d.a[i] === o).length;
    if (n < SIT.length) return { ok: false, msg: `Дайте відповідь у всіх ситуаціях: лишилось ${SIT.length - n}` };
    if (ok < 6) return { ok: false, msg: 'Забагато помилок: перечитайте пояснення й виправте відповіді' };
    if (d.sec.length < 3) return { ok: false, msg: 'Оберіть хоча б три налаштування безпеки' };
    return { ok: true, stars: 1 + (ok === SIT.length ? 1 : 0) + (d.sec.length >= 4 ? 1 : 0) };
  },
});

/* ═════════ Види грошей ═════════ */
// порядок властивостей у таблиці (1 — властивість підходить)
const PR = ['Випускає держава', 'Можна потримати в руках', 'Законний платіжний засіб', 'Без центрального емітента', 'Ціна сильно коливається', 'Приймають майже скрізь', 'Існує в цифровому вигляді', 'Діє лише в одній компанії чи грі'];
const MTRUTH = {
  'Готівка': [1, 1, 1, 0, 0, 1, 0, 0], 'Гроші на картці': [1, 0, 1, 0, 0, 1, 1, 0], 'Електронні гроші (гаманець)': [0, 0, 0, 0, 0, 0, 1, 0], 'Криптовалюта': [0, 0, 0, 1, 1, 0, 1, 0],
  'Золото й метали': [0, 1, 0, 0, 1, 0, 0, 0], 'Бонуси магазину': [0, 0, 0, 0, 0, 0, 1, 1], 'Ігрова валюта': [0, 0, 0, 0, 0, 0, 1, 1],
};
const MONEY = Object.keys(MTRUTH).map(n => [n]);
const MQ = [{ q: 'Яку функцію грошей показує цінник «Хліб — 40 ₴»?', a: ['Засіб накопичення', 'Міра вартості', 'Засіб обміну'], ok: 1, why: 'Гроші допомагають порівнювати вартість різних речей: це міра вартості.' }, { q: 'Що таке інфляція?', a: ['Зростання цін і падіння купівельної сили грошей', 'Податок на гроші', 'Зменшення кількості банків'], ok: 0, why: 'Через інфляцію за ті самі гроші купуєте менше. Тому гроші, що лежать без діла, «тануть».' }, { q: 'Чим електронні гроші відрізняються від криптовалюти?', a: ['Нічим', 'Електронні гроші — це борг емітента в гривнях, а криптовалюта не має центрального емітента', 'Криптовалюта завжди дорожча'], ok: 1, why: 'Електронні гроші — цифрова форма звичайних грошей. Криптовалюта працює без банку чи держави.' }];
reg({
  id: 'money', stage: 8, t: 'Види грошей', d: 'Визначте властивості семи видів грошей і відповідайте на запитання.', icon: 'coins', min: 12,
  intro: `Грошима ми звикли називати купюри, але форм грошей багато: готівка, безготівкові, електронні, криптовалюта, золото, навіть бонуси. Відзначте для кожного, які властивості в нього є, і перевірте себе: функції грошей та інфляція.`,
  data: () => ({ g: {}, q: {} }),
  view(S, d) {
    const hit = MONEY.map(([n]) => PR.filter((_, k) => (d.g[n]?.[k] ?? 0) === MTRUTH[n][k]).length);
    return `${box('Таблиця властивостей', `<p class="sub">Натискайте, якщо властивість підходить.</p><div class="xscroll"><table class="xtable mtab"><thead><tr><th></th>${PR.map(p => `<th>${p}</th>`).join('')}<th>Збіг</th></tr></thead><tbody>${MONEY.map(([n], i) => `<tr><th scope="row">${n}</th>${PR.map((_, k) => `<td><button type="button" class="cel ${d.g[n]?.[k] ? 'on' : ''}" aria-pressed="${!!d.g[n]?.[k]}" aria-label="${esc(n)}: ${esc(PR[k])}" data-act="ex" data-ex="money" data-do="flip" data-a="${esc(n)}" data-i="${k}">${d.g[n]?.[k] ? icon('check', 14) : ''}</button></td>`).join('')}<td class="num"><b class="${hit[i] === PR.length ? 'pos' : ''}">${d.g[n] ? hit[i] + ' з ' + PR.length : '—'}</b></td></tr>`).join('')}</tbody></table></div>${Object.keys(d.g).length >= 3 ? `<p class="sm muted">Підказка: «Збіг» показує, скільки властивостей у рядку відповідають реальності. Зелений — усе правильно.</p>` : ''}`, { ic: 'plan' })}
    ${box('Перевірте себе', quiz('money', 'q', d, MQ), { ic: 'bulb', side: `правильно ${quizOk(d, 'q', MQ)} з ${MQ.length}` })}`;
  },
  acts: { flip(S, d, el) { const n = el.dataset.a, k = +el.dataset.i; (d.g[n] ||= Array(PR.length).fill(0))[k] = d.g[n][k] ? 0 : 1; } },
  ready(S, d) {
    const hits = MONEY.map(([n]) => PR.filter((_, k) => (d.g[n]?.[k] ?? 0) === MTRUTH[n][k]).length), total = sumOf(hits) / (MONEY.length * PR.length);
    if (Object.keys(d.g).length < MONEY.length) return { ok: false, msg: 'Відзначте властивості в усіх рядках таблиці' };
    if (total < .8) return { ok: false, msg: `Таблиця збігається з реальністю на ${pc(total)}: потрібно хоча б 80%. Подивіться на колонку «Збіг»` };
    if (quizDone(d, 'q', MQ) < MQ.length) return { ok: false, msg: 'Дайте відповідь на запитання' };
    const ok = quizOk(d, 'q', MQ);
    return { ok: true, stars: 1 + (total >= .95 ? 1 : 0) + (ok === MQ.length ? 1 : 0) };
  },
});

/* ═════════ Інвестування: портфель ═════════ */
const AS = [
  { k: 'dep', t: 'Депозит у банку', m: .1, v: .005, note: 'Надійно й прогнозовано. Прибуток невеликий, дорослий інфляцією.', col: '#16a34a' },
  { k: 'ovdp', t: 'Державні облігації', m: .13, v: .02, note: 'Позика державі під відсоток. Зазвичай надійно.', col: '#0ea5e9' },
  { k: 'corp', t: 'Корпоративні облігації', m: .15, v: .07, note: 'Позика компанії. Вищий відсоток, але компанія може не повернути.', col: '#8b5cf6' },
  { k: 'stock', t: 'Акції окремих компаній', m: .13, v: .32, note: 'Частка в компанії. Може виростати вдвічі й падати вдвічі.', col: '#ef4444' },
  { k: 'etf', t: 'Індексний фонд (ETF)', m: .1, v: .16, note: 'Корзина із сотень компаній. Ризик нижчий, ніж в окремих акціях.', col: '#f59e0b' },
  { k: 'pif', t: 'Пайовий фонд (ПІФ)', m: .09, v: .12, note: 'Гроші багатьох людей, ними керує компанія за комісію.', col: '#14b8a6' },
  { k: 'gold', t: 'Золото', m: .06, v: .14, note: 'Захищає від інфляції в кризу, але саме не приносить доходу.', col: '#d9a400' },
];
const SCN = { calm: ['Спокійний ринок', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], crash: ['Криза на третьому році', [0, 0, -1, -.4, .4, .3, 0, 0, 0, 0]], boom: ['Бум і корекція', [.4, .6, .3, -.5, 0, 0, 0, 0, 0, 0]] };
const MIX = { cons: ['Консервативний', { dep: 40, ovdp: 40, etf: 10, gold: 10 }], bal: ['Збалансований', { dep: 20, ovdp: 25, corp: 10, etf: 30, gold: 10, pif: 5 }], agr: ['Агресивний', { stock: 40, etf: 40, gold: 10, corp: 10 }] };
function simPort(alloc, scn, seed) {
  const r = mk(seed), shocks = SCN[scn][1], tot = sumOf(Object.values(alloc)) || 1, path = [100], bench = [100]; let v = 100, peak = 100, dd = 0, b = 100;
  for (let y = 0; y < 10; y++) {
    const sh = shocks[y], mkt = r.norm(0, 1) * .5 + sh;
    let ret = 0; for (const a of AS) { const w = (alloc[a.k] || 0) / tot; if (!w) continue; const corr = a.k === 'gold' ? -.3 : a.k === 'dep' ? 0 : a.k === 'ovdp' ? .1 : a.k === 'corp' ? .6 : 1; ret += w * (a.m + a.v * (mkt * corr * 2.2 + r.norm(0, 1) * (a.k === 'stock' ? .7 : .4))); }
    ret = Math.max(ret, -.7); v *= 1 + ret; path.push(Math.round(v * 10) / 10); peak = Math.max(peak, v); dd = Math.max(dd, 1 - v / peak); b *= 1.075; bench.push(Math.round(b * 10) / 10);
  }
  return { path, dd, end: v, bench };
}
reg({
  id: 'portfolio', stage: 8, t: 'Інвестиційний портфель', d: 'Розподіліть гроші між сімома інструментами й перевірте їх у кризі.', icon: 'trend', min: 20,
  intro: `${term('Інвестування', 'Інвестування')}: гроші можна не лише тримати, а й вкладати — у депозити, облігації, акції, фонди, золото. Чим вищий очікуваний дохід, тим вищий ризик. Складіть портфель зі 100 «частин» і подивіться, як він переживе спокійний ринок, кризу й бум. Усі цифри умовні й не є порадою вкладатися.`,
  data: () => ({ al: { dep: 30, ovdp: 20, etf: 30, gold: 10, stock: 10 }, horizon: 10, tol: 30, seed: 3, ran: false, why: '' }),
  view(S, d) {
    const tot = sumOf(Object.values(d.al));
    return `${box('Швидкі варіанти', `<div class="xrow">${Object.entries(MIX).map(([k, [t]]) => xb('portfolio', 'preset', t, { a: k, cls: 'sm' })).join('')}<small class="muted">або налаштуйте самі нижче</small></div>`, { ic: 'compass' })}
    ${box('Ваш портфель', `<div class="xg c2">${AS.map(a => `<div class="srcard ${d.al[a.k] ? 'on' : ''}" style="--c:${a.col}"><header><b>${a.t}</b><span class="xtag">≈ ${Math.round(a.m * 100)}% / рік · ризик ${a.v < .03 ? 'дуже низький' : a.v < .1 ? 'низький' : a.v < .2 ? 'середній' : 'високий'}</span></header><p>${esc(a.note)}</p>${xsl('portfolio', `al.${a.k}`, d, { min: 0, max: 100, step: 5, label: 'Частка', u: '%', v: d.al[a.k] || 0 })}</div>`).join('')}</div>
      <div class="mvpbar"><div class="x-bar"><i style="width:${clamp(tot, 0, 100)}%;background:${tot === 100 ? 'var(--ok)' : '#e0a100'}"></i></div><b>${tot} зі 100</b></div>${tot !== 100 ? tip(`Загалом має бути 100%. Зараз ${tot}%: ${tot < 100 ? 'додайте ще' : 'зменшіть на'} ${Math.abs(100 - tot)}.`, 'warn') : ''}`, { ic: 'chart' })}
    ${box('Скільки втрат ви витримаєте?', xsl('portfolio', 'tol', d, { min: 5, max: 70, step: 5, label: 'Найбільше падіння, яке готові пережити', u: '%' }), { ic: 'shield' })}
    <div class="xrow">${xb('portfolio', 'run', d.ran ? 'Запустити ще раз' : 'Перевірити портфель', { cls: 'primary', ic: 'play', dis: tot !== 100 })}</div>`;
  },
  live(S, d) {
    if (!d.ran) return '';
    const R = Object.keys(SCN).map(k => [k, simPort(d.al, k, d.seed * 17 + hash(k))]), worst = Math.max(...R.map(x => x[1].dd)), labels = Array.from({ length: 11 }, (_, i) => String(i));
    return `${box('Що буде за 10 років (було 100)', `${wideChart([...R.map(([k, r]) => ({ v: r.path, color: { calm: '#16a34a', crash: '#ef4444', boom: '#6366f1' }[k], label: SCN[k][0] })), { v: R[0][1].bench, color: '#94a3b8', label: 'Інфляція +7,5%', dash: true }], { labels, fmt: x => String(Math.round(x)), zero: false })}
      <div class="kpis3">${R.map(([k, r]) => `<div><small>${SCN[k][0]}</small><b class="${r.end >= r.bench.at(-1) ? 'pos' : 'neg'}">${Math.round(r.end)} <small>найбільше падіння ${pc(r.dd)}</small></b></div>`).join('')}</div>
      ${worst * 100 > d.tol ? tip(`У найгіршому сценарії портфель падає на ${pc(worst)}, а ви готові пережити лише ${d.tol}%. Зробіть портфель обережнішим або змініть очікування.`, 'warn') : tip(`Найбільше падіння — ${pc(worst)}: це в межах ваших ${d.tol}%.`, 'ok')}
      ${checks([[Object.values(d.al).filter(v => v > 0).length >= 3, 'Диверсифікація: гроші розподілено хоча б між трьома інструментами', 'Не кладіть усі яйця в один кошик'], [(d.al.stock || 0) <= 40, 'Окремі акції не перевищують 40%', 'Окремі акції — найризикованіший інструмент'], [worst * 100 <= d.tol, 'Падіння вкладається у вашу толерантність']])}
      ${xin('portfolio', 'why', d, { label: 'Чому ви склали портфель саме так?', area: true, rows: 2, max: 240, cls: 'mt', ph: 'Я обрав(ла) такий розподіл, тому що…' })}`, { ic: 'trend' })}`;
  },
  acts: { preset(S, d, el) { d.al = { ...MIX[el.dataset.a][1] }; d.ran = false; }, run(S, d) { d.ran = true; d.seed++; } },
  ready(S, d) {
    const tot = sumOf(Object.values(d.al)), kinds = Object.values(d.al).filter(v => v > 0).length, worst = d.ran ? Math.max(...Object.keys(SCN).map(k => simPort(d.al, k, d.seed * 17 + hash(k)).dd)) : 1;
    if (tot !== 100) return { ok: false, msg: 'Розподіліть рівно 100%' };
    if (kinds < 3) return { ok: false, msg: 'Оберіть хоча б три різні інструменти' };
    if (!d.ran) return { ok: false, msg: 'Перевірте портфель у сценаріях' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій розподіл' };
    return { ok: true, stars: 1 + (worst * 100 <= d.tol ? 1 : 0) + (kinds >= 4 && (d.al.stock || 0) <= 30 ? 1 : 0) };
  },
});

/* ═════════ Криптовалюта й трейдинг ═════════ */
const NEWS = [['Відомий блогер «радить» купувати токен', .12], ['Біржа повідомила про технічний збій', -.1], ['Велика компанія почала приймати цей токен', .18], ['Регулятор попередив про ризики', -.15], ['Хтось «злив» значну суму: ринок хитається', -.2], ['Ажіотаж у соцмережах', .15]];
const OFFERS = [['«Гарантуємо 30% прибутку на місяць, без ризику».', 1, 'Ніхто не може гарантувати прибуток. Це головна ознака шахрайства.'], ['Біржа з ліцензією, прозорі комісії, можливість вивести гроші в будь-який момент.', 0, 'Є ознаки справжньої послуги: ліцензія, прозорі умови, вільне виведення.'], ['Закрита група в месенджері: «сигнали» від незнайомця, платити за вхід 3 000 ₴.', 1, 'Сигнали незнайомців — спосіб заробити на вас, а не з вами.'], ['«Приведи трьох друзів, і ваша частка зросте» — піраміда токенів.', 1, 'Дохід за залучення людей, а не за продукт — ознака піраміди.']];
const TS = 30;
function mkWorld(seed) { const r = mk(seed); const p = [100], ev = []; for (let i = 1; i <= TS; i++) { let g = r.norm(0, .045); if (r.chance(.12)) { const n = r.pick(NEWS); g += n[1]; ev[i] = n[0]; } p.push(Math.max(20, p[i - 1] * (1 + g))); } return { p, ev }; }
reg({
  id: 'trading', stage: 8, t: 'Криптовалюта й трейдинг', d: 'Спробуйте віртуальну торгівлю на 30 днів і розпізнайте шахраїв.', icon: 'bitcoin', min: 20,
  intro: `${term('Криптовалюта', 'Криптовалюта')} — цифрові гроші без центрального емітента, її ціна коливається дуже сильно. ${term('Трейдинг', 'Трейдинг')} — купівля й продаж, щоб заробити на зміні ціни. Спробуйте на віртуальних 10 000 ₴ протягом 30 днів і подивіться, чи вдасться перемогти просте «купив і тримаю». Це лише навчання: реальні гроші в це не вкладайте, поки не розумієте ризиків.`,
  data: () => ({ seed: 7, day: 0, cash: 10000, qty: 0, hist: [], log: [], lev: false, q: {}, why: '', done: false }),
  view(S, d) {
    const W = mkWorld(d.seed), price = W.p[d.day], val = d.cash + d.qty * price, profit = val - 10000;
    return `${box('Торгівля', `<div class="kpis3"><div><small>День</small><b>${d.day} з ${TS}</b></div><div><small>Ціна токена</small><b>${price.toFixed(1).replace('.', ',')} ₴</b></div><div><small>Ваш капітал</small><b class="${profit >= 0 ? 'pos' : 'neg'}">${money0(val)}</b></div></div>
      ${wideChart([{ v: W.p.slice(0, d.day + 1), color: '#6366f1', label: 'Ціна токена', area: true }], { labels: Array.from({ length: d.day + 1 }, (_, i) => String(i)), zero: false, fmt: x => x.toFixed(0) })}
      ${W.ev[d.day] ? `<p class="x-tip warn">${icon('info', 16)}<span><b>Новина дня:</b> ${esc(W.ev[d.day])}</span></p>` : ''}
      <p class="sm">У вас: <b>${d.qty.toFixed(2).replace('.', ',')}</b> токенів · готівкою <b>${money0(d.cash)}</b></p>
      ${d.done ? '' : `<div class="xrow">${xb('trading', 'buy', 'Купити на 25%', { a: .25, ic: 'plus', dis: d.cash < 100 })}${xb('trading', 'buy', 'Купити на все', { a: 1, ic: 'plus', dis: d.cash < 100 })}${xb('trading', 'sell', 'Продати все', { ic: 'minus', dis: d.qty <= 0 })}${xb('trading', 'next', 'Наступний день', { cls: 'primary', ic: 'next' })}${xb('trading', 'skip', '+5 днів', { cls: 'ghost', ic: 'right' })}</div><p class="sm muted">Комісія за кожну операцію — 0,5%.</p>`}
      ${d.done ? tip(`Підсумок: ${money0(val)}. «Купив і тримаю» дало б ${money0(10000 / 100 * W.p[TS])}. ${profit > 0 ? 'Ви заробили, але чи це результат навичок, чи просто пощастило?' : 'Ви втратили частину грошей: так буває з більшістю нових трейдерів.'} Більшість початківців втрачають гроші на короткій торгівлі через емоції й комісії.`, profit > 0 ? 'ok' : 'warn') : ''}`, { ic: 'chart' })}`;
  },
  live(S, d) {
    return `${box('Шахрай чи ні?', OFFERS.map(([t, bad, why], i) => `<div class="quiz"><b>${esc(t)}</b><div class="xrow">${xp('trading', `q.${i}`, 1, 'Небезпечно', d.q[i] === 1, { t: 'n', cls: d.q[i] != null ? (bad === 1 ? 'right' : d.q[i] === 1 ? 'wrong' : '') : '' })}${xp('trading', `q.${i}`, 0, 'Виглядає чесно', d.q[i] === 0, { t: 'n', cls: d.q[i] != null ? (bad === 0 ? 'right' : d.q[i] === 0 ? 'wrong' : '') : '' })}</div>${d.q[i] != null ? `<p class="x-tip ${d.q[i] === bad ? 'ok' : 'warn'}">${icon(d.q[i] === bad ? 'check' : 'info', 16)}<span>${d.q[i] === bad ? 'Правильно. ' : 'Не зовсім. '}${esc(why)}</span></p>` : ''}</div>`).join(''), { ic: 'shield', side: `правильно ${OFFERS.filter(([, b], i) => d.q[i] === b).length} з ${OFFERS.length}` })}
    ${box('Висновок', xin('trading', 'why', d, { label: 'Що ви зрозуміли про ризик і торгівлю?', area: true, rows: 3, max: 300, ph: 'Я зрозумів(ла), що…' }), { ic: 'bulb' })}${d.day >= TS ? `<div class="xrow">${xb('trading', 'again', 'Спробувати ще раз', { ic: 'refresh' })}</div>` : ''}`;
  },
  acts: {
    buy(S, d, el) { const W = mkWorld(d.seed), pr = W.p[d.day], amt = d.cash * +el.dataset.a, fee = amt * .005; if (amt < 1) return false; d.qty += (amt - fee) / pr; d.cash -= amt; },
    sell(S, d) { const W = mkWorld(d.seed), pr = W.p[d.day], amt = d.qty * pr; d.cash += amt * .995; d.qty = 0; },
    next(S, d) { if (d.day < TS) d.day++; if (d.day >= TS) d.done = true; },
    skip(S, d) { d.day = Math.min(TS, d.day + 5); if (d.day >= TS) d.done = true; },
    again(S, d) { d.seed += 3; d.day = 0; d.cash = 10000; d.qty = 0; d.done = false; },
  },
  ready(S, d) {
    const ok = OFFERS.filter(([, b], i) => d.q[i] === b).length, n = Object.keys(d.q).length;
    if (d.day < TS) return { ok: false, msg: `Пройдіть усі ${TS} днів торгівлі (зараз ${d.day})` };
    if (n < OFFERS.length) return { ok: false, msg: 'Позначте всі пропозиції у вправі «Шахрай чи ні?»' };
    if (ok < 3) return { ok: false, msg: 'Забагато помилок: прочитайте пояснення й виправте' };
    if (len(d.why) < 25) return { ok: false, msg: 'Напишіть висновок: що ви зрозуміли' };
    return { ok: true, stars: 1 + (ok === OFFERS.length ? 1 : 0) + (len(d.why) >= 80 ? 1 : 0) };
  },
});
