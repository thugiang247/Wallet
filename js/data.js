import { transactions, settings, setSettings } from './state.js';
import { initDB, saveToIndexedDB } from './db.js';
import { loadTransactions, updateUI } from './ui.js';
import { showSuccess, showError } from './utils.js';

export async function exportData() {
    const data = {
        transactions,
        settings,
        exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `chi-tieu-${new Date().toISOString().split('T')[0]}.json`;

    try {
        // Hỗ trợ chia sẻ file trực tiếp trên mobile (APK / Android)
        if (navigator.share && navigator.canShare) {
            const file = new File([jsonString], fileName, { type: 'application/json' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Dữ liệu Chi Tiêu',
                    files: [file]
                });
                showSuccess('Đã chia sẻ / lưu dữ liệu thành công!');
                return;
            }
        }
    } catch (e) {
        console.log("Web Share API không khả dụng, dùng phương pháp tải xuống truyền thống", e);
    }

    // Phương pháp tải file truyền thống cho Web / PC
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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