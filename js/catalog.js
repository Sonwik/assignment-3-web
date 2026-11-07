// =====================================================
// JS-фича 2. Каталог запчастей + "Моя сборка".
// Данные — массив PARTS (js/parts-data.js). HTML содержит только
// пустые контейнеры: все карточки создаются здесь через DOM.
// Правило: сначала меняю данные (состояние), потом вызываю render.
// =====================================================

const ALL = 'All';

// ---------- Состояние ----------
let searchText = '';
let activeCategory = ALL;
let sortMode = 'default';
let buildIds = loadBuild();     // id запчастей в сборке (сохраняются в localStorage)

// ---------- Элементы ----------
const catalogEl = document.querySelector('#catalog');
const chipsEl = document.querySelector('#category-chips');
const countEl = document.querySelector('#catalog-count');
const searchInput = document.querySelector('#part-search');
const sortSelect = document.querySelector('#part-sort');
const buildListEl = document.querySelector('#build-list');
const buildMessageEl = document.querySelector('#build-message');
const totalCountEl = document.querySelector('#total-count');
const totalWeightEl = document.querySelector('#total-weight');
const totalPriceEl = document.querySelector('#total-price');
const orderBuildLink = document.querySelector('#btn-order-build');
const clearBuildButton = document.querySelector('#btn-clear-build');

// ---------- Категории берём из данных циклом ----------
function getCategories() {
  const categories = [ALL];
  for (const part of PARTS) {
    if (!categories.includes(part.category)) {
      categories.push(part.category);
    }
  }
  return categories;
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const category of getCategories()) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.category = category;
    chip.textContent = category;
    chip.setAttribute('aria-pressed', category === activeCategory ? 'true' : 'false');
    chipsEl.appendChild(chip);
  }
}

// ---------- Поиск + фильтр + сортировка ----------
function getVisibleParts() {
  const query = searchText.toLowerCase();

  // filter() возвращает новый массив — исходный PARTS не меняется
  const visible = PARTS.filter(function (part) {
    const inCategory = activeCategory === ALL || part.category === activeCategory;
    const text = (part.name + ' ' + part.desc + ' ' + part.category).toLowerCase();
    const matches = query === '' || text.includes(query);
    return inCategory && matches;
  });

  if (sortMode === 'price-asc') {
    visible.sort(function (a, b) { return a.price - b.price; });
  } else if (sortMode === 'price-desc') {
    visible.sort(function (a, b) { return b.price - a.price; });
  } else if (sortMode === 'weight-asc') {
    visible.sort(function (a, b) { return a.weight - b.weight; });
  }
  return visible;
}

// Одна карточка запчасти
function createPartCard(part) {
  const inBuild = buildIds.includes(part.id);

  const card = document.createElement('article');
  card.className = 'part-item';
  if (inBuild) {
    card.classList.add('in-build');
  }

  const category = document.createElement('span');
  category.className = 'part-category';
  category.textContent = part.category;

  const name = document.createElement('h3');
  name.className = 'part-name';
  name.textContent = part.name;

  const desc = document.createElement('p');
  desc.className = 'part-desc';
  desc.textContent = part.desc;

  const meta = document.createElement('div');
  meta.className = 'part-meta';
  const price = document.createElement('span');
  price.className = 'part-price';
  price.textContent = formatPrice(part.price);
  const weight = document.createElement('span');
  weight.className = 'part-weight';
  weight.textContent = part.weight + ' g';
  meta.append(price, weight);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-part';
  button.dataset.id = part.id;
  button.textContent = inBuild ? 'In build ✓ — remove' : 'Add to build';
  button.setAttribute('aria-label', (inBuild ? 'Remove ' : 'Add ') + part.name + (inBuild ? ' from build' : ' to build'));

  card.append(category, name, desc, meta, button);
  return card;
}

// Пустой результат: понятное сообщение и кнопка сброса
function createEmptyResult() {
  const box = document.createElement('div');
  box.className = 'empty-result';

  const title = document.createElement('strong');
  title.textContent = 'Nothing found';

  const text = document.createElement('p');
  let reason = 'No parts match "' + searchText + '"';
  if (activeCategory !== ALL) {
    reason = reason + ' in ' + activeCategory;
  }
  text.textContent = reason + '. Check the spelling or reset the filters.';

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn btn-outline-warning btn-sm';
  reset.id = 'btn-reset-filters';
  reset.textContent = 'Reset filters';

  box.append(title, text, reset);
  return box;
}

function renderCatalog() {
  const visible = getVisibleParts();
  catalogEl.replaceChildren();

  if (visible.length === 0) {
    catalogEl.appendChild(createEmptyResult());
  } else {
    for (const part of visible) {
      catalogEl.appendChild(createPartCard(part));
    }
  }
  countEl.textContent = 'Showing ' + visible.length + ' of ' + PARTS.length + ' parts';
}

// ---------- Моя сборка ----------
// Итоги считаю своим циклом: количество, вес и цена
function getBuildTotals() {
  let price = 0;
  let weight = 0;
  for (const id of buildIds) {
    const part = findPart(id);
    price = price + part.price;
    weight = weight + part.weight;
  }
  return { count: buildIds.length, price: price, weight: weight };
}

function renderBuild() {
  buildListEl.replaceChildren();

  if (buildIds.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'build-empty';
    empty.textContent = 'Your build is empty. Add parts from the catalog.';
    buildListEl.appendChild(empty);
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
    buildListEl.appendChild(item);
  }

  const totals = getBuildTotals();
  totalCountEl.textContent = totals.count;
  totalWeightEl.textContent = (totals.weight / 1000).toFixed(2) + ' kg';
  totalPriceEl.textContent = formatPrice(totals.price);

  // Пустую сборку заказать нельзя: ссылка выключена
  const isEmpty = totals.count === 0;
  orderBuildLink.classList.toggle('is-disabled', isEmpty);
  orderBuildLink.setAttribute('aria-disabled', isEmpty ? 'true' : 'false');
  orderBuildLink.tabIndex = isEmpty ? -1 : 0;
  clearBuildButton.disabled = isEmpty;
}

function showBuildMessage(text, type) {
  buildMessageEl.textContent = text;
  buildMessageEl.className = 'build-message ' + type;
}

// Добавить или убрать запчасть. Правило: в сборке только одна рама.
function togglePart(id) {
  const part = findPart(id);

  if (buildIds.includes(id)) {
    buildIds = buildIds.filter(function (buildId) { return buildId !== id; });
    showBuildMessage(part.name + ' removed.', 'msg-warn');
  } else if (part.category === 'Frame') {
    const oldFrame = buildIds.map(findPart).find(function (item) {
      return item.category === 'Frame';
    });
    if (oldFrame !== undefined) {
      buildIds = buildIds.filter(function (buildId) { return buildId !== oldFrame.id; });
      showBuildMessage('A bike has one frame: ' + oldFrame.name + ' was replaced.', 'msg-warn');
    } else {
      showBuildMessage(part.name + ' added.', 'msg-ok');
    }
    buildIds.push(id);
  } else {
    buildIds.push(id);
    showBuildMessage(part.name + ' added.', 'msg-ok');
  }

  saveBuild(buildIds);
  renderCatalog();
  renderBuild();
}

function resetFilters() {
  searchText = '';
  activeCategory = ALL;
  sortMode = 'default';
  searchInput.value = '';
  sortSelect.value = 'default';
  renderChips();
  renderCatalog();
  searchInput.focus();
}

// ---------- События ----------
searchInput.addEventListener('input', function () {
  searchText = searchInput.value.trim();   // одни пробелы = пустой поиск
  renderCatalog();
});

// Esc в поле поиска очищает его
searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && searchInput.value !== '') {
    searchInput.value = '';
    searchText = '';
    renderCatalog();
  }
});

sortSelect.addEventListener('change', function () {
  sortMode = sortSelect.value;
  renderCatalog();
});

// Делегирование событий: один обработчик на весь контейнер
chipsEl.addEventListener('click', function (event) {
  const chip = event.target.closest('.chip');
  if (chip === null) {
    return;
  }
  activeCategory = chip.dataset.category;
  renderChips();
  renderCatalog();
  chipsEl.querySelector('[data-category="' + activeCategory + '"]').focus();
});

catalogEl.addEventListener('click', function (event) {
  if (event.target.id === 'btn-reset-filters') {
    resetFilters();
    return;
  }
  const button = event.target.closest('.btn-part');
  if (button === null) {
    return;
  }
  const id = Number(button.dataset.id);
  togglePart(id);
  // после перерисовки возвращаем фокус на кнопку той же карточки
  const sameButton = catalogEl.querySelector('.btn-part[data-id="' + id + '"]');
  if (sameButton !== null) {
    sameButton.focus();
  }
});

buildListEl.addEventListener('click', function (event) {
  const button = event.target.closest('.btn-remove');
  if (button !== null) {
    togglePart(Number(button.dataset.id));
  }
});

clearBuildButton.addEventListener('click', function () {
  buildIds = [];
  saveBuild(buildIds);
  showBuildMessage('Build cleared.', 'msg-warn');
  renderCatalog();
  renderBuild();
});

// ---------- Старт ----------
renderChips();
renderCatalog();
renderBuild();
