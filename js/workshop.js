// =====================================================
// TASK 2. Workshop board (Kanban) — страница строится из данных
// =====================================================

// ---------- Правила доски ----------
const MAX_IN_PROGRESS = 3;   // в колонке "In progress" не больше 3 карточек

// Колонки доски по порядку
const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'progress', title: 'In progress' },
  { id: 'done', title: 'Done' }
];

const PRIORITY_NAMES = { 1: 'Low', 2: 'Medium', 3: 'High' };

// ---------- Данные: массив объектов ----------
// У каждого объекта уникальный id и свойства разных типов:
// string (title, tag, status), number (id, priority, hours), boolean (urgent)
let jobs = [
  { id: 1, title: 'Face the bottom bracket shell', tag: 'Frame', priority: 3, hours: 1.5, urgent: true, status: 'todo' },
  { id: 2, title: 'True the rear wheel', tag: 'Wheels', priority: 2, hours: 1, urgent: false, status: 'todo' },
  { id: 3, title: 'Install SKEACE 48T crankset', tag: 'Drivetrain', priority: 3, hours: 2, urgent: true, status: 'progress' },
  { id: 4, title: 'Cut and fit the chain', tag: 'Drivetrain', priority: 2, hours: 0.5, urgent: false, status: 'todo' },
  { id: 5, title: 'Mount slick tires', tag: 'Wheels', priority: 1, hours: 0.5, urgent: false, status: 'done' },
  { id: 6, title: 'Wrap the drop bar', tag: 'Cockpit', priority: 1, hours: 1, urgent: false, status: 'todo' },
  { id: 7, title: 'Set chain tension', tag: 'Drivetrain', priority: 3, hours: 0.5, urgent: false, status: 'todo' },
  { id: 8, title: 'Install the headset', tag: 'Frame', priority: 2, hours: 1, urgent: false, status: 'done' },
  { id: 9, title: 'Fit pedal straps', tag: 'Cockpit', priority: 1, hours: 0.5, urgent: false, status: 'todo' },
  { id: 10, title: 'Lace the Intro7 wheelset', tag: 'Wheels', priority: 3, hours: 3, urgent: true, status: 'progress' },
  { id: 11, title: 'Adjust saddle height', tag: 'Cockpit', priority: 2, hours: 0.5, urgent: false, status: 'todo' },
  { id: 12, title: 'Final test ride', tag: 'Frame', priority: 3, hours: 1, urgent: false, status: 'todo' }
];

// ---------- Элементы страницы ----------
const boardEl = document.querySelector('#board');
const progressEl = document.querySelector('#progress');
const noticeEl = document.querySelector('#notice');
const searchInput = document.querySelector('#search');
const tagSelect = document.querySelector('#tag-filter');
const sortSelect = document.querySelector('#sort');

// ---------- Вычисления своими циклами ----------

// Сколько карточек в колонке (считаем по ВСЕМ данным, не только по видимым)
function countByStatus(status) {
  let count = 0;
  for (const job of jobs) {
    if (job.status === status) {
      count++;
    }
  }
  return count;
}

// Сколько часов работы осталось (всё, что не Done)
function countHoursLeft() {
  let total = 0;
  for (const job of jobs) {
    if (job.status !== 'done') {
      total = total + job.hours;
    }
  }
  return total;
}

// Список уникальных тегов из данных
function getTags() {
  const tags = [];
  for (const job of jobs) {
    if (!tags.includes(job.tag)) {
      tags.push(job.tag);
    }
  }
  return tags.sort();
}

// ---------- Поиск, фильтр, сортировка ----------
function getVisibleJobs() {
  const text = searchInput.value.trim().toLowerCase();
  const tag = tagSelect.value;

  // filter создаёт НОВЫЙ массив, исходные данные не меняются
  const visible = jobs.filter(function (job) {
    const matchesText = job.title.toLowerCase().includes(text);
    const matchesTag = tag === 'all' || job.tag === tag;
    return matchesText && matchesTag;
  });

  if (sortSelect.value === 'high') {
    visible.sort(function (a, b) { return b.priority - a.priority; });
  } else if (sortSelect.value === 'low') {
    visible.sort(function (a, b) { return a.priority - b.priority; });
  }
  return visible;
}

function isFiltering() {
  return searchInput.value.trim() !== '' || tagSelect.value !== 'all';
}

// ---------- Одна функция render: рисует всё по текущим данным ----------
function render() {
  const visible = getVisibleJobs();
  boardEl.replaceChildren(); // очищаем доску

  for (const column of COLUMNS) {
    const columnJobs = visible.filter(function (job) {
      return job.status === column.id;
    });
    boardEl.append(createColumn(column, columnJobs));
  }

  // Сообщение, если поиск/фильтр ничего не нашёл
  if (visible.length === 0) {
    showNotice('No jobs match your search or filter. Try another word or tag.', 'empty');
  } else if (noticeEl.classList.contains('notice-empty')) {
    showNotice('', '');
  }

  renderProgress();
}

function createColumn(column, columnJobs) {
  const section = document.createElement('section');
  section.classList.add('kb-column');
  section.setAttribute('aria-labelledby', 'col-' + column.id);

  const header = document.createElement('header');
  header.classList.add('kb-column-head');

  const title = document.createElement('h2');
  title.id = 'col-' + column.id;
  title.textContent = column.title;

  const count = document.createElement('span');
  count.classList.add('kb-count');
  const total = countByStatus(column.id);
  if (column.id === 'progress') {
    count.textContent = total + ' / ' + MAX_IN_PROGRESS;
    // Колонка заполнена — подсвечиваем
    if (total >= MAX_IN_PROGRESS) {
      section.classList.add('kb-column-full');
    }
  } else {
    count.textContent = total;
  }

  header.append(title, count);
  section.append(header);

  const list = document.createElement('div');
  list.classList.add('kb-list');

  if (columnJobs.length === 0) {
    const empty = document.createElement('p');
    empty.classList.add('empty-state');
    empty.textContent = isFiltering() ? 'Nothing found here.' : 'No cards yet.';
    list.append(empty);
  }

  for (const job of columnJobs) {
    list.append(createCard(job));
  }

  section.append(list);
  return section;
}

function createCard(job) {
  const card = document.createElement('article');
  card.classList.add('kb-card', 'priority-' + job.priority);
  if (job.status === 'done') {
    card.classList.add('kb-card-done');
  }

  const title = document.createElement('h3');
  title.classList.add('kb-card-title');
  title.textContent = job.title;

  const meta = document.createElement('div');
  meta.classList.add('kb-meta');

  const tag = document.createElement('span');
  tag.classList.add('kb-tag');
  tag.textContent = job.tag;

  const priority = document.createElement('span');
  priority.classList.add('kb-priority');
  priority.textContent = PRIORITY_NAMES[job.priority] + ' priority';

  const hours = document.createElement('span');
  hours.classList.add('kb-hours');
  hours.textContent = job.hours + ' h';

  meta.append(tag, priority, hours);

  if (job.urgent === true) {
    const urgent = document.createElement('span');
    urgent.classList.add('kb-urgent');
    urgent.textContent = 'Urgent';
    meta.append(urgent);
  }

  // Кнопки перемещения. data-id и data-action прочитает ОДИН слушатель на доске
  const actions = document.createElement('div');
  actions.classList.add('kb-actions');

  const index = getColumnIndex(job.status);

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.classList.add('btn', 'btn-sm', 'kb-btn');
  backBtn.textContent = '← Back';
  backBtn.dataset.id = job.id;
  backBtn.dataset.action = 'back';
  backBtn.setAttribute('aria-label', 'Move "' + job.title + '" back');
  backBtn.disabled = index === 0;

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.classList.add('btn', 'btn-sm', 'kb-btn', 'kb-btn-next');
  nextBtn.textContent = 'Next →';
  nextBtn.dataset.id = job.id;
  nextBtn.dataset.action = 'next';
  nextBtn.setAttribute('aria-label', 'Move "' + job.title + '" forward');
  nextBtn.disabled = index === COLUMNS.length - 1;

  actions.append(backBtn, nextBtn);
  card.append(title, meta, actions);
  return card;
}

function renderProgress() {
  const done = countByStatus('done');
  const total = jobs.length;
  let percent = 0;
  if (total > 0) {
    percent = Math.round(done / total * 100);
  }

  progressEl.replaceChildren();

  // <progress> показывает полосу без inline-стилей
  const bar = document.createElement('progress');
  bar.classList.add('kb-progress');
  bar.max = total;
  bar.value = done;
  bar.setAttribute('aria-label', 'Finished jobs');

  const text = document.createElement('p');
  text.classList.add('kb-progress-text');
  text.textContent = done + ' of ' + total + ' jobs done (' + percent + '%) · ' + countHoursLeft() + ' h of work left';

  progressEl.append(bar, text);
}

// ---------- Перемещение карточки ----------
function getColumnIndex(status) {
  for (let i = 0; i < COLUMNS.length; i++) {
    if (COLUMNS[i].id === status) {
      return i;
    }
  }
  return -1;
}

function moveJob(id, action) {
  const job = jobs.find(function (item) { return item.id === id; });
  if (!job) {
    return;
  }

  const index = getColumnIndex(job.status);
  const newIndex = action === 'next' ? index + 1 : index - 1;
  if (newIndex < 0 || newIndex >= COLUMNS.length) {
    return;
  }
  const target = COLUMNS[newIndex];

  // ПРАВИЛО: в "In progress" не больше MAX_IN_PROGRESS карточек
  if (target.id === 'progress' && countByStatus('progress') >= MAX_IN_PROGRESS) {
    showNotice('Blocked: "In progress" already has ' + MAX_IN_PROGRESS + ' jobs. Finish one of them first, then start "' + job.title + '".', 'error');
    return; // данные не меняем
  }

  // Сначала меняем данные, потом вызываем render()
  job.status = target.id;
  showNotice('"' + job.title + '" moved to ' + target.title + '.', 'success');
  render();
  focusCard(id, action);
}

// render() создаёт новые кнопки, и фокус пропадает.
// Возвращаем фокус на кнопку этой же карточки, чтобы работать только с клавиатуры
function focusCard(id, action) {
  const sameButton = boardEl.querySelector('button[data-id="' + id + '"][data-action="' + action + '"]');
  if (sameButton && !sameButton.disabled) {
    sameButton.focus();
    return;
  }
  const otherButton = boardEl.querySelector('button[data-id="' + id + '"]:not([disabled])');
  if (otherButton) {
    otherButton.focus();
  }
}

function showNotice(text, type) {
  noticeEl.textContent = text;
  noticeEl.classList.remove('notice-error', 'notice-success', 'notice-empty');
  if (type !== '') {
    noticeEl.classList.add('notice-' + type);
  }
}

// ---------- Фильтр тегов строится из данных ----------
function fillTagFilter() {
  for (const tag of getTags()) {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  }
}

// ---------- События ----------

// Делегирование: ОДИН слушатель на всей доске для кнопок всех карточек
boardEl.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return; // клик не по кнопке
  }
  moveJob(Number(button.dataset.id), button.dataset.action);
});

searchInput.addEventListener('input', render);
tagSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);

// ---------- Запуск ----------
fillTagFilter();
render();
