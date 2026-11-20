const FAVORITES_KEY = 'laptop_finder_favorites';
const THEME_KEY = 'laptop_finder_theme';

export const getFavorites = () => {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const saveFavorites = (ids) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
};

export const isFavorite = (id) => getFavorites().includes(Number(id));

export const toggleFavorite = (id) => {
    const numericId = Number(id);
    const current = getFavorites();
    const updated = current.includes(numericId)
        ? current.filter((itemId) => itemId !== numericId)
        : [...current, numericId];

    saveFavorites(updated);
    return updated;
};

export const clearFavorites = () => {
    saveFavorites([]);
};

export const getTheme = () => {
    try {
        const raw = localStorage.getItem(THEME_KEY);
        return raw ? JSON.parse(raw) : 'battery-saver';
    } catch {
        return 'battery-saver';
    }
};

export const setTheme = (theme) => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    applyThemeToDocument(theme);
};

export const applyThemeToDocument = (theme) => {
    if (theme === 'performance') {
        document.documentElement.setAttribute('data-theme', 'performance');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
};

export const restoreTheme = () => {
    const savedTheme = getTheme();
    applyThemeToDocument(savedTheme);
    return savedTheme;
};