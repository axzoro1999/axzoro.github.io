/* ==========================================================================
   Front page behaviour: scrollspy, reveal on scroll, hover-to-play media,
   project tag filter, scroll progress and back-to-top button.
   Written without jQuery so it can load independently of main.min.js.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  /* ----- reveal on scroll ------------------------------------------------ */

  function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  /* ----- scrollspy ------------------------------------------------------- */

  function initScrollSpy() {
    var sections = [];
    var links = {};

    Array.prototype.forEach.call(
      document.querySelectorAll('#site-nav a[data-section]'),
      function (link) {
        var id = link.getAttribute('data-section');
        if (!links[id]) links[id] = [];
        links[id].push(link);
        var section = document.getElementById(id);
        if (section && sections.indexOf(section) === -1) sections.push(section);
      }
    );

    if (!sections.length) return;

    var current = null;

    function setActive(id) {
      if (id === current) return;
      current = id;
      Object.keys(links).forEach(function (key) {
        links[key].forEach(function (link) {
          link.classList.toggle('is-active', key === id);
        });
      });
    }

    function update() {
      var masthead = document.querySelector('.masthead');
      var offset = (masthead ? masthead.offsetHeight : 70) + 24;
      var active = sections[0];

      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= offset) active = section;
      });

      // Snap to the last section once the page is scrolled to the bottom, so a
      // short trailing section still gets highlighted.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        active = sections[sections.length - 1];
      }

      setActive(active.id);
    }

    var scheduled = false;
    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        update();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Close the collapsed nav dropdown after picking a section.
    document.querySelectorAll('#site-nav a[data-section]').forEach(function (link) {
      link.addEventListener('click', function () {
        var hidden = document.querySelector('#site-nav .hidden-links');
        var button = document.querySelector('#site-nav button');
        if (hidden && !hidden.classList.contains('hidden')) {
          hidden.classList.add('hidden');
          if (button) button.classList.remove('close');
        }
      });
    });
  }

  /* ----- scroll progress + back to top ----------------------------------- */

  function initChrome() {
    var bar = document.querySelector('.scroll-progress__bar');
    var toTop = document.querySelector('.op-to-top');
    if (!bar && !toTop) return;

    function update() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (bar) bar.style.width = Math.min(Math.max(ratio, 0), 1) * 100 + '%';
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 600);
    }

    var scheduled = false;
    window.addEventListener('scroll', function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        update();
      });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ----- hover to play: GIF swap and inline video ------------------------ */

  function initHoverMedia() {
    // Images that carry both a static poster and an animation.
    Array.prototype.forEach.call(
      document.querySelectorAll('img[data-gif][data-static]'),
      function (img) {
        var card = img.closest('.proj, .pub') || img;
        var preloaded = false;

        function play() {
          if (!preloaded) {
            var warm = new Image();
            warm.src = img.getAttribute('data-gif');
            preloaded = true;
          }
          img.src = img.getAttribute('data-gif');
          card.classList.add('is-playing');
        }

        function stop() {
          img.src = img.getAttribute('data-static');
          card.classList.remove('is-playing');
        }

        if (canHover) {
          card.addEventListener('mouseenter', play);
          card.addEventListener('mouseleave', stop);
          card.addEventListener('focusin', play);
          card.addEventListener('focusout', stop);
        } else if ('IntersectionObserver' in window) {
          // No pointer to hover with: play whatever is on screen instead.
          new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.intersectionRatio > 0.55) play();
              else stop();
            });
          }, { threshold: [0, 0.55] }).observe(card);
        }
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('.proj__video'),
      function (video) {
        var card = video.closest('.proj') || video;

        function play() {
          var attempt = video.play();
          if (attempt && attempt.catch) attempt.catch(function () {});
          card.classList.add('is-playing');
        }

        function stop() {
          video.pause();
          video.currentTime = 0;
          card.classList.remove('is-playing');
        }

        if (canHover) {
          card.addEventListener('mouseenter', play);
          card.addEventListener('mouseleave', stop);
        } else if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.intersectionRatio > 0.55) play();
              else stop();
            });
          }, { threshold: [0, 0.55] }).observe(card);
        }
      }
    );
  }

  /* ----- project tag filter --------------------------------------------- */

  function initFilter() {
    var chips = document.querySelectorAll('.op-filter__chip');
    var cards = document.querySelectorAll('.proj-grid .proj');
    if (!chips.length || !cards.length) return;

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.getAttribute('data-filter');

        Array.prototype.forEach.call(chips, function (other) {
          other.classList.toggle('is-active', other === chip);
        });

        Array.prototype.forEach.call(cards, function (card) {
          var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
          var show = filter === 'all' || tags.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !show);
          if (show) card.classList.add('is-visible');
        });
      });
    });
  }

  function init() {
    initReveal();
    initScrollSpy();
    initChrome();
    initHoverMedia();
    initFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
