// =====================================================
// Навигация на ВСЕХ страницах:
// 1) переключатель светлой / тёмной темы (запоминается в localStorage)
// 2) счётчик запчастей в "Моей сборке" рядом со ссылкой "Order a Build"
//
// Файл подключается в <head> БЕЗ defer: тема ставится сразу,
// ещё до отрисовки страницы — поэтому нет "вспышки" не той темы.
// =====================================================

const THEME_KEY = 'fga-theme';   // 'light' или 'dark'
const BUILD_KEY = 'fga-build';   // JSON-массив id запчастей (его же использует js/storage.js)

// ---------- Тема ----------
function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;                 // localStorage недоступен — просто не помним выбор
  }
}

// Сохранённая тема, а если её нет — тема системы
function getStartTheme() {
  const saved = getSavedTheme();
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

// data-theme — для моих CSS-переменных, data-bs-theme — для компонентов Bootstrap
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-bs-theme', theme);
}

function updateThemeButton(button) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  button.setAttribute('aria-label', label);
  button.title = label;
}

function toggleTheme(button) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  try {
    localStorage.setItem(THEME_KEY, newTheme);
  } catch (error) {
    // не сохранилось — тема всё равно поменялась на этой странице
  }
  updateThemeButton(button);
}

// ---------- Счётчик сборки ----------
function countBuildParts() {
  try {
    const ids = JSON.parse(localStorage.getItem(BUILD_KEY));
    if (Array.isArray(ids)) {
      return ids.length;
    }
  } catch (error) {
    // пусто или испорчено — считаем, что сборка пустая
  }
  return 0;
}

function updateBuildBadge() {
  const badge = document.querySelector('#build-count');
  if (badge === null) {
    return;
  }
  const count = countBuildParts();
  badge.textContent = count;
  badge.hidden = count === 0;    // пустая сборка — значок не показываем
  badge.setAttribute('aria-label', count + (count === 1 ? ' part' : ' parts') + ' in your build');
}

// ---------- Старт ----------
applyTheme(getStartTheme());     // сразу, до отрисовки

document.addEventListener('DOMContentLoaded', function () {
  const themeButton = document.querySelector('#theme-toggle');
  updateThemeButton(themeButton);
  themeButton.addEventListener('click', function () {
    toggleTheme(themeButton);
  });

  updateBuildBadge();
});

// storage.js сообщает, что сборка изменилась на этой странице
window.addEventListener('buildchange', updateBuildBadge);
// сборку поменяли в другой вкладке
window.addEventListener('storage', function (event) {
  if (event.key === BUILD_KEY) {
    updateBuildBadge();
  }
});
