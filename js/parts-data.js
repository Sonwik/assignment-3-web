// =====================================================
// Данные магазина: запчасти и базовые сборки.
// Подключается на index.html (каталог) и build.html (форма заказа).
// =====================================================

// Массив объектов: у каждой запчасти 6 свойств.
// id — уникальный номер, category — для фильтра, price — в тенге, weight — в граммах
const PARTS = [
  { id: 1,  name: 'Tsunami SNM100 frameset',  category: 'Frame',      price: 85000,  weight: 1650, desc: '6061 aluminium track frame with a carbon fork. Stiff and fast.' },
  { id: 2,  name: 'Cr-Mo steel track frame',  category: 'Frame',      price: 60000,  weight: 2100, desc: 'Classic steel feel: comfortable on rough Astana roads.' },
  { id: 3,  name: 'Intro7 wheelset',          category: 'Wheels',     price: 70000,  weight: 1900, desc: 'Deep alloy rims, sealed bearings, flip-flop rear hub.' },
  { id: 4,  name: '30 mm alloy wheelset',     category: 'Wheels',     price: 45000,  weight: 2200, desc: 'Budget deep-rim wheels for daily riding.' },
  { id: 5,  name: 'Carbon tri-spoke front',   category: 'Wheels',     price: 120000, weight: 950,  desc: 'Only the front wheel. Looks loud, cuts the wind.' },
  { id: 6,  name: 'Slick tires 700x25c',      category: 'Wheels',     price: 16000,  weight: 520,  desc: 'A pair of slicks with Presta tubes. Good grip for skids.' },
  { id: 7,  name: 'SKEACE 48T crankset',      category: 'Drivetrain', price: 35000,  weight: 780,  desc: 'Stiff hollow track cranks, 165 mm, 48-tooth chainring.' },
  { id: 8,  name: 'Track cog 17T',            category: 'Drivetrain', price: 6000,   weight: 60,   desc: 'Steel cog with a lockring. 48/17 is our most popular gear.' },
  { id: 9,  name: '1/8" track chain',         category: 'Drivetrain', price: 8000,   weight: 330,  desc: 'Wide and strong chain for skids and sprints.' },
  { id: 10, name: 'Drop bar 400 mm',          category: 'Cockpit',    price: 12000,  weight: 290,  desc: 'Deep track drops for an aggressive position.' },
  { id: 11, name: 'Flat bar 580 mm',          category: 'Cockpit',    price: 9000,   weight: 260,  desc: 'Narrow flat bar for moving through traffic.' },
  { id: 12, name: 'Track saddle',             category: 'Cockpit',    price: 15000,  weight: 240,  desc: 'Light saddle with a slim nose.' },
  { id: 13, name: 'Pedals with double straps', category: 'Cockpit',   price: 18000,  weight: 420,  desc: 'Your feet stay on the pedals when you skid.' }
];

// Базовые сборки из таблицы на build.html (цена в тенге)
const BASE_BUILDS = {
  street: { name: 'Street Commuter',  price: 120000 },
  track:  { name: 'Track Aggressive', price: 165000 },
  custom: { name: 'Pro Custom',       price: 250000 }
};

// Красивая цена: 85000 -> "85 000 ₸"
function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₸';
}

// Найти запчасть по id (вернёт объект или undefined)
function findPart(id) {
  return PARTS.find(function (part) {
    return part.id === id;
  });
}
