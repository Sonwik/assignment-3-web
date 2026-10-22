// =====================================================
// TASK 1. Higher or Lower: угадай цену следующей запчасти
// =====================================================

// ---------- Все числа игры: константы вверху ----------
const START_LIVES = 3;        // жизней в начале игры
const WIN_STREAK = 10;        // серия для победы
const MIN_PRICE = 5000;       // самая низкая цена, ₸
const MAX_PRICE = 150000;     // самая высокая цена, ₸
const PRICE_STEP = 5000;      // цены кратны 5000 ₸, поэтому одинаковые цены иногда выпадают
const HISTORY_SIZE = 5;       // сколько последних раундов показывать

// Названия запчастей (это данные, а не числа игры)
const PARTS = [
  'Crankset', 'Wheelset', 'Track frame', 'Chain', 'Saddle',
  'Handlebar', 'Pedals', 'Tires', 'Cog 17T', 'Seatpost'
];

// ---------- Элементы страницы ----------
const livesEl = document.querySelector('#lives');
const streakEl = document.querySelector('#streak');
const bestEl = document.querySelector('#best');
const goalEl = document.querySelector('#goal');
const currentNameEl = document.querySelector('#current-name');
const currentPriceEl = document.querySelector('#current-price');
const nextNameEl = document.querySelector('#next-name');
const messageEl = document.querySelector('#message');
const higherBtn = document.querySelector('#btn-higher');
const lowerBtn = document.querySelector('#btn-lower');
const guessForm = document.querySelector('#guess-form');
const guessInput = document.querySelector('#guess-input');
const restartBtn = document.querySelector('#btn-restart');
const historyEl = document.querySelector('#history');
const rulesEl = document.querySelector('#rules-list');
const gameEl = document.querySelector('#game');

// ---------- Состояние игры (меняется во время игры) ----------
let lives;
let streak;
let bestStreak = 0;           // рекорд не сбрасывается при новой игре
let currentPart;
let currentPrice;
let nextPart;
let isOver;
let result;                   // 'win', 'loss' или '' (игра идёт)
let history;

// ---------- Случайные значения ----------

// Целое число от min до max, ОБА края включены
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Случайная цена: MIN_PRICE + (0..steps) * PRICE_STEP.
// steps = 0 даёт MIN_PRICE, последний шаг даёт самую большую цену
function getRandomPrice() {
  const steps = Math.floor((MAX_PRICE - MIN_PRICE) / PRICE_STEP);
  return MIN_PRICE + getRandomInt(0, steps) * PRICE_STEP;
}

function getRandomPart() {
  return PARTS[getRandomInt(0, PARTS.length - 1)];
}

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₸';
}

// ---------- Начать новую игру (без перезагрузки страницы) ----------
function startGame() {
  lives = START_LIVES;
  streak = 0;
  isOver = false;
  result = '';
  history = [];
  currentPart = getRandomPart();
  currentPrice = getRandomPrice();
  nextPart = getRandomPart();
  showMessage('New game! Is the next part higher or lower?', 'info');
  guessInput.value = '';
  render();
}

// ---------- Ход игрока ----------
function makeGuess(choice) {
  // Неправильный ход: игра уже закончилась. Состояние НЕ меняем
  if (isOver === true) {
    showMessage('The game is over. Press "Play again" to start a new game.', 'warning');
    return;
  }

  // Неправильный ввод: не higher и не lower. Состояние НЕ меняем
  if (choice !== 'higher' && choice !== 'lower') {
    showMessage('Unknown move. Type "higher", "lower", "h" or "l".', 'warning');
    return;
  }

  const newPrice = getRandomPrice();
  const isEqual = newPrice === currentPrice;
  const isRight = isEqual ||
    (choice === 'higher' && newPrice > currentPrice) ||
    (choice === 'lower' && newPrice < currentPrice);

  // Исход 1 и 2: угадал (одинаковая цена тоже считается верным ответом)
  if (isRight) {
    streak = streak + 1;
    if (isEqual) {
      showMessage(`Same price: ${formatPrice(newPrice)}! Equal counts as a right guess.`, 'success');
    } else {
      showMessage(`Right! ${nextPart} costs ${formatPrice(newPrice)}.`, 'success');
    }
  } else {
    // Исход 3: не угадал — минус жизнь, серия обнуляется
    lives = lives - 1;
    streak = 0;
    showMessage(`Wrong! ${nextPart} costs ${formatPrice(newPrice)}. You lose a life.`, 'error');
  }

  // Новый рекорд
  if (streak > bestStreak) {
    bestStreak = streak;
  }

  addToHistory(choice, newPrice, isRight);

  // Исход 4: победа — нужная серия набрана
  if (streak === WIN_STREAK) {
    isOver = true;
    result = 'win';
    showMessage(`You win! ${WIN_STREAK} right guesses in a row.`, 'win');
  }

  // Исход 5: поражение — жизни закончились
  if (lives === 0) {
    isOver = true;
    result = 'loss';
    showMessage(`Game over! Your best streak is ${bestStreak}.`, 'loss');
  }

  // Следующая запчасть становится текущей
  currentPart = nextPart;
  currentPrice = newPrice;
  nextPart = getRandomPart();

  render();
}

function addToHistory(choice, newPrice, isRight) {
  history.unshift({
    from: currentPrice,
    to: newPrice,
    part: nextPart,
    choice: choice,
    isRight: isRight
  });
  // Храним только последние HISTORY_SIZE раундов
  if (history.length > HISTORY_SIZE) {
    history.pop();
  }
}

// ---------- Сообщение под карточками ----------
function showMessage(text, type) {
  messageEl.textContent = text;
  // Убираем старые классы и добавляем новый: стиль задаёт CSS
  messageEl.classList.remove('msg-info', 'msg-success', 'msg-error', 'msg-warning', 'msg-win', 'msg-loss');
  messageEl.classList.add('msg-' + type);
}

// ---------- Показать состояние игры после каждого хода ----------
function render() {
  // Жизни: сердечки, потерянные получают класс life-lost
  livesEl.replaceChildren();
  for (let i = 1; i <= START_LIVES; i++) {
    const heart = document.createElement('span');
    heart.textContent = '♥';
    heart.classList.add('life');
    if (i > lives) {
      heart.classList.add('life-lost');
    }
    livesEl.append(heart);
  }
  livesEl.setAttribute('aria-label', `${lives} of ${START_LIVES} lives left`);

  streakEl.textContent = streak;
  bestEl.textContent = bestStreak;
  goalEl.textContent = WIN_STREAK;
  currentNameEl.textContent = currentPart;
  currentPriceEl.textContent = formatPrice(currentPrice);
  nextNameEl.textContent = nextPart;

  // В конце игры кнопки хода выключены, появляется "Play again".
  // Поле ввода остаётся: если напечатать ход после конца игры, будет сообщение
  higherBtn.disabled = isOver;
  lowerBtn.disabled = isOver;
  restartBtn.hidden = !isOver;

  gameEl.classList.toggle('game-win', result === 'win');
  gameEl.classList.toggle('game-loss', result === 'loss');

  renderHistory();
}

function renderHistory() {
  historyEl.replaceChildren();
  if (history.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No rounds yet. Make your first guess!';
    empty.classList.add('empty-state');
    historyEl.append(empty);
    return;
  }
  for (const round of history) {
    const item = document.createElement('li');
    item.classList.add(round.isRight ? 'history-right' : 'history-wrong');
    const mark = round.isRight ? '✓' : '✗';
    item.textContent = `${mark} ${formatPrice(round.from)} → ${round.part} ${formatPrice(round.to)} (${round.choice})`;
    historyEl.append(item);
  }
}

// Правила строятся из констант: если поменять число вверху, текст тоже поменяется
function renderRules() {
  const rules = [
    `Prices are from ${formatPrice(MIN_PRICE)} to ${formatPrice(MAX_PRICE)}, in steps of ${formatPrice(PRICE_STEP)}.`,
    `You have ${START_LIVES} lives. A wrong guess costs one life.`,
    'The same price counts as a right guess.',
    `Reach a streak of ${WIN_STREAK} to win.`
  ];
  for (const text of rules) {
    const li = document.createElement('li');
    li.textContent = text;
    rulesEl.append(li);
  }
}

// ---------- События ----------
higherBtn.addEventListener('click', function () {
  makeGuess('higher');
});

lowerBtn.addEventListener('click', function () {
  makeGuess('lower');
});

// Ход текстом: "h" и "l" превращаем в "higher" и "lower"
guessForm.addEventListener('submit', function (event) {
  event.preventDefault(); // не перезагружать страницу
  const text = guessInput.value.trim().toLowerCase();
  let choice = text;
  if (text === 'h') {
    choice = 'higher';
  } else if (text === 'l') {
    choice = 'lower';
  }
  makeGuess(choice);
  guessInput.value = '';
});

restartBtn.addEventListener('click', function () {
  startGame();
  higherBtn.focus(); // фокус возвращается в игру для работы с клавиатуры
});

// ---------- Запуск ----------
renderRules();
startGame();
