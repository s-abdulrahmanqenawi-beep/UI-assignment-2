# Student Laptop Finder Web App

A responsive five-page web application built with **HTML5**, **Tailwind CSS 4**, and **modular JavaScript (ES Modules)** for **SW302 — User Interface Development**.

## Features
- **Home (`index.html`)**: Live dataset statistics calculated via `reduce()` (total laptops, lowest price, saved favorites, average battery life) and featured student picks.
- **Catalogue (`laptops.html`)**: Live search by name or brand, category filter, maximum price filter, minimum RAM filter, and bidirectional sorting by price, battery life, and weight.
- **Laptop Details (`details.html`)**: Dynamic URL routing (`?id=`), full technical specifications table, and favorite/compare actions.
- **Saved Favorites (`favorites.html`)**: Persistent `localStorage` shortlist with single removal, clear all, and combined/average price calculations.
- **Side-by-Side Comparison (`compare.html`)**: Compare 2 to 4 saved favorites with automatic best-value highlighting across price, RAM, storage, battery life, and weight.
- **Dual Themes**: Switchable **Battery Saver Mode** (light/green) and **Performance Mode** (dark/orange) saved and restored via `localStorage`.

## Installation & Build Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and watch Tailwind CSS 4:**
   ```bash
   npm run build
   ```

3. **Run the application locally:**
   Open the project folder using a local HTTP server (such as **VS Code Live Server** or `npx serve .`) so `fetch()` can load `./data/laptops.json`.

## Submission Notes
- Folder name: `laptop_finder_Abdulrahman`
- Exclude `node_modules/` before zipping the final submission (`package.json` is included to reinstall packages).