// Small enhancements only; the page works without this file.
(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Give the masthead a backdrop once the page has scrolled.
  const masthead = document.querySelector('.masthead');
  if (masthead) {
    const update = () => masthead.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // On phones, the Book / Call dock stays tucked away while the hero buttons or
  // the bookings card are on screen, so the same buttons never show twice.
  const dock = document.querySelector('.dock');
  const targets = ['hero-actions', 'book'].map((id) => document.getElementById(id)).filter(Boolean);
  if (dock && targets.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        dock.classList.toggle('is-tucked', visible.size > 0);
      },
      { threshold: 0.1 }
    );
    targets.forEach((t) => io.observe(t));
  } else if (dock) {
    dock.classList.remove('is-tucked');
  }
})();
