// Симулятор стартапу · додаткові вправи етапів 1–4: інтерв’ю з клієнтом, палітра бренду, пре-мортем, календар грошей.
import { esc, sideChart } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xsel, tip, box, checks, bar, clamp, sumOf, money0 } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Інтерв’ю з клієнтом ═════════ */
const IQ = [
  { q: 'Вам сподобається моя ідея?', good: 0, a: 'Ну так, звучить непогано. Чому б і ні.', why: 'Питання про думку: людина відповідає ввічливо, а не чесно.' },
  { q: 'Коли востаннє ви стикалися з цією проблемою? Розкажіть, як це було.', good: 1, a: 'У четвер: донька не розібралась із дробами, ми сиділи до десятої вечора й обоє були на нервах.', why: 'Конкретний випадок із минулого: це факт, а не припущення.' },
  { q: 'Скільки б ви заплатили за такий застосунок?', good: 0, a: 'Гм… можливо, сто гривень? Не знаю, я про це не думала.', why: 'Гіпотетична ціна: люди називають першу-ліпшу цифру.' },
  { q: 'Що ви вже пробували, щоб це розв’язати?', good: 1, a: 'Наймала репетитора, але шістсот гривень за годину — дорого. Дивилась відео, та вони не відповідають на запитання.', why: 'Ви дізналися про конкурентів і про те, що саме їх не влаштовує.' },
  { q: 'Чи користувалися б ви моїм продуктом, якби він існував?', good: 0, a: 'Напевно… якщо буде зручно.', why: '«Якби» і «напевно»: це не рішення, а ввічливість.' },
  { q: 'Скільки ви витрачаєте на це зараз?', good: 1, a: 'Репетитор — близько 2400 на місяць, і це лише математика.', why: 'Справжня сума: так видно, чи є в клієнта бюджет.' },
  { q: 'Ви ж погодитесь, що це класна ідея, правда?', good: 0, a: 'Ну… так, звісно.', why: 'Навідне питання: відповідь закладена в самому запитанні.' },
  { q: 'Хто ще бере участь у рішенні: купувати чи ні?', good: 1, a: 'Чоловік: він платить за все, що дорожче за п’ятсот гривень. Йому треба показати результат.', why: 'Ви з’ясували, хто насправді ухвалює рішення про оплату.' },
  { q: 'Чи порадите ви мене друзям?', good: 0, a: 'Звісно, як тільки з’явиться.', why: 'Обіцянка на майбутнє нічого не коштує людині.' },
  { q: 'Що в цьому найважче й найбільше дратує?', good: 1, a: 'Що я сама не пам’ятаю шкільну програму й не можу допомогти. Почуваюсь поганою мамою.', why: 'Ви почули емоцію: вона підкаже, як говорити про продукт.' },
  { q: 'Якщо я це зроблю, ви купите?', good: 0, a: 'Давайте подивимось, коли буде готово.', why: 'Ввічлива відмова: «подивимось» майже завжди означає «ні».' },
  { q: 'Покажіть, як ви це робите зараз?', good: 1, a: 'Так, приходьте: покажу таблицю в Excel і чат із репетитором.', why: 'Людина запрошує вас у свій процес: найкращий знак зацікавленості.' },
];
const runs = d => d.runs || [];
const stat = r => { const g = r.ask.filter(i => IQ[i].good).length; return { g, b: r.ask.length - g }; };
reg({
  id: 'interview', stage: 0, opt: true, cols: true, t: 'Інтерв’ю з клієнтом', d: 'Складіть розмову з правильних запитань, проведіть її й відрізніть факти від ввічливих слів.', icon: 'mic', min: 12,
  intro: `Люди рідко кажуть «це не спрацює»: не хочуть вас образити. Тому питайте не про вашу ідею, а про <b>їхнє минуле</b>: що було востаннє, скільки це коштувало, що вже пробували. Оберіть п’ять-шість запитань, натисніть «Провести розмову» й подивіться, що відповість Марина, мама школяра. Розмова зараховується лише після цього, а минулі розмови можна перечитати.`,
  data: () => ({ ask: [], runs: [], sel: null, note: '' }),
  view(S, d) {
    return `${box('Підготуйте запитання', `<p class="sm muted">Оберіть п’ять-шість запитань: розмова піде в тому порядку, як ви їх обрали. Відповіді з’являться, коли ви проведете розмову.</p><div class="qlist">${IQ.map((x, i) => xp('interview', 'ask', i, esc(x.q), d.ask.includes(i), { set: 'tog', t: 'n', max: 6, cls: 'card' })).join('')}</div>
      <div class="xrow" style="margin-top:12px">${xb('interview', 'run', 'Провести розмову', { cls: 'primary', ic: 'mic', dis: d.ask.length < 3 })}<span class="chip">${d.ask.length} з 6 запитань${d.ask.length < 3 ? ' · потрібно хоча б три' : ''}</span></div>`, { ic: 'mic', side: `проведено розмов: ${runs(d).length}` })}
    ${box('Ваш висновок', xin('interview', 'note', d, { area: true, max: 300, label: 'Що ви зрозуміли про клієнтку й що зробите далі?', ph: 'Марина вже платить…, тому я…' }), { ic: 'pen' })}`;
  },
  live(S, d) {
    const R = runs(d), i = d.sel != null && R[d.sel] ? d.sel : R.length - 1, r = R[i];
    const hist = R.length ? `<div class="xrow" style="margin-bottom:10px">${R.map((x, k) => { const st = stat(x); return xp('interview', 'sel', k, `Розмова ${k + 1} · фактів ${st.g}`, k === i, { t: 'n' }); }).join('')}</div>` : '';
    const st = r ? stat(r) : { g: 0, b: 0 };
    return `${box('Розмова з Мариною', r ? `${hist}<div class="chat">${r.ask.map(q => `<div class="msg me"><span>${esc(IQ[q].q)}</span></div><div class="msg her ${IQ[q].good ? 'fact' : 'fog'}"><b>Марина</b><span>${esc(IQ[q].a)}</span><small>${IQ[q].good ? 'Факт' : 'Туман'}: ${esc(IQ[q].why)}</small></div>`).join('')}</div>` : `<p class="muted">Ще не проведено жодної розмови. Оберіть запитання ліворуч і натисніть «Провести розмову».</p>`, { ic: 'users' })}
    <div class="kpis3"><div><small>Фактів у розмові</small><b>${st.g}</b></div><div><small>Туману</small><b>${st.b}</b></div><div><small>Розмов проведено</small><b>${R.length}</b></div></div>`;
  },
  acts: {
    run(S, d, el, C) {
      if (d.ask.length < 3) { C?.toast?.('Оберіть хоча б три запитання', 'bad'); return false; }
      (d.runs ||= []).push({ ask: [...d.ask], w: S.s.week }); d.ask = []; d.sel = d.runs.length - 1;
    },
  },
  ready(S, d) {
    const R = runs(d);
    if (!R.length) return { ok: false, msg: 'Проведіть хоча б одну розмову' };
    const best = R.map(stat).reduce((m, x) => x.g > m.g ? x : m, { g: -1, b: 0 }), long = R.find(r => r.ask.length >= 5);
    if (!long) return { ok: false, msg: 'Проведіть розмову хоча б із п’яти запитань' };
    if (best.g < 3) return { ok: false, msg: 'У розмові має бути щонайменше три запитання, що дають факти' };
    if (len(d.note) < 20) return { ok: false, msg: 'Запишіть висновок із розмови' };
    return { ok: true, stars: 1 + (best.g >= 4 ? 1 : 0) + (R.some(r => stat(r).b <= 1 && r.ask.length >= 5) ? 1 : 0) };
  },
});

/* ═════════ Палітра бренду ═════════ */
const hsl = (h, s, l) => { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
const lum = hex => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const MOODS = [['calm', 'Спокійний', 'довіра й порядок: фінанси, освіта', 215, 62, 42], ['energy', 'Енергійний', 'рух і дія: спорт, їжа', 14, 82, 44], ['nature', 'Природний', 'здоров’я, турбота, еко', 142, 55, 30], ['premium', 'Преміальний', 'статус і серйозність', 268, 42, 32], ['friendly', 'Дружній', 'тепло, творчість, діти', 335, 62, 44], ['bold', 'Сміливий', 'технології, молодь', 172, 78, 28]];
const HARM = [['analog', 'Сусідні відтінки', 30, 'спокійно й гармонійно'], ['triad', 'Тріада', 120, 'жваво, але збалансовано'], ['split', 'Розділений контраст', 150, 'помітно, але м’якше за пряму протилежність'], ['compl', 'Контраст', 180, 'максимальна різниця: акцент одразу в очі']];
const pal = d => { const off = HARM.find(h => h[0] === d.harm)?.[2] ?? 30; return { main: hsl(d.h, d.s, d.l), accent: hsl(d.h + off, d.s, clamp(d.l + 6, 20, 62)), soft: hsl(d.h, clamp(d.s * .55, 0, 60), 94), dark: hsl(d.h, clamp(d.s * .5, 0, 40), 14), mid: hsl(d.h, 12, 46) }; };
reg({
  id: 'palette', stage: 1, ord: 6, opt: true, cols: true, t: 'Палітра бренду', d: 'Складіть колірну схему й перевірте, чи читається текст на кнопках.', icon: 'palette', min: 12,
  intro: `Колір — це настрій бренду. Оберіть настрій і правило підбору другого кольору, підкрутіть відтінок і подивіться, як палітра виглядає на справжній картці. Головне правило: текст на кнопці має читатися (контраст не менший за 4,5 до 1).`,
  data: () => ({ mood: 'calm', h: 215, s: 62, l: 42, harm: 'analog', cta: 'main', name: '', why: '' }),
  onSet: (S, d, p, v) => { if (p === 'mood') { const m = MOODS.find(x => x[0] === v); if (m) { d.h = m[3]; d.s = m[4]; d.l = m[5]; } } },
  view(S, d) {
    return `${box(`<span class="ex-n">1</span>Настрій бренду`, `<p class="sub">Який настрій має створювати бренд? Колір впливає на те, що відчуває клієнт: синій дає довіру, помаранчевий енергію, зелений спокій.</p><div class="xrow g3">${MOODS.map(m => xp('palette', 'mood', m[0], m[1], d.mood === m[0], { sub: m[2], cls: 'card' })).join('')}</div>`, { ic: 'palette' })}
    ${box(`<span class="ex-n">2</span>Відтінок і другий колір`, `<p class="sub">Підкрутіть колір під себе й оберіть, як підібрати другий: сусідній (спокійно), контрастний (помітно) чи тріада (жваво).</p><div class="xg">${xsl('palette', 'h', d, { min: 0, max: 359, step: 1, label: 'Відтінок', u: '°' })}${xsl('palette', 's', d, { min: 20, max: 100, step: 1, label: 'Насиченість', u: '%' })}${xsl('palette', 'l', d, { min: 20, max: 65, step: 1, label: 'Яскравість', u: '%' })}</div>
      <div class="xrow g2" style="margin-top:10px">${HARM.map(h => xp('palette', 'harm', h[0], h[1], d.harm === h[0], { sub: h[3], cls: 'card' })).join('')}</div>`, { ic: 'wrench' })}
    ${box(`<span class="ex-n">3</span>Назва й пояснення`, `<p class="sub">Назвіть палітру й поясніть вибір одним реченням: чому ці кольори підходять вашому бренду.</p><div class="xg c2">${xin('palette', 'name', d, { label: 'Назва палітри', ph: 'Ранкова кава', max: 30 })}${xin('palette', 'why', d, { label: 'Чому саме ці кольори підходять вашому бренду?', ph: 'Блакитний створює довіру, жовтий дає тепло…', max: 160 })}</div>`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const p = pal(d), cta = d.cta === 'accent' ? p.accent : p.main, cr = ratio('#ffffff', cta), cd = ratio(p.dark, p.soft), mood = MOODS.find(m => m[0] === d.mood);
    const sw = [['Основний', p.main], ['Акцент', p.accent], ['Світлий фон', p.soft], ['Текст', p.dark], ['Допоміжний', p.mid]];
    return `${box('Ваша палітра', `<div class="pswatches">${sw.map(([n, c]) => `<div class="psw"><i style="background:${c};color:${ratio('#ffffff', c) >= 3 ? '#fff' : '#111'}"></i><b>${n}</b><code>${c}</code></div>`).join('')}</div>
      <div class="xrow" style="margin:8px 0">${xp('palette', 'cta', 'main', 'Кнопка — основний', d.cta !== 'accent')}${xp('palette', 'cta', 'accent', 'Кнопка — акцент', d.cta === 'accent')}</div>
      <div class="pmock" style="background:${p.soft};color:${p.dark}"><span class="pm-tag" style="background:${p.accent};color:${ratio('#ffffff', p.accent) >= 3 ? '#fff' : '#111'}">Новинка</span><h4>${esc(d.name || 'Ваша компанія')}</h4><p style="color:${p.mid}">Так виглядатиме текст на картці. ${esc(mood?.[2] || '')}.</p><button type="button" tabindex="-1" style="background:${cta};color:#fff">Спробувати безкоштовно</button></div>
      ${checks([[cr >= 4.5, `Білий текст на кнопці: контраст ${cr.toFixed(1).replace('.', ',')} до 1`, 'Потрібно щонайменше 4,5: зробіть колір темнішим або оберіть інший для кнопки'], [cd >= 7, `Текст на світлому фоні: ${cd.toFixed(1).replace('.', ',')} до 1`], [ratio(p.accent, p.soft) >= 3, 'Акцент помітний на світлому фоні']])}`, { ic: 'eye' })}`;
  },
  ready(S, d) {
    const p = pal(d), cta = d.cta === 'accent' ? p.accent : p.main;
    if (ratio('#ffffff', cta) < 4.5) return { ok: false, msg: 'Білий текст на кнопці не читається: потрібен контраст 4,5 до 1' };
    if (len(d.name) < 3) return { ok: false, msg: 'Назвіть палітру' };
    if (len(d.why) < 15) return { ok: false, msg: 'Поясніть вибір кольорів' };
    return { ok: true, stars: 1 + (ratio(p.dark, p.soft) >= 7 ? 1 : 0) + (len(d.why) >= 40 ? 1 : 0) };
  },
});

/* ═════════ Пре-мортем ═════════ */
// [ризик, очікувана ймовірність 1–3, очікуваний вплив 1–3]
const RISKS = [
  ['Гроші закінчаться раніше, ніж з’являться клієнти', 3, 3], ['Клієнти не готові платити за продукт', 2, 3], ['Конкурент зробить те саме, але дешевше', 3, 2], ['Ключова людина піде з команди', 2, 3],
  ['Сервіс «ляже» у пікову годину', 2, 2], ['Зміняться правила чи закони', 1, 3], ['Один поганий відгук зіпсує репутацію', 2, 1], ['Уся реклама тримається на одному каналі', 3, 2],
  ['Постачальник зірве поставку', 2, 2], ['Засновник вигорить і втратить мотивацію', 2, 3], ['Витік даних клієнтів', 1, 3], ['Не вдасться швидко масштабуватись', 2, 1],
];
const LV = ['Низька', 'Середня', 'Висока'];
const allRisks = d => [...RISKS.map(r => ({ t: r[0], ep: r[1], ei: r[2] })), ...(d.own || []).map(o => ({ t: o.t }))];
const sc = (d, k) => (d.r[k]?.p && d.r[k]?.i ? d.r[k].p * d.r[k].i : 0);
reg({
  id: 'premortem', stage: 2, opt: true, cols: true, t: 'Пре-мортем: чому стартап провалиться', d: 'Оцініть ризики на матриці й складіть план захисту від головних.', icon: 'shield', min: 18,
  intro: `Уявіть, що за рік ваш стартап закрився. <b>Чому?</b> Така гра називається пре-мортем: краще вигадати причини зараз, поки їх можна виправити. Оцініть ймовірність і вплив кожного ризику, оберіть три найнебезпечніші й напишіть, що робитимете.`,
  data: () => ({ r: {}, top: [], mit: {}, own: [] }),
  view(S, d) {
    const all = allRisks(d);
    return `${box('Оцініть ризики', `<div class="prisk">${all.map((x, k) => `<div class="pr-row ${sc(d, k) >= 6 ? 'hot' : ''}"><span class="pr-n">${k + 1}</span><b>${esc(x.t)}</b><div class="pr-c"><small>Ймовірність</small><span class="xrow">${[1, 2, 3].map(v => xp('premortem', `r.${k}.p`, v, LV[v - 1], d.r[k]?.p === v, { t: 'n' })).join('')}</span></div><div class="pr-c"><small>Вплив</small><span class="xrow">${[1, 2, 3].map(v => xp('premortem', `r.${k}.i`, v, LV[v - 1], d.r[k]?.i === v, { t: 'n' })).join('')}</span></div></div>`).join('')}</div>
      ${d.own.length < 4 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="pm-new" maxlength="280" placeholder="Додайте свій ризик: чого боїтесь саме ви?">${xb('premortem', 'addOwn', 'Додати', { ic: 'plus' })}</div>` : ''}`, { ic: 'alert', side: `оцінено ${all.filter((_, k) => sc(d, k)).length} з ${all.length}` })}
    ${box('Три головні ризики й план', `<p class="sm muted">Оберіть три ризики з найвищою оцінкою й напишіть, що зробите, щоб їх зменшити.</p><div class="xrow">${all.map((x, k) => sc(d, k) ? xp('premortem', 'top', k, `${k + 1}. ${esc(x.t)}`, d.top.includes(k), { set: 'tog', t: 'n', max: 3 }) : '').join('')}</div>
      ${d.top.map(k => xin('premortem', `mit.${k}`, d, { area: true, rows: 2, max: 200, label: `Ризик ${k + 1}: що зробите?`, ph: 'Як зменшити ймовірність або наслідки…' })).join('')}`, { ic: 'flag', side: `${d.top.length} з 3` })}`;
  },
  live(S, d) {
    const all = allRisks(d), cell = {};
    all.forEach((x, k) => { if (sc(d, k)) (cell[`${d.r[k].p}-${d.r[k].i}`] ||= []).push(k + 1); });
    const grid = [3, 2, 1].map(i => `<div class="pm-y"><small>${LV[i - 1]}</small></div>${[1, 2, 3].map(p => `<div class="pm-c s${p * i >= 6 ? 'h' : p * i >= 3 ? 'm' : 'l'}">${(cell[`${p}-${i}`] || []).map(n => `<i>${n}</i>`).join('')}</div>`).join('')}`).join('');
    const worst = all.map((x, k) => ({ k, s: sc(d, k) })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 3);
    return `${box('Матриця ризиків', `<div class="pm-grid"><div class="pm-ax">Вплив</div>${grid}<div></div><div></div>${LV.map(l => `<div class="pm-x"><small>${l}</small></div>`).join('')}</div><p class="sm muted" style="text-align:center">Ймовірність</p>`, { ic: 'target' })}
    ${box('Найнебезпечніші зараз', worst.length ? `<ol class="pm-top">${worst.map(w => `<li><b>${w.k + 1}.</b> ${esc(all[w.k].t)} <span class="xtag">${w.s} з 9</span></li>`).join('')}</ol>` : `<p class="muted">Оцініть кілька ризиків, і тут з’являться головні.</p>`, { ic: 'flame' })}`;
  },
  acts: {
    addOwn(S, d) { const el = document.getElementById('pm-new'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } d.own.push({ t: v }); },
  },
  ready(S, d) {
    const all = allRisks(d), n = all.filter((_, k) => sc(d, k)).length;
    if (n < 8) return { ok: false, msg: `Оцініть хоча б вісім ризиків: лишилось ${8 - n}` };
    if (d.top.length < 3) return { ok: false, msg: 'Оберіть три головні ризики' };
    if (d.top.some(k => len(d.mit[k]) < 12)) return { ok: false, msg: 'Напишіть план для кожного з трьох ризиків' };
    const rated = RISKS.map((r, k) => k).filter(k => sc(d, k)), hit = rated.filter(k => Math.abs(d.r[k].p - RISKS[k][1]) + Math.abs(d.r[k].i - RISKS[k][2]) <= 1).length;
    const best = RISKS.map((r, k) => ({ k, s: r[1] * r[2] })).sort((a, b) => b.s - a.s).slice(0, 5).map(x => x.k);
    return { ok: true, stars: 1 + (rated.length && hit / rated.length >= .6 ? 1 : 0) + (d.top.filter(k => k >= RISKS.length || best.includes(k)).length >= 2 ? 1 : 0) };
  },
});

/* ═════════ Календар грошей ═════════ */
const CF = { start: 20000, rent: [1, 5, 9], rentV: 9000, wageV: 7000, sales: 6000 };
const CFE = [['adv', 'Передоплата від клієнтів', 24000, 'тиждень, коли гроші надійдуть'], ['mat', 'Закупівля матеріалів', -12000, 'тиждень оплати'], ['ads', 'Рекламна кампанія', -6000, 'тиждень оплати'], ['sub', 'Підрядник (дизайн сайту)', -8000, 'тиждень оплати'], ['tax', 'Податки й ЄСВ', -4000, 'тиждень оплати']];
function cfRun(d) {
  const ev = Array.from({ length: 12 }, () => []);
  CF.rent.forEach(w => ev[w - 1].push(['Оренда', -CF.rentV]));
  for (let w = 2; w <= 12; w += 2) ev[w - 1].push(['Зарплата', -CF.wageV]);
  for (let w = 3; w <= 12; w++) ev[w - 1].push(['Продажі', CF.sales]);
  CFE.forEach(([k, n, v]) => { const w = clamp(+d.w[k] || 1, 1, 12); ev[w - 1].push([n, v]); });
  if (+d.cr) { const w = clamp(+d.cr, 1, 12), back = Math.min(12, w + 4); ev[w - 1].push(['Кредит', 15000]); ev[back - 1].push(['Повернення кредиту', -17000]); }
  let b = CF.start; const bal = ev.map(list => (b += sumOf(list.map(x => x[1])))), min = Math.min(...bal);
  return { ev, bal, min, final: bal[11], neg: bal.filter(x => x < 0).length };
}
reg({
  id: 'cashflow', stage: 3, opt: true, cols: true, t: 'Календар грошей', d: 'Розставте платежі за тижнями так, щоб гроші не закінчились посеред місяця.', icon: 'calendar', min: 15,
  intro: `Компанія може бути прибутковою й усе одно збанкрутувати: гроші просто прийшли <b>пізніше</b>, ніж треба було платити. Це називається касовий розрив. У вас дванадцять тижнів: оренда й зарплата вже заплановані, а п’ять платежів ви розставляєте самі.`,
  data: () => ({ w: { adv: 8, mat: 2, ads: 3, sub: 4, tax: 5 }, cr: 0 }),
  view(S, d) {
    const wk = Array.from({ length: 12 }, (_, i) => [i + 1, `Тиждень ${i + 1}`]);
    return `${box('Ваші платежі', `<p class="sm muted">Оренда (щоп’ятого тижня, ${money0(CF.rentV)}), зарплата (кожні два тижні, ${money0(CF.wageV)}) і продажі (з третього тижня, ${money0(CF.sales)}) уже в календарі. Початковий залишок: ${money0(CF.start)}.</p>
      <div class="xg c2">${CFE.map(([k, n, v, h]) => xsel('cashflow', `w.${k}`, d, wk, { label: `${n}: ${v > 0 ? '+' : '−'}${money0(Math.abs(v))}` })).join('')}</div>`, { ic: 'calendar' })}
    ${box('Кредитна лінія', `<p class="sm muted">Банк дає ${money0(15000)} одразу, але за чотири тижні треба повернути ${money0(17000)}. Це допомагає закрити розрив, проте коштує грошей.</p>${xsel('cashflow', 'cr', d, [[0, 'Не беру кредит'], ...wk.map(([v, t]) => [v, `Взяти на ${t.toLowerCase()}`])], { label: 'Кредит' })}`, { ic: 'bank' })}`;
  },
  live(S, d) {
    const r = cfRun(d);
    const cal = r.ev.map((list, i) => `<div class="cf-w ${r.bal[i] < 0 ? 'neg' : ''}"><b>${i + 1}</b>${list.map(([n, v]) => `<span class="${v > 0 ? 'pos' : 'out'}" title="${esc(n)}">${v > 0 ? '+' : '−'}${Math.round(Math.abs(v) / 1000)}k</span>`).join('')}<em>${Math.round(r.bal[i] / 1000)}k</em></div>`).join('');
    return `${box('Баланс за тижнями', `${sideChart([{ v: [CF.start, ...r.bal], color: r.min < 0 ? '#e0503f' : '#6366f1', label: 'Залишок на рахунку', area: true }], { labels: ['0', ...r.ev.map((_, i) => String(i + 1))], fmt: x => Math.round(x / 1000) + 'k' })}
      <div class="kpis3"><div><small>Найменший залишок</small><b class="${r.min < 0 ? 'neg' : ''}">${money0(r.min)}</b></div><div><small>Тижнів у мінусі</small><b class="${r.neg ? 'neg' : ''}">${r.neg}</b></div><div><small>Залишок наприкінці</small><b>${money0(r.final)}</b></div></div>
      ${r.neg ? tip(`У ${r.neg} ${r.neg === 1 ? 'тижні' : 'тижнях'} гроші закінчуються. Оплачуйте великі платежі після надходжень, а передоплату просіть раніше.`, 'bad') : tip('Усі платежі закриті вчасно: баланс не падає нижче нуля.', 'ok')}`, { ic: 'chart' })}
    ${box('Календар', `<div class="cf-cal">${cal}</div><p class="sm muted">Червоне: платіж, зелене: надходження, знизу: залишок у тисячах.</p>`, { ic: 'calendar' })}`;
  },
  ready(S, d) { const r = cfRun(d); if (r.neg) return { ok: false, msg: `Залишок негативний у ${r.neg} тижнях: змініть порядок платежів` }; if (r.final < 3000) return { ok: false, msg: 'Наприкінці має лишитись хоча б 3 000 ₴' }; return { ok: true, stars: 1 + (r.min >= 5000 ? 1 : 0) + (!+d.cr ? 1 : 0) }; },
});

export { pal, MOODS };
