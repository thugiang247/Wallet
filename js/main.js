import { initDB } from './db.js';
import { loadSettings } from './settings.js';
import { loadTransactions, updateUI } from './ui.js';
import { setupEventListeners } from './events.js';
import { applyTheme } from './theme.js';

async function init() {
    await initDB();
    await loadSettings();
    await loadTransactions();
    setupEventListeners();
    updateUI();
    applyTheme();
}

init();