// =====================================================
// Skid Challenge (skid.html): останови фикс как можно ближе к линии.
// Держишь кнопку или пробел — заднее колесо заблокировано, велик тормозит.
// Отпустил — катится с той же скоростью. Физика как в js/bike.js.
// =====================================================

// ---------- Настройки ----------
const ROUNDS = 5;
const START_SPEED = 230;       // px/с в первом раунде
const SPEED_STEP = 35;         // каждый раунд быстрее
const SKID_FRICTION = 260;     // насколько быстро тормозит скид (px/с за секунду)
const PERFECT_GAP = 4;         // ближе 4 см — "Perfect!"
const BEST_KEY = 'fga-skid-best';
const SVG_W = 220;
const FRONT_EDGE = 210;        // передний край переднего колеса в SVG (175 + 35)
const REAR_CONTACT = 45;       // центр заднего колеса в SVG

// ---------- Элементы ----------
const track = document.querySelector('#track');
const gameBike = document.querySelector('#bike');
const stopLine = document.querySelector('#stop-line');
const rearWheelEl = document.querySelector('#wheel-rear');
const frontWheelEl = document.querySelector('#wheel-front');
const startButton = document.querySelector('#btn-start');
const holdButton = document.querySelector('#btn-hold');
const messageEl = document.querySelector('#skid-message');
const roundEl = document.querySelector('#round');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const speedEl = document.querySelector('#speed');
const historyEl = document.querySelector('#history');

// ---------- Состояние ----------
let phase = 'ready';           // 'ready' | 'riding' | 'stopped' | 'over'
let round = 1;
let totalScore = 0;
let bikeX = 0;
let bikeSpeed = 0;
let isHolding = false;
let rearTurn = 0;
let frontTurn = 0;
let lineX = 0;
let currentMark = null;
let markStartX = 0;
let previousTime = null;

// ---------- Помощники ----------
function bikeScale() {
  return gameBike.offsetWidth / SVG_W;
}
function frontEdgeX() {
  return bikeX + FRONT_EDGE * bikeScale();
}
function rearContact() {
  return bikeX + REAR_CONTACT * bikeScale();
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (error) {
    return 0;
  }
}
function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch (error) {
    // не сохранилось — рекорд останется только на этой странице
  }
}

function drawBike() {
  gameBike.style.transform = 'translateX(' + bikeX + 'px)';
  rearWheelEl.setAttribute('transform', 'rotate(' + rearTurn + ' 45 92)');
  frontWheelEl.setAttribute('transform', 'rotate(' + frontTurn + ' 175 92)');
}

function updateStats() {
  roundEl.textContent = Math.min(round, ROUNDS) + ' / ' + ROUNDS;
  scoreEl.textContent = totalScore;
  bestEl.textContent = loadBest();
}

// ---------- Раунд ----------
function startRound() {
  // убираем старые следы
  for (const mark of track.querySelectorAll('.skid-mark')) {
    mark.remove();
  }
  // стоп-линия в случайном месте: от 55% до 80% ширины трассы
  const percent = 0.55 + Math.random() * 0.25;
  lineX = Math.round(track.offsetWidth * percent);
  stopLine.style.left = lineX + 'px';

  bikeX = -gameBike.offsetWidth * 0.3;
  bikeSpeed = START_SPEED + (round - 1) * SPEED_STEP;
  isHolding = false;
  phase = 'riding';
  previousTime = null;

  speedEl.textContent = Math.round(bikeSpeed / 10) + ' km/h';
  messageEl.textContent = 'Round ' + round + ': ride… hold to skid!';
  startButton.disabled = true;
  holdButton.disabled = false;
  holdButton.focus();
  updateStats();
  requestAnimationFrame(gameFrame);
}

// Начать скид: новый след под задним колесом
function startHold() {
  if (phase !== 'riding' || isHolding) {
    return;
  }
  isHolding = true;
  gameBike.classList.add('is-skidding');
  holdButton.classList.add('is-pressed');
  markStartX = rearContact();
  currentMark = document.createElement('div');
  currentMark.className = 'skid-mark';
  currentMark.style.left = markStartX + 'px';
  track.appendChild(currentMark);
}

function endHold() {
  isHolding = false;
  gameBike.classList.remove('is-skidding');
  holdButton.classList.remove('is-pressed');
  currentMark = null;
}

function addHistory(text, points) {
  const item = document.createElement('li');
  const label = document.createElement('span');
  label.textContent = text;
  const value = document.createElement('strong');
  value.textContent = points + ' pts';
  item.append(label, value);
  historyEl.appendChild(item);
}

// Раунд закончен: считаем очки
function finishRound(rodeOff) {
  endHold();
  phase = 'stopped';
  holdButton.disabled = true;

  const gap = Math.round(lineX - frontEdgeX());   // сколько см не доехал до линии
  let points = 0;
  let text = '';

  if (rodeOff) {
    text = 'Rode through the line without stopping';
  } else if (gap < 0) {
    text = 'Crossed the line by ' + (-gap) + ' cm';
  } else {
    points = Math.max(0, 100 - Math.round(gap / 2));
    text = gap <= PERFECT_GAP ? 'PERFECT! ' + gap + ' cm before the line' : gap + ' cm before the line';
  }

  totalScore = totalScore + points;
  messageEl.textContent = 'Round ' + round + ': ' + text + ' — ' + points + ' points.';
  addHistory('Round ' + round + ': ' + text, points);

  if (round === ROUNDS) {
    finishGame();
  } else {
    round = round + 1;
    startButton.textContent = 'Next round';
    startButton.disabled = false;
    startButton.focus();
  }
  updateStats();
}

function finishGame() {
  phase = 'over';
  const best = loadBest();
  let text = 'Game over! Total: ' + totalScore + ' of ' + (ROUNDS * 100) + '.';
  if (totalScore > best) {
    saveBest(totalScore);
    text = text + ' New best game!';
  }
  // jQuery: сообщение плавно мигает, чтобы было заметно
  messageEl.textContent = text;
  $(messageEl).stop(true, true).fadeOut(150).fadeIn(250);
  startButton.textContent = 'Play again';
  startButton.disabled = false;
  startButton.focus();
}

function resetGame() {
  round = 1;
  totalScore = 0;
  historyEl.replaceChildren();
  startButton.textContent = 'Start round';
}

// ---------- Один кадр анимации ----------
function gameFrame(time) {
  if (phase !== 'riding') {
    return;
  }
  if (previousTime === null) {
    previousTime = time;
  }
  const dt = Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;

  if (isHolding) {
    bikeSpeed = bikeSpeed - SKID_FRICTION * dt;   // скид тормозит
  }
  if (bikeSpeed <= 0) {
    bikeSpeed = 0;
    drawBike();
    finishRound(false);
    return;
  }

  const distance = bikeSpeed * dt;
  bikeX = bikeX + distance;
  const turn = (distance / (35 * bikeScale())) * (180 / Math.PI);
  frontTurn = (frontTurn + turn) % 360;
  if (!isHolding) {
    rearTurn = (rearTurn + turn) % 360;           // заднее колесо крутится, только если не заблокировано
  }
  if (currentMark !== null) {
    currentMark.style.width = Math.max(rearContact() - markStartX, 0) + 'px';
  }
  speedEl.textContent = Math.round(bikeSpeed / 10) + ' km/h';
  drawBike();

  // уехал за край трассы
  if (bikeX > track.offsetWidth) {
    finishRound(true);
    return;
  }
  requestAnimationFrame(gameFrame);
}

// ---------- События ----------
startButton.addEventListener('click', function () {
  if (phase === 'over') {
    resetGame();
  }
  startRound();
});

// Мышь и палец: pointer-события
holdButton.addEventListener('pointerdown', function (event) {
  event.preventDefault();
  startHold();
});
holdButton.addEventListener('pointerup', endHold);
holdButton.addEventListener('pointerleave', endHold);
holdButton.addEventListener('pointercancel', endHold);

// Клавиатура: пробел (repeat — автоповтор, когда клавишу держат)
let spaceUsedForSkid = false;
document.addEventListener('keydown', function (event) {
  if (event.code === 'Space' && phase === 'riding') {
    event.preventDefault();             // страница не прокручивается
    spaceUsedForSkid = true;
    if (!event.repeat) {
      startHold();
    }
  }
});
document.addEventListener('keyup', function (event) {
  // если пробел держали для скида — отпускание не должно нажать кнопку "Next round"
  if (event.code === 'Space' && spaceUsedForSkid) {
    event.preventDefault();
    spaceUsedForSkid = false;
    endHold();
  }
});

// ---------- Старт ----------
const myGarageBike = loadGarage();
if (myGarageBike !== null) {
  applyGarageToBike(gameBike.querySelector('svg'), myGarageBike, false);
}
stopLine.style.left = Math.round(track.offsetWidth * 0.7) + 'px';
bikeX = 10;
drawBike();
updateStats();
