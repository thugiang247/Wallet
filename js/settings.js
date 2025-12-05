import { settings, setSettings } from './state.js';
import { saveToIndexedDB, getFromIndexedDB } from './db.js';
import { showSuccess, showError } from './utils.js';

export async function loadSettings() {
    try {
        const storedSettings = await getFromIndexedDB('settings', 'appSettings');
        if (storedSettings) {
            setSettings(storedSettings.value);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

export function openSettings() {
    document.getElementById('settingsModal').classList.add('active');

    document.getElementById('poeBot').value = settings.poeBot;
    document.getElementById('openrouterKey').value = settings.openrouterKey;
    document.getElementById('openrouterModel').value = settings.openrouterModel;

    document.querySelectorAll('.provider-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.provider === settings.provider);
    });

    document.getElementById('poeSettings').style.display =
        settings.provider === 'poe' ? 'block' : 'none';
    document.getElementById('openrouterSettings').style.display =
        settings.provider === 'openrouter' ? 'block' : 'none';

    if (settings.openrouterModel) {
        document.getElementById('modelSelectGroup').style.display = 'block';
    }
}

export function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

export async function saveSettingsFromModal() {
    setSettings({
        poeBot: document.getElementById('poeBot').value,
        openrouterKey: document.getElementById('openrouterKey').value,
        openrouterModel: document.getElementById('openrouterModel').value,
        provider: settings.provider
    });

    try {
        await saveToIndexedDB('settings', {
            key: 'appSettings',
            value: settings
        });
        showSuccess('Đã lưu cài đặt!');
        closeSettings();
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Lỗi khi lưu cài đặt: ' + error.message);
    }
}

export async function testOpenRouterKey() {
    const keyInput = document.getElementById('openrouterKey');
    const apiKey = keyInput.value.trim();
    const resultEl = document.getElementById('keyTestResult');
    const testBtn = document.getElementById('testKeyBtn');

    if (!apiKey) {
        resultEl.innerHTML = '<div class="alert error"><i class="fas fa-exclamation-circle"></i> Vui lòng nhập API key</div>';
        return;
    }

    testBtn.disabled = true;
    testBtn.innerHTML = '<span class="loading"></span> Đang test...';
    resultEl.innerHTML = '';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('API key không hợp lệ');
        }

        const data = await response.json();
        const models = data.data || [];

        resultEl.innerHTML = '<div class="alert success"><i class="fas fa-check-circle"></i> API key hợp lệ! Đã tải ' + models.length + ' models</div>';

        const modelSelect = document.getElementById('openrouterModel');
        modelSelect.innerHTML = '<option value="">-- Chọn model --</option>' +
            models.map(m => `<option value="${m.id}">${m.name || m.id}</option>`).join('');

        document.getElementById('modelSelectGroup').style.display = 'block';

        setSettings({ openrouterKey: apiKey });

    } catch (error) {
        resultEl.innerHTML = '<div class="alert error"><i class="fas fa-exclamation-circle"></i> ' + error.message + '</div>';
    } finally {
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-check-circle"></i> Test API Key & Lấy Models';
    }
}