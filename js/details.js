import { fetchLaptopById } from './api.js';
import { isFavorite, toggleFavorite } from './storage.js';
import {
    initSharedUI,
    updateNavbarFavoritesCount,
    renderError
} from './ui.js';

const renderDetailsSkeleton = (container) => {
    container.innerHTML = `
    <div class="bg-surface border border-border rounded-2xl p-6 sm:p-8 animate-pulse space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="h-64 sm:h-80 bg-surface-alt rounded-xl"></div>
        <div class="space-y-4">
          <div class="h-5 bg-surface-alt rounded w-24"></div>
          <div class="h-8 bg-surface-alt rounded w-3/4"></div>
          <div class="h-7 bg-surface-alt rounded w-1/3"></div>
          <div class="space-y-2 pt-2">
            <div class="h-4 bg-surface-alt rounded w-full"></div>
            <div class="h-4 bg-surface-alt rounded w-5/6"></div>
            <div class="h-4 bg-surface-alt rounded w-4/6"></div>
          </div>
          <div class="flex gap-3 pt-4">
            <div class="h-11 bg-surface-alt rounded-lg flex-1"></div>
            <div class="h-11 bg-surface-alt rounded-lg flex-1"></div>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <div class="h-6 bg-surface-alt rounded w-48"></div>
        <div class="h-40 bg-surface-alt rounded-xl w-full"></div>
      </div>
    </div>
  `;
};

const renderNotFound = (container, idValue) => {
    const reason = idValue
        ? `We couldn't find any laptop matching ID "${idValue}".`
        : 'No laptop ID was specified in the page URL.';

    container.innerHTML = `
    <div class="bg-surface border border-border rounded-2xl p-8 sm:p-12 text-center space-y-4">
      <p class="text-4xl">🔍</p>
      <h1 class="text-2xl font-extrabold text-text">Laptop Not Found</h1>
      <p class="text-sm sm:text-base text-muted max-w-md mx-auto">${reason}</p>
      <div class="pt-2">
        <a href="laptops.html" class="btn-action">Browse Available Laptops</a>
      </div>
    </div>
  `;
};

const renderLaptopDetails = (container, laptop) => {
    document.title = `${laptop.name} | Student Laptop Finder`;

    const saved = isFavorite(laptop.id);

    // All required fields organized into label/value pairs for dynamic table generation
    const specRows = [
        { label: 'Laptop ID', value: `#${laptop.id}` },
        { label: 'Model Name', value: laptop.name },
        { label: 'Brand', value: laptop.brand },
        { label: 'Category', value: laptop.category.toUpperCase() },
        { label: 'Price', value: `$${laptop.price.toLocaleString()}` },
        { label: 'Processor (CPU)', value: laptop.cpu },
        { label: 'Memory (RAM)', value: `${laptop.ramGB} GB` },
        { label: 'Storage Capacity', value: `${laptop.storageGB} GB SSD` },
        { label: 'Battery Life', value: `${laptop.batteryHours} Hours` },
        { label: 'Weight', value: `${laptop.weightKg} kg` },
        { label: 'Screen Size', value: `${laptop.screenInches} inches` }
    ];

    const tableRowsHTML = specRows
        .map(
            (row) => `
      <tr class="border-b border-border last:border-b-0">
        <th scope="row" class="py-3.5 px-4 text-left text-sm font-semibold text-muted bg-surface-alt/50 w-1/3 sm:w-2/5">
          ${row.label}
        </th>
        <td class="py-3.5 px-4 text-sm font-medium text-text">
          ${row.value}
        </td>
      </tr>
    `
        )
        .join('');

    container.innerHTML = `
    <article class="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      <!-- Top Overview Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="bg-surface-alt rounded-xl overflow-hidden border border-border">
          <img
            src="${laptop.image}"
            alt="${laptop.name}"
            class="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="badge-pill">${laptop.category}</span>
            <span class="text-xs font-semibold uppercase tracking-wider text-muted">${laptop.brand}</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-text">${laptop.name}</h1>

          <p class="text-3xl font-extrabold text-accent">$${laptop.price.toLocaleString()}</p>

          <p class="text-sm sm:text-base text-muted leading-relaxed">
            ${laptop.description}
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              id="detail-fav-btn"
              class="${saved ? 'btn-action' : 'btn-outline'} flex-1"
            >
              ${saved ? '★ Saved in Favorites' : '☆ Add to Favorites'}
            </button>

            <button
              type="button"
              id="detail-compare-btn"
              class="btn-action flex-1"
            >
              ⚖️ Add &amp; Compare
            </button>
          </div>
        </div>
      </div>

      <!-- Full Specifications Table -->
      <section aria-labelledby="specs-heading" class="space-y-3 pt-4 border-t border-border">
        <h2 id="specs-heading" class="text-xl font-bold text-text">Full Technical Specifications</h2>
        <div class="overflow-x-auto border border-border rounded-xl">
          <table class="w-full border-collapse">
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  `;

    // Bind Favorite Toggle
    const favBtn = document.getElementById('detail-fav-btn');
    favBtn.addEventListener('click', () => {
        toggleFavorite(laptop.id);
        const nowSaved = isFavorite(laptop.id);
        favBtn.textContent = nowSaved ? '★ Saved in Favorites' : '☆ Add to Favorites';
        favBtn.className = `${nowSaved ? 'btn-action' : 'btn-outline'} flex-1`;
        updateNavbarFavoritesCount();
    });

    // Bind Add to Favorites & Navigate to Comparison Page
    const compareBtn = document.getElementById('detail-compare-btn');
    compareBtn.addEventListener('click', () => {
        if (!isFavorite(laptop.id)) {
            toggleFavorite(laptop.id);
            updateNavbarFavoritesCount();
        }
        window.location.href = 'compare.html';
    });
};

const initDetailsPage = async () => {
    initSharedUI();

    const container = document.getElementById('details-container');
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    if (!idParam || Number.isNaN(Number(idParam))) {
        renderNotFound(container, idParam);
        return;
    }

    renderDetailsSkeleton(container);

    try {
        const laptop = await fetchLaptopById(idParam);
        if (!laptop) {
            renderNotFound(container, idParam);
            return;
        }
        renderLaptopDetails(container, laptop);
    } catch (error) {
        renderError(container, error.message);
    }
};

initDetailsPage();