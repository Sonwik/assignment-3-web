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

const GARAGE_DEFAULT = {
  frame: 'yellow',
  rim: 'black',
  tire: 'black',
  bar: 'drop',
  front: 'trispoke',
  card: null                    // или { nick: 'ZHARKYN', number: 7, color: 'yellow' }
};

// Найти вариант по id в массиве (или первый, если такого нет)
function findOption(list, id) {
  const found = list.find(function (option) {
    return option.id === id;
  });
  return found !== undefined ? found : list[0];
}

// Прочитать сохранённый велик. Нет сохранения — null
function loadGarage() {
  try {
    const saved = JSON.parse(localStorage.getItem(GARAGE_KEY));
    if (saved !== null && typeof saved === 'object') {
      // берём только известные id — испорченные данные не ломают страницу
      return {
        frame: findOption(FRAME_COLORS, saved.frame).id,
        rim: findOption(RIM_COLORS, saved.rim).id,
        tire: findOption(TIRES, saved.tire).id,
        bar: findOption(BARS, saved.bar).id,
        front: findOption(FRONT_WHEELS, saved.front).id,
        card: saved.card && saved.card.nick ? saved.card : null
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

// Покрасить рисунок велосипеда (<svg class="bike-art">) по конфигу.
// withTires = false на главной и в игре: там цвет шин зависит от темы
function applyGarageToBike(svg, config, withTires) {
  svg.style.setProperty('--bike-frame', findOption(FRAME_COLORS, config.frame).color);
  svg.style.setProperty('--bike-rim', findOption(RIM_COLORS, config.rim).color);
  if (withTires) {
    const tire = findOption(TIRES, config.tire);
    svg.style.setProperty('--bike-tire', tire.tread);
    svg.style.setProperty('--bike-wall', tire.wall);
  }

  showOnly(svg, 'data-bar', config.bar);
  showOnly(svg, 'data-front', config.front);

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
