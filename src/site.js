import { pages } from './pages.js';

const $ = selector => document.querySelector(selector);
const legacy = /^\/(help|pathways|tasks|evidence|evidence-room)(\/|$)/;

function render() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (legacy.test(path)) {
    location.replace('/workspace.html#' + path.slice(1).replace(/^evidence-room/, 'evidence'));
    return;
  }
  const page = pages[path] || pages['/'];
  $('#content').innerHTML = page.render();
  document.title = path === '/' ? 'Crossover · From thinking to being. From scarcity to stewardship.' : `${page.title} · Crossover`;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.content = document.title;
  if (ogDesc) ogDesc.content = $('#content .lead')?.textContent || document.querySelector('meta[name="description"]').content;
  document.querySelectorAll('.public-nav a').forEach(link => {
    if (link.pathname === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('.public-nav').classList.remove('open');
  $('.menu-button').setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', event => {
  const menu = event.target.closest('.menu-button');
  if (menu) {
    const open = $('.public-nav').classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    return;
  }
  const link = event.target.closest('a');
  if (!link || link.origin !== location.origin || !pages[link.pathname] || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
  if (link.hash && link.pathname === location.pathname) return;
  event.preventDefault();
  if (link.pathname !== location.pathname) history.pushState({}, '', link.pathname);
  render();
  if (link.hash) document.getElementById(decodeURIComponent(link.hash.slice(1)))?.scrollIntoView();
  else scrollTo(0, 0);
});

addEventListener('popstate', () => { render(); scrollTo(0, 0); });
render();
