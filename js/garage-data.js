// =====================================================
// Garage: варианты деталей + сохранение "моего велика".
// Подключается на garage.html (конструктор), index.html (велик в hero)
// и skid.html (велик в игре) — везде едет ОДИН и тот же твой велик.
// =====================================================

const GARAGE_KEY = 'fga-garage';

// Базовая сборка, которая есть в любом велике (цены в тенге)
const GARAGE_BASE = [
  { name: 'Tsunami SNM100 frameset', price: 85000 },
  { name: 'SKEACE 48T crankset', price: 35000 },
  { name: 'Intro7 wheelset', price: 70000 },
  { name: '1/8" chain + track saddle', price: 23000 }
];

// Каждый массив — одна группа вариантов в конструкторе
const FRAME_COLORS = [
  { id: 'yellow', name: 'Tsunami Yellow', color: '#ffc107', price: 0 },
  { id: 'black',  name: 'Matte Black',    color: '#2b2f33', price: 0 },
  { id: 'white',  name: 'Pearl White',    color: '#f1f3f5', price: 0 },
  { id: 'red',    name: 'Track Red',      color: '#e03131', price: 0 },
  { id: 'mint',   name: 'Mint',           color: '#38d9a9', price: 15000 },
  { id: 'purple', name: 'Purple',         color: '#7950f2', price: 15000 }
];

const RIM_COLORS = [
  { id: 'black',  name: 'Black',  color: '#212529', price: 0 },
  { id: 'silver', name: 'Silver', color: '#adb5bd', price: 0 },
  { id: 'white',  name: 'White',  color: '#f8f9fa', price: 0 },
  { id: 'yellow', name: 'Yellow', color: '#ffc107', price: 5000 },
  { id: 'red',    name: 'Red',    color: '#e03131', price: 5000 }
];

// tread — протектор, wall — боковина
const TIRES = [
  { id: 'black',    name: 'Black slicks', tread: '#212529', wall: '#212529', price: 16000 },
  { id: 'skinwall', name: 'Skinwall',     tread: '#212529', wall: '#c69c6d', price: 20000 },
  { id: 'white',    name: 'White',        tread: '#f1f3f5', wall: '#f1f3f5', price: 22000 }
];

const BARS = [
  { id: 'drop',     name: 'Drop bar', price: 12000 },
  { id: 'bullhorn', name: 'Bullhorn', price: 11000 },
  { id: 'flat',     name: 'Flat bar', price: 9000 }
];

const FRONT_WHEELS = [
  { id: 'spoked',   name: 'Spoked (in wheelset)', price: 0 },
  { id: 'trispoke', name: 'Carbon tri-spoke',     price: 120000 }
];

const CARD_COLORS = [
  { id: 'yellow', name: 'Yellow', color: '#ffc107' },
  { id: 'pink',   name: 'Pink',   color: '#f783ac' },
  { id: 'cyan',   name: 'Cyan',   color: '#3bc9db' },
  { id: 'white',  name: 'White',  color: '#f8f9fa' }
];

// ---------- Покраска и детали другого цвета ----------
const PAINT_STYLES = [
  { id: 'solid',  name: 'Solid',          price: 0 },
  { id: 'fade',   name: 'Fade (gradient)', price: 20000 },
  { id: 'stripe', name: 'Racing stripe',  price: 10000 }
];

// Что может светиться (неон) — можно выбрать несколько
const GLOW_PARTS = [
  { id: 'frame', name: 'Neon frame', price: 15000 },
  { id: 'rims',  name: 'Neon rims',  price: 12000 }
];

const FORK_COLORS = [
  { id: 'match',  name: 'Same as frame', color: null,      price: 0 },
  { id: 'black',  name: 'Black',         color: '#2b2f33', price: 5000 },
  { id: 'white',  name: 'White',         color: '#f1f3f5', price: 5000 },
  { id: 'chrome', name: 'Chrome',        color: '#ced4da', price: 8000 },
  { id: 'red',    name: 'Red',           color: '#e03131', price: 5000 },
  { id: 'yellow', name: 'Yellow',        color: '#ffc107', price: 5000 }
];

// Обмотка руля и седло
const TAPE_COLORS = [
  { id: 'black',   name: 'Black',   color: '#212529', price: 0 },
  { id: 'white',   name: 'White',   color: '#f8f9fa', price: 3000 },
  { id: 'leather', name: 'Leather', color: '#8b5a2b', price: 6000 },
  { id: 'red',     name: 'Red',     color: '#e03131', price: 3000 },
  { id: 'mint',    name: 'Mint',    color: '#38d9a9', price: 3000 }
];

// ---------- Надпись и стикеры ----------
const TEXT_PATTERN = /^[A-Za-z0-9 !.-]{0,12}$/;   // до 12 латинских букв, цифр, пробелов, ! . -
const TEXT_PRICE = 3000;
const TEXT_COLORS = [
  { id: 'white',  name: 'White',  color: '#f8f9fa' },
  { id: 'black',  name: 'Black',  color: '#16191c' },
  { id: 'yellow', name: 'Yellow', color: '#ffd43b' },
  { id: 'red',    name: 'Red',    color: '#ff6b6b' }
];

const STICKERS = [
  { id: 'star',  name: 'Star',      price: 1000 },
  { id: 'bolt',  name: 'Lightning', price: 1000 },
  { id: 'flame', name: 'Flame',     price: 1000 },
  { id: 'heart', name: 'Heart',     price: 1000 },
  { id: 'smile', name: 'Smile',     price: 1000 },
  { id: 'gear',  name: '"48×17"',   price: 1000 }
];

// ---------- Аксессуары ----------
const ACCESSORIES = [
  { id: 'bell',      name: 'Bell',                   price: 3000 },
  { id: 'bottle',    name: 'Bottle + cage',          price: 6000 },
  { id: 'basket',    name: 'Front basket',           price: 9000 },
  { id: 'rearlight', name: 'Blinking rear light',    price: 5000 },
  { id: 'flag',      name: 'Safety flag',            price: 4000 },
  { id: 'duck',      name: 'Rubber duck',            price: 1500 },
  { id: 'tinsel',    name: 'New Year tinsel',        price: 2500 },
  { id: 'garland',   name: 'New Year garland',       price: 3500 },
  { id: 'tree',      name: 'Mini tree on a rack',    price: 12000 },
  { id: 'santa',     name: 'Santa hat on the saddle', price: 2000 }
];

const GARAGE_DEFAULT = {
  frame: 'yellow',
  paint: 'solid',
  color2: 'black',              // второй цвет для Fade и Stripe
  glow: [],                     // ['frame', 'rims']
  fork: 'match',
  rim: 'black',
  tire: 'black',
  tape: 'black',
  bar: 'drop',
  front: 'trispoke',
  text: '',
  textColor: 'white',
  stickers: [],
  accessories: [],
  card: null,                   // или { nick: 'ZHARKYN', number: 7, color: 'yellow' }
  outfit: null                  // одежда манекена (js/outfit.js)
};

// Найти вариант по id в массиве (или первый, если такого нет)
function findOption(list, id) {
  const found = list.find(function (option) {
    return option.id === id;
  });
  return found !== undefined ? found : list[0];
}

// Оставить в массиве только существующие id (для стикеров, аксессуаров, свечения)
function keepKnown(list, ids) {
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.filter(function (id) {
    return list.some(function (option) {
      return option.id === id;
    });
  });
}

// Прочитать сохранённый велик. Нет сохранения — null
function loadGarage() {
  try {
    const saved = JSON.parse(localStorage.getItem(GARAGE_KEY));
    if (saved !== null && typeof saved === 'object') {
      // берём только известные id — испорченные или старые данные не ломают страницу
      const text = typeof saved.text === 'string' && TEXT_PATTERN.test(saved.text) ? saved.text : '';
      return {
        frame: findOption(FRAME_COLORS, saved.frame).id,
        paint: findOption(PAINT_STYLES, saved.paint).id,
        color2: findOption(FRAME_COLORS, saved.color2 || 'black').id,
        glow: keepKnown(GLOW_PARTS, saved.glow),
        fork: findOption(FORK_COLORS, saved.fork).id,
        rim: findOption(RIM_COLORS, saved.rim).id,
        tire: findOption(TIRES, saved.tire).id,
        tape: findOption(TAPE_COLORS, saved.tape).id,
        bar: findOption(BARS, saved.bar).id,
        front: findOption(FRONT_WHEELS, saved.front).id,
        text: text,
        textColor: findOption(TEXT_COLORS, saved.textColor).id,
        stickers: keepKnown(STICKERS, saved.stickers),
        accessories: keepKnown(ACCESSORIES, saved.accessories),
        card: saved.card && saved.card.nick ? saved.card : null,
        outfit: saved.outfit && typeof saved.outfit === 'object' ? saved.outfit : null
      };
    }
  } catch (error) {
    // ничего не сохранено или localStorage недоступен
  }
  return null;
}

function saveGarage(config) {
  try {
    localStorage.setItem(GARAGE_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    return false;
  }
}

// Показать один вариант, остальные спрятать: например, один из трёх рулей
function showOnly(svg, attribute, value) {
  const parts = svg.querySelectorAll('[' + attribute + ']');
  for (const part of parts) {
    const isActive = part.getAttribute(attribute) === value;
    part.setAttribute('display', isActive ? 'inline' : 'none');
  }
}

// Показать все выбранные: например, стикеры ['star', 'bolt']
function showSelected(svg, attribute, selectedIds) {
  const parts = svg.querySelectorAll('[' + attribute + ']');
  for (const part of parts) {
    const isActive = selectedIds.includes(part.getAttribute(attribute));
    part.setAttribute('display', isActive ? 'inline' : 'none');
  }
}

// Покрасить рисунок велосипеда (<svg class="bike-art">) по конфигу.
// isStudio = true в Garage. На главной и в игре (false) шины берут цвет темы,
// а чёрная обмотка не красится — иначе на тёмном фоне её не видно.
function applyGarageToBike(svg, config, isStudio) {
  const frameColor = findOption(FRAME_COLORS, config.frame).color;
  svg.style.setProperty('--bike-frame', frameColor);
  svg.style.setProperty('--bike-frame2', findOption(FRAME_COLORS, config.color2).color);
  svg.style.setProperty('--bike-rim', findOption(RIM_COLORS, config.rim).color);

  // Вилка: "Same as frame" — цвет рамы
  const fork = findOption(FORK_COLORS, config.fork);
  svg.style.setProperty('--bike-fork', fork.color !== null ? fork.color : frameColor);

  if (isStudio || config.tape !== 'black') {
    svg.style.setProperty('--bike-tape', findOption(TAPE_COLORS, config.tape).color);
  }
  if (isStudio) {
    const tire = findOption(TIRES, config.tire);
    svg.style.setProperty('--bike-tire', tire.tread);
    svg.style.setProperty('--bike-wall', tire.wall);
  }

  // Покраска и свечение — классами (стили в css/bike.css)
  svg.classList.toggle('paint-fade', config.paint === 'fade');
  svg.querySelector('.frame-stripe').setAttribute('display', config.paint === 'stripe' ? 'inline' : 'none');
  svg.classList.toggle('glow-frame', config.glow.includes('frame'));
  svg.classList.toggle('glow-rims', config.glow.includes('rims'));

  showOnly(svg, 'data-bar', config.bar);
  showOnly(svg, 'data-front', config.front);
  showSelected(svg, 'data-sticker', config.stickers);
  showSelected(svg, 'data-acc', config.accessories);

  // Надпись на раме
  const text = svg.querySelector('.frame-text');
  text.textContent = config.text.toUpperCase();
  text.setAttribute('display', config.text.trim() === '' ? 'none' : 'inline');
  svg.style.setProperty('--bike-text', findOption(TEXT_COLORS, config.textColor).color);

  // Spoke card в заднем колесе
  const card = svg.querySelector('.spoke-card');
  if (config.card === null) {
    card.setAttribute('display', 'none');
  } else {
    card.setAttribute('display', 'inline');
    card.querySelector('text').textContent = config.card.number;
    svg.style.setProperty('--bike-card', findOption(CARD_COLORS, config.card.color).color);
  }
}
