import { transactions } from './state.js';
import { formatCurrency } from './utils.js';

/**
 * Groups transactions by month (YYYY-MM format) and calculates totals.
 * @param {Array} transactions - Array of transaction objects.
 * @returns {Array} Array of objects with {period: 'YYYY-MM', income: number, expense: number, balance: number}
 */
export function groupTransactionsByMonth(transactions) {
    const groups = {};

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!groups[monthKey]) {
            groups[monthKey] = { income: 0, expense: 0 };
        }

        if (t.type === 'income') {
            groups[monthKey].income += t.amount;
        } else if (t.type === 'expense') {
            groups[monthKey].expense += t.amount;
        }
    });

    // Convert to array and calculate balance
    return Object.entries(groups)
        .map(([period, amounts]) => ({
            period,
            income: amounts.income,
            expense: amounts.expense,
            balance: amounts.income - amounts.expense
        }))
        .sort((a, b) => b.period.localeCompare(a.period)); // Sort descending
}

/**
 * Groups transactions by year (YYYY format) and calculates totals.
 * @param {Array} transactions - Array of transaction objects.
 * @returns {Array} Array of objects with {period: 'YYYY', income: number, expense: number, balance: number}
 */
export function groupTransactionsByYear(transactions) {
    const groups = {};

    transactions.forEach(t => {
        const date = new Date(t.date);
        const yearKey = `${date.getFullYear()}`;

        if (!groups[yearKey]) {
            groups[yearKey] = { income: 0, expense: 0 };
        }

        if (t.type === 'income') {
            groups[yearKey].income += t.amount;
        } else if (t.type === 'expense') {
            groups[yearKey].expense += t.amount;
        }
    });

    // Convert to array and calculate balance
    return Object.entries(groups)
        .map(([period, amounts]) => ({
            period,
            income: amounts.income,
            expense: amounts.expense,
            balance: amounts.income - amounts.expense
        }))
        .sort((a, b) => b.period.localeCompare(a.period)); // Sort descending
}

/**
 * Renders the monthly reports table HTML.
 * @param {Array} monthlyData - Data from groupTransactionsByMonth.
 * @returns {string} HTML string for the table.
 */
export function renderMonthlyReports(monthlyData) {
    if (monthlyData.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Chưa có dữ liệu để hiển thị báo cáo theo tháng</p>
            </div>
        `;
    }

    const rows = monthlyData.map(data => `
        <tr>
            <td>${data.period}</td>
            <td class="income">${formatCurrency(data.income)}</td>
            <td class="expense">${formatCurrency(data.expense)}</td>
            <td class="${data.balance >= 0 ? 'income' : 'expense'}">${formatCurrency(data.balance)}</td>
        </tr>
    `).join('');

    return `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>Tháng</th>
                    <th>Tổng thu</th>
                    <th>Tổng chi</th>
                    <th>Số dư</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

/**
 * Renders the yearly reports table HTML.
 * @param {Array} yearlyData - Data from groupTransactionsByYear.
 * @returns {string} HTML string for the table.
 */
export function renderYearlyReports(yearlyData) {
    if (yearlyData.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Chưa có dữ liệu để hiển thị báo cáo theo năm</p>
            </div>
        `;
    }

    const rows = yearlyData.map(data => `
        <tr>
            <td>${data.period}</td>
            <td class="income">${formatCurrency(data.income)}</td>
            <td class="expense">${formatCurrency(data.expense)}</td>
            <td class="${data.balance >= 0 ? 'income' : 'expense'}">${formatCurrency(data.balance)}</td>
        </tr>
    `).join('');

    return `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>Năm</th>
                    <th>Tổng thu</th>
                    <th>Tổng chi</th>
                    <th>Số dư</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}