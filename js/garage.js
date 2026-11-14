// =====================================================
// Garage (garage.html): конструктор фикса + spoke card.
// Варианты деталей — массивы из js/garage-data.js.
// Радиокнопки и галочки создаются циклом, рисунок красится CSS-переменными.
// Одежда манекена — в js/outfit.js (использует функции этого файла).
// =====================================================

const NICK_PATTERN = /^[A-Za-z0-9]{2,10}$/;   // только латиница и цифры, 2–10 символов
const NUMBER_MIN = 1;
const NUMBER_MAX = 999;

// Новая копия варианта по умолчанию (с отдельными массивами внутри)
function freshDefault() {
  return JSON.parse(JSON.stringify(GARAGE_DEFAULT));
}

// ---------- Состояние: текущий велик ----------
// Есть сохранённый — начинаем с него, нет — с варианта по умолчанию
let config = loadGarage() || freshDefault();

// ---------- Элементы ----------
const bikeSvg = document.querySelector('#studio .bike-art');
const studio = document.querySelector('#studio');
const builderForm = document.querySelector('#builder-form');
const captionEl = document.querySelector('#bike-caption');
const priceLinesEl = document.querySelector('#price-lines');
const priceTotalEl = document.querySelector('#price-total');
const garageStatus = document.querySelector('#garage-status');
const spinButton = document.querySelector('#btn-spin');
const bikeTextInput = document.querySelector('#bike-text');

const cardForm = document.querySelector('#card-form');
const nickInput = document.querySelector('#card-nick');
const numberInput = document.querySelector('#card-number');
const cardStatus = document.querySelector('#card-status');
const cardPreview = document.querySelector('#card-preview');

// Группы вариантов: имя в config -> массив -> контейнер.
// radio — выбирается один вариант, checkbox — сколько угодно
const GROUPS = [
  { name: 'frame',       list: FRAME_COLORS, container: '#opt-frame',  type: 'radio' },
  { name: 'paint',       list: PAINT_STYLES, container: '#opt-paint',  type: 'radio' },
  { name: 'color2',      list: FRAME_COLORS, container: '#opt-color2', type: 'radio', noPrice: true },
  { name: 'glow',        list: GLOW_PARTS,   container: '#opt-glow',   type: 'checkbox' },
  { name: 'fork',        list: FORK_COLORS,  container: '#opt-fork',   type: 'radio' },
  { name: 'rim',         list: RIM_COLORS,   container: '#opt-rim',    type: 'radio' },
  { name: 'tire',        list: TIRES,        container: '#opt-tire',   type: 'radio' },
  { name: 'tape',        list: TAPE_COLORS,  container: '#opt-tape',   type: 'radio' },
  { name: 'bar',         list: BARS,         container: '#opt-bar',    type: 'radio' },
  { name: 'front',       list: FRONT_WHEELS, container: '#opt-front',  type: 'radio' },
  { name: 'textColor',   list: TEXT_COLORS,  container: '#opt-text-color', type: 'radio', noPrice: true },
  { name: 'stickers',    list: STICKERS,     container: '#opt-stickers',    type: 'checkbox' },
  { name: 'accessories', list: ACCESSORIES,  container: '#opt-accessories', type: 'checkbox' }
];

// ---------- Варианты из массива ----------
// Цвет кружка: цвет детали, у шин — протектор и боковина
function getSwatch(option) {
  if (option.color !== undefined && option.color !== null) {
    return option.color;
  }
  if (option.tread !== undefined) {
    return 'radial-gradient(circle, ' + option.wall + ' 45%, ' + option.tread + ' 47%)';
  }
  if (option.main !== undefined) {
    // одежда: кружок из двух цветов
    return 'linear-gradient(135deg, ' + option.main + ' 55%, ' + option.accent + ' 55%)';
  }
  return '';
}

function priceLabel(price) {
  return price === 0 ? 'included' : '+' + formatTenge(price);
}

// selected — id (для radio) или массив id (для checkbox)
function renderOptions(group, selected, showPrice) {
  const container = document.querySelector(group.container);
  const type = group.type || 'radio';
  container.replaceChildren();

  for (const option of group.list) {
    const label = document.createElement('label');
    label.className = 'option';

    const input = document.createElement('input');
    input.type = type;
    input.name = group.name;
    input.value = option.id;
    input.className = 'option-input';
    input.checked = type === 'checkbox' ? selected.includes(option.id) : option.id === selected;

    const body = document.createElement('span');
    body.className = 'option-body';

    const swatch = getSwatch(option);
    if (swatch !== '') {
      const dot = document.createElement('span');
      dot.className = 'option-swatch';
      dot.style.background = swatch;
      body.appendChild(dot);
    }

    const name = document.createElement('span');
    name.className = 'option-name';
    name.textContent = option.name;
    body.appendChild(name);

    if (showPrice && option.price !== undefined) {
      const price = document.createElement('span');
      price.className = 'option-price';
      price.textContent = priceLabel(option.price);
      body.appendChild(price);
    }

    label.append(input, body);
    container.appendChild(label);
  }
}

function renderAllOptions() {
  for (const group of GROUPS) {
    renderOptions(group, config[group.name], !group.noPrice);
  }
  const cardColor = config.card !== null ? config.card.color : CARD_COLORS[0].id;
  renderOptions({ name: 'card-color', list: CARD_COLORS, container: '#opt-card' }, cardColor, false);
  bikeTextInput.value = config.text;
}

// ---------- Цена ----------
function formatTenge(value) {
  return value.toLocaleString('ru-RU') + ' ₸';
}

// Строки цены: базовые детали + всё платное, что выбрано
function getPriceLines() {
  const lines = [];
  for (const part of GARAGE_BASE) {
    lines.push({ name: part.name, price: part.price });
  }
  for (const group of GROUPS) {
    if (group.noPrice) {
      continue;
    }
    // для radio — один выбранный вариант, для checkbox — все отмеченные
    const ids = group.type === 'checkbox' ? config[group.name] : [config[group.name]];
    for (const id of ids) {
      const option = findOption(group.list, id);
      if (option.price > 0) {
        lines.push({ name: option.name, price: option.price });
      }
    }
  }
  if (config.text !== '') {
    lines.push({ name: 'Frame text "' + config.text.toUpperCase() + '"', price: TEXT_PRICE });
  }
  return lines;
}

function renderPrice() {
  const lines = getPriceLines();
  let total = 0;
  priceLinesEl.replaceChildren();

  for (const line of lines) {
    total = total + line.price;
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = line.name;
    const price = document.createElement('span');
    price.textContent = formatTenge(line.price);
    item.append(name, price);
    priceLinesEl.appendChild(item);
  }
  priceTotalEl.textContent = formatTenge(total);
}

// ---------- Обновить всё после изменения ----------
function updateBike() {
  applyGarageToBike(bikeSvg, config, true);

  const frame = findOption(FRAME_COLORS, config.frame);
  const paint = findOption(PAINT_STYLES, config.paint);
  let caption = frame.name + ' frame';
  if (config.paint !== 'solid') {
    caption = caption + ' with ' + paint.name.toLowerCase();
  }
  caption = caption + ', ' + findOption(BARS, config.bar).name.toLowerCase();
  if (config.accessories.length > 0) {
    caption = caption + ', ' + config.accessories.length + ' accessories';
  }
  if (config.stickers.length > 0) {
    caption = caption + ', ' + config.stickers.length + ' stickers';
  }
  captionEl.textContent = caption;
  bikeSvg.setAttribute('aria-label', 'Your bike: ' + caption);

  // второй цвет нужен только для Fade и Stripe
  document.querySelector('#color2-group').disabled = config.paint === 'solid';

  renderPrice();
}

function showStatus(element, text, type) {
  element.textContent = text;
  element.className = 'garage-status ' + type;
}

function markNotSaved() {
  showStatus(garageStatus, 'Not saved yet.', 'status-warn');
}

// ---------- Конструктор: события ----------
builderForm.addEventListener('change', function (event) {
  const input = event.target;
  if (input === bikeTextInput) {
    return;                       // надпись обрабатывается ниже, на input
  }
  if (input.type === 'checkbox') {
    // новый массив: добавить id или убрать его
    if (input.checked) {
      config[input.name] = config[input.name].concat(input.value);
    } else {
      config[input.name] = config[input.name].filter(function (id) {
        return id !== input.value;
      });
    }
  } else {
    config[input.name] = input.value;
  }
  updateBike();
  markNotSaved();
});

// Надпись на раме: проверяется при каждом вводе
bikeTextInput.addEventListener('input', function () {
  const value = bikeTextInput.value;
  const errorEl = document.querySelector('#bike-text-error');
  if (TEXT_PATTERN.test(value)) {
    errorEl.textContent = '';
    bikeTextInput.classList.remove('is-invalid');
    bikeTextInput.removeAttribute('aria-invalid');
    config.text = value.trim();
    updateBike();
    markNotSaved();
  } else {
    errorEl.textContent = 'Up to 12 Latin letters, digits, spaces and ! . -';
    bikeTextInput.classList.add('is-invalid');
    bikeTextInput.setAttribute('aria-invalid', 'true');
  }
});
// Enter в поле надписи не отправляет форму
builderForm.addEventListener('submit', function (event) {
  event.preventDefault();
});

// Случайный велик: в каждой группе случайный вариант,
// каждую галочку ставим с шансом 30%
function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

document.querySelector('#btn-random-bike').addEventListener('click', function () {
  for (const group of GROUPS) {
    if (group.type === 'checkbox') {
      config[group.name] = group.list.filter(function () {
        return Math.random() < 0.3;
      }).map(function (option) {
        return option.id;
      });
    } else {
      config[group.name] = randomItem(group.list).id;
    }
  }
  renderAllOptions();
  updateBike();
  showStatus(garageStatus, 'Random bike! Press it again or Save if you like it.', 'status-warn');
});

document.querySelector('#btn-save-bike').addEventListener('click', function () {
  if (saveGarage(config)) {
    showStatus(garageStatus, 'Saved! Your bike now rides on the home page and in Skid Challenge.', 'status-ok');
  } else {
    showStatus(garageStatus, 'Could not save: your browser blocks storage.', 'status-bad');
  }
});

// Сброс велика: spoke card и одежда остаются
document.querySelector('#btn-reset-bike').addEventListener('click', function () {
  const card = config.card;
  const outfit = config.outfit;
  config = freshDefault();
  config.card = card;
  config.outfit = outfit;
  renderAllOptions();
  updateBike();
  document.querySelector('#bike-text-error').textContent = '';
  bikeTextInput.classList.remove('is-invalid');
  showStatus(garageStatus, 'Back to the default bike. Press Save to keep it.', 'status-warn');
});

// Крутить колёса (CSS-анимация включается классом)
spinButton.addEventListener('click', function () {
  const isSpinning = studio.classList.toggle('is-spinning');
  spinButton.setAttribute('aria-pressed', isSpinning ? 'true' : 'false');
  spinButton.textContent = isSpinning ? 'Stop wheels' : 'Spin wheels';
});

// =====================================================
// Spoke card
// =====================================================
function checkNick() {
  const value = nickInput.value.trim();
  if (value === '') {
    return 'Enter a nickname.';
  }
  if (!NICK_PATTERN.test(value)) {
    return 'Use 2–10 Latin letters or digits, no spaces.';
  }
  return '';
}

function checkNumber() {
  const value = numberInput.value.trim();
  if (value === '') {
    return 'Enter your race number.';
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < NUMBER_MIN || number > NUMBER_MAX) {
    return 'Number must be a whole number from ' + NUMBER_MIN + ' to ' + NUMBER_MAX + '.';
  }
  return '';
}

function showFieldError(input, message) {
  document.querySelector('#' + input.id + '-error').textContent = message;
  input.classList.toggle('is-invalid', message !== '');
  if (message === '') {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', 'true');
  }
}

function getCardColor() {
  const checked = cardForm.querySelector('input[name="card-color"]:checked');
  return checked !== null ? checked.value : CARD_COLORS[0].id;
}

// Превью меняется, пока человек печатает
function updateCardPreview() {
  const nick = nickInput.value.trim().toUpperCase() || 'NICKNAME';
  const number = numberInput.value.trim() || '00';
  const color = findOption(CARD_COLORS, getCardColor()).color;
  cardPreview.querySelector('.card-bg').style.fill = color;
  cardPreview.querySelector('.card-number').textContent = number;
  cardPreview.querySelector('.card-nick').textContent = nick;
  cardPreview.setAttribute('aria-label', 'Spoke card preview: number ' + number + ', ' + nick);
}

let cardTouched = false;   // ошибки показываем только после первой попытки

cardForm.addEventListener('input', function () {
  updateCardPreview();
  if (cardTouched) {
    showFieldError(nickInput, checkNick());
    showFieldError(numberInput, checkNumber());
  }
});

cardForm.addEventListener('change', updateCardPreview);

// Проверить поля; вернуть true, если всё правильно
function validateCard() {
  cardTouched = true;
  const nickError = checkNick();
  const numberError = checkNumber();
  showFieldError(nickInput, nickError);
  showFieldError(numberInput, numberError);
  if (nickError !== '') {
    nickInput.focus();
    return false;
  }
  if (numberError !== '') {
    numberInput.focus();
    return false;
  }
  return true;
}

cardForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!validateCard()) {
    showStatus(cardStatus, '', '');
    return;
  }
  config.card = {
    nick: nickInput.value.trim().toUpperCase(),
    number: Number(numberInput.value),
    color: getCardColor()
  };
  updateBike();
  showStatus(cardStatus, 'Your card is in the rear wheel. Press "Save to my garage" to keep it.', 'status-ok');
});

document.querySelector('#btn-remove-card').addEventListener('click', function () {
  config.card = null;
  updateBike();
  showStatus(cardStatus, 'Card removed from the wheel.', 'status-warn');
});

// ---------- Скачать карточку как картинку (canvas) ----------
function drawCardOnCanvas(nick, number, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;                       // фон карточки
  ctx.beginPath();
  ctx.roundRect(8, 8, 584, 364, 28);
  ctx.fill();

  ctx.fillStyle = '#16191c';                   // отверстие для спицы
  ctx.beginPath();
  ctx.roundRect(276, 28, 48, 16, 8);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = '800 150px Archivo, Arial, sans-serif';
  ctx.fillText(number, 300, 244);
  ctx.font = '800 48px Archivo, Arial, sans-serif';
  ctx.fillText(nick, 300, 304);
  ctx.font = '600 22px Archivo, Arial, sans-serif';
  ctx.fillText('FIXED GEAR ASTANA · ALLEYCAT', 300, 348);
  return canvas;
}

document.querySelector('#btn-download-card').addEventListener('click', function () {
  if (!validateCard()) {
    showStatus(cardStatus, 'Fix the fields above to download your card.', 'status-bad');
    return;
  }
  const nick = nickInput.value.trim().toUpperCase();
  const color = findOption(CARD_COLORS, getCardColor()).color;
  const canvas = drawCardOnCanvas(nick, numberInput.value.trim(), color);

  const link = document.createElement('a');
  link.download = 'spoke-card-' + nick.toLowerCase() + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showStatus(cardStatus, 'Downloaded spoke-card-' + nick.toLowerCase() + '.png', 'status-ok');
});

// ---------- Старт ----------
if (config.card !== null) {
  nickInput.value = config.card.nick;
  numberInput.value = config.card.number;
}
renderAllOptions();
updateBike();
updateCardPreview();
