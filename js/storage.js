// =====================================================
// Сохранение сборки между страницами (localStorage).
// Каталог на index.html сохраняет id запчастей и передачу,
// форма на build.html их читает.
// try/catch нужен: в приватном режиме localStorage может не работать,
// тогда сайт просто продолжит работать без сохранения.
// =====================================================

// BUILD_KEY ('fga-build') объявлен в js/navbar.js — он подключён на всех страницах
const GEAR_KEY = 'fga-gear';     // строка передачи, например "48x17"

function loadBuild() {
  try {
    const saved = JSON.parse(localStorage.getItem(BUILD_KEY));
    // Оставляем только числа, для которых есть запчасть
    if (Array.isArray(saved)) {
      return saved.filter(function (id) {
        return findPart(id) !== undefined;
      });
    }
  } catch (error) {
    // ничего не делаем: вернём пустую сборку
  }
  return [];
}

function saveBuild(ids) {
  try {
    localStorage.setItem(BUILD_KEY, JSON.stringify(ids));
  } catch (error) {
    // сохранить не получилось — на этой странице всё равно работает
  }
  // сообщаем навигации (js/navbar.js), чтобы обновить счётчик
  window.dispatchEvent(new Event('buildchange'));
}

function loadGear() {
  try {
    return localStorage.getItem(GEAR_KEY) || '';
  } catch (error) {
    return '';
  }
}

function saveGear(gear) {
  try {
    localStorage.setItem(GEAR_KEY, gear);
  } catch (error) {
    // ничего страшного
  }
}

function clearSavedOrder() {
  try {
    localStorage.removeItem(BUILD_KEY);
    localStorage.removeItem(GEAR_KEY);
  } catch (error) {
    // ничего страшного
  }
  window.dispatchEvent(new Event('buildchange'));
}
