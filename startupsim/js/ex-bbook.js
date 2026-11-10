// Симулятор стартапу · «Брендбук»: збирає логотип, кольори й характер бренду в одну сторінку й перевіряє, чи вони узгоджені.
import { esc } from './ui.js';
import { icon } from './icons.js';
import { reg, xin, tip, box, checks, exDone } from './ex-core.js';
import { lockup, toHsl, BF } from './ex-brand.js';
import { pal } from './ex8.js';

const len = s => String(s || '').trim().length;
const CLICHE = /найкращ|№\s*1|якісн|професійн|інноваційн|унікальн|лідер/i;
const AX = [['serious', 'Серйозний', 'Грайливий'], ['classic', 'Класичний', 'Сучасний'], ['access', 'Доступний', 'Преміальний'], ['friend', 'Дружній', 'Експертний']];
const stp = (n, t) => `<span class="ex-n">${n}</span>${t}`;
// дані сусідніх вправ читаємо, не створюючи їх у збереженні
const peek = (S, id) => S.s.ex?.d?.[id] || null;
const hueGap = (a, b) => { const x = Math.abs(toHsl(a)[0] - b); return Math.min(x, 360 - x); };
const tone = ax => AX.map(([k, a, b]) => { const v = ax?.[k] ?? 50; return v < 38 ? a : v > 62 ? b : null; }).filter(Boolean);

function facts(S, d) {
  const L = peek(S, 'logo'), P = peek(S, 'palette'), V = peek(S, 'brandvoice'), c = S.s.company;
  const colors = [];
  if (L) { colors.push(['Основний колір знака', L.c1]); if (L.grad && L.c2) colors.push(['Другий колір знака', L.c2]); }
  const pl = P ? pal(P) : null;
  return { L, P, V, c, pl, vals: V?.vals || [], slogan: V?.slogan || '', tone: tone(V?.ax), colors };
}
function review(S, d) {
  const f = facts(S, d), r = [];
  r.push([!!f.L && exDone(S, 'logo'), 'Логотип створено', 'Спершу завершіть вправу «Логотип і фірмовий стиль»']);
  r.push([!!f.P && exDone(S, 'palette'), 'Палітру складено', 'Складіть палітру у вправі «Палітра бренду»']);
  r.push([f.vals.length >= 3, 'Обрано три цінності', 'Оберіть цінності у вправі «Характер бренду»']);
  if (f.L && f.P) { const g = hueGap(f.L.c1, f.P.h); r.push([g <= 35, 'Колір знака пасує до палітри', `Відтінок знака відрізняється від палітри на ${Math.round(g)}°: підберіть ближчий або змініть палітру`]); }
  if (f.L) r.push([len(f.L.name) > 0 && f.L.name.trim().toLowerCase() === f.c.name.trim().toLowerCase(), 'Назва на логотипі збігається з назвою компанії', 'У логотипі інша назва, ніж у компанії: приведіть до одного вигляду']);
  r.push([f.slogan && !CLICHE.test(f.slogan), 'Слоган є й не шаблонний', 'Додайте слоган без слів «найкращий», «якісний»']);
  r.push([len(d.promise) >= 20, 'Обіцянка бренду записана', 'Напишіть одне речення про те, що отримає клієнт']);
  r.push([d.dos.filter(len).length >= 2 && d.donts.filter(len).length >= 2, 'Є хоча б по два правила «Завжди» й «Ніколи»', 'Додайте правила, щоб усі в команді говорили однаково']);
  return r;
}

reg({
  id: 'bbook', stage: 1, ord: 7, opt: true, cols: true, t: 'Брендбук', d: 'Зберіть логотип, кольори й голос бренду на одній сторінці й перевірте, що все пасує.', icon: 'book', min: 10,
  intro: `Брендбук — це коротка інструкція, як виглядає й говорить компанія. Завдяки їй усі, хто працює з брендом, роблять його однаково. Тут сторінка збирається сама з ваших попередніх вправ, а ви дописуєте головне: обіцянку клієнту й правила голосу.`,
  data: () => ({ promise: '', dos: ['', '', ''], donts: ['', '', ''], t: 0 }),
  view(S, d) {
    d.dos ||= ['', '', '']; d.donts ||= ['', '', ''];
    return `${box(stp(1, 'Обіцянка клієнту'), `<p class="sub">Одне речення: кому ви допомагаєте, що вони отримують і чому вам можна вірити. Наприклад: «Допомагаємо школярам робити домашку за п’ять хвилин, а батькам — не сидіти поруч».</p>${xin('bbook', 'promise', d, { max: 220, area: true, rows: 3, ph: 'Допомагаємо [кому] [що отримати], тому що [чому]' })}`, { ic: 'heart' })}
    ${box(stp(2, 'Правила голосу'), `<p class="sub">Три речі, які бренд робить завжди, і три, яких не робить ніколи. Наприклад: «Завжди звертаємось на «ви»» і «Ніколи не лякаємо штрафами».</p><div class="two"><div><b class="sm">Завжди</b>${d.dos.map((_, i) => xin('bbook', `dos.${i}`, d, { max: 100, ph: `Правило ${i + 1}` })).join('')}</div><div><b class="sm">Ніколи</b>${d.donts.map((_, i) => xin('bbook', `donts.${i}`, d, { max: 100, ph: `Правило ${i + 1}` })).join('')}</div></div>`, { ic: 'pen' })}
    ${box(stp(3, 'Чи все пасує?'), checks(review(S, d)), { ic: 'check' })}`;
  },
  live(S, d) {
    const f = facts(S, d), L = f.L, F = L ? BF[L.font] || BF.modern : null, sw = c => `<li><i style="background:${esc(c[1])}"></i><span>${esc(c[0])}<small>${esc(c[1])}</small></span></li>`;
    const pc = f.pl ? [['Головний', f.pl.main], ['Акцент', f.pl.accent], ['Світлий фон', f.pl.soft], ['Темний текст', f.pl.dark]] : [];
    return `<div class="bbook"><header><span>Брендбук</span><b>${esc(f.c.name)}</b></header>
      <section>${L ? lockup(L, { size: 64 }) : '<p class="muted sm">Логотип з’явиться після вправи «Логотип і фірмовий стиль».</p>'}</section>
      <section><h4>Кольори</h4><ul class="bb-sw">${[...f.colors, ...pc].map(sw).join('') || '<li class="muted sm">Кольорів поки немає</li>'}</ul></section>
      <section><h4>Шрифт і голос</h4><p>${F ? `Шрифт: <b>${esc(F.t)}</b>. ` : ''}${f.tone.length ? `Характер: <b>${esc(f.tone.join(', ').toLowerCase())}</b>.` : ''}</p>${f.vals.length ? `<p class="bb-v">${f.vals.map(v => `<span>${esc(v)}</span>`).join('')}</p>` : ''}${f.slogan ? `<p class="bb-sl">«${esc(f.slogan)}»</p>` : ''}</section>
      ${len(d.promise) ? `<section><h4>Обіцянка</h4><p>${esc(d.promise)}</p></section>` : ''}
      ${(d.dos || []).some(len) || (d.donts || []).some(len) ? `<section class="two"><div><h4>Завжди</h4><ul>${d.dos.filter(len).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Ніколи</h4><ul>${d.donts.filter(len).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></section>` : ''}
      <footer><button type="button" class="btn sm" onclick="print()">${icon('printer', 14)} Надрукувати сторінку</button></footer></div>`;
  },
  ready(S, d) {
    const r = review(S, d), own = len(d.promise) >= 20 && d.dos.filter(len).length >= 1 && d.donts.filter(len).length >= 1;
    return own ? { ok: true, stars: 1 + (r.filter(x => x[0]).length >= 6 ? 1 : 0) + (r.every(x => x[0]) ? 1 : 0) } : { ok: false, msg: 'Напишіть обіцянку й хоча б по одному правилу «Завжди» та «Ніколи»' };
  },
});
