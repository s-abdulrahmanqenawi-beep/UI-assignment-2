import { fetchLaptops } from './api.js';
import {
    initSharedUI,
    renderSkeletons,
    renderError,
    createLaptopCard
} from './ui.js';

let allLaptops = [];

const sortLaptops = (laptops, sortBy) => {
    const copy = [...laptops];

    switch (sortBy) {
        case 'price-asc':
            return copy.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return copy.sort((a, b) => b.price - a.price);
        case 'battery-desc':
            return copy.sort((a, b) => b.batteryHours - a.batteryHours);
        case 'battery-asc':
            return copy.sort((a, b) => a.batteryHours - b.batteryHours);
        case 'weight-asc':
            return copy.sort((a, b) => a.weightKg - b.weightKg);
        case 'weight-desc':
            return copy.sort((a, b) => b.weightKg - a.weightKg);
        default:
            return copy;
    }
};

const applyFiltersAndRender = () => {
    const searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
    const categoryValue = document.getElementById('category-filter').value;
    const maxPriceRaw = document.getElementById('max-price-filter').value;
    const minRamValue = Number(document.getElementById('min-ram-filter').value);
    const sortValue = document.getElementById('sort-select').value;

    const maxPrice = maxPriceRaw !== '' ? Number(maxPriceRaw) : Infinity;

    const filtered = allLaptops.filter((laptop) => {
        const matchesSearch =
            laptop.name.toLowerCase().includes(searchQuery) ||
            laptop.brand.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryValue === 'all' || laptop.category === categoryValue;
        const matchesPrice = laptop.price <= maxPrice;
        const matchesRam = laptop.ramGB >= minRamValue;

        return matchesSearch && matchesCategory && matchesPrice && matchesRam;
    });

    const sorted = sortLaptops(filtered, sortValue);

    const resultCountEl = document.getElementById('result-count');
    resultCountEl.textContent = `Showing ${sorted.length} of ${allLaptops.length} laptops`;

    const grid = document.getElementById('catalogue-grid');
    grid.innerHTML = '';

    if (sorted.length === 0) {
        grid.innerHTML = `
      <div class="col-span-full bg-surface border border-border rounded-xl p-10 text-center space-y-3">
        <p class="text-xl font-bold text-text">No Laptops Match Your Filters</p>
        <p class="text-sm text-muted">Try widening your price limit, lowering the minimum RAM, or clearing your search text.</p>
        <button type="button" id="empty-reset-btn" class="btn-action mt-2">Clear Filters</button>
      </div>
    `;
        document.getElementById('empty-reset-btn').addEventListener('click', resetFilters);
        return;
    }

    // Use map() to transform each laptop object into a reusable card element
    const cardElements = sorted.map((laptop) => createLaptopCard(laptop));
    cardElements.forEach((card) => grid.appendChild(card));
};

const resetFilters = () => {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('max-price-filter').value = '';
    document.getElementById('min-ram-filter').value = '0';
    document.getElementById('sort-select').value = 'default';
    applyFiltersAndRender();
};

const initCataloguePage = async () => {
    initSharedUI();

    const grid = document.getElementById('catalogue-grid');
    const resultCountEl = document.getElementById('result-count');

    renderSkeletons(grid, 6);

    try {
        allLaptops = await fetchLaptops();
        applyFiltersAndRender();

        // Bind live filter & sort listeners
        document.getElementById('search-input').addEventListener('input', applyFiltersAndRender);
        document.getElementById('category-filter').addEventListener('change', applyFiltersAndRender);
        document.getElementById('max-price-filter').addEventListener('input', applyFiltersAndRender);
        document.getElementById('min-ram-filter').addEventListener('change', applyFiltersAndRender);
        document.getElementById('sort-select').addEventListener('change', applyFiltersAndRender);
        document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
    } catch (error) {
        resultCountEl.textContent = '0 laptops loaded';
        renderError(grid, error.message);
    }
};

initCataloguePage();