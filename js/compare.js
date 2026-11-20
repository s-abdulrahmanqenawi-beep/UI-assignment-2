import { fetchLaptops } from './api.js';
import { getFavorites } from './storage.js';
import { initSharedUI, renderError } from './ui.js';

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

let favoriteLaptops = [];
let selectedIds = [];
let limitMessage = '';

export const getBestSpecValue = (laptops, key, direction) => {
    const values = laptops.map((item) => Number(item[key]));
    return direction === 'min' ? Math.min(...values) : Math.max(...values);
};

const renderCompareSkeleton = (container) => {
    container.innerHTML = `
    <div class="bg-surface border border-border rounded-2xl p-6 animate-pulse space-y-6">
      <div class="h-6 bg-surface-alt rounded w-1/3"></div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="h-16 bg-surface-alt rounded-xl"></div>
        <div class="h-16 bg-surface-alt rounded-xl"></div>
        <div class="h-16 bg-surface-alt rounded-xl"></div>
      </div>
      <div class="h-72 bg-surface-alt rounded-xl w-full"></div>
    </div>
  `;
};

const buildComparisonTableHTML = (selectedLaptops) => {
    const bestValues = {
        price: getBestSpecValue(selectedLaptops, 'price', 'min'),
        ramGB: getBestSpecValue(selectedLaptops, 'ramGB', 'max'),
        storageGB: getBestSpecValue(selectedLaptops, 'storageGB', 'max'),
        batteryHours: getBestSpecValue(selectedLaptops, 'batteryHours', 'max'),
        weightKg: getBestSpecValue(selectedLaptops, 'weightKg', 'min')
    };

    const specDefinitions = [
        {
            label: 'Price',
            key: 'price',
            format: (l) => `$${l.price.toLocaleString()}`,
            isBest: (l) => l.price === bestValues.price
        },
        {
            label: 'Category',
            key: 'category',
            format: (l) => l.category.toUpperCase(),
            isBest: () => false
        },
        {
            label: 'Processor (CPU)',
            key: 'cpu',
            format: (l) => l.cpu,
            isBest: () => false
        },
        {
            label: 'Memory (RAM)',
            key: 'ramGB',
            format: (l) => `${l.ramGB} GB`,
            isBest: (l) => l.ramGB === bestValues.ramGB
        },
        {
            label: 'Storage Capacity',
            key: 'storageGB',
            format: (l) => `${l.storageGB} GB SSD`,
            isBest: (l) => l.storageGB === bestValues.storageGB
        },
        {
            label: 'Battery Life',
            key: 'batteryHours',
            format: (l) => `${l.batteryHours} hrs`,
            isBest: (l) => l.batteryHours === bestValues.batteryHours
        },
        {
            label: 'Weight',
            key: 'weightKg',
            format: (l) => `${l.weightKg} kg`,
            isBest: (l) => l.weightKg === bestValues.weightKg
        },
        {
            label: 'Screen Size',
            key: 'screenInches',
            format: (l) => `${l.screenInches}"`,
            isBest: () => false
        }
    ];

    // Column headers for each selected laptop
    const headerColumnsHTML = selectedLaptops
        .map(
            (laptop) => `
      <th scope="col" class="p-4 text-left align-top border-l border-border min-w-[210px]">
        <div class="space-y-2.5">
          <img
            src="${laptop.image}"
            alt="${laptop.name}"
            class="w-full h-32 object-cover rounded-lg border border-border bg-surface-alt"
          />
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">${laptop.brand}</p>
            <h3 class="text-base font-bold text-text leading-snug">${laptop.name}</h3>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <a href="details.html?id=${laptop.id}" class="text-xs font-semibold text-accent hover:underline">
              Full Specs →
            </a>
            <button
              type="button"
              data-remove-compare="${laptop.id}"
              class="ml-auto text-xs text-muted hover:text-red-500 font-medium cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      </th>
    `
        )
        .join('');

    // Specification rows generated with map()
    const rowsHTML = specDefinitions
        .map((spec) => {
            const valueCells = selectedLaptops
                .map((laptop) => {
                    const best = spec.isBest(laptop);
                    return `
            <td class="p-4 text-sm border-l border-border transition-colors ${best ? 'bg-best font-bold text-text' : 'text-text'
                        }">
              <div class="flex items-center justify-between gap-2">
                <span>${spec.format(laptop)}</span>
                ${best
                            ? '<span class="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-accent text-white">★ Best</span>'
                            : ''
                        }
              </div>
            </td>
          `;
                })
                .join('');

            return `
        <tr class="border-t border-border">
          <th scope="row" class="p-4 text-left text-sm font-semibold text-muted bg-surface-alt sticky left-0 z-10 min-w-[150px]">
            ${spec.label}
          </th>
          ${valueCells}
        </tr>
      `;
        })
        .join('');

    return `
    <div class="overflow-x-auto border border-border rounded-2xl bg-surface shadow-sm">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-surface-alt/40">
            <th scope="col" class="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted bg-surface-alt sticky left-0 z-10 min-w-[150px]">
              Specification
            </th>
            ${headerColumnsHTML}
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;
};

const renderCompareWorkspace = () => {
    const workspace = document.getElementById('compare-workspace');

    // Case 1: Fewer than 2 favorites exist in localStorage
    if (favoriteLaptops.length < MIN_COMPARE) {
        workspace.innerHTML = `
      <div class="bg-surface border border-border rounded-2xl p-10 text-center space-y-4">
        <p class="text-4xl">⚖️</p>
        <h2 class="text-xl font-bold text-text">At Least 2 Saved Favorites Required</h2>
        <p class="text-sm text-muted max-w-md mx-auto">
          You currently have ${favoriteLaptops.length} laptop${favoriteLaptops.length === 1 ? '' : 's'} in your favorites. Save at least 2 laptops from the catalogue to compare them side by side.
        </p>
        <div class="pt-2">
          <a href="laptops.html" class="btn-action">Browse Laptop Catalogue</a>
        </div>
      </div>
    `;
        return;
    }

    // Selector cards for saved favorites
    const selectorButtonsHTML = favoriteLaptops
        .map((laptop) => {
            const isSelected = selectedIds.includes(laptop.id);
            return `
        <button
          type="button"
          data-toggle-compare="${laptop.id}"
          class="text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                    ? 'bg-accent-soft border-accent text-text shadow-sm'
                    : 'bg-surface-alt/50 border-border text-muted hover:border-accent'
                }"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase">${laptop.brand} • $${laptop.price.toLocaleString()}</p>
            <p class="text-sm font-bold text-text truncate">${laptop.name}</p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${isSelected ? 'bg-accent text-white' : 'bg-surface border border-border text-muted'
                }">
            ${isSelected ? '✓ Selected' : '+ Select'}
          </span>
        </button>
      `;
        })
        .join('');

    const warningBannerHTML = limitMessage
        ? `
      <div role="alert" class="bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between gap-2">
        <span>⚠️ ${limitMessage}</span>
        <button type="button" id="dismiss-warning-btn" class="text-xs underline cursor-pointer">Dismiss</button>
      </div>
    `
        : '';

    const selectedLaptops = favoriteLaptops.filter((item) => selectedIds.includes(item.id));

    const comparisonAreaHTML =
        selectedLaptops.length >= MIN_COMPARE
            ? buildComparisonTableHTML(selectedLaptops)
            : `
        <div class="bg-surface border border-border rounded-2xl p-8 text-center space-y-2">
          <p class="text-lg font-bold text-text">Select at Least 2 Laptops Above</p>
          <p class="text-sm text-muted">Click on two to four saved favorites above to display their side-by-side comparison table.</p>
        </div>
      `;

    workspace.innerHTML = `
    <section aria-label="Select favorites to compare" class="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-bold text-text">Choose Favorites to Compare (${selectedIds.length}/${MAX_COMPARE} selected)</h2>
          <p class="text-xs text-muted">Click a favorite below to include or exclude it from the comparison table.</p>
        </div>
      </div>

      ${warningBannerHTML}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        ${selectorButtonsHTML}
      </div>
    </section>

    <section aria-label="Comparison results">
      ${comparisonAreaHTML}
    </section>
  `;

    // Bind toggle buttons in selector
    workspace.querySelectorAll('[data-toggle-compare]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-toggle-compare'));
            handleToggleSelection(id);
        });
    });

    // Bind remove buttons inside table header
    workspace.querySelectorAll('[data-remove-compare]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-remove-compare'));
            handleToggleSelection(id);
        });
    });

    const dismissBtn = document.getElementById('dismiss-warning-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            limitMessage = '';
            renderCompareWorkspace();
        });
    }
};

const handleToggleSelection = (id) => {
    if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter((itemId) => itemId !== id);
        limitMessage = '';
        renderCompareWorkspace();
        return;
    }

    if (selectedIds.length >= MAX_COMPARE) {
        limitMessage = 'You can compare a maximum of 4 laptops at once. Deselect one laptop before adding a 5th.';
        renderCompareWorkspace();
        return;
    }

    selectedIds = [...selectedIds, id];
    limitMessage = '';
    renderCompareWorkspace();
};

const initComparePage = async () => {
    initSharedUI();

    const workspace = document.getElementById('compare-workspace');
    renderCompareSkeleton(workspace);

    try {
        const allLaptops = await fetchLaptops();
        const savedIds = getFavorites();
        favoriteLaptops = allLaptops.filter((laptop) => savedIds.includes(laptop.id));

        // Pre-select up to 4 saved favorites automatically on load
        selectedIds = favoriteLaptops.slice(0, MAX_COMPARE).map((laptop) => laptop.id);
        renderCompareWorkspace();
    } catch (error) {
        renderError(workspace, error.message);
    }
};

initComparePage();