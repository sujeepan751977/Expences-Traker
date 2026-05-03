// app.js
// Form handling and initialization. Uses storage.js and ui.js helper functions.

// Read the `type` parameter from the URL. It tells us if this form is
// adding an 'income' or an 'expense'.
function getTransactionType() {
    const query = new URLSearchParams(window.location.search);
    const type = query.get('type');

    if (type === 'expense') {
        return 'expense';
    }

    return 'income';
}

// Change the small title/description/button text on the transaction page
// so the user sees whether they are adding income or expense.
function updateTransactionPageText(type) {
    const title = document.querySelector('.container h1');
    const description = document.querySelector('.container p');
    const button = document.querySelector('#transaction-form .btn');

    if (type === 'expense') {
        if (title) {
            title.textContent = 'Your New Expense';
        }

        if (description) {
            description.textContent = 'Add a new expense to your record.';
        }

        if (button) {
            button.textContent = 'Add Expense';
        }
        return;
    }

    if (title) {
        title.textContent = 'Your New Income';
    }

    if (description) {
        description.textContent = 'Add a new income to your record.';
    }

    if (button) {
        button.textContent = 'Add Income';
    }
}

// Handle the form submit on the transaction page.
// This will store a new transaction in localStorage.
function handleTransactionForm() {
    const form = document.getElementById('transaction-form');

    if (!form) {
        return;
    }

    const transactionType = getTransactionType();
    const dateInput = document.getElementById('date-input');
    const textInput = document.getElementById('text');
    const amountInput = document.getElementById('amount');

    // Update the page text so the user knows what they are adding.
    updateTransactionPageText(transactionType);

    // Set the date input to the current date/time if it is empty.
    if (dateInput && !dateInput.value) {
        const today = new Date();
        dateInput.value = today.toISOString().slice(0, 16);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Convert amount value and make it negative for expenses.
        const amountValue = Number(amountInput.value);
        let finalAmount = amountValue;

        if (transactionType === 'expense') {
            finalAmount = -Math.abs(amountValue);
        } else {
            finalAmount = Math.abs(amountValue);
        }

        // Build the transaction object and save it.
        const transaction = {
            id: makeId(),
            date: dateInput.value,
            text: textInput.value.trim(),
            amount: finalAmount,
        };

        const transactions = getTransactions();
        transactions.push(transaction);
        saveTransactions(transactions);

        // Clear the form and go to history page to see the result.
        form.reset();
        window.location.href = 'history.html';
    });
}

// Initialize app on pages after the DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    updateSummaryOnPage();
    renderTransactionHistory();
    handleTransactionForm();
    setupFilters();
});
