// ui.js
// Functions that update the page: summaries, history list, filters, edit/delete

// Format number to a simple currency string used in the app.
function formatMoney(amount) {
    return `LKR ${amount.toFixed(2)}`;
}

// Calculate income, expense and balance from transactions array.
function calculateSummary(transactions) {
    let income = 0;
    let expense = 0;

    for (const transaction of transactions) {
        if (transaction.amount >= 0) {
            income += transaction.amount;
        } else {
            expense += Math.abs(transaction.amount);
        }
    }

    return {
        income,
        expense,
        balance: income - expense,
    };
}

// Read the values from the filter inputs on the history page.
function getFilterValues() {
    const dateFilter = document.getElementById('filter-date');
    const monthFilter = document.getElementById('filter-month');

    return {
        date: dateFilter ? dateFilter.value : '',
        month: monthFilter ? monthFilter.value : '',
    };
}

// Keep only transactions that match the selected date/month filters.
function filterTransactions(transactions) {
    const filters = getFilterValues();

    return transactions.filter((transaction) => {
        const transactionDate = transaction.date ? transaction.date.slice(0, 10) : '';
        const transactionMonth = transaction.date ? transaction.date.slice(0, 7) : '';

        if (filters.date && transactionDate !== filters.date) {
            return false;
        }

        if (filters.month && transactionMonth !== filters.month) {
            return false;
        }

        return true;
    });
}

// Update the small summary boxes on the dashboard (Balance, Income, Expense).
function updateSummaryOnPage() {
    const transactions = getTransactions();
    const summary = calculateSummary(transactions);

    const balanceElement = document.getElementById('Balance');
    const incomeElement = document.getElementById('Income');
    const expenseElement = document.getElementById('Expense');

    if (balanceElement) {
        balanceElement.textContent = formatMoney(summary.balance);
    }

    if (incomeElement) {
        incomeElement.textContent = formatMoney(summary.income);
    }

    if (expenseElement) {
        expenseElement.textContent = formatMoney(summary.expense);
    }
}

// Render the list of transactions on the history page.
// Each item shows date, description, amount and has Edit/Delete buttons.
function renderTransactionHistory() {
    const transactionList = document.getElementById('transaction-list');

    if (!transactionList) {
        return;
    }

    const transactions = filterTransactions(ensureTransactionIds(getTransactions()));
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No transactions found.';
        transactionList.appendChild(emptyItem);
        return;
    }

    transactions.forEach((transaction) => {
        const item = document.createElement('li');
        const info = document.createElement('span');
        const buttons = document.createElement('div');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const sign = transaction.amount >= 0 ? '+' : '-';
        const amount = Math.abs(transaction.amount);
        const shownDate = transaction.date ? transaction.date.replace('T', ' ') : '';

        info.textContent = `${shownDate} | ${transaction.text} | ${sign}${formatMoney(amount)}`;

        // Edit button opens simple prompts to change the transaction.
        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.className = 'action-button edit-button';
        editButton.addEventListener('click', function () {
            editTransaction(transaction.id);
        });

        // Delete button asks for confirmation then removes the item.
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.className = 'action-button delete-button';
        deleteButton.addEventListener('click', function () {
            deleteTransaction(transaction.id);
        });

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
        buttons.className = 'transaction-actions';

        item.appendChild(info);
        item.appendChild(buttons);
        transactionList.appendChild(item);
    });
}

// Delete a transaction by id and update UI/storage.
function deleteTransaction(id) {
    const transactions = getTransactions();
    const updatedTransactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    const shouldDelete = confirm('Do you want to delete this transaction?');

    if (!shouldDelete) {
        return;
    }

    saveTransactions(updatedTransactions);
    renderTransactionHistory();
    updateSummaryOnPage();
}

// Edit a transaction using simple prompt boxes (beginner-friendly).
function editTransaction(id) {
    const transactions = getTransactions();
    const transaction = transactions.find(function (item) {
        return item.id === id;
    });

    if (!transaction) {
        return;
    }

    const newDate = prompt('Enter date and time (YYYY-MM-DDTHH:MM)', transaction.date);
    if (newDate === null) {
        return;
    }

    const newText = prompt('Enter description', transaction.text);
    if (newText === null) {
        return;
    }

    const newAmount = prompt('Enter amount', String(transaction.amount));
    if (newAmount === null) {
        return;
    }

    const amountNumber = Number(newAmount);
    if (Number.isNaN(amountNumber)) {
        alert('Please enter a valid number for amount.');
        return;
    }

    transaction.date = newDate.trim();
    transaction.text = newText.trim();
    transaction.amount = amountNumber;

    saveTransactions(transactions);
    renderTransactionHistory();
    updateSummaryOnPage();
}

// Wire up simple filter buttons on the history page.
function setupFilters() {
    const applyButton = document.getElementById('apply-filter-button');
    const clearButton = document.getElementById('clear-filter-button');

    if (!applyButton && !clearButton) {
        return;
    }

    if (applyButton) {
        applyButton.addEventListener('click', function () {
            renderTransactionHistory();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            const dateFilter = document.getElementById('filter-date');
            const monthFilter = document.getElementById('filter-month');

            if (dateFilter) {
                dateFilter.value = '';
            }

            if (monthFilter) {
                monthFilter.value = '';
            }

            renderTransactionHistory();
        });
    }
}
