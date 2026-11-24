// Симулятор стартапу · вправи етапу 5 «Гроші на старт»: джерела фінансування, інвестиції в стартап, гранти й конкурси.
import { esc, term, donut } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, X, mk, hash, clamp, sumOf, pc, money0, quiz, quizOk, quizDone, qbtn, qbody, own, ideaBits, isHw } from './ex-core.js';

const len = s => String(s || '').trim().length;
const dots = n => `<span class="dots5" aria-label="${n} з 5">${'●'.repeat(n)}<i>${'●'.repeat(5 - n)}</i></span>`;

/* ═════════ Джерела фінансування ═════════ */
const SRC = [
  { k: 'own', t: 'Власні гроші', max: 300000, sp: 5, cost: 5, ctl: 5, acc: 5, tag: 'свої', note: 'Найпростіше: нічого не віддаєте, але ризикуєте власними заощадженнями.', col: '#6366f1' },
  { k: 'fff', t: 'Родина й друзі', max: 300000, sp: 4, cost: 3, ctl: 4, acc: 4, eq: true, tag: 'частка', note: 'Вірять у вас. Домовтеся письмово, скільки це в частці компанії, щоб не посваритися.', col: '#ec4899' },
  { k: 'loan', t: 'Банківський кредит', max: 500000, sp: 3, cost: 2, ctl: 5, acc: 2, rate: .22, tag: '22% річних', note: 'Гроші треба повернути з відсотками, навіть якщо справа не вийшла. Дають лише дорослим із документами.', col: '#f59e0b' },
  { k: 'crowd', t: 'Краудфандинг', max: 300000, sp: 3, cost: 3, ctl: 5, acc: 3, fee: .12, tag: 'комісія 12%', note: 'Багато людей скидаються по трохи. Потрібна аудиторія й обіцяні подарунки вчасно.', col: '#14b8a6' },
  { k: 'pre', t: 'Передзамовлення', max: 200000, sp: 3, cost: 5, ctl: 5, acc: 3, tag: 'від клієнтів', note: 'Клієнти платять наперед: і гроші, і доказ, що продукт потрібен.', col: '#16a34a' },
  { k: 'angel', t: 'Бізнес-ангел', max: 1500000, sp: 2, cost: 2, ctl: 3, acc: 2, eq: true, tag: 'частка', note: 'Досвідчений підприємець дає гроші й поради за частину компанії.', col: '#8b5cf6' },
  { k: 'grant', t: 'Грант', max: 300000, sp: 1, cost: 5, ctl: 5, acc: 2, chance: .3, tag: 'шанс ≈ 30%', note: 'Гроші не треба повертати, але отримають не всі: шанс приблизно 30%.', col: '#84cc16' },
];
function srcCalc(d) {
  let raised = 0, eqAmt = 0, interest = 0, kinds = new Set(), nonDil = false;
  for (const s of SRC) { const a = +d.mix[s.k] || 0; if (!a) continue; kinds.add(s.k); const net = a * (s.fee ? 1 - s.fee : 1) * (s.chance || 1); raised += net; if (s.eq) eqAmt += a; if (s.rate) interest += a * s.rate; if (!s.eq) nonDil = true; }
  const dil = eqAmt ? eqAmt / (d.pre + eqAmt) : 0;
  return { raised, eqAmt, interest, dil, kinds: kinds.size, cover: d.need ? raised / d.need : 0, nonDil };
}
// простий опис кожного джерела: коротко в рядку, докладніше під кнопкою «?», суми-кнопки
const SRC_TXT = {
  own: { short: 'Ваші заощадження. Нічого не віддаєте.', plain: 'Це гроші, які ви вже маєте. Плюс: ніхто не командує вами. Мінус: якщо справа не вийде, гроші зникнуть. Беріть лише те, чого не шкода втратити.', chips: [50000, 100000, 200000, 300000] },
  fff: { short: 'Вірять у вас. Домовтеся про частку письмово.', plain: 'Рідні й друзі дають гроші, бо довіряють вам. Щоб не посваритися, одразу запишіть, яку частку компанії вони отримують. Наприклад, 300 000 ₴ за 10%.', chips: [50000, 100000, 200000, 300000] },
  loan: { short: 'Треба повернути з відсотками, навіть якщо не вийшло.', plain: 'Банк дає гроші в борг. За рік ви повертаєте більше, ніж узяли: тут 22% зверху. Кредит дають лише дорослим із документами, тому в житті це справа батьків чи вашого повноліття.', chips: [100000, 200000, 300000, 500000] },
  crowd: { short: 'Багато людей скидаються по трохи.', plain: 'Краудфандинг — це коли ви розповідаєте про ідею в інтернеті, а люди скидаються по трохи й чекають від вас подарунок. Сайт бере комісію 12%. Працює, якщо про вас уже хтось знає.', chips: [50000, 100000, 200000, 300000] },
  pre: { short: 'Клієнти платять наперед.', plain: 'Передзамовлення — клієнт платить за те, чого ще немає, і чекає. Ви отримуєте гроші й доказ, що продукт потрібен. Головне — вчасно виконати обіцяне.', chips: [50000, 100000, 150000, 200000] },
  angel: { short: 'Дає гроші й поради за частину компанії.', plain: 'Бізнес-ангел — досвідчений підприємець, який вкладає свої гроші в початківців. Взамін він отримує частину компанії й часом допомагає порадами. Він хоче бачити, що у вас уже щось працює.', chips: [300000, 500000, 1000000, 1500000] },
  grant: { short: 'Гроші не треба повертати, але дають не всім.', plain: 'Грант — подарунок від конкурсу чи фонду. Повертати й віддавати частку не треба. Але виграють не всі: шанс приблизно 30%, тож не розраховуйте лише на нього.', chips: [50000, 100000, 200000, 300000] },
};
const kfmt = v => (v / 1000).toLocaleString('uk-UA') + ' тис.';
reg({
  id: 'sources', stage: 4, t: 'Джерела фінансування', d: 'Порівняйте сім джерел грошей і складіть свій набір.', icon: 'coins', min: 15,
  neo: {
    about: 'Гроші на старт беруть із кількох джерел, і в кожного своя ціна: за одні віддають відсотки, за інші частину компанії. Оберіть, звідки візьмете, щоб вистачило й не довелося віддавати зайве.',
    steps: (S, d) => { const c = srcCalc(d); return [['Скільки потрібно', c.kinds > 0 || (d.ch || 0) > 0, 0], ['Звідки взяти', c.cover >= .7 && c.kinds >= 2, 1], ['Підсумок і пояснення', len(d.why) >= 20 && c.cover >= .7 && c.kinds >= 2, 2]]; },
  },
  data: S => { const fp = X(S, 'finplan'); return { need: Math.max(100000, Math.round((fp.needNow || 300000) / 50000) * 50000), pre: 3000000, mix: {}, why: '', ch: 0 }; },
  onSet: (S, d) => { d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    const row = s => {
      const a = +d.mix[s.k] || 0, on = a > 0, T = SRC_TXT[s.k], chips = T.chips.includes(a) || !a ? T.chips : [...T.chips, a].sort((x, y) => x - y);
      return `<div class="srow ${on ? 'on' : ''}">
        <button type="button" class="sbtn" role="checkbox" aria-checked="${on}" data-act="ex" data-ex="sources" data-do="src" data-a="${s.k}"><span class="cb">${on ? icon('check', 14) : ''}</span><span class="sinfo"><h3>${esc(s.t)}</h3><p>${T.short}</p></span></button>
        <div class="smeta"><span class="tg5 ${s.sp >= 4 ? 'g' : s.sp >= 3 ? 'y' : 'r'}">${s.sp >= 4 ? 'швидко' : s.sp >= 3 ? 'не дуже швидко' : 'довго'}</span><span class="tg5 ${s.cost >= 4 ? 'g' : s.cost >= 3 ? 'y' : 'r'}">${s.cost >= 4 ? 'дешево' : s.cost >= 3 ? 'помірна ціна' : 'дорого'}</span><span class="tg5 b">${s.tag}</span>${qbtn(s.k)}</div>
        ${on ? `<div class="samt"><span>Скільки:</span>${chips.map(v => xp('sources', `mix.${s.k}`, v, kfmt(v), a === v, { t: 'n' })).join('')}</div>` : ''}
        ${qbody(s.k, T.plain)}</div>`;
    };
    return `${box('1. Скільки потрібно грошей', `<div class="xg c2">${xsl('sources', 'need', d, { min: 50000, max: 3000000, step: 50000, label: 'Потреба на старт', u: ' ₴' })}</div>${qbody('need', 'Потреба — це скільки грошей не вистачає, щоб дожити до перших продажів. Якщо не знаєте, натисніть кнопку нижче: число візьметься з вашого фінансового плану.')}<div class="xrow mt">${xb('sources', 'needFromPlan', 'Взяти з фінансового плану', { ic: 'refresh', cls: 'sm' })}</div>`, { ic: 'wallet', side: qbtn('need') })}
    ${box('2. Звідки взяти гроші', `<p class="hl5">Поставте галочку біля джерела й оберіть суму. Біля кожного є «?» з поясненням.</p><div class="slist">${SRC.map(row).join('')}</div>
      <div class="sgame"><p><b>Перші гроші в грі.</b> ${S.hasFff() ? 'Родина й друзі вже вклали 300 000 ₴ за 10% компанії.' : 'Родина й друзі можуть одразу дати 300 000 ₴ за 10% компанії. Це справжні гроші гри. Вирішуйте самі, чи брати їх зараз.'}</p>${S.hasFff() ? '' : xb('sources', 'takeFff', 'Взяти 300 000 ₴ за 10%', { cls: 'primary', ic: 'coins' })}</div>`, { ic: 'coins' })}`;
  },
  acts: {
    src(S, d, el) { const k = el.dataset.a, T = SRC_TXT[k]; if (!T) return false; d.mix[k] = (+d.mix[k] || 0) > 0 ? 0 : T.chips[1]; d.ch = (d.ch || 0) + 1; },
    needFromPlan(S, d, el, C) { const n = X(S, 'finplan').needNow; if (!n) { C.toast('У фінплані гроші не закінчуються, тож потреба невелика. Поставте суму вручну.'); return false; } d.need = clamp(Math.round(n / 50000) * 50000, 50000, 3000000); C.toast('Потребу взято з фінансового плану', 'good'); },
    takeFff(S, d, el, C) { if (!S.takeFff()) return false; C?.toast?.('Родина й друзі вклали 300 000 ₴', 'good'); },
  },
  live(S, d) {
    const c = srcCalc(d), got = d.need ? c.raised : 0;
    return `${box('3. Підсумок', `<div class="sumb"><div class="sb-t"><span>Обрано з потрібних ${money0(d.need)}</span><b class="${c.cover >= .9 ? 'pos' : c.cover < .7 ? 'neg' : ''}">${money0(got)} · ${pc(c.cover)}</b></div>${bar(c.cover, { color: c.cover >= .9 ? 'var(--ok)' : '#e0a100', label: 'Покриття потреби' })}
      <div class="kpis3"><div><small>Частку компанії віддаєте</small><b class="${c.dil > .35 ? 'neg' : ''}">${pc(c.dil, 1)}</b></div><div><small>Відсотки за рік</small><b>${money0(c.interest)}</b></div><div><small>Різних джерел</small><b>${c.kinds}</b></div></div>
      <p class="sm muted">Для грантів і краудфандингу враховано шанс і комісію, тому «отримаємо» трохи менше, ніж «просимо».</p></div>
      ${checks([[c.cover >= .9, 'Грошей вистачає (хоча б 90% потреби)', 'Додайте ще джерело або зменште потребу'], [c.kinds >= 2, 'Є хоча б два різних джерела', 'Не покладайтесь на одне джерело'], [c.dil <= .35, 'Віддаєте не більше третини компанії', 'Забагато частки: вам лишиться мало впливу'], [c.nonDil, 'Є джерело, за яке не віддаєте частку']])}
      ${xin('sources', 'why', d, { label: 'Чому саме такий набір?', area: true, rows: 2, max: 240, ph: 'Ми обрали ці джерела, тому що…', cls: 'mt', hint: 'Одне-два речення: що вам підходить і чого ви уникаєте.' })}`, { ic: 'check' })}`;
  },
  ready(S, d) {
    const c = srcCalc(d);
    if (c.cover < .7) return { ok: false, msg: 'Грошей поки вистачає менше ніж на 70% потреби: додайте джерело або зменште потребу' };
    if (c.kinds < 2) return { ok: false, msg: 'Оберіть хоча б два джерела' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    return { ok: true, stars: 1 + (c.dil <= .2 ? 1 : 0) + (c.nonDil && c.kinds >= 3 ? 1 : 0) };
  },
});

/* ═════════ Інвестиції в стартап ═════════ */
const EQQ = [
  { q: 'Інвестор дає 1 млн ₴ і просить за це 20% компанії. Скільки тоді «коштує» вся компанія?', a: ['5 млн ₴', '1 млн ₴', '2 млн ₴', '20 млн ₴'], ok: 0, why: '1 млн ₴ — це п’ята частина (20%). Отже, вся компанія коштує 5 разів по 1 млн ₴ = 5 млн ₴.' },
  { q: 'Що буде з вашою часткою, коли ви віддаєте частину компанії інвестору?', a: ['Нічого, вона не зміниться', 'Вона стане меншою, зате компанія може швидше вирости', 'Вона стане більшою'], ok: 1, why: 'Частка в компанії завжди зменшується. Це добре, якщо на гроші компанія виросте: 10% від великого — більше, ніж 100% від маленького.' },
  { q: 'Коли доречно брати гроші в обмін на частку?', a: ['Завжди: це ж безкоштовні гроші', 'Коли гроші справді допоможуть рости, а ви лишаєтесь із великою часткою', 'Ніколи'], ok: 1, why: 'Гроші інвестора не безкоштовні: ви платите часткою. Беріть стільки, скільки потрібно, і не віддавайте надто багато.' },
];
reg({
  id: 'equity', stage: 4, t: 'Гроші від інвестора', d: 'Подивіться, яку частину компанії віддасте за гроші, і відповідайте на три питання.', icon: 'handshake', min: 10,
  neo: {
    about: 'Інвестор дає гроші, а ви віддаєте частину компанії. Чим більший шматок віддаєте, тим менше лишається вам. Подивіться, що виходить за різних умов, і дайте відповідь на три питання.',
    steps: (S, d) => [['Оберіть суму й частку', (d.ch || 0) >= 1, 0], ['Подивіться, що вийде', (d.ch || 0) >= 1, 1], ['Дайте відповідь на питання', quizDone(d, 'q', EQQ) >= EQQ.length && quizOk(d, 'q', EQQ) >= 2, 2]],
  },
  data: () => ({ sum: 300000, pct: 15, q: {}, ch: 0 }),
  onSet: (S, d, p) => { if (p !== 'q' && !p.startsWith('q.')) d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    return `${box('1. Ваша пропозиція інвестору', `<p class="hl5">Рухайте повзунки й дивіться, що змінюється. Для початку спробуйте 300 000 ₴ за 15%.</p><div class="xg c2">
        <div>${xsl('equity', 'sum', d, { min: 50000, max: 3000000, step: 50000, label: 'Скільки грошей просите', u: ' ₴' })}<p class="hl5 mt">Що це означає ${qbtn('sum')}</p></div>
        <div>${xsl('equity', 'pct', d, { min: 5, max: 50, step: 1, label: 'Яку частину компанії віддаєте', u: '%' })}<p class="hl5 mt">Що це означає ${qbtn('pct')}</p></div></div>
        ${qbody('sum', 'Це гроші, які інвестор вкладе в компанію. Вони потраплять на рахунок і підуть на розвиток.')}${qbody('pct', 'Частка — це шматок компанії, який стане власністю інвестора. Віддали 15% — інвестор отримує 15 з кожних 100 частин, а вам лишається 85. Частку «назад» не купиш, тому віддавайте обережно.')}`, { ic: 'wrench' })}`;
  },
  live(S, d) {
    const start = S.stake(), inv = d.pct / 100, mine = start * (1 - inv), val = d.sum / inv, others = 1 - start;
    const parts = [{ v: mine, color: '#6366f1' }, ...(others > .001 ? [{ v: others * (1 - inv), color: '#ec4899' }] : []), { v: inv, color: '#8b5cf6' }];
    return `${box('2. Що вийде', `<p class="hl5">Інвестор платить <b>${money0(d.sum)}</b> і отримує <b>${pc(inv, 0)}</b> компанії. Отже, вся компанія «коштує» <b>${money0(val)}</b> ${qbtn('val')}</p>${qbody('val', `Якщо ${pc(inv, 0)} компанії коштують ${money0(d.sum)}, то 100% коштують у ${Math.round(1 / inv * 10) / 10} раза більше: ${money0(val)}. Так інвестор «оцінює» вашу компанію.`)}
      <div class="srcsum">${donut(parts, { size: 150 })}<div class="srcl"><span><i style="background:#6366f1"></i>Ви <b>${pc(mine, 1)}</b></span>${others > .001 ? `<span><i style="background:#ec4899"></i>Родина й друзі <b>${pc(others * (1 - inv), 1)}</b></span>` : ''}<span><i style="background:#8b5cf6"></i>Інвестор <b>${pc(inv, 1)}</b></span></div></div>
      <div class="kpis3 mt"><div><small>Вся компанія коштує</small><b>${money0(val)}</b></div><div><small>Ваша частина в гривнях</small><b>${money0(mine * val)}</b></div><div><small>Ви отримаєте</small><b>${money0(d.sum)}</b></div></div>
      ${d.pct > 30 ? tip('Ви віддаєте майже третину компанії або більше. Подумайте, чи не забагато.', 'bad') : val < d.sum * 4 ? tip('Інвестор отримує велику частину за невелику оцінку. Спробуйте віддати менше.', 'warn') : tip('Виглядає розумно: ви отримуєте гроші й лишаєтесь із великою частиною.', 'ok')}`, { ic: 'chart' })}
    ${box('3. Три питання', quiz('equity', 'q', d, EQQ), { ic: 'bulb', side: `правильно ${quizOk(d, 'q', EQQ)} з ${EQQ.length}` })}`;
  },
  ready(S, d) {
    if ((d.ch || 0) < 1) return { ok: false, msg: 'Спробуйте свої суми: змініть хоча б одне значення' };
    if (quizDone(d, 'q', EQQ) < EQQ.length) return { ok: false, msg: 'Дайте відповідь на всі запитання' };
    const ok = quizOk(d, 'q', EQQ);
    if (ok < 2) return { ok: false, msg: 'Перечитайте пояснення й виправте відповіді: потрібно хоча б 2 правильні' };
    return { ok: true, stars: ok === 3 ? 3 : 2 };
  },
});

/* ═════════ Гранти й конкурси ═════════ */
const talksOf = S => sumOf(Object.values(S.s.know).map(k => k.n));
const PROG = [
  { k: 'start', t: 'Старт-грант для молодих підприємців', prize: 100000, diff: 55, who: 'Для тих, хто починає: потрібна ідея і кілька розмов із майбутніми клієнтами.', kw: /клієнт|ринок|ціль/i, req: S => [['Є опис проблеми в бізнес-плані (хоча б 3 блоки)', S.canvasFilled() >= 3], ['Ви поговорили хоча б із трьома людьми', talksOf(S) >= 3]] },
  { k: 'school', t: 'Шкільний конкурс бізнес-ідей', prize: 20000, diff: 40, who: 'Приз за кращу ідею. Дивляться, чи ідея зрозуміла й цікава.', kw: /ідея|нов|унікал|вирішу/i, req: S => [['Описано проблему в бізнес-плані', (S.s.canvas?.problem || '').trim().length >= 10]] },
  { k: 'social', t: 'Соціальний грант', prize: 150000, diff: 62, who: 'Для ідей, що допомагають людям: дітям, літнім, тваринам, природі.', kw: /допомог|суспіль|доступн|громад|діт/i, req: S => [['Описано, для кого цей проєкт', !!S.s.canvas?.segment], ['Проєкт допомагає людям (ваше твердження)', !!X(S, 'grants').social]] },
  { k: 'accel', t: 'Програма акселератора', prize: 30000, diff: 60, who: 'Невеликі гроші й наставники. Беруть тих, у кого вже є перша версія продукту.', kw: /команд|зростан|клієнт|рух/i, req: S => [['Є перша версія або функції в розробці', S.s.product.launched || S.s.product.built.length > 0 || S.s.product.queue.length > 0]] },
];
const FIELDS = [['problem', 'Яку проблему ви розв’язуєте і в кого вона?', 'Школярі витрачають по 2 години на домашку й не розуміють пояснень…', 40, 'Підказка: опишіть одну людину. Хто вона і що її бісить?'], ['solution', 'Як ви її розв’язуєте?', 'Застосунок, який крок за кроком пояснює розв’язок…', 40, 'Підказка: одне-два речення, без складних слів.'], ['team', 'Хто в команді?', 'Я розробляю продукт; допомагає подруга-дизайнерка…', 20, 'Підказка: навіть якщо ви один, напишіть, у чому ви сильні.'], ['plan', 'На що підуть гроші? Що вийде через півроку?', 'Реклама — 40%, розробка — 60%. За 6 місяців: 500 користувачів, 50 платних…', 40, 'Підказка: додайте хоча б дві цифри, наприклад, суму й кількість людей.']];
// підказки до заявки й пітчу: для «домашки» — готові приклади, для решти — слова з вашої ідеї
const fieldGen = (S, k) => { const b = ideaBits(S); return { problem: `${b.seg[0].toUpperCase() + b.seg.slice(1)} стикаються з проблемою «${b.problem}»: скільки це коштує їм часу чи грошей…`, solution: `«${b.t}»: ${b.pitch ? b.pitch.charAt(0).toLowerCase() + b.pitch.slice(1) : 'що саме ви робите крок за кроком'}`, team: 'Я роблю…; допомагає… із досвідом…', plan: 'За 3 місяці: перша версія, 20 клієнтів, перші гроші…' }[k] || ''; };
function appScore(a, P) {
  const f = FIELDS.filter(([k, , , m]) => len(a[k]) >= m).length, txt = FIELDS.map(([k]) => a[k] || '').join(' '), nums = (txt.match(/\d+/g) || []).length;
  const fine = len(txt) >= 180 && len(txt) <= 900;
  const parts = [['Усі чотири розділи заповнені', f / FIELDS.length * 45, f === FIELDS.length], ['Є цифри (суми, терміни, кількість людей)', Math.min(30, nums * 10), nums >= 3], ['Не надто коротко й не надто довго', fine ? 25 : len(txt) > 900 ? 15 : 8, fine]];
  return { score: Math.round(sumOf(parts.map(x => x[1]))), parts };
}
reg({
  id: 'grants', stage: 4, t: 'Гранти й конкурси', d: 'Перевірте, чи підходите, подайте заявку й дізнайтеся рішення журі.', icon: 'award', min: 20,
  neo: {
    about: 'Грант — це гроші, які не треба повертати і за які не віддають частку компанії. Їх дають за добре описану ідею. Оберіть конкурс, заповніть заявку й подайте її. Якщо відмовили, це нормально: прочитайте відгук, виправте й подайте ще раз.',
    steps: (S, d) => {
      const P = PROG.find(p => p.k === d.prog) || PROG[0], a = d.a[P.k] || {}, sent = Object.keys(d.res || {}).length > 0, full = FIELDS.every(([k, , , m]) => len(a[k]) >= m);
      return [['Оберіть конкурс', sent || FIELDS.some(([k]) => len(a[k]) > 0), 0], ['Заповніть заявку', sent || full, 2], ['Подайте й прочитайте відгук', sent, 3]];
    },
  },
  data: () => ({ prog: 'start', social: false, english: false, a: { start: {}, school: {}, tech: {}, social: {}, accel: {}, world: {} }, res: {} }),
  view(S, d) {
    const P = PROG.find(p => p.k === d.prog) || PROG[0], reqs = P.req(S), ok = reqs.every(r => r[1]), a = d.a[P.k] ||= {};
    const row = p => {
      const e = p.req(S).every(r => r[1]), r = d.res[p.k], on = d.prog === p.k;
      return `<div class="srow pick ${on ? 'on' : ''}">
        <button type="button" class="sbtn" role="radio" aria-checked="${on}" data-act="ex" data-ex="grants" data-do="set" data-p="prog" data-v="${p.k}" data-t="s"><span class="cb"></span><span class="sinfo"><h3>${esc(p.t)}</h3><p>${esc(p.who)}</p></span></button>
        <div class="smeta"><span class="tg5 b">${money0(p.prize)}</span>${e ? '<span class="tg5 g">підходите</span>' : '<span class="tg5">ще не підходите</span>'}${r ? `<span class="tg5 ${r.res === 'win' ? 'g' : r.res === 'fin' ? 'y' : 'r'}">${{ win: 'отримали', fin: 'фіналіст', no: 'відмова' }[r.res]}</span>` : ''}${qbtn('p_' + p.k)}</div>
        ${qbody('p_' + p.k, `${esc(p.who)} Щоб виграти, опишіть проблему, рішення, команду й на що підуть гроші. Зазвичай потрібно близько ${p.diff} балів зі ста.`)}</div>`;
    };
    return `${box('1. Оберіть конкурс', `<p class="hl5">Біля кожного видно приз і чи ви вже підходите.</p><div class="slist" role="radiogroup" aria-label="Конкурси">${PROG.map(row).join('')}</div>`, { ic: 'award' })}
    ${box(`2. Чи ви підходите: ${P.t}`, `<p class="hl5">Це умови конкурсу. Галочка означає, що умову вже виконано.</p>${checks(reqs.map(r => [r[1], r[0]]))}${P.k === 'social' ? `<label class="switch" style="margin-top:8px"><input type="checkbox" data-exi="grants" data-p="social" ${d.social ? 'checked' : ''}><span></span>Так, наш проєкт допомагає людям</label>` : ''}${ok ? '' : tip('Не всі умови виконано. Заявку подати можна, але шанс малий. Краще спершу виконати умови.', 'warn')}`, { ic: 'check' })}
    ${box('3. Заявка', `<p class="hl5">Пишіть простими словами, по одному-два речення. Підказка є під кожним полем.</p>${FIELDS.map(([k, l, ph, , hint]) => xin('grants', `a.${P.k}.${k}`, d, { label: l, area: true, rows: 3, max: 400, ph: own(S, ph, fieldGen(S, k)), hint, cls: 'mt' })).join('')}`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const P = PROG.find(p => p.k === d.prog) || PROG[0], a = d.a[P.k] ||= {}, sc = appScore(a, P), r = d.res[P.k];
    return `${box('4. Перевірка й подання', `<div class="uscore"><b>${sc.score}</b><span>балів зі ста. Щоб пройти, зазвичай потрібно близько ${P.diff}</span></div>${checks(sc.parts.map(x => [x[2], x[0]]))}<div class="xrow mt">${xb('grants', 'submit', r ? 'Подати ще раз' : 'Подати заявку', { cls: 'primary', ic: 'rocket', dis: sc.score < 30 })}${sc.score < 30 ? '<small class="muted">Спершу заповніть заявку хоча б наполовину.</small>' : ''}</div>
      ${r ? `<div class="jury ${r.res}"><h4>${r.res === 'win' ? 'Заявку підтримано!' : r.res === 'fin' ? 'Ви серед фіналістів' : 'Цього разу відмовили'}</h4><p>${esc(r.msg)}</p></div>` : ''}`, { ic: 'check' })}`;
  },
  acts: {
    submit(S, d, el, C) {
      const P = PROG.find(p => p.k === d.prog) || PROG[0], a = d.a[P.k] ||= {}, sc = appScore(a, P), ok = P.req(S).every(r => r[1]), rr = mk(hash(P.k + JSON.stringify(a) + S.s.week)), cut = P.diff + rr.norm(0, 6) + (ok ? 0 : 25);
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
const pitGen = (S, k) => { const b = ideaBits(S); return { problem: `${b.seg[0].toUpperCase() + b.seg.slice(1)} стикаються з проблемою «${b.problem}».`, solution: `«${b.t}»: ${b.pitch ? b.pitch.charAt(0).toLowerCase() + b.pitch.slice(1) : 'одне речення про рішення'}`, market: 'Скільки людей має цю проблему, хоча б приблизно.', trac: 'За два тижні N людей спробували, M заплатили.', team: 'Я роблю…; допомагає… із досвідом…', ask: 'Шукаю N ₴ на N місяців: на що саме.' }[k] || ''; };
const PITH = { problem: 'Хто страждає і від чого?', solution: 'Що ви пропонуєте, одним реченням.', market: 'Скільки людей має цю проблему? Хоча б приблизно.', trac: 'Що вже зробили? Додайте цифру: скільки людей спробували чи заплатили.', team: 'Хто з вами і чим допомагає.', ask: 'Скільки грошей просите й на що, наприклад: 100 000 ₴ на рекламу.' };
const wordsOf = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const pitchSc = d => { const p = d.p || {}, f = k => len(p[k]) >= 25, num = k => /\d/.test(p[k] || ''); const all = PIT.map(([k]) => p[k] || '').join(' ');
  return { angel: clamp((f('team') ? 30 : 0) + (num('trac') ? 30 : 0) + (f('problem') ? 20 : 0) + (f('ask') && num('ask') ? 20 : 0), 0, 100), fund: clamp((num('market') ? 30 : 0) + (num('trac') ? 30 : 0) + (f('solution') ? 15 : 0) + (f('ask') && num('ask') ? 25 : 0), 0, 100), accel: clamp((f('problem') ? 25 : 0) + (f('team') ? 25 : 0) + (f('solution') ? 25 : 0) + (num('trac') ? 25 : 0), 0, 100), words: wordsOf(all) }; };
reg({
  id: 'pitch', stage: 4, opt: true, t: 'Пітч за хвилину', d: 'Розкажіть про компанію інвестору за 60 секунд.', icon: 'mic', min: 12,
  neo: {
    about: '[[Пітч-дек|Пітч]] — це розповідь про вашу компанію за одну хвилину. Уявіть, що розповідаєте другу. Напишіть по одному-два речення в кожному з шести полів і подивіться, кому з інвесторів це сподобається.',
    steps: (S, d) => { const p = d.p || {}, six = PIT.every(([k]) => len(p[k]) >= 20), nums = /\d/.test(p.trac || '') && /\d/.test(p.ask || ''); return [['Напишіть шість частин', six, 0], ['Додайте цифри', six && nums, 3], ['Подивіться, кому сподобається', six && nums, 6]]; },
  },
  data: () => ({ p: {} }),
  view(S, d) { return `<p class="hl5">Біля кожної частини є «?» з поясненням і прикладом. Цифри (скільки людей, скільки грошей) роблять пітч переконливішим.</p><div class="xg c2">${PIT.map(([k, t, ph], i) => `<div class="xbox"><header><span class="xtag">${i + 1}</span><h2>${t}</h2>${qbtn(k)}</header>${xin('pitch', `p.${k}`, d, { area: true, rows: 2, max: 160, ph: 'наприклад: ' + own(S, ph, pitGen(S, k)), hint: PITH[k] })}${qbody(k, `${PITH[k]} Приклад${isHw(S) ? '' : ' (з іншої ідеї)'}: ${esc(ph)}`)}</div>`).join('')}</div>`; },
  live(S, d) {
    const r = pitchSc(d), w = r.words, sec = Math.round(w / 2.5);
    return `${box('Кому це сподобається', `${[['angel', 'Бізнес-ангел', 'шукає сильну команду й перші результати'], ['fund', 'Венчурний фонд', 'шукає великий ринок і швидке зростання'], ['accel', 'Акселератор', 'шукає чітку проблему й готовність вчитися']].map(([k, t, h]) => `<div class="cmp"><span>${t}<small class="muted" style="display:block">${h}</small></span>${bar(r[k] / 100, { color: r[k] >= 70 ? 'var(--ok)' : '#e0a100', label: t })}<b>${r[k]}%</b></div>`).join('')}<p class="sm muted">Слів: ${w}. Це приблизно ${sec} с мовлення. ${sec > 70 ? 'Задовго: скоротіть до хвилини.' : sec < 25 ? 'Занадто коротко.' : 'Вкладаєтесь у хвилину.'}</p>`, { ic: 'chart' })}`;
  },
  ready(S, d) { const r = pitchSc(d); if (PIT.some(([k]) => len(d.p[k]) < 20)) return { ok: false, msg: 'Заповніть усі шість розділів хоча б одним реченням' }; if (!/\d/.test(d.p.trac || '') || !/\d/.test(d.p.ask || '')) return { ok: false, msg: 'Додайте цифри в «Що вже зроблено» й «Що просите»' }; return { ok: true, stars: 1 + (r.angel >= 70 ? 1 : 0) + (r.fund >= 70 ? 1 : 0) }; },
});
