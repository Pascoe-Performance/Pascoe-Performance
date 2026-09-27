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

  const showStatus = (text: string, isError = false) => {
    if (!status) return;
    status.innerHTML = '';
    const p = document.createElement('p');
    p.className = isError ? 'notice notice-error' : 'notice';
    p.textContent = text;
    status.appendChild(p);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const endpoint = form.dataset.endpoint || '/';
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
      showStatus('Thanks — your inquiry has been sent. Ben will be in touch soon.');
    } catch {
      showStatus(
        'Sorry, your inquiry could not be sent. Please try again in a moment. Your details are still in the form.',
        true,
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send Inquiry';
    }
  });
}
