// =====================================================
// Форма заказа (build.html): проверка полей на JavaScript.
// - при открытии страницы ошибок нет;
// - поле проверяется первый раз, когда из него ушли (focusout),
//   потом — при каждом вводе (input / change);
// - ошибка под полем пропадает, как только поле исправлено;
// - после правильной отправки: сообщение об успехе (jQuery) и форма очищается.
// =====================================================

// ---------- Правила ----------
const NAME_PATTERN = /^[\p{L}' -]+$/u;                 // только буквы, пробел, дефис, апостроф
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;   // что-то@что-то.домен
const GEAR_PATTERN = /^(\d{2})\s*[x×*\/]\s*(\d{2})$/i;   // 48x17, 48×17, 48/17
const HEIGHT_MIN = 140;
const HEIGHT_MAX = 210;
const COMMENT_MAX = 300;
const DAYS_AHEAD = 60;
const CLOSED_DAY = 1;                                    // понедельник (getDay() === 1)

// ---------- Элементы ----------
const form = document.querySelector('#order-form');
const formStatus = document.querySelector('#form-status');
const successBox = document.querySelector('#order-success');
const nameInput = document.querySelector('#order-name');
const emailInput = document.querySelector('#order-email');
const phoneInput = document.querySelector('#order-phone');
const buildSelect = document.querySelector('#order-build');
const heightInput = document.querySelector('#order-height');
const heightHint = document.querySelector('#order-height-hint');
const gearInput = document.querySelector('#order-gear');
const gearHint = document.querySelector('#order-gear-hint');
const dateInput = document.querySelector('#order-date');
const commentInput = document.querySelector('#order-comment');
const commentCount = document.querySelector('#order-comment-count');
const agreeInput = document.querySelector('#order-agree');

const sumBase = document.querySelector('#sum-base');
const sumSize = document.querySelector('#sum-size');
const sumGear = document.querySelector('#sum-gear');
const sumParts = document.querySelector('#summary-parts');
const sumTotal = document.querySelector('#sum-total');

let buildIds = loadBuild();        // запчасти из каталога на главной
const touched = new Set();         // поля, из которых уже уходили

// ---------- Даты ----------
// Дата -> строка "2026-11-14" (формат input type="date")
function toInputDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ---------- Помощники ----------
// Размер рамы по росту (или '' если рост неправильный)
function getFrameSize(height) {
  if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
    return '';
  } else if (height < 165) {
    return 'S (50 cm)';
  } else if (height < 179) {
    return 'M (54 cm)';
  } else if (height < 191) {
    return 'L (56 cm)';
  }
  return 'XL (58 cm)';
}

// Оставляем только цифры: "+7 (701) 234-56-78" -> "77012345678"
function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '8') {
    digits = '7' + digits.slice(1);   // 8 701... тоже принимаем
  }
  return digits;
}

// "77012345678" -> "+7 701 234 56 78"
function formatPhone(digits) {
  return '+7 ' + digits.slice(1, 4) + ' ' + digits.slice(4, 7) + ' ' +
    digits.slice(7, 9) + ' ' + digits.slice(9, 11);
}

// ---------- Проверки: каждая возвращает текст ошибки или '' ----------
function checkName() {
  const value = nameInput.value.trim();
  if (value === '') {
    return 'Enter your name.';
  }
  if (!NAME_PATTERN.test(value)) {
    return 'Use only letters, spaces and hyphens.';
  }
  const words = value.split(/\s+/);
  if (words.length < 2 || words[0].length < 2 || words[1].length < 2) {
    return 'Enter your first and last name, for example "Zharkyn Abay".';
  }
  return '';
}

function checkEmail() {
  const value = emailInput.value.trim();
  if (value === '') {
    return 'Enter your email.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Email should look like name@example.com.';
  }
  return '';
}

function checkPhone() {
  const value = phoneInput.value.trim();
  if (value === '') {
    return 'Enter your phone number.';
  }
  const digits = getPhoneDigits(value);
  if (digits.length !== 11 || digits[0] !== '7' || digits[1] !== '7') {
    return 'Enter a Kazakhstan mobile number, for example +7 701 234 56 78.';
  }
  return '';
}

function checkBuild() {
  if (buildSelect.value === '') {
    return 'Choose a base build.';
  }
  return '';
}

function checkHeight() {
  const value = heightInput.value.trim();
  if (value === '') {
    return 'Enter your height in centimeters.';
  }
  const height = Number(value);
  if (!Number.isInteger(height)) {
    return 'Height must be a whole number, for example 178.';
  }
  if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
    return 'We build frames for riders from ' + HEIGHT_MIN + ' to ' + HEIGHT_MAX + ' cm.';
  }
  return '';
}

function checkGear() {
  const value = gearInput.value.trim();
  if (value === '') {
    return '';                       // поле необязательное
  }
  const match = value.match(GEAR_PATTERN);
  if (match === null) {
    return 'Write the gear like 48x17 (chainring x cog).';
  }
  const chainring = Number(match[1]);
  const cog = Number(match[2]);
  if (chainring < 42 || chainring > 53) {
    return 'Chainring must be from 42 to 53 teeth.';
  }
  if (cog < 12 || cog > 20) {
    return 'Cog must be from 12 to 20 teeth.';
  }
  return '';
}

function checkDate() {
  if (dateInput.value === '') {
    return 'Choose a date for the test ride.';
  }
  const parts = dateInput.value.split('-');
  const chosen = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = getToday();
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + DAYS_AHEAD);

  if (chosen < today) {
    return 'The date cannot be in the past.';
  }
  if (chosen > lastDay) {
    return 'You can book only ' + DAYS_AHEAD + ' days ahead.';
  }
  if (chosen.getDay() === CLOSED_DAY) {
    return 'The workshop is closed on Mondays. Choose another day.';
  }
  return '';
}

function checkComment() {
  if (commentInput.value.length > COMMENT_MAX) {
    return 'Too long: ' + commentInput.value.length + ' of ' + COMMENT_MAX + ' characters.';
  }
  return '';
}

function checkAgree() {
  if (!agreeInput.checked) {
    return 'Please confirm that you understand how a fixed gear works.';
  }
  return '';
}

// id поля -> его проверка
const CHECKS = {
  'order-name': checkName,
  'order-email': checkEmail,
  'order-phone': checkPhone,
  'order-build': checkBuild,
  'order-height': checkHeight,
  'order-gear': checkGear,
  'order-date': checkDate,
  'order-comment': checkComment,
  'order-agree': checkAgree
};

// Проверить одно поле и показать результат под ним
function validateField(input) {
  const message = CHECKS[input.id]();
  const errorEl = document.querySelector('#' + input.id + '-error');
  errorEl.textContent = message;

  const isEmptyOptional = (input === gearInput || input === commentInput) && input.value.trim() === '';
  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '' && !isEmptyOptional && input !== agreeInput);
  if (message === '') {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', 'true');
  }
  updateFormStatus();
  return message === '';
}

// Сообщение над формой обновляется, пока человек исправляет поля
function updateFormStatus() {
  if (formStatus.textContent === '') {
    return;                          // показываем его только после попытки отправки
  }
  const errorCount = form.querySelectorAll('[aria-invalid="true"]').length;
  if (errorCount === 0) {
    formStatus.textContent = '';
  } else {
    formStatus.textContent = 'Please fix ' + errorCount + (errorCount === 1 ? ' field' : ' fields') + ' marked in red.';
  }
}

// ---------- Сводка заказа справа ----------
function getPartsTotal() {
  let total = 0;
  for (const id of buildIds) {
    total = total + findPart(id).price;
  }
  return total;
}

function renderSummary() {
  // Базовая сборка
  const base = BASE_BUILDS[buildSelect.value];
  sumBase.textContent = base === undefined ? 'not chosen' : base.name;

  // Размер рамы — сразу, как только рост правильный
  const size = getFrameSize(Number(heightInput.value));
  if (checkHeight() === '') {
    sumSize.textContent = size;
    heightHint.textContent = 'Your frame size: ' + size + '.';
    heightHint.classList.add('hint-ok');
  } else {
    sumSize.textContent = 'enter your height';
    heightHint.textContent = 'We pick the frame size from your height.';
    heightHint.classList.remove('hint-ok');
  }

  // Передача
  if (gearInput.value.trim() !== '' && checkGear() === '') {
    const match = gearInput.value.trim().match(GEAR_PATTERN);
    sumGear.textContent = match[1] + '×' + match[2];
  } else {
    sumGear.textContent = 'standard 48×17';
  }

  // Запчасти
  sumParts.replaceChildren();
  if (buildIds.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'summary-empty';
    empty.append('No extra parts. ');
    const link = document.createElement('a');
    link.href = 'index.html#parts';
    link.textContent = 'Pick parts in the catalog';
    empty.appendChild(link);
    sumParts.appendChild(empty);
  }
  for (const id of buildIds) {
    const part = findPart(id);
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = part.name;
    const price = document.createElement('span');
    price.className = 'item-price';
    price.textContent = formatPrice(part.price);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-remove';
    remove.dataset.id = part.id;
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove ' + part.name);
    item.append(name, price, remove);
    sumParts.appendChild(item);
  }

  // Итог = база + запчасти
  if (base === undefined) {
    sumTotal.textContent = buildIds.length > 0 ? formatPrice(getPartsTotal()) + ' + base' : '—';
  } else {
    const prefix = buildSelect.value === 'custom' ? 'from ' : '';
    sumTotal.textContent = prefix + formatPrice(base.price + getPartsTotal());
  }

  // Выделяем выбранную строку в таблице
  $('.price-table tbody tr').removeClass('is-chosen');
  $('.btn-choose[data-build="' + buildSelect.value + '"]').closest('tr').addClass('is-chosen');
}

function updateCommentCount() {
  const length = commentInput.value.length;
  commentCount.textContent = length + ' / ' + COMMENT_MAX;
  commentCount.classList.toggle('hint-bad', length > COMMENT_MAX);
}

// ---------- Успешный заказ ----------
function showSuccess() {
  const base = BASE_BUILDS[buildSelect.value];
  const firstName = nameInput.value.trim().split(/\s+/)[0];
  const orderNumber = 'FGA-' + (Math.floor(Math.random() * 9000) + 1000);
  const parts = dateInput.value.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const prettyDate = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  successBox.replaceChildren();

  const title = document.createElement('h2');
  title.className = 'success-title';
  title.textContent = 'Thank you, ' + firstName + '! Order ' + orderNumber + ' is received.';

  const list = document.createElement('ul');
  list.className = 'success-list';
  const lines = [
    'Build: ' + base.name + ', frame ' + getFrameSize(Number(heightInput.value)) + ', gear ' + sumGear.textContent,
    'Extra parts: ' + buildIds.length + ' · estimated total ' + sumTotal.textContent,
    'Test ride: ' + prettyDate + '. We will call ' + formatPhone(getPhoneDigits(phoneInput.value)) + ' to confirm.'
  ];
  for (const line of lines) {
    const item = document.createElement('li');
    item.textContent = line;
    list.appendChild(item);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn btn-outline-light btn-sm';
  close.id = 'btn-close-success';
  close.textContent = 'Close';

  successBox.append(title, list, close);

  // jQuery: плавно показать сообщение и прокрутить к нему
  $(successBox).stop(true, true).hide().slideDown(400);
  $('html, body').stop().animate({ scrollTop: $(successBox).offset().top - 90 }, 500);
  successBox.focus({ preventScroll: true });
}

function resetForm() {
  form.reset();
  touched.clear();
  for (const id in CHECKS) {
    const input = document.querySelector('#' + id);
    input.classList.remove('is-invalid', 'is-valid');
    input.removeAttribute('aria-invalid');
    document.querySelector('#' + id + '-error').textContent = '';
  }
  formStatus.textContent = '';
  gearHint.classList.remove('hint-ok');
  buildIds = [];
  clearSavedOrder();             // сборка отправлена — очищаем её
  updateCommentCount();
  renderSummary();
}

// ---------- События ----------
// Первый уход из поля -> проверка
form.addEventListener('focusout', function (event) {
  const input = event.target;
  if (CHECKS[input.id] === undefined) {
    return;
  }
  touched.add(input.id);
  validateField(input);
  // красивый формат телефона, если номер правильный
  if (input === phoneInput && checkPhone() === '') {
    phoneInput.value = formatPhone(getPhoneDigits(phoneInput.value));
  }
});

// Ввод -> проверка (только если поле уже трогали) + обновить сводку
function onFieldChange(event) {
  const input = event.target;
  if (CHECKS[input.id] === undefined) {
    return;
  }
  if (touched.has(input.id) || input === agreeInput || input === buildSelect) {
    touched.add(input.id);
    validateField(input);
  }
  if (input === commentInput) {
    updateCommentCount();
  }
  renderSummary();
}
form.addEventListener('input', onFieldChange);
form.addEventListener('change', onFieldChange);

form.addEventListener('submit', function (event) {
  event.preventDefault();          // без перезагрузки страницы

  let firstInvalid = null;
  let errorCount = 0;
  for (const id in CHECKS) {
    const input = document.querySelector('#' + id);
    touched.add(id);
    if (!validateField(input)) {
      errorCount = errorCount + 1;
      if (firstInvalid === null) {
        firstInvalid = input;
      }
    }
  }

  if (errorCount > 0) {
    formStatus.textContent = 'Please fix';   // не пустое -> updateFormStatus() посчитает
    updateFormStatus();
    firstInvalid.focus();
    return;
  }

  showSuccess();
  resetForm();
});

// Кнопки "Choose" в таблице выбирают сборку в форме
$('.btn-choose').on('click', function () {
  buildSelect.value = $(this).data('build');
  touched.add(buildSelect.id);
  validateField(buildSelect);
  renderSummary();
  $('html, body').stop().animate({ scrollTop: $('#order').offset().top - 80 }, 500, function () {
    buildSelect.focus();
  });
});

// Удалить запчасть из сводки
sumParts.addEventListener('click', function (event) {
  const button = event.target.closest('.btn-remove');
  if (button === null) {
    return;
  }
  const id = Number(button.dataset.id);
  buildIds = buildIds.filter(function (buildId) { return buildId !== id; });
  saveBuild(buildIds);
  renderSummary();
  sumParts.querySelector('.btn-remove, a').focus();
});

// Закрыть сообщение об успехе
successBox.addEventListener('click', function (event) {
  if (event.target.id === 'btn-close-success') {
    $(successBox).stop(true, true).slideUp(300);
    nameInput.focus();
  }
});

// ---------- Старт ----------
// Ограничения календаря: с сегодняшнего дня и на 60 дней вперёд
const lastBookingDay = getToday();
lastBookingDay.setDate(lastBookingDay.getDate() + DAYS_AHEAD);
dateInput.min = toInputDate(getToday());
dateInput.max = toInputDate(lastBookingDay);

// Передача из калькулятора на главной
const savedGear = loadGear();
if (savedGear !== '') {
  gearInput.value = savedGear;
  gearHint.textContent = 'Filled in from the gear calculator. You can change it.';
  gearHint.classList.add('hint-ok');
}

updateCommentCount();
renderSummary();
