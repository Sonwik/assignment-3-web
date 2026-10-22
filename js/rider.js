// =====================================================
// TASK 3. Rider card creator — форма с живой проверкой
// =====================================================

// ---------- Правила (числа и списки) ----------
const TOTAL_POINTS = 20;   // сумма навыков должна быть РОВНО 20
const SKILL_MIN = 1;
const SKILL_MAX = 10;
const NAME_MIN = 3;
const MAX_SKILL_GAP = 6;  // самый сильный навык больше самого слабого не более чем на 6

// Занятые имена: такое имя взять нельзя (без учёта регистра)
const TAKEN_NAMES = ['Tsunami', 'Skid King', 'Ghost Rider', 'Fixie', 'Astana Rider'];

// Каждому стилю нужен главный навык не меньше min
const CLASS_RULES = {
  sprinter: { label: 'Sprinter', skill: 'speed', min: 5 },
  climber: { label: 'Climber', skill: 'endurance', min: 5 },
  courier: { label: 'Courier', skill: 'control', min: 5 },
  trickster: { label: 'Trickster', skill: 'tricks', min: 5 }
};

const SKILLS = [
  { key: 'speed', label: 'Speed' },
  { key: 'control', label: 'Control' },
  { key: 'endurance', label: 'Endurance' },
  { key: 'tricks', label: 'Tricks' }
];

const COLOR_NAMES = { yellow: 'Yellow', red: 'Red', blue: 'Blue', green: 'Green', white: 'White' };

// Порядок групп = порядок полей в форме (для сводки ошибок и фокуса)
const GROUPS = ['name', 'class', 'color', 'skills'];

// ---------- Элементы ----------
const form = document.querySelector('#rider-form');
const nameInput = document.querySelector('#rider-name');
const classSelect = document.querySelector('#rider-class');
const colorRadios = document.querySelectorAll('input[name="frameColor"]');
const counterEl = document.querySelector('#skills-counter');
const summaryEl = document.querySelector('#error-summary');
const previewEl = document.querySelector('#preview');
const ridersEl = document.querySelector('#riders');
const resultMessage = document.querySelector('#result-message');
const clearBtn = document.querySelector('#btn-clear');

const skillInputs = {
  speed: document.querySelector('#skill-speed'),
  control: document.querySelector('#skill-control'),
  endurance: document.querySelector('#skill-endurance'),
  tricks: document.querySelector('#skill-tricks')
};

// Где показывать ошибку каждой группы
const errorEls = {
  name: document.querySelector('#rider-name-error'),
  class: document.querySelector('#rider-class-error'),
  color: document.querySelector('#color-error'),
  skills: document.querySelector('#skills-error')
};

const fieldEls = {
  name: document.querySelector('#field-name'),
  class: document.querySelector('#field-class'),
  color: document.querySelector('#field-color'),
  skills: document.querySelector('#field-skills')
};

// Выключаем всплывающие сообщения браузера. Атрибуты required, min, max остаются,
// и checkValidity() / validity продолжают работать
form.noValidate = true;

// Группа "тронута" после первого blur. До этого ошибок не показываем
const touched = { name: false, class: false, color: false, skills: false };

let riderCount = 0;

// ---------- Чтение данных формы ----------
function getSkillValue(key) {
  const value = skillInputs[key].valueAsNumber;
  return Number.isNaN(value) ? 0 : value; // пустое поле считаем как 0
}

function getSelectedColor() {
  for (const radio of colorRadios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return '';
}

function getData() {
  const skills = {};
  for (const skill of SKILLS) {
    skills[skill.key] = getSkillValue(skill.key);
  }
  return {
    name: nameInput.value.trim(),
    riderClass: classSelect.value,
    color: getSelectedColor(),
    skills: skills
  };
}

// Сумма навыков — свой цикл
function sumSkills() {
  let total = 0;
  for (const skill of SKILLS) {
    total = total + getSkillValue(skill.key);
  }
  return total;
}

// Разница между самым сильным и самым слабым навыком — свой цикл
function getSkillGap() {
  let highest = getSkillValue(SKILLS[0].key);
  let lowest = highest;
  for (const skill of SKILLS) {
    const value = getSkillValue(skill.key);
    if (value > highest) {
      highest = value;
    }
    if (value < lowest) {
      lowest = value;
    }
  }
  return highest - lowest;
}

function isNameTaken(name) {
  for (const taken of TAKEN_NAMES) {
    if (taken.toLowerCase() === name.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// ---------- Проверка каждой группы ----------
// Каждая функция возвращает { message, elements, focusEl }.
// message === '' значит "ошибок нет"

function checkName() {
  const value = nameInput.value.trim();
  let message = '';
  if (nameInput.validity.valueMissing || value === '') {
    message = 'Enter a rider name.';
  } else if (value.length < NAME_MIN) {
    // Свой счёт длины: minlength не видит, что имя из одних пробелов
    message = 'The name is too short: ' + value.length + ' of at least ' + NAME_MIN + ' characters.';
  } else if (isNameTaken(value)) {
    // ПРАВИЛО 1 (HTML не умеет): имя не должно быть занято
    message = '"' + value + '" is already taken. Choose another name.';
  }
  return { message: message, elements: [nameInput], focusEl: nameInput };
}

function checkClass() {
  let message = '';
  if (classSelect.validity.valueMissing) {
    message = 'Choose a riding style.';
  } else {
    // ПРАВИЛО 2 (HTML не умеет): у стиля главный навык не меньше min
    const rule = CLASS_RULES[classSelect.value];
    const value = getSkillValue(rule.skill);
    const skillLabel = getSkillLabel(rule.skill);
    if (value < rule.min) {
      message = 'A ' + rule.label + ' needs ' + skillLabel + ' ' + rule.min + ' or more (now ' + value + ').';
    }
  }
  return { message: message, elements: [classSelect], focusEl: classSelect };
}

function checkColor() {
  let message = '';
  // validity у radio-группы: valueMissing, если ничего не выбрано
  if (colorRadios[0].validity.valueMissing) {
    message = 'Choose a frame color.';
  }
  return { message: message, elements: Array.from(colorRadios), focusEl: colorRadios[0] };
}

function checkSkills() {
  // Сначала проверки HTML-атрибутов каждого поля (min, max, step, required)
  for (const skill of SKILLS) {
    const input = skillInputs[skill.key];
    const v = input.validity;
    if (v.valueMissing || v.badInput) {
      return { message: 'Enter ' + skill.label + ': a whole number from ' + SKILL_MIN + ' to ' + SKILL_MAX + '.', elements: [input], focusEl: input };
    }
    if (v.rangeUnderflow || v.rangeOverflow) {
      return { message: skill.label + ' must be from ' + SKILL_MIN + ' to ' + SKILL_MAX + ' (now ' + input.value + ').', elements: [input], focusEl: input };
    }
    if (v.stepMismatch) {
      return { message: skill.label + ' must be a whole number (now ' + input.value + ').', elements: [input], focusEl: input };
    }
  }

  const allInputs = Object.values(skillInputs);

  // ПРАВИЛО 3 (HTML не умеет): сумма ровно TOTAL_POINTS
  const total = sumSkills();
  if (total !== TOTAL_POINTS) {
    const diff = Math.abs(TOTAL_POINTS - total);
    const hint = total > TOTAL_POINTS ? 'remove ' + diff : 'add ' + diff;
    return { message: 'Use exactly ' + TOTAL_POINTS + ' points: now ' + total + ', ' + hint + '.', elements: allInputs, focusEl: allInputs[0] };
  }

  // ПРАВИЛО 4 (HTML не умеет): райдер сбалансирован —
  // самый сильный навык больше самого слабого не более чем на MAX_SKILL_GAP
  const gap = getSkillGap();
  if (gap > MAX_SKILL_GAP) {
    return { message: 'Your rider is unbalanced: the gap between the strongest and the weakest skill is ' + gap + '. It can be at most ' + MAX_SKILL_GAP + '.', elements: allInputs, focusEl: allInputs[0] };
  }

  return { message: '', elements: allInputs, focusEl: allInputs[0] };
}

function checkGroup(group) {
  if (group === 'name') { return checkName(); }
  if (group === 'class') { return checkClass(); }
  if (group === 'color') { return checkColor(); }
  return checkSkills();
}

// ---------- Показ ошибки под полем ----------
function showGroupResult(group, result) {
  const hasError = result.message !== '';
  errorEls[group].textContent = result.message;
  fieldEls[group].classList.toggle('field-invalid', hasError);
  fieldEls[group].classList.toggle('field-valid', !hasError);

  // Для группы навыков сначала сбрасываем все поля, потом отмечаем нужные
  const all = group === 'skills' ? Object.values(skillInputs) : result.elements;
  for (const el of all) {
    const isBad = hasError && result.elements.includes(el);
    el.setAttribute('aria-invalid', isBad ? 'true' : 'false');
    el.classList.toggle('is-invalid', isBad);
    el.classList.toggle('is-valid', !hasError && el.type !== 'radio');
    // Constraint Validation API: своё сообщение => checkValidity() тоже его видит
    el.setCustomValidity(isBad ? result.message : '');
  }
}

function clearGroup(group) {
  errorEls[group].textContent = '';
  fieldEls[group].classList.remove('field-invalid', 'field-valid');
  const elements = checkGroup(group).elements.concat(Object.values(skillInputs));
  for (const el of elements) {
    el.removeAttribute('aria-invalid');
    el.classList.remove('is-invalid', 'is-valid');
    el.setCustomValidity('');
  }
}

function validateGroup(group) {
  const result = checkGroup(group);
  showGroupResult(group, result);
  return result;
}

// Проверить только "тронутые" группы (после первого blur)
function validateTouched() {
  for (const group of GROUPS) {
    if (touched[group]) {
      validateGroup(group);
    }
  }
}

function getGroupOf(el) {
  if (el === nameInput) { return 'name'; }
  if (el === classSelect) { return 'class'; }
  if (el.name === 'frameColor') { return 'color'; }
  if (el.classList.contains('skill-input')) { return 'skills'; }
  return '';
}

function getSkillLabel(key) {
  for (const skill of SKILLS) {
    if (skill.key === key) {
      return skill.label;
    }
  }
  return key;
}

// ---------- Счётчик очков ----------
function updateCounter() {
  const left = TOTAL_POINTS - sumSkills();
  counterEl.classList.remove('counter-left', 'counter-ok', 'counter-over');
  if (left > 0) {
    counterEl.textContent = left + ' points left';
    counterEl.classList.add('counter-left');
  } else if (left === 0) {
    counterEl.textContent = 'All ' + TOTAL_POINTS + ' points used ✓';
    counterEl.classList.add('counter-ok');
  } else {
    counterEl.textContent = Math.abs(left) + ' points over the limit';
    counterEl.classList.add('counter-over');
  }
}

// ---------- Карточка райдера (для предпросмотра и для результата) ----------
function buildCard(data, title) {
  const card = document.createElement('article');
  card.classList.add('rider-card', 'frame-' + (data.color || 'none'));

  const label = document.createElement('p');
  label.classList.add('rider-card-label');
  label.textContent = title;

  const name = document.createElement('h3');
  name.classList.add('rider-card-name');
  name.textContent = data.name || 'Your rider';

  const info = document.createElement('p');
  info.classList.add('rider-card-info');
  const classText = data.riderClass ? CLASS_RULES[data.riderClass].label : 'No style yet';
  const colorText = data.color ? COLOR_NAMES[data.color] + ' frame' : 'No color yet';
  info.textContent = classText + ' · ' + colorText;

  const list = document.createElement('ul');
  list.classList.add('rider-skills');
  for (const skill of SKILLS) {
    const item = document.createElement('li');

    const skillName = document.createElement('span');
    skillName.textContent = skill.label;

    // <progress> рисует полосу навыка без inline-стилей
    const bar = document.createElement('progress');
    bar.max = SKILL_MAX;
    bar.value = Math.min(data.skills[skill.key], SKILL_MAX);
    bar.setAttribute('aria-label', skill.label);

    const value = document.createElement('b');
    value.textContent = data.skills[skill.key];

    item.append(skillName, bar, value);
    list.append(item);
  }

  card.append(label, name, info, list);
  return card;
}

function updatePreview() {
  previewEl.replaceChildren(buildCard(getData(), 'Preview'));
}

function renderRidersEmpty() {
  if (ridersEl.children.length === 0) {
    const empty = document.createElement('p');
    empty.classList.add('empty-state');
    empty.id = 'riders-empty';
    empty.textContent = 'No riders yet. Fill in the form to create the first card.';
    ridersEl.append(empty);
  }
}

// ---------- Сводка ошибок вверху формы ----------
function showSummary(errors) {
  summaryEl.replaceChildren();

  const title = document.createElement('p');
  title.classList.add('error-summary-title');
  const word = errors.length === 1 ? 'error' : 'errors';
  title.textContent = 'Please fix ' + errors.length + ' ' + word + ':';

  const list = document.createElement('ul');
  for (const error of errors) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + error.focusEl.id;
    link.textContent = error.message;
    link.dataset.target = error.focusEl.id;
    item.append(link);
    list.append(item);
  }

  summaryEl.append(title, list);
  summaryEl.hidden = false;
}

function hideSummary() {
  summaryEl.hidden = true;
  summaryEl.replaceChildren();
}

// ---------- Сброс формы ----------
function resetForm() {
  form.reset();
  for (const group of GROUPS) {
    touched[group] = false;
    clearGroup(group);
  }
  hideSummary();
  updateCounter();
  updatePreview();
}

// ---------- События ----------

// blur: первая проверка поля. focusout всплывает, поэтому хватает одного слушателя на форме
form.addEventListener('focusout', function (event) {
  const group = getGroupOf(event.target);
  if (group === '') {
    return;
  }
  touched[group] = true;
  // Фокус ушёл на кнопку формы (Create / Clear): не показываем ошибку сейчас.
  // Иначе текст ошибки сдвинет кнопку вниз, и клик "промахнётся".
  // Submit сам проверит все поля
  const next = event.relatedTarget;
  if (next && next.tagName === 'BUTTON' && form.contains(next)) {
    return;
  }
  validateGroup(group);
});

// input / change: предпросмотр на каждый ввод, и повторная проверка тронутых полей
function handleChange() {
  updateCounter();
  updatePreview();
  validateTouched();
}
form.addEventListener('input', handleChange);
form.addEventListener('change', handleChange);

// Клик по ошибке в сводке переносит фокус на поле
summaryEl.addEventListener('click', function (event) {
  const link = event.target.closest('a[data-target]');
  if (!link) {
    return;
  }
  event.preventDefault();
  document.getElementById(link.dataset.target).focus();
});

form.addEventListener('submit', function (event) {
  event.preventDefault(); // страница не перезагружается

  // При отправке проверяем ВСЕ поля
  const errors = [];
  for (const group of GROUPS) {
    touched[group] = true;
    const result = validateGroup(group);
    if (result.message !== '') {
      errors.push(result);
    }
  }

  // Есть ошибки: число ошибок вверху и фокус на первое неправильное поле
  if (errors.length > 0) {
    showSummary(errors);
    errors[0].focusEl.focus();
    resultMessage.textContent = '';
    return;
  }

  // Ошибок нет: строим итоговую карточку через DOM
  const data = getData();
  riderCount++;
  const card = buildCard(data, 'Rider #' + riderCount);
  card.classList.add('rider-card-final');

  const empty = document.querySelector('#riders-empty');
  if (empty) {
    empty.remove();
  }
  ridersEl.prepend(card);

  // Теперь это имя занято
  TAKEN_NAMES.push(data.name);

  resultMessage.textContent = 'Rider "' + data.name + '" is created!';
  resultMessage.classList.add('notice-success');

  resetForm();
  nameInput.focus();
});

clearBtn.addEventListener('click', function () {
  resetForm();
  resultMessage.textContent = '';
  nameInput.focus();
});

// ---------- Запуск: без ошибок при загрузке ----------
updateCounter();
updatePreview();
renderRidersEmpty();
