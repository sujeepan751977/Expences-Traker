
const STORAGE_KEY = 'expense-tracker-transactions';

// Read the saved transactions from localStorage.
function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        const transactions = JSON.parse(data);
        return Array.isArray(transactions) ? transactions : [];
    } catch (error) {

        return [];
    }
}

// Save an array of transactions
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function makeId() {
    return String(Date.now()) + String(Math.floor(Math.random() * 1000));
}

function ensureTransactionIds(transactions) {
    let changed = false;

    for (const transaction of transactions) {
        if (!transaction.id) {
            transaction.id = makeId();
            changed = true;
        }
    }

    if (changed) {
        saveTransactions(transactions);
    }

    return transactions;
}
