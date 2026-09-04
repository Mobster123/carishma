/* CARISHMA
   Behaviours: mobile nav toggle, sticky header state, reveal on scroll,
   Instagram embed lazy load, WhatsApp form composer, lookbook deep link,
   lookbook lightbox. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* 1. Mobile nav toggle
     -------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav__toggle');
  var navMenu = document.getElementById('nav-menu');

  function setMenu(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(!navMenu.classList.contains('is-open'));
    });

    navMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }


  /* 2. Sticky header state
     -------------------------------------------------------------------- */
  var header = document.getElementById('site-header');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* 3. Reveal on scroll
     -------------------------------------------------------------------- */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if (revealItems.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px' });

      revealItems.forEach(function (el) { revealObserver.observe(el); });
    }
  }


  /* 4. Instagram embed lazy load
     -------------------------------------------------------------------- */
  var instagram = document.getElementById('instagram');

  if (instagram && instagram.querySelector('.instagram-media')) {
    var embedLoaded = false;

    var loadEmbed = function () {
      if (embedLoaded) { return; }
      embedLoaded = true;
      var script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    if ('IntersectionObserver' in window) {
      var igObserver = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          loadEmbed();
          igObserver.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      igObserver.observe(instagram);
    } else {
      loadEmbed();
    }
  }


  /* 5. WhatsApp form composer
     -------------------------------------------------------------------- */
  var form = document.getElementById('enquiry-form');

  if (form) {
    var fields = {
      name: form.querySelector('#name'),
      phone: form.querySelector('#phone'),
      message: form.querySelector('#message')
    };

    var setError = function (input, hasError) {
      var wrapper = input.closest('.field');
      wrapper.classList.toggle('has-error', hasError);
      input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    };

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('input', function () {
        setError(fields[key], false);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = fields.name.value.trim();
      var phone = fields.phone.value.trim();
      var message = fields.message.value.trim();
      var valid = true;

      if (!name) { setError(fields.name, true); valid = false; }
      if (!phone) { setError(fields.phone, true); valid = false; }

      if (!valid) {
        (!name ? fields.name : fields.phone).focus();
        return;
      }

      var text = 'Hello Ambika, I\'m ' + name + '. ' +
        (message ? message + ' ' : '') +
        'My number is ' + phone + '.';

      window.open(
        'https://wa.me/919811608463?text=' + encodeURIComponent(text),
        '_blank',
        'noopener'
      );
    });
  }


  /* 6. Lookbook deep link
     -------------------------------------------------------------------- */
  var gallery = document.querySelector('.gallery');

  if (gallery) {
    window.addEventListener('load', function () {
      var hash = window.location.hash;
      if (/^#page-\d{2}$/.test(hash)) {
        var target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  }


  /* 7. Lightbox
     -------------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');

  if (gallery && lightbox) {
    var pageLinks = Array.prototype.slice.call(gallery.querySelectorAll('.page__link'));
    var lbStage = lightbox.querySelector('.lightbox__stage');
    var lbImage = lightbox.querySelector('.lightbox__img');
    var lbCounter = lightbox.querySelector('.lightbox__counter');
    var lbZoom = lightbox.querySelector('.lightbox__zoom');
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbPrev = lightbox.querySelector('.lightbox__prev');
    var lbNext = lightbox.querySelector('.lightbox__next');
    var focusable = [lbZoom, lbClose, lbPrev, lbNext];
    var current = 0;
    var lastFocused = null;
    var zoomed = false;
    var ZOOM_FACTOR = 2.5;

    /* Zoom in around a point (rx, ry run 0 to 1 across the image), or fit. */
    var setZoom = function (on, rx, ry) {
      if (on === zoomed) { return; }
      var ratio = lbImage.naturalHeight && lbImage.naturalWidth
        ? lbImage.naturalHeight / lbImage.naturalWidth
        : 1553 / 1200;
      var fittedWidth = lbImage.getBoundingClientRect().width;
      zoomed = on;
      lightbox.classList.toggle('is-zoomed', on);
      lbZoom.setAttribute('aria-pressed', String(on));
      lbZoom.textContent = on ? 'Fit' : 'Zoom';

      if (!on) {
        lbImage.style.width = '';
        lbStage.scrollTop = 0;
        lbStage.scrollLeft = 0;
        return;
      }

      var natural = lbImage.naturalWidth || 1200;
      var zoomWidth = Math.min(natural, Math.round(fittedWidth * ZOOM_FACTOR));
      var zoomHeight = zoomWidth * ratio + 96;
      lbImage.style.width = zoomWidth + 'px';
      rx = typeof rx === 'number' ? rx : 0.5;
      ry = typeof ry === 'number' ? ry : 0.5;
      lbStage.scrollLeft = rx * zoomWidth - lbStage.clientWidth / 2;
      lbStage.scrollTop = ry * zoomHeight - lbStage.clientHeight / 2;
    };

    var show = function (index) {
      setZoom(false);
      current = (index + pageLinks.length) % pageLinks.length;
      var link = pageLinks[current];
      var img = link.querySelector('img');
      lbImage.src = link.getAttribute('href');
      lbImage.alt = img.getAttribute('alt');
      lbCounter.textContent = (current + 1) + ' / ' + pageLinks.length;
    };

    var open = function (index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      lbClose.focus();
    };

    var close = function () {
      setZoom(false);
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      lbImage.removeAttribute('src');
      if (lastFocused) { lastFocused.focus(); }
    };

    pageLinks.forEach(function (link, index) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        open(index);
      });
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () { show(current - 1); });
    lbNext.addEventListener('click', function () { show(current + 1); });
    lbZoom.addEventListener('click', function () { setZoom(!zoomed); });

    /* Click the page to zoom in where you clicked; click again to fit.
       Dragging with the mouse while zoomed pans instead of toggling. */
    var pointerStart = null;
    var dragged = false;

    /* Stop the browser starting a native image drag, which would cancel the pan. */
    lbImage.addEventListener('dragstart', function (event) { event.preventDefault(); });

    lbStage.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse' || event.button !== 0) { return; }
      pointerStart = {
        x: event.clientX,
        y: event.clientY,
        left: lbStage.scrollLeft,
        top: lbStage.scrollTop
      };
      dragged = false;
    });

    lbStage.addEventListener('pointermove', function (event) {
      if (!pointerStart || !zoomed) { return; }
      var dx = event.clientX - pointerStart.x;
      var dy = event.clientY - pointerStart.y;
      if (!dragged && Math.abs(dx) + Math.abs(dy) > 6) {
        dragged = true;
        lbStage.classList.add('is-dragging');
        lbStage.setPointerCapture(event.pointerId);
      }
      if (dragged) {
        lbStage.scrollLeft = pointerStart.left - dx;
        lbStage.scrollTop = pointerStart.top - dy;
      }
    });

    var endDrag = function () {
      pointerStart = null;
      lbStage.classList.remove('is-dragging');
    };
    lbStage.addEventListener('pointerup', endDrag);
    lbStage.addEventListener('pointercancel', endDrag);

    lbStage.addEventListener('click', function (event) {
      if (dragged) { dragged = false; return; }
      if (event.target === lbImage) {
        if (zoomed) {
          setZoom(false);
        } else {
          var rect = lbImage.getBoundingClientRect();
          setZoom(true, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
        }
      } else {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) { return; }

      if (event.key === 'Escape') {
        if (zoomed) { setZoom(false); } else { close(); }
      } else if (event.key === 'ArrowLeft' && !zoomed) {
        show(current - 1);
      } else if (event.key === 'ArrowRight' && !zoomed) {
        show(current + 1);
      } else if (event.key === '+' || event.key === '=') {
        setZoom(true);
      } else if (event.key === '-' || event.key === '0') {
        setZoom(false);
      } else if (event.key === 'Tab') {
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (focusable.indexOf(document.activeElement) === -1) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
})();
