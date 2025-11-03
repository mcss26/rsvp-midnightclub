// tools/theme_check.js — chequeos rápidos de tema y config
(function () {
  // marca que hay JS
  document.documentElement.classList.add('js');

  // forzar base dark (y marcar reduce motion si aplica)
  document.documentElement.dataset.theme = 'dark';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion');
  }

  // verificación básica de config
  try {
    if (typeof API_BASE !== 'string' || !API_BASE.includes('/exec')) {
      console.warn('[MC-RSVP] Configurá API_BASE en config.js con tu URL /exec');
    }
  } catch (e) {
    console.warn('[MC-RSVP] Falta config.js (API_BASE no definido).');
  }
})();
