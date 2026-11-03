/* 360° Window Wash shared script */
(function () {
  'use strict';

  // Where each area's quote requests go. Keep these endpoints exactly.
  var ROUTES = {
    'tampa-bay': { label: 'Tampa Bay', url: 'https://formspree.io/f/mjgeoljw', type: 'formspree', phone: '(727) 335-0332' },
    'north-tampa-pasco': { label: 'North Tampa / Pasco County', url: 'https://formsubmit.co/ajax/cooper@360windowwash.com', type: 'formsubmit', phone: '(813) 553-2159' },
    'middle-tennessee': { label: 'Middle Tennessee', url: 'https://formsubmit.co/ajax/michelle@360windowwash.com', type: 'formsubmit', phone: '(615) 669-6777' },
    'houston': { label: 'Houston', url: 'https://formsubmit.co/ajax/abraham@360windowwash.com', type: 'formsubmit', phone: '(713) 510-3199' },
    'not-sure': { label: 'Area not sure / other', url: 'https://formspree.io/f/mjgeoljw', type: 'formspree', phone: '(727) 335-0332' }
  };

  function routeFor(area) {
    return ROUTES[area] || null;
  }

  function buildPayload(route, data) {
    var body = { _subject: 'Quote request: 360 Window Wash (' + route.label + ')' };
    if (route.type === 'formsubmit') {
      body._template = 'table';
      body._captcha = 'false';
    }
    Object.keys(data).forEach(function (k) { body[k] = data[k]; });
    return body;
  }

  window.QuoteRouting = { ROUTES: ROUTES, routeFor: routeFor, buildPayload: buildPayload };

  // Mobile menu
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMobile() {
    if (!hamburger) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = !mobileMenu.classList.contains('open');
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobile); });
  }

  // Call picker (homepage and locations page)
  var picker = document.getElementById('callPicker');
  if (picker) {
    document.querySelectorAll('[data-call-picker]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMobile();
        if (typeof picker.showModal === 'function') { picker.showModal(); }
        else { picker.setAttribute('open', ''); }
      });
    });
    picker.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { picker.close ? picker.close() : picker.removeAttribute('open'); });
    });
    picker.addEventListener('click', function (e) { if (e.target === picker) picker.close(); });
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('visible'); });
  }

  // Quote forms
  document.querySelectorAll('form[data-quote-form]').forEach(function (form) {
    var areaSelect = form.querySelector('[name="area"]');
    var hint = form.querySelector('[data-area-hint]');
    if (areaSelect && hint) {
      areaSelect.addEventListener('change', function () {
        var r = routeFor(areaSelect.value);
        hint.textContent = r && areaSelect.value !== 'not-sure'
          ? 'Goes straight to the ' + r.label + ' crew. Prefer to call? ' + r.phone + '.'
          : 'Goes to our Tampa Bay office, and we will pass it to the closest crew.';
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var area = areaSelect ? areaSelect.value : form.getAttribute('data-area');
      var route = routeFor(area);
      var err = form.parentNode.querySelector('.form-error');
      if (!route) {
        if (areaSelect) areaSelect.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== 'area') data[k] = v; });
      data.area = route.label;
      var btn = form.querySelector('[type="submit"]');
      var btnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending';
      if (err) err.style.display = 'none';
      fetch(route.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(buildPayload(route, data))
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.style.display = 'none';
        var ok = form.parentNode.querySelector('.form-success');
        if (ok) { ok.style.display = 'block'; ok.focus && ok.focus(); }
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = btnText;
        if (err) {
          err.textContent = 'That did not send. Please call ' + route.phone + ' and we will take it from there.';
          err.style.display = 'block';
        }
      });
    });
  });
})();
