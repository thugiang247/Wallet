import { transactions, categoryIcons, setTransactions } from './state.js';
import { formatCurrency, formatDate } from './utils.js';
import { saveToIndexedDB, getAllFromIndexedDB } from './db.js';

export async function addTransaction(transaction) {
    try {
        const id = await saveToIndexedDB('transactions', {
            ...transaction,
            date: transaction.date || new Date().toISOString()
        });
        await loadTransactions();
        updateUI();
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
}

export async function loadTransactions() {
    try {
        const loadedTransactions = await getAllFromIndexedDB('transactions');
        setTransactions(loadedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

export function updateUI() {
    updateStats();
    updateTransactionsList();
    updateCategoriesGrid();
}

function updateStats() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expense);
    document.getElementById('balance').textContent = formatCurrency(balance);
}

function updateTransactionsList() {
    const listEl = document.getElementById('transactionsList');

    if (transactions.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Chưa có giao dịch nào. Hãy nhập giao dịch của bạn bên trên!</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-category">${categoryIcons[t.category] || '📦'} ${t.category}</span>
                <div class="transaction-description">${t.description}</div>
                <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
        </div>
    `).join('');
}

function updateCategoriesGrid() {
    const categoriesMap = {};

    transactions.forEach(t => {
        if (!categoriesMap[t.category]) {
            categoriesMap[t.category] = { income: 0, expense: 0 };
        }
        categoriesMap[t.category][t.type] += t.amount;
    });

    const gridEl = document.getElementById('categoriesGrid');

    if (Object.keys(categoriesMap).length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-tags"></i>
                <p>Chưa có hạng mục nào</p>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = Object.entries(categoriesMap).map(([category, amounts]) => {
        const total = amounts.expense > 0 ? -amounts.expense : amounts.income;
        return `
            <div class="category-card">
                <div class="category-icon">${categoryIcons[category] || '📦'}</div>
                <div class="category-name">${category}</div>
                <div class="category-amount" style="color: ${total >= 0 ? 'var(--success)' : 'var(--danger)'}">
                    ${formatCurrency(Math.abs(total))}
                </div>
            </div>
        `;
    }).join('');
}