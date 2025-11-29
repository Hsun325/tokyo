// --- 1. 導航功能核心邏輯 ---
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const location = e.currentTarget.getAttribute('data-location');
            if (location) {
                // 使用 Google Maps 導航連結 (daddr 是目的地地址或名稱)
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
                
                // 在新視窗/分頁中開啟導航，避免跳出 PWA 體驗
                window.open(mapsUrl, '_system'); 
            }
        });
    });

    // --- 2. 記帳功能核心邏輯 ---
    const totalAmountSpan = document.getElementById('total-amount');
    const expenseList = document.getElementById('expense-list');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    
    // 從瀏覽器本地儲存 (localStorage) 載入數據
    let expenses = JSON.parse(localStorage.getItem('tripExpenses')) || [];

    // 渲染所有紀錄
    function renderExpenses() {
        expenseList.innerHTML = '';
        let total = 0;

        expenses.forEach((expense, index) => {
            total += expense.amount;
            const listItem = document.createElement('li');
            
            // 使用 CSS 類別標註顏色
            listItem.className = `category-${expense.category}`; 
            
            // 刪除按鈕使用 index 作為識別碼
            listItem.innerHTML = `
                <span>${expense.item}</span>
                <span>¥ ${expense.amount.toLocaleString()}</span>
                <small>(${expense.category_display})</small>
                <button onclick="deleteExpense(${index})">刪除</button>
            `;
            expenseList.appendChild(listItem);
        });

        totalAmountSpan.textContent = `¥ ${total.toLocaleString()}`;
        // 每次更新都儲存到本地
        localStorage.setItem('tripExpenses', JSON.stringify(expenses));
    }

    // 新增紀錄
    addExpenseBtn.addEventListener('click', () => {
        const itemInput = document.getElementById('expense-item');
        const amountInput = document.getElementById('expense-amount');
        const categorySelect = document.getElementById('expense-category');

        const newItem = itemInput.value.trim();
        const newAmount = parseInt(amountInput.value);
        const newCategory = categorySelect.value;
        const categoryDisplay = categorySelect.options[categorySelect.selectedIndex].text;

        if (newItem && newAmount > 0) {
            expenses.unshift({ // unshift: 新紀錄放在最前面
                item: newItem,
                amount: newAmount,
                category: newCategory,
                category_display: categoryDisplay,
                timestamp: new Date().toISOString()
            });
            // 清空輸入欄位
            itemInput.value = '';
            amountInput.value = '';
            renderExpenses();
        }
    });

    // 刪除紀錄 (全域函數，供 HTML 中的 onclick 調用)
    window.deleteExpense = function(index) {
        expenses.splice(index, 1);
        renderExpenses();
    }

    // 匯出 CSV
    exportCsvBtn.addEventListener('click', () => {
        let csvContent = "項目,金額(JPY),類別,時間\n";
        expenses.forEach(e => {
            // 避免項目名稱有逗號造成 CSV 錯誤，簡單處理
            const safeItem = e.item.replace(/"/g, '""'); 
            csvContent += `"${safeItem}",${e.amount},${e.category_display},${new Date(e.timestamp).toLocaleDateString()}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "tokyo_trip_expense_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 初始化渲染介面
    renderExpenses();
});
