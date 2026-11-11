// Симулятор стартапу · етапи: бічний маршрут, аркуш етапу й тонка смужка етапу на інших сторінках.
import { icon } from './icons.js';
import { esc } from './ui.js';
import { STAGES } from './stages.js';
import { stars, exStars, goalNow, exAll, exDone, X, STAGE_T, exCount } from './ex-core.js';

const plural = (n, a, b, c) => { const m = n % 100, k = m % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; };

// ліворуч: дев'ять етапів вертикальним маршрутом
export function stageRail(S, ui, info) {
  const sel = info.cur; // між етапами не переходять: гра сама веде до наступного, коли виконано всі справи
  const row = (st, i) => {
    const cls = st.done && (i < info.cur || info.allDone) ? 'done' : i === info.cur ? 'cur' : i <= info.reached ? 'open' : 'lock';
    const label = `Етап ${i + 1}: ${st.t}${cls === 'done' ? ', пройдено' : cls === 'lock' ? ', ще закрито' : `, виконано ${st.n} з ${st.m}`}`;
    return `<li><div class="rs ${cls} ${i === sel ? 'sel' : ''}" role="group" aria-current="${i === sel ? 'step' : 'false'}" aria-label="${esc(label)}"><span class="n">${cls === 'done' ? icon('check', 16) : cls === 'lock' ? icon('lock', 13) : i + 1}</span><span class="rt"><b>${esc(st.t)}</b><small>${cls === 'lock' ? 'ще закрито' : `${st.n} з ${st.m}`}</small></span></div></li>`;
  };
  return `<aside class="rail" aria-label="Етапи стартапу"><h2>Шлях стартапу</h2><ol>${info.list.map(row).join('')}</ol>
    <div class="rail-foot"><span>Вправ виконано</span><b>${info.ex} з ${info.exAll}</b><div class="x-bar"><i style="width:${info.exAll ? info.ex / info.exAll * 100 : 0}%"></i></div></div></aside>`;
}

// праворуч: аркуш обраного етапу
export function stageSheet(S, ui, info) {
  const i = info.cur, st = info.list[i], next = info.list[i + 1];
  const first = st.req.find(x => !x.ok);
  const btn = (x, primary) => x.go === 'file' ? '' : `<button class="btn sm ${primary ? 'primary' : ''}" data-act="go" data-to="${x.go}" ${x.hl ? `data-hl="${esc(x.hl)}"` : ''}>${esc(x.btn)}</button>`;
  const step = (x, k, o) => `<li class="step ${x.ok ? 'ok' : x === first && !o ? 'now' : ''}"><span class="sn">${x.ok ? icon('check', 18) : x.ic ? icon(x.ic, 18) : k + 1}</span>
    <div><b>${esc(x.t)}</b><small>${esc(x.d)}</small>${x.ex && x.ok ? `<span class="sx">${stars(exStars(S, x.ex))}</span>` : ''}</div>${x.ok && !x.ex ? `<span class="chip ok">${icon('check', 14)} Готово</span>` : btn(x, x === first && !o)}</li>`;
  const head = info.allDone && i === info.cur
    ? `<p class="k">Усі етапи пройдено</p><h1>Ви пройшли весь шлях стартапу</h1><p class="lead">Усі розділи відкриті. Далі можна вдосконалювати вправи, розвивати компанію й готувати підсумковий звіт.</p>`
    : `<p class="k">Етап ${i + 1} з ${STAGES.length}${st.done ? ' · пройдено' : ''}</p><h1>${esc(st.long)}</h1><p class="lead">${esc(st.why)}</p>`;
  const pct = st.m ? st.n / st.m : 1;
  const opt = st.opt.length ? `<details class="ws-opt"${st.on && !st.done ? '' : ''}><summary>${icon('plus', 15)} Додатково <span class="muted sm">${st.on} з ${st.opt.length}</span></summary><ol class="steps">${st.opt.map((x, k) => step(x, k, true)).join('')}</ol></details>` : '';
  const foot = st.done
    ? (next ? `<div class="ws-next ok">${icon('check', 20)}<div><b>Етап пройдено</b><small>Далі: «${esc(next.t)}» — ${esc(next.topics.join(', ').toLowerCase())}.</small></div><button class="btn primary" data-act="stage" data-i="${i + 1}">До етапу ${i + 2}</button></div>` : '')
    : (next ? `<div class="ws-next">${icon('lock', 18)}<div><b>Далі: етап ${i + 2} «${esc(next.t)}»</b><small>Відкриється, коли ви виконаєте всі справи цього етапу: ${esc(next.topics.join(', ').toLowerCase())}.</small></div></div>` : '');
  return `<section class="ws" aria-label="Етап ${i + 1}">${head}
    <ul class="topics" aria-label="Що розбираємо">${st.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="ws-prog"><div class="x-bar" role="meter" aria-valuenow="${st.n}" aria-valuemax="${st.m}" aria-label="Виконано справ"><i style="width:${pct * 100}%"></i></div><small>Виконано ${st.n} з ${st.m} ${plural(st.m, 'справи', 'справ', 'справ')}</small></div>
    <ol class="steps">${st.req.map((x, k) => step(x, k)).join('')}</ol>${opt}${foot}</section>`;
}

// на інших сторінках: тонка смужка з поточним етапом
export function stageBar(S, info) {
  const st = info.list[info.cur], pct = st.m ? st.n / st.m : 1;
  return `<button class="stbar" data-act="stage" data-i="${info.cur}"><span class="n">${info.cur + 1}</span><span><small>Етап ${info.cur + 1} з ${STAGES.length}</small><b>${esc(st.t)}</b></span><span class="x-bar"><i style="width:${pct * 100}%"></i></span><span class="sc">${st.n} з ${st.m}</span>${icon('right', 16)}</button>`;
}

// SMART-ціль, поставлена у вправі: прогрес до неї видно на головній
export function goalCard(S) {
  const q = goalNow(S); if (!q) return '';
  const { g, M, now, pct, left, status } = q;
  const msg = status === 'done' ? 'Ціль досягнуто. Поставте нову, амбітнішу.' : status === 'late' ? 'Термін минув. Проаналізуйте, що завадило, і поставте нову ціль.' : `Лишилось ${Math.max(0, left)} ${plural(Math.max(0, left), 'тиждень', 'тижні', 'тижнів')}`;
  return `<section class="goalcard ${status}" aria-label="SMART-ціль"><span class="ex-ic">${icon(status === 'done' ? 'check' : 'flag', 22)}</span><div class="gb"><small>Ваша SMART-ціль</small><b>${esc(g.text)}</b><div class="x-bar" role="meter" aria-valuenow="${Math.round(pct * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct * 100}%"></i></div><small>Зараз: ${esc(M.fmt(now))} · ${msg}</small></div><button class="btn sm" data-act="go" data-to="ex-smart">Змінити</button></section>`;
}

// короткий результат вправи для підсумкового звіту й файлу
const list = a => a.filter(Boolean).join(', ');
const SUMM = {
  interview: (S, d) => `розмов: ${(d.runs || []).length}`, palette: (S, d) => d.name && `палітра «${d.name}»`, premortem: (S, d) => `головних ризиків: ${d.top.length}`, cashflow: (S, d) => d.w && `передоплата на тижні ${d.w.adv}`,
  negotiate: (S, d) => d.deal && `інвестор отримав ${d.deal.e}%`, abtest: (S, d) => `тестів: ${d.runs.length}`, journey: (S, d) => `кроків клієнта: ${Object.keys(d.tp).length}`, conflict: (S, d) => `ситуацій розібрано: ${Object.keys(d.a).length}`,
  rate: (S, d) => d.pk && `ставка: ${Math.round((d.inc + 1760) / .95 / Math.max(1, (d.days - d.vac / 12) * d.hrs * d.bill / 100))} ₴/год`, scam: (S, d) => `розпізнано: ${Object.keys(d.a).length} з 8`, compound: (S, d) => `строк ${d.yrs} р.`,
  niche: (S, d) => d.pickName && `ніша: ${d.pickName}`, w5: (S, d) => { const m = d.segs?.find(x => x.id === d.main); return m && `головний сегмент: ${m.name}`; }, strategy: (S, d) => d.goal && `мета: ${d.goal}`,
  smart: (S, d) => S.s.goal?.text, logo: (S, d) => d.name && `знак для «${d.name}»`, usp: (S, d) => d.pick && d[d.pick] && 'унікальну пропозицію записано в бізнес-план', naming: (S, d) => d.final && `назва: ${d.final}`,
  price: (S, d) => d.final && `ціна ${Math.round(d.final).toLocaleString('uk-UA')} ₴`, sources: (S, d) => `потреба ${Math.round(d.need).toLocaleString('uk-UA')} ₴`, assort: (S, d) => d.items && `варіантів: ${d.items.length}`,
  channels: (S, d) => d.sel && `канали: ${d.sel.length}`, leadership: (S, d) => d.mine && ({ a: 'авторитарний', d: 'демократичний', l: 'ліберальний', c: 'коучинг' }[d.mine] || ''), hiring: (S, d) => d.pick && `обрано кандидата: ${d.pick}`,
  exchanges: (S, d) => d.pick && `старт: ${({ global: 'міжнародна біржа', ua: 'українська біржа', social: 'соцмережі', direct: 'прямі замовники', market: 'маркетплейс' })[d.pick] || d.pick}`, fop: (S, d) => d.form && `форма: ${d.form === 'fop' ? 'ФОП' : 'ТОВ'}`,
  portfolio: (S, d) => d.al && `інструментів у портфелі: ${Object.values(d.al).filter(v => v > 0).length}`,
};
export function exSummary(S) {
  const n = exCount(S); if (!n) return '';
  const rows = STAGE_T.map((t, i) => { const ex = exAll().filter(e => e.stage === i && exDone(S, e.id)); return ex.length ? `<tr><th scope="row">${i + 1}. ${esc(t)}</th><td>${ex.map(e => { const r = SUMM[e.id]?.(S, X(S, e.id)); return `<div class="xsr"><b>${esc(e.t)}</b>${r ? ` <span class="muted">· ${esc(r)}</span>` : ''} ${stars(exStars(S, e.id))}</div>`; }).join('')}</td></tr>` : ''; }).join('');
  return `<section class="card"><header class="card-h"><h2>${icon('award')} Вправи етапів</h2><span class="chip ok">${n} з ${exAll().length}</span></header><table class="tbl xrep"><tbody>${rows}</tbody></table></section>`;
}
