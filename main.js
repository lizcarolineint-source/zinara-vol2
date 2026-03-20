/* ============================================================
   ZINARA DIGITAL — main.js
   Version 2.0 — all features verified working
   ============================================================ */

(function () {
  'use strict';

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!noMotion) els.forEach(el => el.classList.add('wait'));
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('go');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ── NAV SCROLL SHADOW ──────────────────────────────────── */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const fn = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
  }

  /* ── MOBILE NAV ─────────────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const mobile = document.getElementById('navMobile');
    if (!toggle || !mobile) return;
    let open = false;
    toggle.addEventListener('click', () => {
      open = !open;
      mobile.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        open = false;
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', e => {
      if (open && !toggle.contains(e.target) && !mobile.contains(e.target)) {
        open = false;
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── ACTIVE NAV LINK ────────────────────────────────────── */
  function initActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a, .nav-mobile a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('#')[0];
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ── SMOOTH SCROLL ──────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── STAT COUNTER ANIMATION ─────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const isInt = Number.isInteger(target);
        const duration = 1400;
        const steps = 50;
        let count = 0;
        const timer = setInterval(() => {
          count++;
          const current = Math.min((target / steps) * count, target);
          el.textContent = (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
          if (count >= steps) clearInterval(timer);
        }, duration / steps);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => obs.observe(el));
  }

  /* ── IMAGE FALLBACKS ────────────────────────────────────── */
  /* If any image fails to load, hide it and show the bg colour */
  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback-bg]').forEach(img => {
      img.addEventListener('error', function () {
        this.style.display = 'none';
        const parent = this.closest('[class*="-img"], .svc-img, .blog-card-img, .blog-featured-img');
        if (parent) {
          parent.style.background = this.dataset.fallbackBg || 'var(--cloud)';
          // Show a subtle label so the placeholder is obvious during development
          if (!parent.querySelector('.img-placeholder-label')) {
            const lbl = document.createElement('div');
            lbl.className = 'img-placeholder-label';
            lbl.textContent = 'Replace with your image';
            lbl.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;font-size:.75rem;color:var(--ink-3);font-family:var(--fb);';
            parent.appendChild(lbl);
          }
        }
      });
    });
  }

  /* ── AUDIT FORM — FORMSPREE ─────────────────────────────── */
  /*
   * HOW TO ACTIVATE:
   * 1. Go to https://formspree.io and sign up free (50 submissions/month free)
   * 2. Create a new form — set the email to info@zinara.co.ke
   * 3. Copy your Form ID (looks like: xyzabcde)
   * 4. In audit.html, change the form action to:
   *    action="https://formspree.io/f/YOUR_FORM_ID"
   *
   * Until then, the form falls back to a mailto link that pre-fills all fields.
   */
  function initAuditForm() {
    const form = document.getElementById('auditForm');
    if (!form) return;

    const isFormspree = (form.action || '').includes('formspree.io');

    if (isFormspree) {
      /* Formspree AJAX submission */
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        const origText = btn.innerHTML;
        btn.innerHTML = 'Sending&hellip;';
        btn.disabled = true;

        try {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });

          if (res.ok) {
            showConfirm(form);
          } else {
            const data = await res.json();
            const msg = (data.errors || []).map(e => e.message).join(', ') || 'Something went wrong.';
            showError(btn, msg, origText);
          }
        } catch {
          showError(btn, 'Network error — please email info@zinara.co.ke directly.', origText);
        }
      });

    } else {
      /* Mailto fallback — pre-fills all fields so nothing is lost */
      form.addEventListener('submit', e => {
        e.preventDefault();
        const d = {};
        new FormData(form).forEach((v, k) => { d[k] = v; });

        const confirmEmail = document.getElementById('confirmEmailAddr');
        if (confirmEmail) confirmEmail.textContent = d.email || 'info@zinara.co.ke';

        const subject = encodeURIComponent('Revenue Recovery Audit Request — ' + (d.company || d.name || 'New enquiry'));
        const body = encodeURIComponent(
          'Name: ' + (d.name || '') +
          '\nCompany: ' + (d.company || '') +
          '\nEmail: ' + (d.email || '') +
          '\nPhone/WhatsApp: ' + (d.phone || '') +
          '\nWebsite: ' + (d.website || '') +
          '\nPrimary failure point: ' + (d.failure || '') +
          '\n\nAdditional context:\n' + (d.message || '')
        );

        window.location.href = 'mailto:info@zinara.co.ke?subject=' + subject + '&body=' + body;

        /* Show confirmation after short delay */
        setTimeout(() => showConfirm(form), 600);
      });
    }

    function showConfirm(form) {
      const confirm = document.getElementById('formConfirm');
      const email = form.querySelector('#email');
      const addr = document.getElementById('confirmEmailAddr');
      if (addr && email) addr.textContent = email.value;
      if (confirm) {
        form.style.display = 'none';
        confirm.style.display = 'block';
      }
    }

    function showError(btn, msg, origText) {
      btn.innerHTML = origText;
      btn.disabled = false;
      let err = document.getElementById('formError');
      if (!err) {
        err = document.createElement('p');
        err.id = 'formError';
        err.style.cssText = 'color:var(--orange);font-size:.83rem;margin-top:.75rem;text-align:center;';
        btn.parentNode.insertBefore(err, btn.nextSibling);
      }
      err.textContent = msg;
    }
  }

  /* ── BLOG FILTER ────────────────────────────────────────── */
  /*
   * Works by reading data-category attributes on .blog-card-full elements.
   * Active filter hides non-matching cards.
   * 'All' always shows everything.
   */
  function initBlogFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.blog-card-full');
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        /* Update active state */
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter || 'all';

        cards.forEach(card => {
          if (filter === 'all') {
            card.style.display = '';
          } else {
            const cat = (card.dataset.category || '').toLowerCase();
            card.style.display = cat === filter ? '' : 'none';
          }
        });

        /* Re-layout: hide the grid border gap when some cells are hidden */
        const grid = document.querySelector('.blog-grid-full');
        if (grid) {
          const visible = [...cards].filter(c => c.style.display !== 'none');
          grid.style.gridTemplateColumns = visible.length === 1 ? '1fr' : '';
        }
      });
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNavScroll();
    initMobileNav();
    initActiveNav();
    initSmoothScroll();
    initCounters();
    initImageFallbacks();
    initAuditForm();
    initBlogFilter();
  });

})();
