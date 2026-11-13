// =====================================================
// Главная: заставка при входе + появление первого экрана.
// 1) Заставка: колесо въезжает, делает скид, появляется название,
//    шторка уходит вверх. Один раз за визит (sessionStorage).
//    Клик или любая клавиша — пропустить.
// 2) Первый экран: строки заголовка выезжают по очереди,
//    цифры (3, 13) считаются от нуля.
// Файл подключён в <head> БЕЗ defer: классы ставятся до отрисовки,
// поэтому ничего не "мигает". Вся анимация — в css/home.css.
// =====================================================

const INTRO_KEY = 'fga-intro-seen';
const introReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Показывать заставку? Нет, если уже видели в этой вкладке или анимации выключены
function shouldShowIntro() {
  if (introReduceMotion) {
    return false;
  }
  try {
    return sessionStorage.getItem(INTRO_KEY) !== 'yes';
  } catch (error) {
    return false;             // хранилище недоступно — лучше без заставки, чем каждый раз
  }
}

const showIntro = shouldShowIntro();
if (!introReduceMotion) {
  document.documentElement.classList.add('hero-anim');    // элементы первого экрана ждут сигнала
}
if (showIntro) {
  document.documentElement.classList.add('show-intro');
}

let heroStarted = false;
let introFinished = false;

// Число плавно растёт от 0 до data-count за 1,2 секунды
function countUp(element) {
  const target = Number(element.dataset.count);
  const duration = 1200;
  let startTime = null;

  function step(time) {
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);           // быстро в начале, медленно в конце
    element.textContent = Math.round(target * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Запустить появление первого экрана (CSS ждёт класс hero-go)
function startHero() {
  if (heroStarted) {
    return;
  }
  heroStarted = true;
  document.documentElement.classList.add('hero-go');
  if (!introReduceMotion) {
    for (const number of document.querySelectorAll('[data-count]')) {
      countUp(number);
    }
  }
}

// Убрать заставку и запомнить, что её уже видели
function finishIntro() {
  if (introFinished) {
    return;
  }
  introFinished = true;
  document.documentElement.classList.remove('show-intro');
  try {
    sessionStorage.setItem(INTRO_KEY, 'yes');
  } catch (error) {
    // не запомнилось — ничего страшного
  }
  startHero();
}

document.addEventListener('DOMContentLoaded', function () {
  if (!showIntro) {
    startHero();
    return;
  }

  const intro = document.querySelector('#intro');

  // Шторка начала подниматься — первый экран уже выезжает под ней
  intro.addEventListener('animationstart', function (event) {
    if (event.animationName === 'intro-leave') {
      startHero();
    }
  });
  // Шторка ушла (или заставку пропустили) — убираем её
  intro.addEventListener('animationend', function (event) {
    if (event.animationName === 'intro-leave' || event.animationName === 'intro-fade') {
      finishIntro();
    }
  });

  // Пропустить: клик или любая клавиша
  function skipIntro() {
    intro.classList.add('is-skipping');
  }
  intro.addEventListener('click', skipIntro);
  document.addEventListener('keydown', skipIntro, { once: true });

  // Запасной вариант: если анимация почему-то не закончилась
  setTimeout(finishIntro, 4000);
});
