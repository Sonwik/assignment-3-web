// =====================================================
// JS-фича 1. Калькулятор передачи (gear ratio) для фикса.
// Всё пересчитывается сразу при change / input, без перезагрузки.
// =====================================================

// ---------- Диапазоны ----------
const CHAINRING_MIN = 42;
const CHAINRING_MAX = 53;
const COG_MIN = 12;
const COG_MAX = 20;
const CADENCE_MIN = 40;
const CADENCE_MAX = 160;

// Шкала "лёгкая — тяжёлая" передача (для маркера)
const SCALE_MIN = 2.2;
const SCALE_MAX = 3.8;

// ---------- Элементы ----------
const chainringSelect = document.querySelector('#chainring');
const cogSelect = document.querySelector('#cog');
const tireSelect = document.querySelector('#tire');
const cadenceInput = document.querySelector('#cadence');
const cadenceError = document.querySelector('#cadence-error');
const useGearButton = document.querySelector('#btn-use-gear');
const savedMessage = document.querySelector('#calc-saved');

const outRatio = document.querySelector('#out-ratio');
const outFeel = document.querySelector('#out-feel');
const outInches = document.querySelector('#out-inches');
const outDev = document.querySelector('#out-dev');
const outSpeed = document.querySelector('#out-speed');
const outPatches = document.querySelector('#out-patches');
const outNote = document.querySelector('#out-note');
const feelMarker = document.querySelector('#feel-marker');
const patchTire = document.querySelector('#patch-tire');

// ---------- Заполняем списки звёзд циклом ----------
function fillSelect(select, min, max, selected) {
  for (let teeth = min; teeth <= max; teeth++) {
    const option = document.createElement('option');
    option.value = teeth;
    option.textContent = teeth + 'T';
    if (teeth === selected) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

// ---------- Математика ----------
// Наибольший общий делитель (алгоритм Евклида)
function gcd(a, b) {
  while (b !== 0) {
    const rest = a % b;
    a = b;
    b = rest;
  }
  return a;
}

// Skid patches: сколько разных мест покрышки касается асфальта при скиде.
// Сокращаем дробь chainring/cog. Знаменатель = число мест.
// Если райдер скидит с любой ноги (ambidextrous) и числитель нечётный — мест в 2 раза больше.
function getSkidPatches(chainring, cog) {
  const divider = gcd(chainring, cog);
  const single = cog / divider;
  const ringPart = chainring / divider;
  let ambidextrous = single;
  if (ringPart % 2 === 1) {
    ambidextrous = single * 2;
  }
  return { single: single, ambidextrous: ambidextrous };
}

// Как ощущается передача
function getFeel(ratio) {
  if (ratio < 2.6) {
    return 'Light — easy start, tricks and hills';
  } else if (ratio < 3.0) {
    return 'Street classic — good for the city';
  } else if (ratio < 3.3) {
    return 'Fast — for strong legs and flat roads';
  }
  return 'Track sprint — very heavy to start';
}

// Проверка каденса. Возвращает текст ошибки или пустую строку
function checkCadence(value) {
  if (value.trim() === '') {
    return 'Enter your cadence.';
  }
  const number = Number(value);
  if (!Number.isInteger(number)) {
    return 'Cadence must be a whole number, for example 90.';
  }
  if (number < CADENCE_MIN || number > CADENCE_MAX) {
    return 'Cadence must be from ' + CADENCE_MIN + ' to ' + CADENCE_MAX + ' rpm.';
  }
  return '';
}

// ---------- Рисуем покрышку с точками (SVG через DOM) ----------
function drawPatches(count) {
  const ns = 'http://www.w3.org/2000/svg';
  patchTire.replaceChildren();       // очищаем старый рисунок

  const tire = document.createElementNS(ns, 'circle');
  tire.setAttribute('class', 'patch-tire-ring');
  tire.setAttribute('cx', 60);
  tire.setAttribute('cy', 60);
  tire.setAttribute('r', 50);
  patchTire.appendChild(tire);

  const rim = document.createElementNS(ns, 'circle');
  rim.setAttribute('class', 'patch-tire-rim');
  rim.setAttribute('cx', 60);
  rim.setAttribute('cy', 60);
  rim.setAttribute('r', 40);
  patchTire.appendChild(rim);

  // Точки равномерно по кругу: угол = 360 / count
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('class', 'patch-dot');
    dot.setAttribute('cx', (60 + 50 * Math.cos(angle)).toFixed(1));
    dot.setAttribute('cy', (60 + 50 * Math.sin(angle)).toFixed(1));
    dot.setAttribute('r', 5);
    patchTire.appendChild(dot);
  }

  const label = document.createElementNS(ns, 'text');
  label.setAttribute('x', 60);
  label.setAttribute('y', 68);
  label.textContent = count;
  patchTire.appendChild(label);
  patchTire.setAttribute('aria-label', count + ' skid patches on the tire');
}

// ---------- Главная функция: считает и показывает результат ----------
function updateCalculator() {
  const chainring = Number(chainringSelect.value);
  const cog = Number(cogSelect.value);
  const circumference = Number(tireSelect.value);     // в миллиметрах

  const ratio = chainring / cog;
  const wheelInches = circumference / Math.PI / 25.4;  // диаметр колеса в дюймах
  const gearInches = ratio * wheelInches;
  const development = (ratio * circumference) / 1000;  // метров за один оборот педалей
  const patches = getSkidPatches(chainring, cog);

  outRatio.textContent = ratio.toFixed(2);
  outFeel.textContent = getFeel(ratio);
  outInches.textContent = gearInches.toFixed(1) + '″';
  outDev.textContent = development.toFixed(2) + ' m';
  outPatches.textContent = patches.single + ' / ' + patches.ambidextrous;
  drawPatches(patches.ambidextrous);

  // Маркер на шкале: переводим ratio в проценты от 0 до 100
  let percent = ((ratio - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  percent = Math.max(0, Math.min(100, percent));
  feelMarker.style.left = percent + '%';

  // Скорость зависит от каденса — считаем только если каденс правильный
  const error = checkCadence(cadenceInput.value);
  cadenceError.textContent = error;
  if (error === '') {
    cadenceInput.classList.remove('is-invalid');
    cadenceInput.removeAttribute('aria-invalid');
    const speed = (development * Number(cadenceInput.value) * 60) / 1000;
    outSpeed.textContent = speed.toFixed(1) + ' km/h';
  } else {
    cadenceInput.classList.add('is-invalid');
    cadenceInput.setAttribute('aria-invalid', 'true');
    outSpeed.textContent = '—';
  }

  // Подсказка по skid patches
  if (patches.ambidextrous <= 4) {
    outNote.textContent = 'Only ' + patches.ambidextrous + ' skid patch(es): your rear tire will wear out in the same spots. Try a cog with one tooth more or less.';
    outNote.classList.add('note-warning');
  } else {
    outNote.textContent = 'Skid patches: ' + patches.single + ' if you skid with one foot, ' + patches.ambidextrous + ' with both. More patches = the tire lasts longer.';
    outNote.classList.remove('note-warning');
  }

  useGearButton.textContent = 'Use ' + chainring + '×' + cog + ' in my order';
  savedMessage.textContent = '';
}

// ---------- Сохранить передачу для формы заказа ----------
function useGear() {
  const gear = chainringSelect.value + 'x' + cogSelect.value;
  saveGear(gear);

  savedMessage.textContent = 'Saved! ' + gear.replace('x', '×') + ' will be filled in on the ';
  const link = document.createElement('a');
  link.href = 'build.html#order';
  link.textContent = 'order form';
  savedMessage.appendChild(link);
  savedMessage.append('.');
}

// ---------- Запуск ----------
fillSelect(chainringSelect, CHAINRING_MIN, CHAINRING_MAX, 48);
fillSelect(cogSelect, COG_MIN, COG_MAX, 17);

chainringSelect.addEventListener('change', updateCalculator);
cogSelect.addEventListener('change', updateCalculator);
tireSelect.addEventListener('change', updateCalculator);
cadenceInput.addEventListener('input', updateCalculator);
useGearButton.addEventListener('click', useGear);

// Enter в поле каденса не должен перезагружать страницу
document.querySelector('#calc-form').addEventListener('submit', function (event) {
  event.preventDefault();
});

updateCalculator();
