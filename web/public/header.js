/*
  Inject shared header (and mobile bottom nav) into static HTML pages.
  Include with: <script src="/header.js" defer></script>
*/
(function () {
  const d = document;
  if (d.getElementById('site-header')) return;

  let user = null;
  try {
    const raw = localStorage.getItem('satzbau_user');
    if (raw) user = JSON.parse(raw);
  } catch (_) {}

  let userSlot;
  if (user) {
    const initial = ((user.name || user.email || '?') + '').charAt(0).toUpperCase();
    if (user.picture) {
      userSlot =
        '<a class="site-header__avatar" href="/favorites" aria-label="Your account">' +
          '<img src="' + user.picture.replace(/"/g, '&quot;') + '" alt="" referrerpolicy="no-referrer" />' +
        '</a>';
    } else {
      userSlot =
        '<a class="site-header__avatar site-header__avatar--initial" href="/favorites" aria-label="Your account">' +
          initial +
        '</a>';
    }
  } else {
    userSlot = '<a class="site-header__signin" href="/favorites">Sign in</a>';
  }

  const header = d.createElement('header');
  header.id = 'site-header';
  header.className = 'site-header';
  header.innerHTML =
    '<div class="site-header__inner">' +
      '<span class="site-header__links">' +
        '<a href="/">Home</a>' +
        '<a href="/guides">Guides</a>' +
        '<a href="/about">About</a>' +
        '<a href="/favorites">Favorites</a>' +
      '</span>' +
      userSlot +
    '</div>';

  d.body.insertBefore(header, d.body.firstChild);

  // --- Mobile bottom nav ---
  if (d.getElementById('site-bottom-nav')) return;

  const path = window.location.pathname || '/';
  const isActive = {
    home: path === '/' || path === '',
    guides: path.indexOf('/guides') === 0,
    about: path.indexOf('/about') === 0,
    favorites: path.indexOf('/favorites') === 0,
  };

  const ICONS = {
    home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    guides: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h11a3 3 0 0 1 3 3v13"/><path d="M4 4v14a2 2 0 0 0 2 2h12"/><path d="M8 8h6"/><path d="M8 12h6"/></svg>',
    about: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/></svg>',
    favorites: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"/></svg>',
  };

  function item(href, label, key) {
    const cls = 'site-bottom-nav__item' + (isActive[key] ? ' site-bottom-nav__item--active' : '');
    const aria = isActive[key] ? ' aria-current="page"' : '';
    return '<a class="' + cls + '" href="' + href + '"' + aria + '>' + ICONS[key] + '<span>' + label + '</span></a>';
  }

  const nav = d.createElement('nav');
  nav.id = 'site-bottom-nav';
  nav.className = 'site-bottom-nav';
  nav.setAttribute('aria-label', 'Primary');
  nav.innerHTML =
    item('/', 'Home', 'home') +
    item('/guides', 'Guides', 'guides') +
    item('/about', 'About', 'about') +
    item('/favorites', 'Favorites', 'favorites');

  d.body.appendChild(nav);
  d.body.classList.add('has-site-bottom-nav');
})();
