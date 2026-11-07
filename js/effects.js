// =====================================================
// jQuery-эффекты (подключается на всех страницах):
// 1) плавный скролл по якорям
// 2) колесо "Наверх", которое крутится при скролле
// 3) аккордеон FAQ
// 4) лайтбокс галереи
// .stop() перед анимацией: быстрые повторные клики не копят очередь анимаций.
// =====================================================

$(function () {
  const $window = $(window);
  const $page = $('html, body');
  const navHeight = $('.site-nav').outerHeight() || 0;

  // ---------- 1. Плавный скролл ----------
  // Работает для ссылок на эту же страницу: "#calculator" или "index.html#parts" на index.html
  $('a[href*="#"]').on('click', function (event) {
    const samePage = this.pathname === window.location.pathname;
    const $target = $(this.hash);
    if (!samePage || this.hash === '' || $target.length === 0) {
      return;   // обычный переход на другую страницу
    }
    event.preventDefault();

    $page.stop().animate({ scrollTop: $target.offset().top - navHeight }, 600, function () {
      // переносим фокус к секции — для работы с клавиатуры
      $target.attr('tabindex', '-1').trigger('focus');
    });
    history.pushState(null, '', this.hash);

    // На телефоне закрываем бургер-меню после клика
    const menu = document.querySelector('#navbarNav');
    if (menu !== null && menu.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });

  // ---------- 2. Колесо "Наверх" ----------
  const $backToTop = $('#back-to-top');
  const $wheelImg = $backToTop.find('img');
  let isButtonVisible = false;

  function onScroll() {
    const scrollTop = $window.scrollTop();

    // колесо поворачивается на 1 градус за каждые 3 пикселя скролла
    $wheelImg.css('transform', 'rotate(' + (scrollTop / 3) + 'deg)');

    // показываем кнопку только после 400px, и только если она ещё не показана
    if (scrollTop > 400 && !isButtonVisible) {
      isButtonVisible = true;
      $backToTop.stop(true, true).fadeIn(300);
    } else if (scrollTop <= 400 && isButtonVisible) {
      isButtonVisible = false;
      $backToTop.stop(true, true).fadeOut(300);
    }
  }

  $window.on('scroll', onScroll);
  onScroll();

  $backToTop.on('click', function () {
    $page.stop().animate({ scrollTop: 0 }, 700);
    $('.navbar-brand').trigger('focus');
  });

  // ---------- 3. Аккордеон FAQ ----------
  $('.faq-question').on('click', function () {
    const $button = $(this);
    const $answer = $('#' + $button.attr('aria-controls'));
    const isOpen = $button.attr('aria-expanded') === 'true';

    // закрываем другие открытые ответы
    $('.faq-question[aria-expanded="true"]').not($button).each(function () {
      $(this).attr('aria-expanded', 'false');
      $('#' + $(this).attr('aria-controls')).stop(true, true).slideUp(250);
    });

    $button.attr('aria-expanded', isOpen ? 'false' : 'true');
    if (isOpen) {
      $answer.stop(true, true).slideUp(250);
    } else {
      $answer.stop(true, true).slideDown(250);
    }
  });

  // ---------- 4. Лайтбокс галереи ----------
  const $lightbox = $('#lightbox');
  if ($lightbox.length === 0) {
    return;   // на этой странице галереи нет
  }
  const $lightboxImg = $('#lightbox-img');
  const $caption = $('#lightbox-caption');

  // Собираем фото из карточек галереи в массив
  const photos = $('.gallery-open').map(function () {
    const $card = $(this).closest('.build-card');
    return {
      src: $(this).find('img').attr('src'),
      alt: $(this).find('img').attr('alt'),
      title: $card.find('.card-title').text()
    };
  }).get();

  let current = 0;
  let $lastFocused = null;

  function showPhoto(index) {
    // по кругу: после последнего — первое
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    $lightboxImg.stop(true, true).fadeOut(120, function () {
      $lightboxImg.attr({ src: photo.src, alt: photo.alt });
      $caption.text(photo.title + ' · ' + (current + 1) + ' / ' + photos.length);
      $lightboxImg.fadeIn(180);
    });
  }

  function openLightbox(index) {
    $lastFocused = $(document.activeElement);
    current = index;
    const photo = photos[current];
    $lightboxImg.attr({ src: photo.src, alt: photo.alt }).show();
    $caption.text(photo.title + ' · ' + (current + 1) + ' / ' + photos.length);
    $('body').addClass('overflow-hidden');
    // display:flex, потом hide(), чтобы fadeIn() показал его как flex
    $lightbox.stop(true, true).css('display', 'flex').hide().fadeIn(250);
    $('#lightbox-close').trigger('focus');
  }

  function closeLightbox() {
    $lightbox.stop(true, true).fadeOut(200);
    $('body').removeClass('overflow-hidden');
    if ($lastFocused !== null) {
      $lastFocused.trigger('focus');
    }
  }

  $('.gallery-open').on('click', function () {
    openLightbox(Number($(this).data('index')));
  });
  $('#lightbox-close').on('click', closeLightbox);
  $('#lightbox-prev').on('click', function () { showPhoto(current - 1); });
  $('#lightbox-next').on('click', function () { showPhoto(current + 1); });

  // клик по тёмному фону закрывает
  $lightbox.on('click', function (event) {
    if (event.target === this) {
      closeLightbox();
    }
  });

  // клавиатура: Esc, стрелки, и Tab не уходит из окна
  $(document).on('keydown', function (event) {
    if (!$lightbox.is(':visible')) {
      return;
    }
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      showPhoto(current - 1);
    } else if (event.key === 'ArrowRight') {
      showPhoto(current + 1);
    } else if (event.key === 'Tab') {
      const $buttons = $lightbox.find('button');
      const first = $buttons.get(0);
      const last = $buttons.get($buttons.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
});
