// Small progressive enhancements. The site is fully readable without JavaScript.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Mobile menu ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');

function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuBtn?.addEventListener('click', () => setMenu(menu?.hidden ?? true));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.querySelector('.header-cta')?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu && !menu.hidden) {
    setMenu(false);
    menuBtn?.focus();
  }
});
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
