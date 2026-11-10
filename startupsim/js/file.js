// Симулятор стартапу · збереження всієї гри у файл і відкриття з файлу.
// Файл містить повний стан гри (усі рішення, історію тижнів, пошту, журнал, бізнес-план, бренд, команду…),
// стан інтерфейсу й короткий підсумок, який викладач може прочитати навіть у блокноті.
import { okState, money, num, pct, dateText, WEEKS } from './sim.js';
import { checksum, translit, slug } from '../../shared/savefile.js';
import { exCount, exAll } from './ex-core.js';
import { STAGES } from './stages.js';
export { checksum, translit };

export const FILE_APP = 'edvault-startup';
export const FILE_FORMAT = 1;
// власний формат файлу: читабельна шапка з підсумком і дані гри в закодованому вигляді (не JSON)
export const FILE_EXT = '.edvault';
const MAGIC = 'EDVAULT-STARTUP';

const STATUS = { bankrupt: 'компанія закрилася (закінчилися гроші)', sold: 'компанію продано', time: 'гру завершено: минуло 2 роки' };

export function summaryOf(S) {
  const s = S.s, I = S.I;
  return {
    'Учень': s.founder.name,
    'Клас або група': s.founder.group || '—',
    'Компанія': s.company.name,
    'Ідея': `${I.t}${I.custom ? ' (власна ідея)' : ''}`,
    'Тиждень': `${s.week + 1} з ${WEEKS} (${dateText(s.week)})`,
    'Стан гри': s.over ? STATUS[s.over.kind] : 'гра триває',
    'Гроші': money(s.cash),
    'Активні користувачі': num(S.activeUsers()),
    'Платні клієнти': num(S.paidUsers()),
    'Виручка на місяць (MRR)': money(S.mrr()),
    'Оцінка компанії': money(S.valuation()),
    'Частка учня': pct(S.stake(), 1),
    "Інтерв'ю з клієнтами": String(Object.values(s.know).reduce((a, k) => a + k.n, 0)),
    'Етап шляху': `${Math.min((s.flags.st9 || 0) + 1, STAGES.length)} з ${STAGES.length}: ${STAGES[Math.min(s.flags.st9 || 0, STAGES.length - 1)].t}`,
    'Виконано вправ': `${exCount(S)} з ${exAll().length || 0}`,
    'Досягнення': String(Object.keys(s.ach).length),
    'Записів у журналі рішень': String((s.journal || []).length),
  };
}

// Безпечна назва файлу: startup_Kompaniia_Imia-Prizvyshche_tyzhden-12.edvault
export function fileName(S) {
  return ['startup', slug(S.s.company.name) || 'kompaniia', slug(S.s.founder.name), `tyzhden-${S.s.week + 1}`].filter(Boolean).join('_') + FILE_EXT;
}

export function packGame(S, ui = {}) {
  const state = JSON.parse(JSON.stringify(S.s));
  return {
    app: FILE_APP, format: FILE_FORMAT, savedAt: new Date().toISOString(),
    about: 'Збережена гра «Симулятор стартапу» (startup.edvault.online). Відкрийте її в симуляторі кнопкою «Відкрити з файлу».',
    summary: summaryOf(S),
    integrity: checksum(JSON.stringify(state)),
    ui: JSON.parse(JSON.stringify(ui)),
    state,
  };
}


const toB64 = str => { const u = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin); };
const fromB64 = t => new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0)));

// Текст файлу .edvault: шапка (її можна прочитати в блокноті), контрольна сума даних і самі дані
export function serializeGame(S, ui = {}) {
  const pack = packGame(S, ui), body = toB64(JSON.stringify(pack)).match(/.{1,96}/g).join('\n');
  const head = [`${MAGIC} ${FILE_FORMAT}`, '# Збережена гра «Симулятор стартапу» (startup.edvault.online).', '# Відкрийте її в симуляторі: «Відкрити з файлу». Нижче закодовані дані гри, їх не змінюйте.', '#',
    ...Object.entries(pack.summary).map(([k, v]) => `# ${k}: ${v}`), '#', `SUM ${checksum(body)}`, 'DATA'];
  return `${head.join('\n')}\n${body}\nEND\n`;
}
// Розбирає текст файлу .edvault у такий самий об'єкт, який дає JSON-файл
function parseFile(raw) {
  const lines = raw.split(/\r?\n/), i = lines.indexOf('DATA'), j = lines.lastIndexOf('END');
  if (i < 0 || j < i) throw new Error('structure');
  const body = lines.slice(i + 1, j).join('\n'), sum = (lines.find(l => l.startsWith('SUM ')) || '').slice(4).trim();
  if (sum && sum !== checksum(body)) throw new Error('sum');
  return JSON.parse(fromB64(body.replace(/\s+/g, '')));
}

// Розбирає текст файлу (.edvault або старий .json). Повертає { ok, state, ui, edited, savedAt, summary } або { ok: false, error }
export function unpackGame(text) {
  let data;
  const raw = String(text).replace(/^\uFEFF/, '').trimStart();
  if (raw.startsWith(MAGIC)) {
    try { data = parseFile(raw); } catch (e) { return { ok: false, error: e.message === 'sum' ? 'Файл пошкоджений або його змінювали вручну: дані не збігаються з контрольною сумою.' : 'Файл пошкоджений: його не вдалося прочитати.' }; }
  } else {
    try { data = JSON.parse(raw); } catch { return { ok: false, error: 'Це не файл збереження: його не вдалося прочитати.' }; }
  }
  if (!data || typeof data !== 'object') return { ok: false, error: 'Це не файл збереження симулятора стартапу.' };
  // підтримка «голого» стану (наприклад, скопійованого з localStorage)
  const state = data.state ?? data.s ?? (data.v === 1 && data.cap ? data : null);
  if (data.app && data.app !== FILE_APP) return { ok: false, error: 'Цей файл належить іншому інструменту, а не симулятору стартапу.' };
  if (data.format > FILE_FORMAT) return { ok: false, error: 'Файл збережено новішою версією симулятора. Оновіть сторінку й спробуйте ще раз.' };
  if (!okState(state)) return { ok: false, error: 'Файл пошкоджений або це не збереження симулятора стартапу.' };
  const edited = !!data.integrity && checksum(JSON.stringify(state)) !== data.integrity;
  return { ok: true, state, ui: data.ui && typeof data.ui === 'object' ? data.ui : { view: data.view || 'dash' }, edited, savedAt: data.savedAt || null, summary: data.summary || null };
}
