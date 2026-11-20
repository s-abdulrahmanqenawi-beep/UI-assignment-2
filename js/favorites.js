import { fetchLaptops } from './api.js';
import { getFavorites, clearFavorites } from './storage.js';
import {
    initSharedUI,
    updateNavbarFavoritesCount,
    renderSkeletons,
    renderError,
    createLaptopCard
} from './ui.js';

let allLaptops = [];

const formatCurrency = (amount) =>
    `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

const renderFavoritesView = () => {
    const savedIds = getFavorites();
    const savedLaptops = allLaptops.filter((laptop) => savedIds.includes(laptop.id));

    // Calculate total and average price with reduce()
    const totalPrice = savedLaptops.reduce((sum, laptop) => sum + laptop.price, 0);
    const averagePrice = savedLaptops.length > 0 ? totalPrice / savedLaptops.length : 0;

    document.getElementById('fav-total-count').textContent = savedLaptops.length;
    document.getElementById('fav-total-price').textContent = formatCurrency(totalPrice);
    document.getElementById('fav-avg-price').textContent = formatCurrency(averagePrice);

    const clearBtn = document.getElementById('clear-favorites-btn');
    clearBtn.disabled = savedLaptops.length === 0;
    clearBtn.classList.toggle('opacity-50', savedLaptops.length === 0);
    clearBtn.classList.toggle('cursor-not-allowed', savedLaptops.length === 0);

    const grid = document.getElementById('favorites-grid');
    grid.innerHTML = '';

    if (savedLaptops.length === 0) {
        grid.innerHTML = `
      <div class="col-span-full bg-surface border border-border rounded-2xl p-10 text-center space-y-4">
        <p class="text-4xl">☆</p>
        <h2 class="text-xl font-bold text-text">No Saved Favorites Yet</h2>
        <p class="text-sm text-muted max-w-md mx-auto">
          Browse the catalogue and click "Save" on any laptop you want to shortlist or compare later.
        </p>
        <div class="pt-2">
          <a href="laptops.html" class="btn-action">Explore Laptop Catalogue</a>
        </div>
      </div>
    `;
        return;
    }

    // Render each saved laptop card using the shared card component
    const cards = savedLaptops.map((laptop) =>
        createLaptopCard(laptop, () => {
            // Re-render immediately when a user un-saves a card from this page
            renderFavoritesView();
        })
    );

    cards.forEach((card) => grid.appendChild(card));
};

const initFavoritesPage = async () => {
    initSharedUI();

    const grid = document.getElementById('favorites-grid');
    renderSkeletons(grid, 3);

    try {
        allLaptops = await fetchLaptops();
        renderFavoritesView();

        const clearBtn = document.getElementById('clear-favorites-btn');
        clearBtn.addEventListener('click', () => {
            if (getFavorites().length === 0) return;
            clearFavorites();
            updateNavbarFavoritesCount();
            renderFavoritesView();
        });
    } catch (error) {
        renderError(grid, error.message);
    }
};

initFavoritesPage();