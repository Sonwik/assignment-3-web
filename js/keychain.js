// =====================================================
// Брелок под кнопкой темы (на всех страницах).
// Физика пружины: чем сильнее брелок отклонился, тем сильнее его тянет
// назад (STIFFNESS), а трение (DAMPING) гасит качание.
// Толчки: скролл страницы, наведение мышки, клик ("дёрнули за шнурок").
// =====================================================

const CHAIN_STIFFNESS = 60;     // сила, которая возвращает брелок вниз
const CHAIN_DAMPING = 2.4;      // трение: чем больше, тем быстрее успокаивается
const CHAIN_MAX_ANGLE = 45;     // больше 45° не отклоняется
const CHAIN_MAX_PUSH = 160;     // самый сильный толчок от скролла

const keychain = document.querySelector('.keychain');
const keychainArt = document.querySelector('.keychain-art');
const themeButtonForChain = document.querySelector('#theme-toggle');

let chainAngle = 0;             // угол в градусах (0 = висит ровно)
let chainSpeed = 0;             // скорость качания, градусы в секунду
let chainTime = null;
let chainMoving = false;
let lastScrollY = window.scrollY;

// Один кадр: считаем ускорение пружины и двигаем брелок
function chainFrame(time) {
  if (chainTime === null) {
    chainTime = time;
  }
  const dt = Math.min((time - chainTime) / 1000, 0.05);
  chainTime = time;

  const acceleration = -CHAIN_STIFFNESS * chainAngle - CHAIN_DAMPING * chainSpeed;
  chainSpeed = chainSpeed + acceleration * dt;
  chainAngle = chainAngle + chainSpeed * dt;
  chainAngle = Math.max(-CHAIN_MAX_ANGLE, Math.min(CHAIN_MAX_ANGLE, chainAngle));
  keychain.style.transform = 'rotate(' + chainAngle.toFixed(2) + 'deg)';

  // почти остановился — выключаем анимацию, чтобы не тратить ресурсы
  if (Math.abs(chainAngle) < 0.05 && Math.abs(chainSpeed) < 0.5) {
    chainAngle = 0;
    chainSpeed = 0;
    keychain.style.transform = 'rotate(0deg)';
    chainMoving = false;
    return;
  }
  requestAnimationFrame(chainFrame);
}

// Толкнуть брелок (amount — сколько градусов в секунду добавить)
function pushChain(amount) {
  chainSpeed = chainSpeed + amount;
  if (!chainMoving) {
    chainMoving = true;
    chainTime = null;
    requestAnimationFrame(chainFrame);
  }
}

const chainReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (keychain !== null && !chainReduceMotion) {
  // Скролл: чем быстрее листаешь, тем сильнее качается
  window.addEventListener('scroll', function () {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    const push = Math.max(-CHAIN_MAX_PUSH, Math.min(CHAIN_MAX_PUSH, delta * 1.5));
    pushChain(push);
  });

  // Навели мышку на кнопку — брелок звякнул
  themeButtonForChain.addEventListener('mouseenter', function () {
    pushChain(90);
  });

  // Клик по кнопке или по брелку: рывок вниз + качание (тему меняет js/navbar.js)
  themeButtonForChain.addEventListener('click', function () {
    keychainArt.classList.remove('is-tugged');
    void keychainArt.getBoundingClientRect();   // перезапуск CSS-анимации
    keychainArt.classList.add('is-tugged');
    pushChain(-140);
  });
}
