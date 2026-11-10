// Симулятор стартапу · вправи етапу 1 «Ніша й продукт»: ніша, ринок і конкуренти, потреби клієнтів, модель заробітку, перша версія.
import { MODELS } from './data.js';
import { money } from './sim.js';
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xnum, tip, box, checks, bar, radar, stars, hash, clamp, sumOf, pc, money0 } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Модель заробітку ═════════ */
const MODEL_X = { free: { su: .4, pay: 1, arpu: 3, hint: 'Заробіток із реклами: 3 ₴ на місяць з користувача.' }, freemium: { su: .12, pay: .05, hint: 'Платить 5 із 100 зареєстрованих.' }, trial: { su: .06, pay: .35, hint: 'Реєструється менше, а платить третина.' }, device: { su: .015, pay: 1, once: true, hint: 'Платять одразу, але є собівартість товару.' }, b2b: { su: .004, pay: .5, mult: 25, hint: 'Клієнтів мало, зате кожен — це організація.' } };
reg({
  id: 'bmodel', stage: 0, ord: 5, opt: true, t: 'Модель заробітку', d: 'Порівняйте способи заробляти й оберіть свій.', icon: 'coins', min: 10,
  intro: `${term('Бізнес-модель', 'Бізнес-модель')} відповідає на питання: хто платить, за що і як. Порівняйте умовні розрахунки для різних моделей на однакових відвідувачах і оберіть ту, що пасує вашій ідеї.`,
  data: S => ({ visitors: 2000, price: Math.round(S.seg().wtp * .8 / 10) * 10, pick: '', why: '', applied: false }),
  view(S, d) {
    const g = S.seg(), models = S.I.models, rows = models.map(m => { const x = MODEL_X[m] || { su: .05, pay: .1 }, price = m === 'b2b' ? d.price * (x.mult || 1) / 1 : d.price, users = d.visitors * x.su, payers = users * x.pay; const rev = m === 'free' ? users * x.arpu : payers * price; return { m, users, payers, rev, once: !!x.once, hint: x.hint }; });
    const max = Math.max(1, ...rows.map(r => r.rev));
    return `${box('Умови розрахунку', `<div class="xg c2">${xsl('bmodel', 'visitors', d, { min: 500, max: 20000, step: 500, label: 'Відвідувачів сайту за місяць', u: '' })}${xsl('bmodel', 'price', d, { min: 10, max: Math.max(500, Math.round(g.wtp * 2)), step: 10, label: 'Ціна, ₴', u: ' ₴' })}</div><p class="sm muted">Цифри умовні: вони лише показують різницю між моделями.</p>`, { ic: 'wrench' })}
    ${box('Що дає кожна модель', `<div class="xlist">${rows.map(r => `<div class="nrow"><div class="nh"><b>${esc(MODELS[r.m]?.t || r.m)}</b><span class="ns">${money0(r.rev)}${r.once ? '' : ' / міс'}</span></div>${bar(r.rev / max, { label: MODELS[r.m]?.t })}<p class="sm muted">${esc(MODELS[r.m]?.desc || '')} ${esc(r.hint)}</p><div class="nd"><span>Зареєструється <b>${Math.round(r.users)}</b></span><span>Платитимуть <b>${Math.round(r.payers)}</b></span></div>
      <div class="xrow">${xp('bmodel', 'pick', r.m, 'Обрати цю модель', d.pick === r.m, { cls: 'card' })}</div></div>`).join('')}</div>`, { ic: 'chart' })}
    ${box('Чому ця модель?', `${xin('bmodel', 'why', d, { area: true, max: 300, ph: 'Обираю цю модель, тому що наші клієнти…', hint: 'Подумайте: хто платитиме, коли й скільки готовий платити.' })}<div class="xrow" style="margin-top:10px">${xb('bmodel', 'apply', d.applied ? 'Модель застосовано в грі' : 'Застосувати в грі', { cls: 'primary', dis: !d.pick || d.pick === 'b2b' || S.s.model === d.pick })}${d.pick === 'b2b' ? '<small class="muted">Для організацій модель вмикається автоматично, коли ви обираєте їх цільовими клієнтами.</small>' : ''}</div>`, { ic: 'check' })}`;
  },
  acts: { apply(S, d, el, C) { S.setModel(d.pick); d.applied = true; C.toast('Модель застосовано в грі', 'good'); } },
  ready(S, d) { return !d.pick ? { ok: false, msg: 'Оберіть модель' } : len(d.why) < 20 ? { ok: false, msg: 'Поясніть свій вибір' } : { ok: true, stars: 2 + (len(d.why) >= 80 ? 1 : 0) }; },
});
