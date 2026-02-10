(function () {
  'use strict';

  // —— Theme ——
  function getTheme() {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch (_) {
      return 'dark';
    }
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    var darkIcon = document.getElementById('theme-toggle-dark-icon');
    var lightIcon = document.getElementById('theme-toggle-light-icon');
    if (darkIcon && lightIcon) {
      if (theme === 'dark') {
        darkIcon.classList.add('theme-icon-hidden');
        lightIcon.classList.remove('theme-icon-hidden');
      } else {
        darkIcon.classList.remove('theme-icon-hidden');
        lightIcon.classList.add('theme-icon-hidden');
      }
    }
  }

  function initTheme() {
    var theme = getTheme();
    applyTheme(theme);
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        try { localStorage.setItem('theme', theme); } catch (_) {}
        applyTheme(theme);
      });
    }
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  // —— Address link (open maps) ——
  function initAddressLinks() {
    document.querySelectorAll('a[data-address]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var address = link.getAttribute('data-address');
        if (!address) return;
        var encoded = encodeURIComponent(address);
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          try {
            window.location.href = 'maps:0,0?q=' + encoded;
          } catch (_) {
            window.open('https://www.google.com/maps/search/?api=1&query=' + encoded, '_blank');
          }
        } else {
          window.open('https://www.google.com/maps/search/?api=1&query=' + encoded, '_blank');
        }
      });
    });
  }

  // —— Skip link ——
  function initSkipLink() {
    var skip = document.getElementById('skip-link');
    var main = document.getElementById('main-content');
    if (skip && main) {
      skip.addEventListener('click', function (e) {
        e.preventDefault();
        main.setAttribute('tabindex', '-1');
        main.focus();
        setTimeout(function () { main.removeAttribute('tabindex'); }, 100);
      });
    }
  }

  // —— Carousel ——
  var carouselInterval;

  function initCarousel() {
    var track = document.getElementById('carousel-container');
    var slides = document.querySelectorAll('.carousel-slide');
    var indicators = document.querySelectorAll('.carousel-dot');
    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    var total = slides.length;
    var current = 0;

    function updateCarousel() {
      if (track) track.style.transform = 'translateX(-' + current * 100 + '%)';
      indicators.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        dot.classList.toggle('carousel-dot-active', i === current);
      });
    }

    function next() {
      current = (current + 1) % total;
      updateCarousel();
    }

    function prev() {
      current = (current - 1 + total) % total;
      updateCarousel();
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    indicators.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        current = i;
        updateCarousel();
      });
    });

    carouselInterval = setInterval(next, 5000);
    if (track) {
      track.addEventListener('mouseenter', function () { clearInterval(carouselInterval); });
      track.addEventListener('mouseleave', function () { carouselInterval = setInterval(next, 5000); });
    }

    var startX = 0, endX = 0;
    if (track) {
      track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; });
      track.addEventListener('touchend', function (e) {
        endX = e.changedTouches[0].clientX;
        var diff = startX - endX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
      });
    }

    updateCarousel();
  }

  // —— Lightbox ——
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-image');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    var lightboxCounter = document.getElementById('lightbox-counter');
    var carouselImages = document.querySelectorAll('.carousel-slide img');
    var total = carouselImages.length;
    var currentIndex = 0;

    function showLightbox(index) {
      if (!lightbox || !lightboxImg || !carouselImages[index]) return;
      currentIndex = index;
      lightboxImg.src = carouselImages[index].getAttribute('data-image') || '';
      if (lightboxCounter) lightboxCounter.textContent = (index + 1) + ' / ' + total;
      lightbox.setAttribute('aria-hidden', 'false');
      if (lightboxClose) lightboxClose.focus();
      clearInterval(carouselInterval);
    }

    function hideLightbox() {
      if (!lightbox) return;
      lightbox.setAttribute('aria-hidden', 'true');
      var img = carouselImages[currentIndex];
      if (img && img.focus) img.focus();
      carouselInterval = setInterval(function () {
        var nextBtn = document.getElementById('carousel-next');
        if (nextBtn) nextBtn.click();
      }, 5000);
    }

    carouselImages.forEach(function (img, i) {
      img.addEventListener('click', function () { showLightbox(i); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showLightbox(i);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () {
      currentIndex = (currentIndex - 1 + total) % total;
      showLightbox(currentIndex);
    });
    if (lightboxNext) lightboxNext.addEventListener('click', function () {
      currentIndex = (currentIndex + 1) % total;
      showLightbox(currentIndex);
    });

    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        var t = e.target;
        if (t.id === 'lightbox-prev' || t.id === 'lightbox-next' || t.id === 'lightbox-close' ||
            t.closest('#lightbox-prev') || t.closest('#lightbox-next') || t.closest('#lightbox-close')) return;
        hideLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') hideLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev && lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
      }
    });
  }

  // Carousel dot active state
  var style = document.createElement('style');
  style.textContent = '.carousel-dot-active, .carousel-dot[aria-selected="true"] { background: var(--primary) !important; }';
  document.head.appendChild(style);

  // Run inits
  initTheme();
  initAddressLinks();
  initSkipLink();
  initCarousel();
  initLightbox();
})();
