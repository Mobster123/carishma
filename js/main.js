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
    var lbImage = lightbox.querySelector('.lightbox__img');
    var lbCounter = lightbox.querySelector('.lightbox__counter');
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbPrev = lightbox.querySelector('.lightbox__prev');
    var lbNext = lightbox.querySelector('.lightbox__next');
    var current = 0;
    var lastFocused = null;

    var show = function (index) {
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

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) { close(); }
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) { return; }

      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowLeft') {
        show(current - 1);
      } else if (event.key === 'ArrowRight') {
        show(current + 1);
      } else if (event.key === 'Tab') {
        var focusable = [lbClose, lbPrev, lbNext];
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
