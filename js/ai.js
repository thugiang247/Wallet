import { settings } from './state.js';
import { addTransaction } from './ui.js';
import { showSuccess, showError } from './utils.js';

export async function analyzeWithAI(text) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    analyzeBtn.innerHTML = '<span class="loading"></span> Đang phân tích...';

    try {
        if (settings.provider === 'poe') {
            await analyzeWithPoe(text);
        } else {
            await analyzeWithOpenRouter(text);
        }
    } catch (error) {
        showError('Lỗi khi phân tích: ' + error.message);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Phân tích với AI';
    }
}

async function analyzeWithPoe(text) {
    const prompt = `Bạn là trợ lý quản lý tài chính. Phân tích câu sau và trích xuất các giao dịch thu/chi thành JSON.

Câu: "${text}"

Yêu cầu:
- Trả về ONLY JSON array, không có text khác
- Mỗi giao dịch phải có: type (income/expense), amount (số tiền), category (hạng mục), description (mô tả)
- Các hạng mục phổ biến: Ăn uống, Đi lại, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Hóa đơn, Lương, Thưởng, Đầu tư, Khác
- Số tiền là số nguyên (VND)

Format:
[{"type":"income","amount":3000000,"category":"Lương","description":"Lương tháng"},{"type":"expense","amount":10000,"category":"Ăn uống","description":"Mua rau"}]`;

    return new Promise((resolve, reject) => {
        let responseText = '';

        window.Poe.registerHandler('expense-analyzer', (result) => {
            const msg = result.responses[0];

            if (msg.status === 'error') {
                reject(new Error(msg.statusText || 'Lỗi từ Poe API'));
                return;
            }

            if (msg.status === 'incomplete') {
                responseText = msg.content;
            } else if (msg.status === 'complete') {
                responseText = msg.content;

                try {
                    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                    if (!jsonMatch) {
                        reject(new Error('Không tìm thấy JSON trong response'));
                        return;
                    }

                    const parsedTransactions = JSON.parse(jsonMatch[0]);

                    parsedTransactions.forEach(t => addTransaction(t));

                    showSuccess(`Đã thêm ${parsedTransactions.length} giao dịch!`);
                    document.getElementById('naturalInput').value = '';
                    resolve();
                } catch (error) {
                    reject(new Error('Lỗi parse JSON: ' + error.message));
                }
            }
        });

        window.Poe.sendUserMessage(`@${settings.poeBot} ${prompt}`, {
            handler: 'expense-analyzer',
            stream: true,
            openChat: false
        }).catch(reject);
    });
}

async function analyzeWithOpenRouter(text) {
    if (!settings.openrouterKey || !settings.openrouterModel) {
        throw new Error('Vui lòng cấu hình OpenRouter API key và model trong Cài đặt');
    }

    const prompt = `Bạn là trợ lý quản lý tài chính. Phân tích câu sau và trích xuất các giao dịch thu/chi thành JSON.

Câu: "${text}"

Yêu cầu:
- Trả về ONLY JSON array, không có text khác
- Mỗi giao dịch phải có: type (income/expense), amount (số tiền), category (hạng mục), description (mô tả)
- Các hạng mục phổ biến: Ăn uống, Đi lại, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Hóa đơn, Lương, Thưởng, Đầu tư, Khác
- Số tiền là số nguyên (VND)

Format:
[{"type":"income","amount":3000000,"category":"Lương","description":"Lương tháng"},{"type":"expense","amount":10000,"category":"Ăn uống","description":"Mua rau"}]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'Chi Tieu App'
        },
        body: JSON.stringify({
            model: settings.openrouterModel,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Lỗi từ OpenRouter API');
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
    }

    const parsedTransactions = JSON.parse(jsonMatch[0]);

    for (const t of parsedTransactions) {
        await addTransaction(t);
    }

    showSuccess(`Đã thêm ${parsedTransactions.length} giao dịch!`);
    document.getElementById('naturalInput').value = '';
}