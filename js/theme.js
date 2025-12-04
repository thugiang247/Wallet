import { settings, setSettings } from './state.js';
import { saveToIndexedDB } from './db.js';

export function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
        html.classList.remove('dark');
        setSettings({ theme: 'light' });
        document.querySelector('#themeToggle i').className = 'fas fa-moon';
    } else {
        html.classList.add('dark');
        setSettings({ theme: 'dark' });
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }

    saveSettings();
}

export function applyTheme() {
    if (settings.theme === 'dark' ||
        (!settings.theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!settings.theme) {
            if (event.matches) {
                document.documentElement.classList.add('dark');
                document.querySelector('#themeToggle i').className = 'fas fa-sun';
            } else {
                document.documentElement.classList.remove('dark');
                document.querySelector('#themeToggle i').className = 'fas fa-moon';
            }
        }
    });
}

async function saveSettings() {
    try {
        await saveToIndexedDB('settings', {
            key: 'appSettings',
            value: settings
        });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}