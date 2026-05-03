

const STORAGE_KEY = 'expense-tracker-transactions';

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

function saveTransactions(transactions) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function makeId() {
	return String(Date.now()) + String(Math.floor(Math.random() * 1000));
}

function getTransactionType() {
	const query = new URLSearchParams(window.location.search);
	const type = query.get('type');

	if (type === 'expense') {
		return 'expense';
	}

	return 'income';
}

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

function formatMoney(amount) {
	return `LKR ${amount.toFixed(2)}`;
}

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

function getFilterValues() {
	const dateFilter = document.getElementById('filter-date');
	const monthFilter = document.getElementById('filter-month');

	return {
		date: dateFilter ? dateFilter.value : '',
		month: monthFilter ? monthFilter.value : '',
	};
}

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

		editButton.textContent = 'Edit';
		editButton.type = 'button';
		editButton.className = 'action-button edit-button';
		editButton.addEventListener('click', function () {
			editTransaction(transaction.id);
		});

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

function handleTransactionForm() {
	const form = document.getElementById('transaction-form');

	if (!form) {
		return;
	}

	const transactionType = getTransactionType();
	const dateInput = document.getElementById('date-input');
	const textInput = document.getElementById('text');
	const amountInput = document.getElementById('amount');

	updateTransactionPageText(transactionType);

	if (dateInput && !dateInput.value) {
		const today = new Date();
		dateInput.value = today.toISOString().slice(0, 16);
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();

		const amountValue = Number(amountInput.value);
		let finalAmount = amountValue;

		if (transactionType === 'expense') {
			finalAmount = -Math.abs(amountValue);
		} else {
			finalAmount = Math.abs(amountValue);
		}

		const transaction = {
			id: makeId(),
			date: dateInput.value,
			text: textInput.value.trim(),
			amount: finalAmount,
		};

		const transactions = getTransactions();
		transactions.push(transaction);
		saveTransactions(transactions);

		form.reset();
		window.location.href = 'history.html';
	});
}

updateSummaryOnPage();
renderTransactionHistory();
handleTransactionForm();
setupFilters();
