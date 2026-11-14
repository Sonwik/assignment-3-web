// =====================================================
// Garage: одежда райдера на манекене (garage.html, секция Rider outfit).
// Каждая вещь — объект: форма (shape / base / pattern) + цвета.
// JS показывает нужные части рисунка (display) и красит их CSS-переменными.
// Использует функции из js/garage.js: renderOptions, formatTenge, showStatus, config.
// =====================================================

// shape — какой рисунок показать, main/accent — цвета, price — цена в тенге
const HEADWEAR = [
  { id: 'none',         name: 'No hat',       shape: 'none',   price: 0 },
  { id: 'cap',          name: 'Cycling cap',  shape: 'cap',    main: '#212529', accent: '#ffc107', price: 6000 },
  { id: 'cap-white',    name: 'White cap',    shape: 'cap',    main: '#f1f3f5', accent: '#e03131', price: 6000 },
  { id: 'helmet',       name: 'Matte helmet', shape: 'helmet', main: '#343a40', accent: '#ffc107', price: 25000 },
  { id: 'helmet-white', name: 'White helmet', shape: 'helmet', main: '#f1f3f5', accent: '#4dabf7', price: 25000 },
  { id: 'beanie',       name: 'Beanie',       shape: 'beanie', main: '#e03131', accent: '#f8f9fa', price: 5000 },
  { id: 'santa',        name: 'Santa hat',    shape: 'santa',  main: '#e03131', accent: '#f8f9fa', price: 3000 }
];

const GLASSES = [
  { id: 'none',  name: 'No glasses',    shape: 'none',  price: 0 },
  { id: 'sport', name: 'Sport shades',  shape: 'sport', main: '#212529', accent: '#4dabf7', price: 9000 },
  { id: 'neon',  name: 'Neon shades',   shape: 'sport', main: '#ff6b35', accent: '#ffd43b', price: 9000 },
  { id: 'round', name: 'Round shades',  shape: 'round', main: '#212529', accent: '#495057', price: 7000 }
];

// base: tee (короткий рукав) или jacket (длинный), pattern — узор
const TOPS = [
  { id: 'graphic', name: 'Graphic tee',             base: 'tee',    pattern: 'graphic', main: '#f8f9fa', accent: '#16191c', detail: '#ffc107', price: 7000 },
  { id: 'black',   name: 'Black tee',               base: 'tee',    pattern: 'plain',   main: '#25282c', accent: '#495057', detail: '#6c757d', price: 6000 },
  { id: 'hoodie',  name: 'Hoodie',                  base: 'jacket', pattern: 'hood',    main: '#868e96', accent: '#f8f9fa', detail: '#495057', price: 15000 },
  { id: 'racer',   name: 'Green Racer moto jacket', base: 'jacket', pattern: 'racer',   main: '#4caf1a', accent: '#16191c', detail: '#f8f9fa', price: 45000 },
  { id: 'team',    name: 'Navy Racing team jacket', base: 'jacket', pattern: 'team',    main: '#1b2a5e', accent: '#d7263d', detail: '#ffcc00', price: 40000 },
  { id: 'track',   name: 'Track jacket',            base: 'jacket', pattern: 'stripes', main: '#c92a2a', accent: '#c92a2a', detail: '#f8f9fa', price: 18000 },
  { id: 'puffer',  name: 'Puffer jacket',           base: 'jacket', pattern: 'quilt',   main: '#f08c00', accent: '#b35c00', detail: '#f08c00', price: 30000 },
  { id: 'hivis',   name: 'Hi-vis vest',             base: 'tee',    pattern: 'hivis',   main: '#25282c', accent: '#495057', detail: '#d8f000', price: 9000 },
  { id: 'denim',   name: 'Denim jacket',            base: 'jacket', pattern: 'denim',   main: '#4a6fa5', accent: '#e6c27a', detail: '#4a6fa5', price: 22000 },
  { id: 'bomber',  name: 'Bomber jacket',           base: 'jacket', pattern: 'bomber',  main: '#556b2f', accent: '#ff922b', detail: '#212529', price: 28000 },
  { id: 'santa',   name: 'Santa jacket',            base: 'jacket', pattern: 'santa',   main: '#e03131', accent: '#16191c', detail: '#f8f9fa', price: 12000 }
];

const PANTS = [
  { id: 'jeans',       name: 'Blue jeans',     base: 'long',  detail: 'seams',   main: '#2f4b7c', accent: '#d9a441', price: 15000 },
  { id: 'black-jeans', name: 'Black jeans',    base: 'long',  detail: 'seams',   main: '#25282c', accent: '#6c757d', price: 15000 },
  { id: 'cargo',       name: 'Cargo pants',    base: 'long',  detail: 'pockets', main: '#6b7046', accent: '#565a37', price: 17000 },
  { id: 'joggers',     name: 'Joggers',        base: 'long',  detail: 'cuffs',   main: '#495057', accent: '#343a40', price: 12000 },
  { id: 'cycling',     name: 'Cycling shorts', base: 'short', detail: 'stripe',  main: '#16191c', accent: '#ffc107', price: 14000 },
  { id: 'chino',       name: 'Chino shorts',   base: 'short', detail: 'none',    main: '#c8b28a', accent: '#a8916a', price: 10000 }
];

const SHOES = [
  { id: 'white',   name: 'White sneakers', base: 'low',  detail: 'laces-low',  main: '#f8f9fa', accent: '#adb5bd', price: 20000 },
  { id: 'neon',    name: 'Neon runners',   base: 'low',  detail: 'laces-low',  main: '#a9e34b', accent: '#343a40', price: 24000 },
  { id: 'high',    name: 'Red high-tops',  base: 'high', detail: 'laces-high', main: '#d7263d', accent: '#f8f9fa', price: 26000 },
  { id: 'cycling', name: 'Cycling shoes',  base: 'low',  detail: 'straps',     main: '#212529', accent: '#ffc107', price: 30000 },
  { id: 'boots',   name: 'Leather boots',  base: 'high', detail: 'none',       main: '#7a4a24', accent: '#3b2414', price: 28000 }
];

const BAGS = [
  { id: 'none',      name: 'No bag',        shape: 'none',      price: 0 },
  { id: 'messenger', name: 'Messenger bag', shape: 'messenger', main: '#343a40', accent: '#ffc107', price: 18000 },
  { id: 'backpack',  name: 'Backpack',      shape: 'backpack',  main: '#e03131', accent: '#212529', price: 16000 },
  { id: 'sling',     name: 'Sling bag',     shape: 'sling',     main: '#212529', accent: '#adb5bd', price: 9000 }
];

const OUTFIT_DEFAULT = { head: 'cap', glasses: 'none', top: 'graphic', pants: 'jeans', shoes: 'white', bag: 'messenger' };

// Группа -> массив -> контейнер радиокнопок
const OUTFIT_GROUPS = [
  { name: 'head',    list: HEADWEAR, container: '#opt-head' },
  { name: 'glasses', list: GLASSES,  container: '#opt-glasses' },
  { name: 'top',     list: TOPS,     container: '#opt-top' },
  { name: 'pants',   list: PANTS,    container: '#opt-pants' },
  { name: 'shoes',   list: SHOES,    container: '#opt-shoes' },
  { name: 'bag',     list: BAGS,     container: '#opt-bag' }
];

const mannequin = document.querySelector('#mannequin');
const outfitForm = document.querySelector('#outfit-form');
const outfitCaption = document.querySelector('#outfit-caption');
const outfitTotal = document.querySelector('#outfit-total');
const outfitStatus = document.querySelector('#outfit-status');

// Одежда из сохранения (только известные id) или по умолчанию
function cleanOutfit(saved) {
  const result = {};
  for (const group of OUTFIT_GROUPS) {
    const id = saved !== null ? saved[group.name] : OUTFIT_DEFAULT[group.name];
    result[group.name] = findOption(group.list, id).id;
  }
  return result;
}

config.outfit = cleanOutfit(config.outfit);

// Покрасить часть рисунка: две CSS-переменные (--top-main, --top-accent ...)
function setColors(prefix, item) {
  if (item.main !== undefined) {
    mannequin.style.setProperty('--' + prefix + '-main', item.main);
    mannequin.style.setProperty('--' + prefix + '-accent', item.accent);
  }
  if (item.detail !== undefined) {
    mannequin.style.setProperty('--' + prefix + '-detail', item.detail);
  }
}

// Одеть манекен по config.outfit
function dressMannequin() {
  const outfit = config.outfit;
  const head = findOption(HEADWEAR, outfit.head);
  const glasses = findOption(GLASSES, outfit.glasses);
  const top = findOption(TOPS, outfit.top);
  const pants = findOption(PANTS, outfit.pants);
  const shoes = findOption(SHOES, outfit.shoes);
  const bag = findOption(BAGS, outfit.bag);

  // showOnly из js/garage-data.js: показать одну форму, остальные спрятать
  showOnly(mannequin, 'data-head', head.shape);
  showOnly(mannequin, 'data-glasses', glasses.shape);
  showOnly(mannequin, 'data-top-base', top.base);
  showOnly(mannequin, 'data-top-pattern', top.pattern);
  showOnly(mannequin, 'data-pants-base', pants.base);
  showOnly(mannequin, 'data-pants-detail', pants.detail);
  showOnly(mannequin, 'data-shoe-base', shoes.base);
  showOnly(mannequin, 'data-shoe-detail', shoes.detail);
  showOnly(mannequin, 'data-bag', bag.shape);

  setColors('head', head);
  setColors('glasses', glasses);
  setColors('top', top);
  setColors('pants', pants);
  setColors('shoes', shoes);
  setColors('bag', bag);

  // Подпись и цена: цикл по всем выбранным вещам
  const names = [];
  let total = 0;
  for (const group of OUTFIT_GROUPS) {
    const item = findOption(group.list, outfit[group.name]);
    total = total + item.price;
    if (item.price > 0) {
      names.push(item.name);
    }
  }
  const caption = names.join(', ');
  outfitCaption.textContent = caption;
  mannequin.setAttribute('aria-label', 'Mannequin wearing: ' + caption);
  outfitTotal.textContent = formatTenge(total);
}

function renderOutfitOptions() {
  for (const group of OUTFIT_GROUPS) {
    renderOptions(group, config.outfit[group.name], true);
  }
}

// ---------- События ----------
outfitForm.addEventListener('change', function (event) {
  config.outfit[event.target.name] = event.target.value;
  dressMannequin();
  showStatus(outfitStatus, 'Not saved yet.', 'status-warn');
});

document.querySelector('#btn-random-outfit').addEventListener('click', function () {
  for (const group of OUTFIT_GROUPS) {
    config.outfit[group.name] = randomItem(group.list).id;   // randomItem — из js/garage.js
  }
  renderOutfitOptions();
  dressMannequin();
  showStatus(outfitStatus, 'New look! Press again or save it.', 'status-warn');
});

document.querySelector('#btn-save-outfit').addEventListener('click', function () {
  if (saveGarage(config)) {
    showStatus(outfitStatus, 'Outfit saved together with your bike.', 'status-ok');
  } else {
    showStatus(outfitStatus, 'Could not save: your browser blocks storage.', 'status-bad');
  }
});

// ---------- Старт ----------
renderOutfitOptions();
dressMannequin();
