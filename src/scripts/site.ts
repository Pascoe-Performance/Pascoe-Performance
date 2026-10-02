// Small progressive enhancements. The site is fully readable without JavaScript.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Mobile menu ---------- */
// Opens with a slide-down reveal and dims the page behind it.
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');
const backdrop = document.querySelector<HTMLElement>('[data-menu-backdrop]');
const root = document.documentElement;
const MENU_MS = 380;
let menuTimer = 0;

function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  const isOpen = root.classList.contains('menu-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  window.clearTimeout(menuTimer);

  if (open) {
    menu.hidden = false;
    if (backdrop) backdrop.hidden = false;
    void menu.offsetHeight; // let the closed state render first so the transition runs
    root.classList.add('menu-open');
  } else {
    root.classList.remove('menu-open');
    const hide = () => {
      menu.hidden = true;
      if (backdrop) backdrop.hidden = true;
    };
    if (isOpen && !reduceMotion.matches) menuTimer = window.setTimeout(hide, MENU_MS);
    else hide();
  }
}

menuBtn?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
backdrop?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.querySelector('.header-cta')?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('menu-open')) {
    setMenu(false);
    menuBtn?.focus();
  }
});
window.matchMedia('(min-width: 1024px)').addEventListener?.('change', (e) => e.matches && setMenu(false));
// Close the menu if the browser restores the page from its back/forward cache.
window.addEventListener('pageshow', () => setMenu(false));

/* ---------- Background videos ---------- */
const autoplayVideos = Array.from(document.querySelectorAll<HTMLVideoElement>('video[autoplay]'));

function pauseAll() {
  autoplayVideos.forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
  });
}
if (reduceMotion.matches) pauseAll();
reduceMotion.addEventListener?.('change', (e) => e.matches && pauseAll());

document.querySelectorAll<HTMLButtonElement>('[data-video-toggle]').forEach((btn) => {
  const video = btn.parentElement?.querySelector('video');
  if (!video) return;
  const sync = () => {
    const paused = video.paused;
    btn.classList.toggle('is-paused', paused);
    btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
  };
  btn.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
});

/* ---------- Inquiry form ---------- */
const form = document.querySelector<HTMLFormElement>('form[data-inquiry]');

if (form) {
  const radios = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="interest"]'));
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');

  // Arrival cue: when a link brings the visitor to the form, glow its edge once.
  // On desktop, also place the cursor in the first field (skipped on touch screens,
  // where it would open the keyboard over the form).
  const section = document.getElementById('inquiry');
  const firstField = form.querySelector<HTMLInputElement>('input[name="name"]');
  const canFocus = window.matchMedia('(pointer: fine)').matches;
  let arriveTimer = 0;

  const arrive = () => {
    form.classList.remove('is-arrived');
    void form.offsetWidth; // restart the animation if it already ran
    form.classList.add('is-arrived');
    if (canFocus && firstField && !firstField.value) firstField.focus({ preventScroll: true });
  };

  const arriveAfterScroll = () => {
    window.clearTimeout(arriveTimer);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('scrollend', finish);
      arrive();
    };
    const hasScrollEnd = 'onscrollend' in window;
    if (hasScrollEnd) window.addEventListener('scrollend', finish, { once: true });
    // Fallback: browsers without scrollend, or no scroll needed because the form is already in view.
    arriveTimer = window.setTimeout(finish, reduceMotion.matches ? 50 : hasScrollEnd ? 1600 : 900);
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href="#inquiry"], a[href="/#inquiry"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (section && new URL(a.href).pathname === location.pathname) arriveAfterScroll();
    });
  });
  if (location.hash === '#inquiry') arriveAfterScroll();

  const syncChoices = () =>
    radios.forEach((r) => r.closest('.choice')?.classList.toggle('is-on', r.checked));
  radios.forEach((r) => r.addEventListener('change', syncChoices));

  // "Ask about group training" style buttons preselect an option and scroll to the form.
  document.querySelectorAll<HTMLElement>('[data-pick]').forEach((el) => {
    el.addEventListener('click', () => {
      const match = radios.find((r) => r.value === el.dataset.pick);
      if (match) {
        match.checked = true;
        syncChoices();
      }
    });
  });

  // Status panel (sent / not sent), styled to match the site.
  const ICONS = {
    ok: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    err: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path pathLength="1" d="M12 5.5v8"/><path pathLength="1" d="M12 18.5h.01"/></svg>',
  };
  const showStatus = (title: string, text: string, isError = false) => {
    if (!status) return;
    status.innerHTML = '';
    const box = document.createElement('div');
    box.className = `form-msg ${isError ? 'form-msg--error' : 'form-msg--ok'}`;
    box.innerHTML = `<span class="form-msg-icon">${isError ? ICONS.err : ICONS.ok}</span><div><p class="form-msg-title"></p><p class="form-msg-text"></p></div>`;
    box.querySelector('.form-msg-title')!.textContent = title;
    box.querySelector('.form-msg-text')!.textContent = text;
    status.appendChild(box);
  };

  // Field checks with inline messages instead of the browser's default pop-ups.
  const fieldError = (el: HTMLElement, host: HTMLElement, message: string) => {
    host.classList.add('is-invalid');
    let msg = host.querySelector<HTMLElement>(':scope > .field-error');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'field-error';
      msg.id = `${el.id || 'interest'}-${form.dataset.page || 'f'}-error`;
      host.appendChild(msg);
    }
    msg.textContent = message;
    el.setAttribute('aria-invalid', 'true');
    const described = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!described.includes(msg.id)) el.setAttribute('aria-describedby', [...described, msg.id].join(' '));
  };
  const clearError = (el: HTMLElement, host: HTMLElement | null) => {
    if (!host) return;
    host.classList.remove('is-invalid');
    const msg = host.querySelector<HTMLElement>(':scope > .field-error');
    el.removeAttribute('aria-invalid');
    if (msg) {
      const rest = (el.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== msg.id);
      if (rest.length) el.setAttribute('aria-describedby', rest.join(' '));
      else el.removeAttribute('aria-describedby');
      msg.remove();
    }
  };
  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]')!;
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')!;
  const interestSet = form.querySelector<HTMLFieldSetElement>('fieldset')!;

  const validate = () => {
    const problems: HTMLElement[] = [];
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    clearError(nameInput, nameInput.closest('.field'));
    clearError(emailInput, emailInput.closest('.field'));
    clearError(radios[0], interestSet);
    if (!name) {
      fieldError(nameInput, nameInput.closest('.field')!, 'Please enter your name.');
      problems.push(nameInput);
    }
    if (!email) {
      fieldError(emailInput, emailInput.closest('.field')!, 'Please enter your email so Ben can reply.');
      problems.push(emailInput);
    } else if (!emailInput.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldError(emailInput, emailInput.closest('.field')!, 'That email doesn’t look right. Please check it.');
      problems.push(emailInput);
    }
    if (!radios.some((r) => r.checked)) {
      fieldError(radios[0], interestSet, 'Please choose a training option, or pick Help Me Choose.');
      problems.push(radios[0]);
    }
    return problems;
  };

  nameInput.addEventListener('input', () => clearError(nameInput, nameInput.closest('.field')));
  emailInput.addEventListener('input', () => clearError(emailInput, emailInput.closest('.field')));
  radios.forEach((r) => r.addEventListener('change', () => clearError(radios[0], interestSet)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const problems = validate();
    if (problems.length) {
      if (status) status.innerHTML = '';
      problems[0].focus();
      return;
    }

    const endpoint = form.dataset.endpoint || '/api/inquiry';
    const data = new FormData(form);
    const body = new URLSearchParams();
    data.forEach((value, key) => body.append(key, String(value)));

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    if (status) status.innerHTML = '';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      syncChoices();
      showStatus('Inquiry sent', 'Thanks for reaching out. Ben will be in touch soon.');
    } catch {
      showStatus(
        'Your inquiry didn’t send',
        'Something went wrong on our end. Your details are still in the form, so please try again in a moment.',
        true,
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send Inquiry';
    }
  });
}
