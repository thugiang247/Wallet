import { analyzeWithAI } from './ai.js';
import { toggleTheme } from './theme.js';
import { openSettings, closeSettings, saveSettingsFromModal, testOpenRouterKey } from './settings.js';
import { exportData, importData, handleImportFile } from './data.js';
import { settings, setSettings } from './state.js';
import { showError } from './utils.js';
import { deleteTransaction } from './ui.js';

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

    // Swipe gestures for mobile
    setupSwipeGestures();
}

function setupSwipeGestures() {
    const transactionsList = document.getElementById('transactionsList');

    transactionsList.addEventListener('touchstart', handleTouchStart, { passive: false });
    transactionsList.addEventListener('touchmove', handleTouchMove, { passive: false });
    transactionsList.addEventListener('touchend', handleTouchEnd, { passive: false });

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isSwiping = false;
    let currentItem = null;

    function handleTouchStart(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isSwiping = true;
        currentItem = e.target.closest('.transaction-item');
    }

    function handleTouchMove(e) {
        if (!isSwiping || !currentItem) return;

        const touch = e.touches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;

        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Only horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault();
            const translateX = Math.max(diffX, -100); // Max swipe left 100px
            currentItem.style.transform = `translateX(${translateX}px)`;
        }
    }

    function handleTouchEnd(e) {
        if (!isSwiping || !currentItem) return;

        const diffX = currentX - startX;
        const threshold = 50;

        if (diffX < -threshold) {
            // Swipe left - delete
            currentItem.style.transform = 'translateX(-100px)';
            currentItem.style.opacity = '0';
            setTimeout(() => {
                deleteTransaction(currentItem);
            }, 300);
        } else {
            // Reset position
            currentItem.style.transform = '';
        }

        isSwiping = false;
        currentItem = null;
    }

    function deleteTransaction(item) {
        const id = parseInt(item.dataset.id);
        deleteTransaction(id);
    }
}