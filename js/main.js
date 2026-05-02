window.addEventListener('load', function () {
	const STORAGE_KEY = 'transactions';
	const IDLE_MS = 200000;

	const dataArray = [];
	const form = document.querySelector('form.frm-transactions');
	const error = document.querySelector('.error');
	const tbody = document.querySelector('.transactions tbody');
	const transactionsCard = document.querySelector('.transactions-card');
	const balanceEl = document.querySelector('.balance');
	const creditsEl = document.querySelector('.credits');
	const debitsEl = document.querySelector('.debits');

	let pendingDelete = null;

	const deleteModalEl = document.getElementById('deleteConfirmModal');
	const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
	const idleToastEl = document.getElementById('idleToast');
	const idleToast = bootstrap.Toast.getOrCreateInstance(idleToastEl, { autohide: true, delay: 6000 });

	form.querySelector('input[name="description"]').addEventListener('focus', clearError);

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		const description = form.elements.description.value.trim();
		const type = form.elements.type.value;
		const amount = form.elements.currency.value;

		if (description === '' || (type !== 'debit' && type !== 'credit') || amount === '' || parseFloat(amount) <= 0) {
			showError();
			return;
		}

		clearError();

		const transaction = {
			description,
			type,
			amount,
			key: Date.now()
		};

		dataArray.push(transaction);
		renderTransactionRow(transaction);
		saveTransactions();
		updateTotals();
		updateEmptyState();
		form.reset();
	});

	function showError() {
		error.classList.remove('d-none');
	}

	function clearError() {
		error.classList.add('d-none');
	}

	function renderTransactionRow(transaction) {
		const tr = document.createElement('tr');
		tr.className = `${transaction.type} animate-fade-in`;
		tr.dataset.key = String(transaction.key);
		tr.innerHTML = `
			<td>${escapeHtml(transaction.description)}</td>
			<td><span class="type-pill ${transaction.type}">${transaction.type}</span></td>
			<td class="amount ${transaction.type}-amount">${transaction.type === 'debit' ? '-' : '+'}$${parseFloat(transaction.amount).toFixed(2)}</td>
			<td class="tools">
				<button type="button" class="btn-row-delete" data-key="${transaction.key}" title="Delete" aria-label="Delete transaction">
					<i class="fa-solid fa-trash"></i>
				</button>
			</td>
		`;

		tr.querySelector('.btn-row-delete').addEventListener('click', function (e) {
			const key = parseInt(e.currentTarget.dataset.key, 10);
			const index = dataArray.findIndex(item => item.key === key);
			if (index !== -1) {
				pendingDelete = { row: tr, key };
				deleteModal.show();
			}
		});

		tbody.appendChild(tr);
	}

	function saveTransactions() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(dataArray));
		} catch (err) {
			// localStorage unavailable (private mode, quota) — silently ignore
		}
	}

	function loadTransactions() {
		let saved = null;
		try {
			saved = localStorage.getItem(STORAGE_KEY);
		} catch (err) {
			return;
		}
		if (!saved) return;
		try {
			const parsed = JSON.parse(saved);
			if (!Array.isArray(parsed)) return;
			parsed.forEach(t => {
				if (t && typeof t.description === 'string' && (t.type === 'debit' || t.type === 'credit') && t.amount !== undefined && t.key !== undefined) {
					dataArray.push(t);
					renderTransactionRow(t);
				}
			});
		} catch (err) {
			// Corrupt JSON — ignore and start fresh
		}
	}

	function updateTotals() {
		const totals = dataArray.reduce(function (acc, t) {
			const value = parseFloat(t.amount) || 0;
			if (t.type === 'debit') acc.debits += value;
			else if (t.type === 'credit') acc.credits += value;
			return acc;
		}, { debits: 0, credits: 0 });

		const balance = totals.credits - totals.debits;

		creditsEl.textContent = formatCurrency(totals.credits);
		debitsEl.textContent = formatCurrency(totals.debits);
		balanceEl.textContent = formatCurrency(balance);

		balanceEl.classList.toggle('is-positive', balance > 0);
		balanceEl.classList.toggle('is-negative', balance < 0);
	}

	function updateEmptyState() {
		transactionsCard.classList.toggle('is-empty', dataArray.length === 0);
	}

	function formatCurrency(n) {
		const sign = n < 0 ? '-' : '';
		return `${sign}$${Math.abs(n).toFixed(2)}`;
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	// Delete modal handlers
	document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
		if (!pendingDelete) {
			deleteModal.hide();
			return;
		}
		const { row, key } = pendingDelete;
		const index = dataArray.findIndex(item => item.key === key);
		if (index !== -1 && row && row.parentNode) {
			row.classList.remove('animate-fade-in');
			row.classList.add('animate-fade-out');
			setTimeout(function () {
				if (row.parentNode) row.parentNode.removeChild(row);
				dataArray.splice(index, 1);
				saveTransactions();
				updateTotals();
				updateEmptyState();
			}, 350);
		}
		pendingDelete = null;
		deleteModal.hide();
	});

	document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
		pendingDelete = null;
	});

	// Idle timer — show a gentle toast instead of alert + reload
	let idleTimer;
	function resetIdleTimer() {
		clearTimeout(idleTimer);
		idleTimer = setTimeout(function () {
			idleToast.show();
		}, IDLE_MS);
	}
	window.addEventListener('click', resetIdleTimer);
	window.addEventListener('keydown', resetIdleTimer);
	resetIdleTimer();

	// Clock
	function showTime() {
		const date = new Date();
		let h = date.getHours();
		let m = date.getMinutes();
		let s = date.getSeconds();
		let session = h >= 12 ? 'PM' : 'AM';
		if (h === 0) h = 12;
		else if (h > 12) h -= 12;
		const hh = h < 10 ? '0' + h : h;
		const mm = m < 10 ? '0' + m : m;
		const ss = s < 10 ? '0' + s : s;
		const clockEl = document.getElementById('MyClockDisplay');
		if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss} ${session}`;
		setTimeout(showTime, 1000);
	}
	showTime();

	// Initial hydration
	loadTransactions();
	updateTotals();
	updateEmptyState();
});
