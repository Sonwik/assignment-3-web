// =====================================================
// Hero: фикс едет по дороге и делает скид-стоп.
// У фикса нет свободного хода: чтобы остановиться, райдер блокирует
// ногами заднее колесо, и оно скользит по асфальту, оставляя след.
//
// Как работает: requestAnimationFrame ~60 раз в секунду вызывает
// функцию frame(). В ней я двигаю велосипед на speed * время и
// поворачиваю колёса. Во время скида скорость падает (трение),
// а заднее колесо НЕ крутится — оно заблокировано.
// =====================================================

// ---------- Настройки (px в секунду) ----------
const CRUISE_SPEED = 160;   // обычная скорость
const ACCELERATION = 120;   // как быстро разгоняется после остановки
const FRICTION = 190;       // как быстро тормозит при скиде
const STOP_PAUSE = 700;     // сколько мс стоит после скида
const WHEEL_RADIUS = 35;    // радиус колеса в SVG (viewBox 220 x 130)
const SVG_WIDTH = 220;

// ---------- Элементы ----------
const road = document.querySelector('#road');
const bike = document.querySelector('#bike');
const rearWheel = document.querySelector('#wheel-rear');
const frontWheel = document.querySelector('#wheel-front');
const skidButton = document.querySelector('#btn-skid');
const skidCounter = document.querySelector('#skid-counter');

// ---------- Состояние ----------
let x = -SVG_WIDTH;         // где сейчас велосипед (левый край)
let speed = CRUISE_SPEED;
let isSkidding = false;
let isStopped = false;
let rearAngle = 0;
let frontAngle = 0;
let skidCount = 0;
let skidMark = null;        // элемент следа текущего скида
let skidStartX = 0;
let lastTime = null;
let autoSkidDone = false;     // первый скид велик делает сам — показать, что он умеет

// Масштаб: на телефоне SVG меньше, чем 220px
function getScale() {
  return bike.offsetWidth / SVG_WIDTH;
}

// x-координата точки, где заднее колесо касается дороги
function rearContactX() {
  return x + 45 * getScale();     // центр заднего колеса в SVG: x = 45
}

// Начать скид (кнопка, клик по дороге или клавиша S)
function startSkid() {
  // Если уже тормозим или стоим — ничего не делаем (быстрые клики не ломают анимацию)
  if (isSkidding || isStopped || speed < CRUISE_SPEED * 0.8) {
    return;
  }
  // Велосипед ещё не выехал или уже уезжает за край — след был бы не виден
  if (rearContactX() < 0 || rearContactX() > road.offsetWidth - 100) {
    return;
  }
  isSkidding = true;
  bike.classList.add('is-skidding');

  // Новый след от шины начинается под задним колесом
  skidStartX = rearContactX();
  skidMark = document.createElement('div');
  skidMark.className = 'skid-mark';
  skidMark.style.left = skidStartX + 'px';
  skidMark.style.width = '0px';
  road.appendChild(skidMark);

  skidCount = skidCount + 1;
  skidCounter.textContent = 'Skids: ' + skidCount;
}

// Конец скида: велосипед стоит, след медленно исчезает (jQuery fadeOut)
function finishSkid() {
  isSkidding = false;
  isStopped = true;
  speed = 0;
  bike.classList.remove('is-skidding');

  const mark = skidMark;
  $(mark).delay(1200).fadeOut(1500, function () {
    $(mark).remove();
  });
  skidMark = null;

  // Немного постоять и поехать дальше
  setTimeout(function () {
    isStopped = false;
  }, STOP_PAUSE);
}

// Облачко дыма под задним колесом
function addPuff() {
  const puff = document.createElement('span');
  puff.className = 'puff';
  puff.style.left = (rearContactX() - 7) + 'px';
  road.appendChild(puff);
  puff.addEventListener('animationend', function () {
    puff.remove();
  });
}

// Один кадр анимации
function frame(time) {
  if (lastTime === null) {
    lastTime = time;
  }
  // dt — сколько секунд прошло с прошлого кадра (не больше 0.05, чтобы не было скачков)
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  // 1. Скорость
  if (isSkidding) {
    speed = speed - FRICTION * dt;
    if (speed <= 0) {
      finishSkid();
    }
  } else if (!isStopped && speed < CRUISE_SPEED) {
    speed = Math.min(speed + ACCELERATION * dt, CRUISE_SPEED);
  }

  // Сам делает скид, когда впервые доехал до 40% дороги
  if (!autoSkidDone && x > road.offsetWidth * 0.4) {
    autoSkidDone = true;
    startSkid();
  }

  // 2. Положение. Уехал за правый край — появляется слева
  const distance = speed * dt;
  x = x + distance;
  if (x > road.offsetWidth) {
    x = -bike.offsetWidth;
  }
  bike.style.transform = 'translateX(' + x + 'px)';

  // 3. Колёса: угол = пройденный путь / радиус (в градусах)
  const turn = (distance / (WHEEL_RADIUS * getScale())) * (180 / Math.PI);
  frontAngle = (frontAngle + turn) % 360;
  if (!isSkidding) {
    rearAngle = (rearAngle + turn) % 360;   // при скиде заднее колесо заблокировано
  }
  rearWheel.setAttribute('transform', 'rotate(' + rearAngle + ' 45 92)');
  frontWheel.setAttribute('transform', 'rotate(' + frontAngle + ' 175 92)');

  // 4. След растёт, пока колесо скользит
  if (isSkidding && skidMark !== null) {
    skidMark.style.width = Math.max(rearContactX() - skidStartX, 0) + 'px';
    if (Math.random() < 0.35) {
      addPuff();
    }
  }

  requestAnimationFrame(frame);
}

// ---------- События ----------
skidButton.addEventListener('click', startSkid);
road.addEventListener('click', startSkid);

// Клавиша S — но не когда человек печатает в поле
document.addEventListener('keydown', function (event) {
  const typing = event.target.matches('input, textarea, select');
  if (!typing && (event.key === 's' || event.key === 'S')) {
    startSkid();
  }
});

// ---------- Старт ----------
// Если в Garage собран свой велик — едет он (цвет рамы, ободов, руль, spoke card)
const myBike = loadGarage();
if (myBike !== null) {
  applyGarageToBike(bike.querySelector('svg'), myBike, false);
  document.querySelector('#garage-link').textContent = 'Your bike from the Garage is riding — change it';
}

// Если в системе выключены анимации — велосипед просто стоит в центре
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  x = (road.offsetWidth - bike.offsetWidth) / 2;
  bike.style.transform = 'translateX(' + x + 'px)';
  skidButton.hidden = true;
  document.querySelector('#road-hint').textContent = 'Animations are turned off in your system settings.';
} else {
  requestAnimationFrame(frame);
}
