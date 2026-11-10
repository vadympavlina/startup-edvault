// Симулятор стартапу · вправи етапу 2 «Аудиторія й бренд»: сегментація 5W, маркетингова стратегія, SMART-ціль, логотип, характер бренду.
import { CHANNELS } from './data.js';
import { FONTS, TONES, SYMBOLS, PALETTE } from './mods.js';
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xcol, tip, box, checks, bar, hash, clamp, sumOf, money0, goalMetrics } from './ex-core.js';

const stp = (n, t) => `<span class="ex-n">${n}</span>${t}`;
const len = s => String(s || '').trim().length;
const chips = (id, p, opts, cur, o = {}) => opts.map(v => xp(id, p, v, esc(v), cur === v, o)).join('');

/* ═════════ Характер бренду (необов'язкова) ═════════ */
const VALUES = ['Чесність', 'Простота', 'Турбота', 'Швидкість', 'Якість', 'Сміливість', 'Гумор', 'Надійність', 'Креативність', 'Доступність', 'Експертність', 'Свобода'];
const AXES5 = [['serious', 'Серйозний', 'Грайливий'], ['classic', 'Класичний', 'Сучасний'], ['access', 'Доступний', 'Преміальний'], ['friend', 'Дружній', 'Експертний']];
const CLICHE = /найкращ|№\s*1|якісн|професійн|інноваційн|унікальн|лідер/i;
reg({
  id: 'brandvoice', stage: 1, ord: 5, opt: true, t: 'Характер бренду', d: 'Оберіть цінності, характер і придумайте слоган.', icon: 'heart', min: 10,
  intro: `Бренд — це ще й характер: як ви розмовляєте з людьми. Оберіть три цінності, налаштуйте особистість бренду й придумайте слоган. Потім перевірте, чи не звучить він шаблонно.`,
  data: () => ({ vals: [], ax: { serious: 50, classic: 50, access: 50, friend: 50 }, slogan: '', own: [], t: 0 }),
  onSet: (S, d, p) => { if (p.startsWith('ax.')) d.t = (d.t || 0) + 1; },
  view(S, d) {
    const wc = d.slogan.trim().split(/\s+/).filter(Boolean).length, F = FONTS[S.s.brand.font] || FONTS.modern, c = S.s.company;
    return `${box(stp(1, 'Три цінності'), `<p class="sub">Цінності — це те, у що вірить ваша компанія. Оберіть три, які найкраще про вас. Наприклад, для освітнього сервісу: «Простота», «Турбота», «Чесність».</p><div class="xrow">${[...VALUES, ...d.own].map(v => xp('brandvoice', 'vals', v, v, d.vals.includes(v), { set: 'tog', max: 3 })).join('')}</div><div class="xadd mt"><input class="inp" id="bv-own" maxlength="120" placeholder="Своя цінність">${xb('brandvoice', 'addOwn', 'Додати', { ic: 'plus' })}</div>`, { ic: 'heart', side: `обрано ${d.vals.length} з 3` })}
    ${box(stp(2, 'Який у вас характер?'), `<p class="sub">Пересувайте повзунки між двома крайнощами: так ви показуєте, як бренд говоритиме з людьми.</p>` + AXES5.map(([k, a, b]) => `<div class="ax5"><span>${a}</span>${xsl('brandvoice', `ax.${k}`, d, { min: 0, max: 100, step: 5, label: '', v: d.ax[k] })}<span>${b}</span></div>`).join(''), { ic: 'compass' })}
    ${box(stp(3, 'Слоган'), `<p class="sub">Слоган — це коротка фраза, яка запам’ятовується. Краще 2–7 слів, без слів «найкращий» чи «якісний».</p>${xin('brandvoice', 'slogan', d, { max: 70, ph: 'Коротко й запам’ятовується', label: 'Ваш слоган' })}${checks([[wc >= 2 && wc <= 7, 'Коротко: 2–7 слів', 'Слоган запам’ятовується, коли він короткий'], [!CLICHE.test(d.slogan) && wc > 0, 'Без шаблонних слів («найкращий», «якісний», «№1»)', 'Такі слова є в кожного конкурента'], [wc >= 3, 'Розповідає про вигоду чи дію, а не лише про назву']])}
      <div class="brandcard" style="--c:${c.color};font-family:${F.css}"><b>${esc(c.name)}</b><span>${esc(d.slogan || 'Ваш слоган з’явиться тут')}</span><i>${d.vals.map(esc).join(' · ')}</i></div>`, { ic: 'pen' })}`;
  },
  acts: { addOwn(S, d) { const el = document.getElementById('bv-own'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } if (!d.own.includes(v)) d.own.push(v); if (d.vals.length < 3) d.vals.push(v); } },
  ready(S, d) { const wc = d.slogan.trim().split(/\s+/).filter(Boolean).length; return d.vals.length < 3 ? { ok: false, msg: 'Оберіть три цінності' } : (d.t || 0) < 2 ? { ok: false, msg: 'Налаштуйте хоча б дві шкали особистості' } : wc < 2 ? { ok: false, msg: 'Придумайте слоган із двох слів і більше' } : { ok: true, stars: 1 + (wc <= 7 ? 1 : 0) + (!CLICHE.test(d.slogan) ? 1 : 0) }; },
});
