import { analyzeWithAI } from './ai.js';
import { toggleTheme } from './theme.js';
import { openSettings, closeSettings, saveSettingsFromModal, testOpenRouterKey } from './settings.js';
import { exportData, importData, handleImportFile } from './data.js';
import { settings, setSettings } from './state.js';
import { showError } from './utils.js';

export function setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('naturalInput').value.trim();
        if (!text) {
            showError('Vui lòng nhập nội dung giao dịch');
            return;
        }
        analyzeWithAI(text);
    });

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettingsFromModal);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', importData);
    document.getElementById('importFile').addEventListener('change', handleImportFile);
    document.getElementById('testKeyBtn').addEventListener('click', testOpenRouterKey);

    document.querySelectorAll('.provider-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.provider-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            setSettings({ provider: opt.dataset.provider });

            document.getElementById('poeSettings').style.display =
                settings.provider === 'poe' ? 'block' : 'none';
            document.getElementById('openrouterSettings').style.display =
                settings.provider === 'openrouter' ? 'block' : 'none';
        });
    });

    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettings();
        }
    });

    document.getElementById('naturalInput').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('analyzeBtn').click();
        }
    });
}