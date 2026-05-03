// storage.js
// Simple localStorage helpers for beginner-level code

// Key used to store transactions in the browser localStorage
const STORAGE_KEY = 'expense-tracker-transactions';

// Read the saved transactions from localStorage.
// Returns an array (empty array if nothing is stored or JSON is invalid).
function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        const transactions = JSON.parse(data);
        return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
        // If the stored data is not valid JSON, return an empty list.
        return [];
    }
}

// Save an array of transactions to localStorage (as JSON text).
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Create a simple unique id using the current time and a small random number.
function makeId() {
    return String(Date.now()) + String(Math.floor(Math.random() * 1000));
}

// Ensure every transaction has an `id` property. If we added ids, save back.
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
