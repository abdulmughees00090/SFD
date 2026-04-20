/* ================================================================
   Silver Fox Dynamics — Shared JS
   Handles: theme toggle, mobile nav, scroll effects, reveal, forms
================================================================ */

// ── Theme System ─────────────────────────────────────────────────
(function () {
  const body = document.body;
  const btn  = document.getElementById('themeToggleBtn');

  function applyTheme(dark) {
    body.classList.toggle('dark-theme', dark);
    if (btn) btn.classList.toggle('dark-active', dark);
  }

  const saved = localStorage.getItem('sfd_theme');
  if (saved) {
    applyTheme(saved === 'dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = body.classList.contains('dark-theme');
      applyTheme(!isDark);
      localStorage.setItem('sfd_theme', isDark ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('sfd_theme')) applyTheme(e.matches);
  });
})();

// ── Mobile Navigation ────────────────────────────────────────────
function toggleMenu() {
  const menu   = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!menu || !toggle) return;
  const open = menu.classList.toggle('show');
  toggle.classList.toggle('active', open);
}

document.addEventListener('click', e => {
  const menu   = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!menu || !toggle) return;
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('show');
    toggle.classList.remove('active');
  }
});

document.querySelectorAll('#menu a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('menu')?.classList.remove('show');
    document.querySelector('.menu-toggle')?.classList.remove('active');
  });
});

// ── Header Scroll Effect ─────────────────────────────────────────
(function () {
  const header = document.querySelector('header');
  if (!header) return;
  const check = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

// ── Smooth Scroll for Anchor Links ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

// ── Scroll Reveal ────────────────────────────────────────────────
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 65}ms`;
    io.observe(el);
  });
})();

// ── Toast Notification ───────────────────────────────────────────
function showToast(message, type = 'success') {
  const icon = type === 'success' ? '✓' : '✕';
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ── Form Submission Handler (Contact) ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn  = document.getElementById('submitBtn');
      const text = btn?.querySelector('.submit-text');
      const spin = btn?.querySelector('.loading-spinner');

      if (text) text.style.display = 'none';
      if (spin) spin.style.display = 'inline';
      if (btn)  btn.disabled = true;

      try {
        const resp = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          showToast('Message sent successfully! We\'ll be in touch soon.', 'success');
          contactForm.reset();
          if (text) { text.textContent = 'Message Sent!'; text.style.display = 'inline'; }
          setTimeout(() => {
            if (text) text.textContent = 'Send Message';
            if (spin) spin.style.display = 'none';
            if (btn)  btn.disabled = false;
          }, 3000);
        } else { throw new Error(); }
      } catch {
        showToast('Something went wrong. Please try again.', 'error');
        if (text) { text.textContent = 'Send Message'; text.style.display = 'inline'; }
        if (spin) spin.style.display = 'none';
        if (btn)  btn.disabled = false;
      }
    });
  }

  // ── Job Application Form ─────────────────────────────────────
  const jobForm = document.getElementById('jobApplicationForm');
  if (jobForm) {
    // Auto-fill from URL param
    const role = new URLSearchParams(window.location.search).get('role');
    const posIn = document.getElementById('position');
    if (role && posIn) {
      posIn.value = decodeURIComponent(role);
      const lbl = document.querySelector('label[for="position"]');
      if (lbl) {
        const note = document.createElement('span');
        note.style.cssText = 'font-size:.78rem;margin-left:8px;color:var(--violet-light);';
        note.textContent = '(auto-filled)';
        lbl.appendChild(note);
      }
    }

    // Mirror email → replyto
    const emailIn  = document.getElementById('email');
    const replytoIn = document.getElementById('replyto');
    if (emailIn && replytoIn) {
      emailIn.addEventListener('input', () => { replytoIn.value = emailIn.value; });
    }

    jobForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn  = document.getElementById('submitBtn');
      const text = btn?.querySelector('.submit-text');
      const spin = btn?.querySelector('.loading-spinner');

      if (text) text.style.display = 'none';
      if (spin) spin.style.display = 'inline';
      if (btn)  btn.disabled = true;

      try {
        const resp = await fetch(jobForm.action, {
          method: 'POST',
          body: new FormData(jobForm),
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          showToast('Application submitted! We\'ll review your profile and be in touch.', 'success');
          jobForm.reset();
          if (text) { text.textContent = 'Application Sent!'; text.style.display = 'inline'; }
          setTimeout(() => {
            if (text) text.textContent = 'Submit Application';
            if (spin) spin.style.display = 'none';
            if (btn)  btn.disabled = false;
          }, 4000);
        } else { throw new Error(); }
      } catch {
        showToast('Submission failed. Please try again or email us directly.', 'error');
        if (text) { text.textContent = 'Submit Application'; text.style.display = 'inline'; }
        if (spin) spin.style.display = 'none';
        if (btn)  btn.disabled = false;
      }
    });
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
