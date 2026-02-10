(function () {
  'use strict';

  // Skip link
  (function () {
    var skip = document.getElementById('skip-link');
    var main = document.getElementById('main-content');
    if (skip && main) {
      skip.addEventListener('click', function (e) {
        e.preventDefault();
        main.setAttribute('tabindex', '-1');
        main.focus();
      });
    }
  })();

  // Address links: on mobile open default maps app
  (function () {
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    document.querySelectorAll('a[data-address]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (!isMobile) return;
        e.preventDefault();
        var addr = a.getAttribute('data-address');
        if (addr) {
          window.location.href = 'maps:0,0?q=' + encodeURIComponent(addr);
        }
      });
    });
  })();

  // Theme toggle (must run so button works)
  (function () {
    var html = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    var darkIcon = document.getElementById('theme-toggle-dark-icon');
    var lightIcon = document.getElementById('theme-toggle-light-icon');
    function getTheme() {
      try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; }
    }
    function applyTheme(isDark) {
      if (isDark) { html.classList.add('dark'); } else { html.classList.remove('dark'); }
      if (darkIcon) { darkIcon.classList.toggle('theme-icon-hidden', !isDark); }
      if (lightIcon) { lightIcon.classList.toggle('theme-icon-hidden', isDark); }
    }
    function saveTheme(isDark) { try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {} }
    applyTheme(getTheme() === 'dark');
    if (btn) {
      btn.addEventListener('click', function () {
        var isDark = !html.classList.contains('dark');
        applyTheme(isDark);
        saveTheme(isDark);
      });
    }
  })();

  var carousel = document.getElementById('carousel');
  var dots = document.querySelectorAll('.carousel-dot');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var imgs = document.querySelectorAll('.carousel-slide img');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-image');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var total = imgs.length;
  var currentIndex = 0;
  var carouselTimer;

  function updateDots() {
    if (!carousel || !dots.length) return;
    var idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    idx = Math.max(0, Math.min(idx, total - 1));
    dots.forEach(function (d, i) {
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function getCurrentIndex() {
    if (!carousel || !total) return 0;
    var idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    return Math.max(0, Math.min(idx, total - 1));
  }
  function carouselNext() {
    if (!carousel) return;
    var idx = getCurrentIndex();
    if (idx >= total - 1) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: carousel.offsetWidth, behavior: 'smooth' });
    }
  }
  function carouselPrev() {
    if (!carousel) return;
    var idx = getCurrentIndex();
    if (idx <= 0) {
      carousel.scrollTo({ left: (total - 1) * carousel.offsetWidth, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: -carousel.offsetWidth, behavior: 'smooth' });
    }
  }

  if (carousel) {
    carousel.addEventListener('scroll', updateDots);
    carousel.addEventListener('mouseenter', function () { clearInterval(carouselTimer); });
    carousel.addEventListener('mouseleave', function () { carouselTimer = setInterval(carouselNext, 5000); });
  }
  if (prevBtn) prevBtn.addEventListener('click', carouselPrev);
  if (nextBtn) nextBtn.addEventListener('click', carouselNext);
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      if (carousel) carousel.scrollTo({ left: i * carousel.offsetWidth, behavior: 'smooth' });
    });
  });
  carouselTimer = setInterval(carouselNext, 5000);
  updateDots();

  function showLightbox(i) {
    if (!lightbox || !lightboxImg || !imgs[i]) return;
    currentIndex = i;
    lightboxImg.src = imgs[i].getAttribute('data-image') || '';
    if (lightboxCounter) lightboxCounter.textContent = (i + 1) + ' / ' + total;
    lightbox.showModal();
    if (lightboxClose) lightboxClose.focus();
    clearInterval(carouselTimer);
  }
  function hideLightbox() {
    if (lightbox) lightbox.close();
  }

  imgs.forEach(function (img, i) {
    img.addEventListener('click', function () { showLightbox(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLightbox(i); }
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
  if (lightbox) lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) hideLightbox();
  });
  if (lightbox) lightbox.addEventListener('close', function () {
    carouselTimer = setInterval(carouselNext, 5000);
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.open) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev && lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
  });
})();
