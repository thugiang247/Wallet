import { transactions, settings, setSettings } from './state.js';
import { initDB, saveToIndexedDB } from './db.js';
import { loadTransactions, updateUI } from './ui.js';
import { showSuccess, showError } from './utils.js';

export function exportData() {
    const data = {
        transactions,
        settings,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chi-tieu-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('Đã xuất dữ liệu thành công!');
}

export function importData() {
    document.getElementById('importFile').click();
}

export async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.transactions || !Array.isArray(data.transactions)) {
            throw new Error('File không đúng định dạng');
        }

        const database = await initDB();
        const transaction = database.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        await store.clear();

        for (const t of data.transactions) {
            await saveToIndexedDB('transactions', { ...t, date: t.date || new Date().toISOString() });
        }

        if (data.settings) {
            setSettings(data.settings);
            await saveToIndexedDB('settings', { key: 'appSettings', value: settings });
        }

        showSuccess(`Đã nhập ${data.transactions.length} giao dịch!`);
        await loadTransactions();
        updateUI();
    } catch (error) {
        showError('Lỗi khi nhập dữ liệu: ' + error.message);
    }

    event.target.value = '';
}