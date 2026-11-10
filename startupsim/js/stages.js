// Симулятор стартапу · шлях стартапу: дев'ять етапів, їхні справи й розділи, що відкриваються. Без DOM.
// Справи рахуються зі стану гри (завершені вправи й дії в розділах), тому старі збереження теж працюють.
import { EX, STAGE_T, exDone, exCount, exOf } from './ex-core.js';

// справа-вправа: назву й опис беремо з опису вправи
const E = (id, o = {}) => S => EX[id] ? { ex: id, t: EX[id].t, d: EX[id].d, ic: EX[id].icon, ok: exDone(S, id), go: 'ex-' + id, btn: exDone(S, id) ? 'Відкрити' : 'Почати', ...o } : null;
// справа-дія в розділі гри
const A = f => S => f(S);

// open — розділи, що стають доступними з цього етапу; req — обов'язкові справи, opt — додаткові
export const STAGES = [
  { id: 'niche', t: STAGE_T[0], long: 'Оберіть нішу й зберіть першу версію продукту',
    why: 'Спершу з’ясуйте, чи варта ідея того, щоб за неї братися: хто ваші клієнти, що їм болить і хто вже це розв’язує. Потім опишіть бізнес і зробіть найпростішу версію.',
    topics: ['Вибір ніші', 'Ринок і конкуренти', 'Потреби клієнтів', 'Бізнес-план і модель', 'Створення продукту'],
    open: ['dash', 'inbox', 'customers', 'plan', 'product', 'help', 'report'],
    req: [E('niche'), E('market'), E('needs'),
      A(S => ({ t: 'Опишіть бізнес-план', d: `Заповнено ${Math.min(S.canvasFilled(), 5)} з 5 блоків. Розділ «Бізнес-план» показує, що з написаного підтверджено інтерв’ю.`, ok: S.canvasFilled() >= 5, go: 'plan', btn: 'До плану', hl: '.bp', ic: 'plan' })),
      E('mvp')],
    opt: [E('interview'), E('bmodel'), A(S => ({ t: 'Запустіть першу версію', d: S.s.product.launched ? 'Продукт запущено.' : S.canLaunch() ? 'Одна функція вже готова — можна запускати.' : 'Стане можливим, коли буде готова хоч одна функція (потрібен час: завершуйте тижні).', ok: S.s.product.launched, go: 'product', btn: 'До продукту', hl: '.launch', ic: 'rocket' }))] },
  { id: 'brand', t: STAGE_T[1], long: 'Визначте, кому продаєте, і створіть бренд',
    why: 'Продукт «для всіх» не потрібен нікому. Опишіть свого клієнта, поставте вимірні цілі й вирішіть, як виглядатиме та звучатиме ваша компанія.',
    topics: ['Маркетингова стратегія', 'Сегментація 5W', 'SMART-цілі', 'Бренд'],
    open: ['brand'],
    req: [E('w5'), E('strategy'), E('smart'), E('logo')],
    opt: [E('palette'), E('brandvoice'), E('bbook'), A(S => ({ t: 'Налаштуйте бренд у грі', d: 'Колір, шрифт, тон і позиціонування впливають на те, наскільки ви подобаєтесь клієнтам.', ok: !!S.s.flags.brandSet, go: 'brand', btn: 'До бренду', ic: 'palette' }))] },
  { id: 'position', t: STAGE_T[2], long: 'Знайдіть, чим ви відрізняєтеся',
    why: 'Коли ринок зайнятий, виграє той, кого легко відрізнити. Оцініть сильні й слабкі сторони, сформулюйте пропозицію, оберіть назву й підготуйте першу новину про себе.',
    topics: ['SWOT-аналіз', 'Унікальна торгова пропозиція', 'Неймінг', 'PR'],
    open: [],
    req: [E('swot'), E('usp'), E('naming'), E('pr')],
    opt: [E('premortem'), E('reviews')] },
  { id: 'money', t: STAGE_T[3], long: 'Порахуйте гроші: витрати, ціна й прибуток',
    why: 'Ціна — це не здогадка. Порахуйте, скільки коштує кожна одиниця й коли ви виходите «в нуль», і складіть план грошей на рік уперед.',
    topics: ['Фінансове планування', 'Вартість і ціна', 'Прибутковість проєкту', 'Асортимент'],
    open: ['pricing', 'finance'],
    req: [E('costs'), E('price'), E('finplan'), E('assort')],
    opt: [E('cashflow'), A(S => ({ t: 'Зареєструйте ФОП або ТОВ', d: 'Без цього гроші від клієнтів не надходять. Розділ «Фінанси» → «Форма компанії».', ok: S.s.company.form !== 'none', go: 'finance', btn: 'Зареєструвати', hl: '[data-act="register"]', ic: 'wallet' }))] },
  { id: 'fund', t: STAGE_T[4], long: 'Знайдіть гроші на розвиток',
    why: 'Гроші можна взяти з різних джерел, і в кожного своя ціна: відсотки, частка компанії або час на заявки. Порівняйте їх і складіть свій набір.',
    topics: ['Джерела фінансування', 'Стартап та інвестиції', 'Конкурси й гранти'],
    open: ['investors'],
    req: [E('sources'), E('equity'), E('grants')],
    opt: [E('negotiate'), E('pitch'), A(S => ({ t: 'Подивіться, що кажуть інвестори', d: 'Розділ «Інвестори»: презентація й перші розмови.', ok: !!S.s.flags.invSeen || Object.keys(S.s.inv || {}).length > 0, go: 'investors', btn: 'До інвесторів', ic: 'handshake' }))] },
  { id: 'promo', t: STAGE_T[5], long: 'Розкажіть про себе й залучіть клієнтів',
    why: 'Канали просування бувають офлайн і онлайн, а акції ненадовго збільшують продажі. Складіть план просування й знайдіть, де губляться клієнти.',
    topics: ['Канали просування', 'Воронка продажів', 'Стимулювання збуту'],
    open: ['marketing', 'promo'],
    req: [E('channels'), E('funnel'), E('promomix'), E('ad')],
    opt: [E('abtest'), E('journey'), A(S => { const m = S.s.mkt; return { t: 'Запустіть просування в грі', d: 'Розділ «Реклама»: оберіть хоч один спосіб, щоб про вас дізналися.', ok: m.ads > 0 || m.bloggers > 0 || m.events > 0 || S.s.hours.content > 0, go: 'marketing', btn: 'До реклами', hl: '.ch-row', ic: 'megaphone' }; })] },
  { id: 'team', t: STAGE_T[6], long: 'Збудуйте команду й налагодьте роботу',
    why: 'Самому все не встигнути. Дізнайтеся свій стиль керівництва, розподіліть ролі, спробуйте спринт і навчіться наймати людей.',
    topics: ['Стилі лідерства', 'Ролі в команді', 'Agile, Scrum, Kanban', 'Наймання', 'Дистанційна робота'],
    open: ['team'],
    req: [E('leadership'), E('roles'), E('agile'), E('hiring')],
    opt: [E('conflict'), E('remote'), A(S => ({ t: 'Найміть першу людину', d: 'Розділ «Команда»: співбесіда й пропозиція.', ok: S.s.team.length > 0 || !!S.s.ach.hire, go: 'team', btn: 'До команди', hl: '.member.cand', ic: 'users' }))] },
  { id: 'freelance', t: STAGE_T[7], long: 'Заробляйте своїми навичками',
    why: 'Фриланс допомагає дотягнути до перших грошей і вчить працювати із замовниками. Оберіть біржу, зробіть резюме, напишіть замовнику й оформіть ФОП.',
    topics: ['Біржі фрилансу', 'Резюме й профіль', 'Пошук замовника', 'Оформлення ФОП'],
    open: ['freelance'],
    req: [E('exchanges'), E('resume'), E('client'), E('fop')],
    opt: [E('rate'), A(S => ({ t: 'Візьміть замовлення на біржі', d: 'Розділ «Підробіток»: справжнє замовлення в грі.', ok: (S.s.gigsDone || 0) > 0 || (S.s.myGigs || []).length > 0, go: 'freelance', btn: 'До біржі', ic: 'laptop' }))] },
  { id: 'capital', t: STAGE_T[8], long: 'Розберіться з платежами, інвестиціями й криптою',
    why: 'Гроші бувають готівкові, безготівкові, електронні та криптовалюта. Вивчіть платіжні інструменти, спробуйте скласти портфель і побачте, чим ризикує трейдер.',
    topics: ['Віртуальні банки й картки', 'Види грошей', 'Інвестування', 'Криптовалюта й трейдинг'],
    open: ['payments', 'invest'],
    req: [E('paytools'), E('money'), E('portfolio'), E('trading')],
    opt: [E('scam'), E('compound'), A(S => ({ t: 'Вкладіть вільні гроші в грі', d: 'Розділ «Вкладення»: депозит, облігації, фонд.', ok: !!S.s.flags.invested, go: 'invest', btn: 'До вкладень', ic: 'trend' }))] },
];
STAGES.forEach((st, i) => { st.i = i; });

// простий режим: ці розділи не потрібні, щоб пройти гру, і в простому режимі сховані
export const ADVANCED_VIEWS = ['payments', 'invest', 'promo'];
export const isSimple = S => S.s.flags.simple === true;

// години «за мене»: розумний розподіл під поточний етап (разом 50 годин)
const PROFILE = [0, 2, 2, 1, 3, 2, 3, 3, 4];
export function suggestHours(S, stage) {
  const b2b = S.seg().b2b;
  const P = [
    { product: 10, customers: 21, content: 4, sales: 0, invest: 0, freelance: 0, rest: 15 },
    { product: 28, customers: 6, content: 6, sales: 0, invest: 0, freelance: 0, rest: 10 },
    { product: 14, customers: 6, content: b2b ? 6 : 12, sales: b2b ? 12 : 6, invest: 0, freelance: 0, rest: 12 },
    { product: 12, customers: 6, content: 10, sales: b2b ? 10 : 4, invest: 6, freelance: 0, rest: b2b ? 6 : 12 },
    { product: 8, customers: 4, content: 8, sales: b2b ? 8 : 4, invest: 12, freelance: 0, rest: b2b ? 10 : 14 },
  ][PROFILE[Math.min(stage, 8)]];
  const h = { ...P };
  // грошей майже немає — частину часу на підробіток
  if (S.runwayWeeks() < 8) { h.freelance = 10; h.product = Math.max(0, h.product - 6); h.rest = Math.max(4, h.rest - 4); }
  return h;
}

// на якому етапі відкривається розділ або вправа
export const viewStage = v => {
  if (v.startsWith('ex-')) return EX[v.slice(3)]?.stage ?? 0;
  const i = STAGES.findIndex(st => st.open.includes(v)); return i < 0 ? 0 : i;
};

// старі збереження мали п'ять етапів: усе, що було відкрито там, лишається відкритим
const OLD_OPEN = [['dash', 'inbox', 'customers', 'plan', 'freelance', 'help', 'report'], ['product', 'brand'], ['pricing', 'finance', 'payments', 'marketing', 'promo'], ['team', 'investors'], ['invest']];
export function migrate(S) {
  const f = S.s.flags; if (f.st9 != null) return;
  const old = f.stage || 0, un = { ...(f.unlocked || {}) };
  if (S.s.week > 0 || old > 0) for (let i = 0; i <= Math.min(old, 4); i++) for (const v of OLD_OPEN[i]) un[v] = true;
  f.unlocked = un; f.st9 = 0;
}

export function stageInfo(S) {
  const list = STAGES.map(st => {
    const req = st.req.map(f => f(S)).filter(Boolean), opt = st.opt.map(f => f(S)).filter(Boolean);
    return { ...st, req, opt, done: req.every(x => x.ok), n: req.filter(x => x.ok).length, m: req.length, on: opt.filter(x => x.ok).length };
  });
  let cur = list.findIndex(x => !x.done);
  const allDone = cur < 0;
  if (allDone) cur = list.length - 1;
  // досягнутий етап не відкочується назад, навіть якщо якусь справу знову стало неможливо підтвердити
  const reached = Math.max(cur, S.s.flags.st9 || 0);
  return { list, cur, reached, allDone, ex: exCount(S), exAll: STAGES.reduce((a, st) => a + exOf(st.i).length, 0) };
}

// розділ відкритий, якщо етап досягнуто або його відкрили вручну
export const isOpen = (S, v, info = stageInfo(S)) => viewStage(v) <= info.reached || !!S.s.flags.unlocked?.[v];
export function unlock(S, v) { S.s.flags.unlocked = { ...(S.s.flags.unlocked || {}), [v]: true }; }
// запам'ятовуємо досягнутий етап (викликається після кожної зміни стану)
export function syncStage(S) { migrate(S); const i = stageInfo(S); if (i.reached > (S.s.flags.st9 || 0)) S.s.flags.st9 = i.reached; return i; }
