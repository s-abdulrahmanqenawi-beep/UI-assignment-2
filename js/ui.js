import {
    getFavorites,
    isFavorite,
    toggleFavorite,
    restoreTheme,
    getTheme,
    setTheme
} from './storage.js';

export const updateNavbarFavoritesCount = () => {
    const badges = document.querySelectorAll('[data-fav-count]');
    const count = getFavorites().length;
    badges.forEach((badge) => {
        badge.textContent = count;
    });
};

const updateThemeButtonUI = (theme) => {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach((btn) => {
        btn.textContent =
            theme === 'performance'
                ? '⚡ Performance Mode'
                : '🔋 Battery Saver Mode';
    });
};

export function initSharedUI() {
    const currentTheme = restoreTheme();
    updateThemeButtonUI(currentTheme);
    updateNavbarFavoritesCount();

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const nextTheme = getTheme() === 'performance' ? 'battery-saver' : 'performance';
            setTheme(nextTheme);
            updateThemeButtonUI(nextTheme);
        });
    });

    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

export const renderSkeletons = (container, count = 6) => {
    const skeletons = Array.from({ length: count })
        .map(
            () => `
      <div class="laptop-card animate-pulse">
        <div class="h-48 bg-surface-alt w-full"></div>
        <div class="p-5 space-y-3 flex-1">
          <div class="h-4 bg-surface-alt rounded w-1/4"></div>
          <div class="h-6 bg-surface-alt rounded w-3/4"></div>
          <div class="h-5 bg-surface-alt rounded w-1/3"></div>
          <div class="space-y-2 pt-2">
            <div class="h-3 bg-surface-alt rounded w-full"></div>
            <div class="h-3 bg-surface-alt rounded w-5/6"></div>
          </div>
          <div class="pt-4 flex gap-2">
            <div class="h-10 bg-surface-alt rounded-lg flex-1"></div>
            <div class="h-10 bg-surface-alt rounded-lg w-28"></div>
          </div>
        </div>
      </div>
    `
        )
        .join('');

    container.innerHTML = skeletons;
};

export const renderError = (container, message) => {
    container.innerHTML = `
    <div class="col-span-full bg-surface border border-red-500/40 rounded-xl p-6 text-center">
      <p class="text-lg font-bold text-red-500 mb-1">Unable to Load Laptops</p>
      <p class="text-sm text-muted">${message}</p>
      <p class="text-xs text-muted mt-2">Make sure you are running the project using a local server (such as VS Code Live Server).</p>
    </div>
  `;
};

export const createLaptopCard = (laptop, onFavoriteChange = null) => {
    const card = document.createElement('article');
    card.className = 'laptop-card';

    const saved = isFavorite(laptop.id);

    card.innerHTML = `
    <div class="relative h-48 bg-surface-alt overflow-hidden">
      <img
        src="${laptop.image}"
        alt="${laptop.name}"
        class="w-full h-full object-cover"
      />
      <span class="badge-pill absolute top-3 left-3">${laptop.category}</span>
    </div>

    <div class="p-5 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">${laptop.brand}</p>
          <p class="text-lg font-bold text-accent">$${laptop.price.toLocaleString()}</p>
        </div>
        <h3 class="text-lg font-bold text-text mb-3">${laptop.name}</h3>

        <ul class="text-sm text-muted space-y-1 mb-4 border-t border-border pt-3">
          <li><strong class="text-text">CPU:</strong> ${laptop.cpu}</li>
          <li><strong class="text-text">Memory & Storage:</strong> ${laptop.ramGB}GB RAM / ${laptop.storageGB}GB SSD</li>
          <li><strong class="text-text">Battery & Weight:</strong> ${laptop.batteryHours}h • ${laptop.weightKg}kg</li>
        </ul>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <a href="details.html?id=${laptop.id}" class="btn-action flex-1 text-sm">
          View Details
        </a>
        <button
          type="button"
          data-fav-btn
          class="${saved ? 'btn-action' : 'btn-outline'} text-sm px-3"
          aria-label="Toggle Favorite"
        >
          ${saved ? '★ Saved' : '☆ Save'}
        </button>
      </div>
    </div>
  `;

    const favBtn = card.querySelector('[data-fav-btn]');
    favBtn.addEventListener('click', () => {
        toggleFavorite(laptop.id);
        const nowSaved = isFavorite(laptop.id);
        favBtn.textContent = nowSaved ? '★ Saved' : '☆ Save';
        favBtn.className = `${nowSaved ? 'btn-action' : 'btn-outline'} text-sm px-3`;
        updateNavbarFavoritesCount();

        if (typeof onFavoriteChange === 'function') {
            onFavoriteChange(laptop.id, nowSaved);
        }
    });

    return card;
};