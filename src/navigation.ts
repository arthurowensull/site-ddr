export function initNavigation() {
  const menuToggle = document.querySelector<HTMLButtonElement>('#menuToggle');
  const overlay = document.querySelector<HTMLElement>('#menuOverlay');
  const orbit = document.querySelector<HTMLElement>('#cursorOrbit');

  menuToggle?.addEventListener('click', () => {
    const open = !overlay?.classList.contains('open');
    overlay?.classList.toggle('open', open);
    overlay?.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  overlay?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  window.addEventListener('pointermove', (event) => {
    if (!orbit) return;
    orbit.style.left = `${event.clientX}px`;
    orbit.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('a,button,input,textarea,select').forEach(el => {
    el.addEventListener('mouseenter', () => orbit?.classList.add('hot'));
    el.addEventListener('mouseleave', () => orbit?.classList.remove('hot'));
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const railLinks = [...document.querySelectorAll<HTMLAnchorElement>('.protocol-rail a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = (entry.target as HTMLElement).dataset.section;
      railLinks.forEach(link => link.classList.toggle('active', link.dataset.section === id));
    });
  }, { threshold: .42 });
  document.querySelectorAll<HTMLElement>('[data-section].section').forEach(section => sectionObserver.observe(section));
}
