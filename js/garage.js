// =====================================================
// Garage (garage.html): конструктор фикса + spoke card.
// Варианты деталей — массивы из js/garage-data.js.
// Радиокнопки создаются циклом, рисунок красится CSS-переменными.
// =====================================================

const NICK_PATTERN = /^[A-Za-z0-9]{2,10}$/;   // только латиница и цифры, 2–10 символов
const NUMBER_MIN = 1;
const NUMBER_MAX = 999;

// ---------- Состояние: текущий велик ----------
// Есть сохранённый — начинаем с него, нет — с варианта по умолчанию.
// { ...GARAGE_DEFAULT } делает копию объекта, чтобы не менять сам GARAGE_DEFAULT
let config = loadGarage() || { ...GARAGE_DEFAULT };

// ---------- Элементы ----------
const bikeSvg = document.querySelector('#studio .bike-art');
const studio = document.querySelector('#studio');
const builderForm = document.querySelector('#builder-form');
const captionEl = document.querySelector('#bike-caption');
const priceLinesEl = document.querySelector('#price-lines');
const priceTotalEl = document.querySelector('#price-total');
const garageStatus = document.querySelector('#garage-status');
const spinButton = document.querySelector('#btn-spin');

const cardForm = document.querySelector('#card-form');
const nickInput = document.querySelector('#card-nick');
const numberInput = document.querySelector('#card-number');
const cardStatus = document.querySelector('#card-status');
const cardPreview = document.querySelector('#card-preview');

// Какая группа радиокнопок -> какой массив
const GROUPS = [
  { name: 'frame', list: FRAME_COLORS, container: '#opt-frame' },
  { name: 'rim',   list: RIM_COLORS,   container: '#opt-rim' },
  { name: 'tire',  list: TIRES,        container: '#opt-tire' },
  { name: 'bar',   list: BARS,         container: '#opt-bar' },
  { name: 'front', list: FRONT_WHEELS, container: '#opt-front' }
];

// ---------- Радиокнопки из массива ----------
// Цвет кружка: цвет детали, у шин — протектор и боковина
function getSwatch(option) {
  if (option.color !== undefined) {
    return option.color;
  }
  if (option.tread !== undefined) {
    return 'radial-gradient(circle, ' + option.wall + ' 45%, ' + option.tread + ' 47%)';
  }
  return '';
}

function priceLabel(price) {
  return price === 0 ? 'included' : '+' + formatTenge(price);
}

function renderOptions(group, selectedId, showPrice) {
  const container = document.querySelector(group.container);
  container.replaceChildren();

  for (const option of group.list) {
    const label = document.createElement('label');
    label.className = 'option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = group.name;
    input.value = option.id;
    input.className = 'option-input';
    input.checked = option.id === selectedId;

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

    if (showPrice) {
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
    renderOptions(group, config[group.name], true);
  }
  const cardColor = config.card !== null ? config.card.color : CARD_COLORS[0].id;
  renderOptions({ name: 'card-color', list: CARD_COLORS, container: '#opt-card' }, cardColor, false);
}

// ---------- Цена ----------
function formatTenge(value) {
  return value.toLocaleString('ru-RU') + ' ₸';
}

// Строки цены: базовые детали + выбранные варианты
function getPriceLines() {
  const lines = [];
  for (const part of GARAGE_BASE) {
    lines.push({ name: part.name, price: part.price });
  }
  for (const group of GROUPS) {
    const option = findOption(group.list, config[group.name]);
    if (option.price > 0) {
      lines.push({ name: option.name, price: option.price });
    }
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
  const rim = findOption(RIM_COLORS, config.rim);
  const tire = findOption(TIRES, config.tire);
  const bar = findOption(BARS, config.bar);
  const caption = frame.name + ' frame, ' + rim.name.toLowerCase() + ' rims, ' +
    tire.name.toLowerCase() + ', ' + bar.name.toLowerCase();
  captionEl.textContent = caption;
  bikeSvg.setAttribute('aria-label', 'Your bike: ' + caption);

  renderPrice();
}

function showStatus(element, text, type) {
  element.textContent = text;
  element.className = 'garage-status ' + type;
}

// ---------- Конструктор: события ----------
builderForm.addEventListener('change', function (event) {
  config[event.target.name] = event.target.value;
  updateBike();
  showStatus(garageStatus, 'Not saved yet.', 'status-warn');
});

document.querySelector('#btn-save-bike').addEventListener('click', function () {
  if (saveGarage(config)) {
    showStatus(garageStatus, 'Saved! Your bike now rides on the home page and in Skid Challenge.', 'status-ok');
  } else {
    showStatus(garageStatus, 'Could not save: your browser blocks storage.', 'status-bad');
  }
});

document.querySelector('#btn-reset-bike').addEventListener('click', function () {
  config = { ...GARAGE_DEFAULT };
  renderAllOptions();
  updateBike();
  updateCardPreview();
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
