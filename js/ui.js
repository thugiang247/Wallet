// @ts-nocheck
import { transactions, categoryIcons, setTransactions } from './state.js';
import { formatCurrency, formatDate } from './utils.js';
import { saveToIndexedDB, getAllFromIndexedDB, deleteFromIndexedDB } from './db.js';
import { groupTransactionsByMonth, groupTransactionsByYear, renderMonthlyReports, renderYearlyReports } from './reports.js';

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

export async function deleteTransaction(id) {
    try {
        await deleteFromIndexedDB('transactions', id);
        await loadTransactions();
        updateUI();
    } catch (error) {
        console.error('Error deleting transaction:', error);
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
    renderExpensePieChart();
    updateReports();
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

    listEl.innerHTML = transactions.map((t, index) => `
        <div class="transaction-item" data-id="${t.id}" style="--index: ${index}">
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
        const tooltip = amounts.expense > 0 ?
            `Chi: ${formatCurrency(amounts.expense)}${amounts.income > 0 ? `, Thu: ${formatCurrency(amounts.income)}` : ''}` :
            `Thu: ${formatCurrency(amounts.income)}${amounts.expense > 0 ? `, Chi: ${formatCurrency(amounts.expense)}` : ''}`;
        return `
            <div class="category-card" data-tooltip="${tooltip}">
                <div class="category-icon">${categoryIcons[category] || '📦'}</div>
                <div class="category-name">${category}</div>
                <div class="category-amount" style="color: ${total >= 0 ? 'var(--success)' : 'var(--danger)'}">
                    ${formatCurrency(Math.abs(total))}
                </div>
            </div>
        `;
    }).join('');
}

let expensePieChartInstance = null;

function renderExpensePieChart() {
    const expenseCategoriesMap = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!expenseCategoriesMap[t.category]) {
                expenseCategoriesMap[t.category] = 0;
            }
            expenseCategoriesMap[t.category] += t.amount;
        }
    });

    const chartData = Object.entries(expenseCategoriesMap).map(([category, amount]) => ({
        name: category,
        y: amount
    }));

    const ctx = document.getElementById('expensePieChart');

    if (expensePieChartInstance) {
        expensePieChartInstance.destroy();
    }

    if (chartData.length === 0) {
        ctx.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-chart-pie"></i>
                <p>Chưa có dữ liệu chi tiêu để hiển thị biểu đồ</p>
            </div>
        `;
        return;
    }

    expensePieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map(item => item.name),
            datasets: [{
                data: chartData.map(item => item.y),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#7FFF00',
                    '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#7FFF00',
                    '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return percentage + '%';
                    },
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function updateReports() {
    const monthlyData = groupTransactionsByMonth(transactions);
    const yearlyData = groupTransactionsByYear(transactions);
    document.getElementById('monthlyReports').innerHTML = renderMonthlyReports(monthlyData);
    document.getElementById('yearlyReports').innerHTML = renderYearlyReports(yearlyData);
}