import { fetchLaptops } from './api.js';
import { getFavorites } from './storage.js';
import {
    initSharedUI,
    renderSkeletons,
    renderError,
    createLaptopCard
} from './ui.js';

const updateFavoritesStat = () => {
    const favEl = document.getElementById('stat-favorites');
    if (favEl) {
        favEl.textContent = getFavorites().length;
    }
};

const initHomePage = async () => {
    initSharedUI();
    updateFavoritesStat();

    const featuredGrid = document.getElementById('featured-grid');
    const totalEl = document.getElementById('stat-total');
    const lowestPriceEl = document.getElementById('stat-lowest-price');
    const avgBatteryEl = document.getElementById('stat-avg-battery');

    renderSkeletons(featuredGrid, 3);

    try {
        const laptops = await fetchLaptops();

        // Use reduce() to calculate lowest price and total battery hours from the dataset
        const lowestPrice = laptops.reduce(
            (min, item) => (item.price < min ? item.price : min),
            Infinity
        );
        const totalBattery = laptops.reduce((sum, item) => sum + item.batteryHours, 0);
        const avgBattery = (totalBattery / laptops.length).toFixed(1);

        totalEl.textContent = laptops.length;
        lowestPriceEl.textContent = `$${lowestPrice.toLocaleString()}`;
        avgBatteryEl.textContent = `${avgBattery} hrs`;

        // Render 3 featured laptops (e.g., IDs 1, 5, 9) using the shared card component
        const featuredIds = [1, 5, 9];
        const featuredLaptops = laptops.filter((item) => featuredIds.includes(item.id));

        featuredGrid.innerHTML = '';
        featuredLaptops.forEach((laptop) => {
            const card = createLaptopCard(laptop, () => {
                updateFavoritesStat();
            });
            featuredGrid.appendChild(card);
        });
    } catch (error) {
        renderError(featuredGrid, error.message);
    }
};

initHomePage();