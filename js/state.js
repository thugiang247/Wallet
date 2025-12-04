export let transactions = [];
export let settings = {
    provider: 'poe',
    poeBot: 'GPT-5.1',
    openrouterKey: '',
    openrouterModel: '',
    theme: 'light'
};

export const categoryIcons = {
    'Ăn uống': '🍜',
    'Đi lại': '🚗',
    'Mua sắm': '🛒',
    'Giải trí': '🎮',
    'Sức khỏe': '💊',
    'Giáo dục': '📚',
    'Hóa đơn': '📄',
    'Lương': '💰',
    'Thưởng': '🎁',
    'Đầu tư': '📈',
    'Khác': '📦'
};

export function setTransactions(newTransactions) {
    transactions = newTransactions;
}

export function setSettings(newSettings) {
    settings = { ...settings, ...newSettings };
}