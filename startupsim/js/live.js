// Симулятор стартапу · «Живий офіс»: головна в режимі симуляції. Час іде: компанія працює, клієнти приходять різними
// каналами, день змінюється вечором. Тут лише розмітка (без DOM), таймери й перемотування живуть в app.js.
import { esc } from './ui.js';
import { icon } from './icons.js';
import { money, num, plural, sum } from './sim.js';

export const TICKS = 14;   // півдня на тиждень: ранок і вечір кожного з семи днів
const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя'];
const CH = { ads: ['Реклама', '#ff8fa3'], bloggers: ['Блогери', '#6aa8ff'], social: ['Соцмережі', '#b79bff'], seo: ['Пошук', '#2fb97a'], events: ['Заходи', '#ffc83a'], wom: ['Рекомендації', '#ffa05a'], press: ['Преса', '#5cc9c9'] };
const SHIRT = ['#6aa8ff', '#ff8fa3', '#ffd34d', '#a9e08a'], HAIR = ['#3b2a1e', '#7a3f1d', '#222', '#2b2b2b'];

export const liveState = ui => (ui.live ||= { run: 'pause', kind: '', tick: 0, left: 0, reps: [], note: '', noteGo: '', lowAt: -99, tiredAt: -99 });
export const dayName = tick => DAYS[Math.min(6, Math.floor(tick / 2))];
export const clockText = tick => (tick % 2 ? '18:00' : '09:00');
export const isNight = tick => tick % 2 === 1;
// проста оцінка: скільки грошей буде за N тижнів, якщо все лишиться як останнім часом
export function forecast(S, weeks) { const h = S.s.history.slice(-4); const net = h.length ? sum(h.map(x => x.rev - x.cost)) / h.length : 0; return { cash: Math.round(S.s.cash + net * weeks), net: Math.round(net) }; }
export const pendingLetters = S => S.s.inbox.filter(m => m.choices && m.chosen == null && m.until === S.s.week);

const lum = hex => { const m = /^#?([\da-f]{6})$/i.exec(hex || ''); if (!m) return 0; const n = parseInt(m[1], 16); return (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) / 255; };
const person = (x, y, body, hair, k = 1) => `<g transform="translate(${x},${y}) scale(${k})" stroke="#1d2433" stroke-width="3" stroke-linejoin="round"><rect x="-14" y="2" width="28" height="30" rx="11" fill="${body}"/><circle cx="0" cy="-12" r="13" fill="#ffd2ad"/><path d="M-13 -14a13 13 0 0 1 26 0c-6-6-14-6-26 0z" fill="${hair}"/></g>`;
const ico = (n, x, y, s = 18) => `<g transform="translate(${x},${y})" style="color:#1d2433">${icon(n, s)}</g>`;
const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

function actOf(S, m) {
  const p = S.s.product, q = p.queue[0], ft = q ? S.feature(q) : null;
  if (!m) { // засновник: чим зайнятий найбільше цього тижня
    const top = Object.entries(S.s.hours).sort((a, b) => b[1] - a[1])[0]?.[0];
    const t = { product: [p.launched ? 'розвиває продукт' : 'будує продукт', 'code'], customers: ['говорить із клієнтами', 'users'], content: ['готує допис', 'megaphone'], sales: ['веде переговори', 'handshake'], invest: ['шукає гроші', 'coins'], freelance: ['бере підробіток', 'laptop'], rest: ['відпочиває', 'sun'] }[top] || ['працює', 'user'];
    return { txt: t[0], ic: t[1], bar: S.s.founder.energy / 100, barC: '#1e8f5a' };
  }
  if (m.role === 'dev') return { txt: ft ? `пише «${ft.t}»` : 'виправляє помилки', ic: 'code', bar: ft ? Math.min(1, (p.progress[q] || 0) / Math.max(1, ft.cost)) : 0, barC: '#5b5bd6' };
  if (m.role === 'design') return { txt: 'малює інтерфейс', ic: 'pen', bar: m.morale / 100, barC: '#1e8f5a' };
  if (m.role === 'mkt') return { txt: 'готує допис', ic: 'megaphone', bar: m.morale / 100, barC: '#1e8f5a' };
  if (m.role === 'sales') return { txt: 'дзвонить клієнтам', ic: 'handshake', bar: m.morale / 100, barC: '#1e8f5a' };
  return { txt: 'відповідає клієнтам', ic: 'headset', bar: m.morale / 100, barC: '#1e8f5a' };
}

// сцена: розрізаний офіс, команда за столами, вулиці-канали, клієнти біля дверей
export function liveScene(S, L, motion = true) {
  const s = S.s, last = s.last, hist = s.history.at(-1), launched = s.product.launched, pend = pendingLetters(S).length;
  const people = [{ m: null, name: s.founder.name.split(' ')[0] }, ...s.team.filter(m => !m.leaving).map(m => ({ m, name: m.name.split(' ')[0] }))];
  const slots = [[262, 170, 238, 126], [500, 170, 470, 126], [262, 308, 238, 262], [500, 308, 470, 262]];
  const col = s.company.color || '#5b5bd6', signTx = lum(col) > .62 ? '#1d2433' : '#fff';
  const desk = (i, p) => {
    const [x, y, bx, by] = slots[i], a = actOf(S, p.m), txt = cut(`${p.name} ${a.txt}`, 23), w = Math.min(206, 46 + txt.length * 7.1);
    return `<g><rect x="${x - 22}" y="${y + 26}" width="170" height="14" rx="4" fill="#d7a86e" stroke="#1d2433" stroke-width="3"/><rect x="${x + 28}" y="${y - 2}" width="64" height="30" rx="4" fill="#243049" stroke="#1d2433" stroke-width="3"/>${person(x, y, SHIRT[i % 4], HAIR[i % 4])}
      <rect x="${bx}" y="${by}" width="${w}" height="36" rx="14" fill="#fff" stroke="#1d2433" stroke-width="2.5"/>${ico(a.ic, bx + 10, by + 8)}<text x="${bx + 36}" y="${by + 23}" font-size="13" font-weight="600" fill="#1d2433">${esc(txt)}</text>
      <rect x="${x + 28}" y="${y + 46}" width="86" height="9" rx="5" fill="#fff" stroke="#1d2433" stroke-width="2"/><rect x="${x + 29}" y="${y + 47}" width="${Math.max(4, 84 * Math.max(0, Math.min(1, a.bar)))}" height="7" rx="4" fill="${a.barC}"/></g>`;
  };
  // канали: чотири найсильніші за відвідувачами минулого тижня (або типові, поки даних немає)
  const vis = Object.entries(last?.visits || {}).filter(([k, v]) => CH[k] && v > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const chans = vis.length ? vis : ['social', 'bloggers', 'seo', 'wom'].map(k => [k, 0]);
  const maxV = Math.max(1, ...chans.map(c => c[1])), posts = [[14, 'L'], [118, 'L'], [708, 'R'], [806, 'R']];
  let walkers = '', boards = '', n = 0;
  chans.forEach(([k, v], i) => {
    const [px, side] = posts[i], [name, c] = CH[k], cnt = v > 0 && launched ? Math.max(1, Math.round(v / maxV * 3)) : 0, door = side === 'L' ? 424 : 486, dx = door - (px + 40);
    boards += `<g><rect x="${px + 38}" y="326" width="6" height="64" fill="#8a6a44" stroke="#1d2433" stroke-width="2.5"/><rect x="${px}" y="290" width="${side === 'L' ? 96 : 92}" height="40" rx="9" fill="${c}" stroke="#1d2433" stroke-width="3"/><text x="${px + 48}" y="306" text-anchor="middle" font-size="13" font-weight="700" fill="#1d2433">${esc(name)}</text><text x="${px + 48}" y="322" text-anchor="middle" font-size="12.5" fill="#1d2433">${v ? num(v) + ' відв.' : 'поки немає'}</text></g>`;
    for (let j = 0; j < cnt; j++) {
      const dur = 7 + (n % 3) * 1.5, begin = -(j * dur / cnt + (n % 4) * .7), b = (j + i) % 4;
      walkers += motion
        ? `<g transform="translate(${px + 40},364)"><animateMotion path="M0 0 L${dx} 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.9;.97;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${person(0, 0, c, HAIR[b], .85)}</g>`
        : person(px + 40 + dx * (.2 + j * .25), 364, c, HAIR[b], .85);
      n++;
    }
  });
  const rev = hist?.rev || 0, coins = rev > 0 ? [0, 1, 2].map(i => motion ? `<g transform="translate(${450 + (i - 1) * 16},384)"><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 -70" dur="3.2s" begin="${-i * 1.05}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur="3.2s" begin="${-i * 1.05}s" repeatCount="indefinite"/><circle r="10" fill="#ffd34d" stroke="#1d2433" stroke-width="3"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1d2433">₴</text></g>` : `<g transform="translate(${450 + (i - 1) * 16},${350 - i * 22})"><circle r="10" fill="#ffd34d" stroke="#1d2433" stroke-width="3"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1d2433">₴</text></g>`).join('') : '';
  const queue = launched ? 0 : Math.min(4, Math.round((hist?.wait || 0) / 25));
  const waiting = Array.from({ length: queue }, (_, i) => person(380 - i * 34, 364, SHIRT[(i + 1) % 4], HAIR[i % 4], .85)).join('');
  const win = [250, 330, 520, 600].map(x => `<rect class="lv-win" x="${x}" y="126" width="22" height="16" rx="3"/>`).join('');
  return `<svg class="lv-scene" data-night="${isNight(L.tick) ? 1 : 0}" viewBox="0 0 900 470" role="img" aria-label="Офіс компанії «${esc(s.company.name)}»: працює ${people.length} ${plural(people.length, 'людина', 'людини', 'людей')}">
  <defs><linearGradient id="lvsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d3ff"/><stop offset="1" stop-color="#fff1cc"/></linearGradient><linearGradient id="lvglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#eef3ff"/></linearGradient></defs>
  <rect width="900" height="470" fill="url(#lvsky)"/>
  <path d="M0 388V250h50v50h60v-80h50v70h70v-50h70v148z" fill="#c9d6ea" stroke="#1d2433" stroke-width="2.5" opacity=".7"/><path d="M700 388v-118h50v-55h60v85h70v-65h20v153z" fill="#c9d6ea" stroke="#1d2433" stroke-width="2.5" opacity=".7"/>
  <g stroke="#1d2433" stroke-width="3" fill="#fff"><ellipse cx="560" cy="70" rx="60" ry="20"/><ellipse cx="610" cy="82" rx="40" ry="14"/></g>
  <g class="lv-sun"><circle cx="150" cy="62" r="24" fill="#ffd34d" stroke="#1d2433" stroke-width="3"/></g><g class="lv-moon"><circle cx="150" cy="62" r="22" fill="#f1f1ff" stroke="#1d2433" stroke-width="3"/><circle cx="160" cy="56" r="18" fill="#3a4a7a"/></g>
  <rect y="388" width="900" height="30" fill="#8fcf9f" stroke="#1d2433" stroke-width="3"/><rect y="418" width="900" height="52" fill="#b7b9c8" stroke="#1d2433" stroke-width="3"/><g stroke="#fff" stroke-width="4" stroke-dasharray="26 18"><line x1="0" y1="444" x2="900" y2="444"/></g>
  <rect x="220" y="110" width="470" height="278" rx="12" fill="url(#lvglass)" stroke="#1d2433" stroke-width="4"/>${win}
  <rect x="220" y="78" width="470" height="44" rx="10" fill="${esc(col)}" stroke="#1d2433" stroke-width="4"/><text x="455" y="108" text-anchor="middle" fill="${signTx}" font-size="23" font-weight="800">${esc(cut(s.company.name, 24))}</text>
  <line x1="220" y1="250" x2="690" y2="250" stroke="#1d2433" stroke-width="4"/><line x1="455" y1="122" x2="455" y2="250" stroke="#1d2433" stroke-width="3" stroke-dasharray="8 6"/>
  ${people.slice(0, 4).map((p, i) => desk(i, p)).join('')}${people.length > 4 ? `<text x="690" y="372" text-anchor="end" font-size="12" font-weight="700" fill="#1d2433">і ще ${people.length - 4} у команді</text>` : ''}
  <rect x="438" y="322" width="34" height="66" rx="3" fill="#a77b4a" stroke="#1d2433" stroke-width="3"/><circle cx="466" cy="358" r="3" fill="#1d2433"/>
  ${launched ? '' : `<g><rect x="492" y="352" width="170" height="30" rx="8" fill="#fff4d2" stroke="#1d2433" stroke-width="2.5"/><text x="577" y="372" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1d2433">Скоро відкриття</text></g>`}
  ${people.length < 4 && launched ? `<g><rect x="492" y="274" width="170" height="84" rx="12" fill="#e9f7ee" stroke="#1d2433" stroke-width="3"/><text x="577" y="299" text-anchor="middle" font-size="13" font-weight="700" fill="#1d2433">Каса за день</text><text x="577" y="334" text-anchor="middle" font-size="26" font-weight="800" fill="#1e8f5a">+${num(Math.round(rev / 7))} ₴</text></g>` : ''}
  ${boards}${waiting}${walkers}${coins}
  ${pend ? `<g transform="translate(455,300)"><animateTransform attributeName="transform" type="translate" values="455 300;455 292;455 300" dur="1.1s" repeatCount="indefinite"/><circle r="17" fill="#ffcfd6" stroke="#1d2433" stroke-width="3"/>${ico('mail', -9, -9)}</g>` : ''}
  <rect id="lv-night" x="0" y="0" width="900" height="470" fill="#0e1a3a" opacity="0" pointer-events="none"/>
  </svg>`;
}

const feedItem = (i, bg, t, d) => `<li class="lv-ev"><span class="lv-ic" style="background:${bg}">${icon(i, 16)}</span><span><b>${esc(t)}</b>${d ? `<small>${esc(d)}</small>` : ''}</span></li>`;
function feed(S) {
  const s = S.s, L = s.last, out = [];
  for (const m of pendingLetters(S)) out.push(feedItem('mail', '#ffcfd6', `Лист чекає рішення: ${m.title}`, 'Час зупиниться, поки ви не відповісте'));
  if (L) {
    if (L.money?.revenue > 0) out.push(feedItem('coins', '#bff0d3', `Виручка за тиждень: ${money(L.money.revenue)}`, L.rec?.newPaid ? `Нових платних клієнтів: ${L.rec.newPaid}` : ''));
    for (const f of L.built || []) out.push(feedItem('check', '#bcd9ff', `Готова функція «${S.feature(f).t}»`, ''));
    for (const e of L.events || []) out.push(feedItem('mail', '#ffd95a', e.t, e.d));
    for (const n of L.notes || []) out.push(feedItem('info', '#e7eaf5', n, ''));
  }
  if (!out.length) out.push(feedItem('info', '#e7eaf5', 'Тут з’являтимуться події вашої компанії', 'Натисніть «Грати» або перемотайте час'));
  return `<ul class="lv-feed-l">${out.slice(0, 6).join('')}</ul>`;
}

export function liveHome(S, ui) {
  const s = S.s, L = liveState(ui), rw = S.runwayWeeks(), h = s.history, last = h.at(-1), prev = h.at(-2), fc = forecast(S, 4), motion = !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const net = last && prev ? last.cash - prev.cash : 0;
  return `<section class="lv" aria-label="Живий офіс компанії">
    <div class="lv-warn" role="note">${icon('alert', 20)}<span><b>Перемотування зупиниться саме,</b> якщо прийде лист, що чекає вашого рішення, якщо грошей лишиться менше ніж на 8 тижнів або у вас закінчаться сили.</span></div>
    <div class="lv-grid"><div class="lv-stage">${liveScene(S, L, motion)}<div class="lv-hud" aria-live="off"><span id="lv-day">${dayName(L.tick)}</span><span id="lv-clock">${clockText(L.tick)}</span><span class="lv-run" id="lv-run">Пауза</span><i class="lv-wk"><b id="lv-wkb"></b></i></div></div>
      <aside class="lv-side"><h2>Що відбувається</h2>${feed(S)}<button class="btn sm" data-act="go" data-to="inbox">${icon('mail', 15)} Відкрити пошту</button></aside></div>
    <div id="lv-note" role="status" aria-live="polite"></div>
    <div class="kpis"><div class="kpi"><span class="kpi-l">Гроші</span><b>${money(s.cash)}</b><small>${last && prev ? (net >= 0 ? '+' : '−') + money(Math.abs(Math.round(net / 7))).replace(' ₴', '') + ' ₴ за день' : 'на рахунку зараз'}</small></div>
      <div class="kpi"><span class="kpi-l">Клієнти</span><b>${num(S.activeUsers())}</b><small>платять: ${num(S.paidUsers())}</small></div>
      <div class="kpi"><span class="kpi-l">Виручка за тиждень</span><b>${money(last?.rev || 0)}</b><small>${prev ? 'минулого: ' + money(prev.rev) : 'ще немає даних'}</small></div>
      <div class="kpi ${rw < 8 ? 'bad' : rw < 16 ? 'warn' : ''}"><span class="kpi-l">Вистачить грошей на</span><b>${rw === Infinity ? 'заробляємо' : rw > 104 ? '2+ роки' : Math.max(0, Math.floor(rw)) + ' тиж.'}</b><small>через місяць близько ${money(fc.cash)}</small></div></div></section>`;
}

// оновлення живих частин без перемальовування сцени (щоб не збивати анімацію)
export function paintLive(root, S, L) {
  const svg = root.querySelector('.lv-scene'); if (!svg) return;
  svg.dataset.night = isNight(L.tick) ? '1' : '0';
  try { L.run === 'pause' ? svg.pauseAnimations() : svg.unpauseAnimations(); } catch { /* немає підтримки анімацій */ }
  const set = (id, t) => { const el = root.querySelector('#' + id); if (el) el.textContent = t; };
  set('lv-day', dayName(L.tick)); set('lv-clock', clockText(L.tick));
  set('lv-run', L.run === 'pause' ? 'Пауза' : L.kind === 'play' ? 'Іде час' : 'Перемотування');
  const wk = root.querySelector('#lv-wkb'); if (wk) wk.style.width = ((L.tick + 1) / TICKS * 100) + '%';
  const note = root.querySelector('#lv-note');
  if (note) { const html = L.note ? `<p class="lv-notep">${icon('alert', 18)}<span>${esc(L.note)}</span>${L.noteGo ? `<button class="btn sm" data-act="go" data-to="${esc(L.noteGo)}">Відкрити</button>` : ''}</p>` : ''; if (note._h !== html) { note.innerHTML = html; note._h = html; } }
}
