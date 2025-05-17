document.addEventListener('DOMContentLoaded', function() {
    const apiBaseUrl = 'http://localhost:3000'; // Base URL backend kamu
    const transactionContainer = document.getElementById('transactionContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    function getStatusClass(status) {
        switch(status) {
            case 'pending': return 'yellow';
            case 'verified': return 'green';
            default: return '';
        }
    }

    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    }

    function verifyTransaction(transactionId) {
        if (confirm('Yakin ingin memverifikasi transaksi ini?')) {
            fetch(`${apiBaseUrl}/payment/${transactionId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Transaksi berhasil diverifikasi!');
                    fetchTransactions(); // Refresh list
                } else {
                    alert('Gagal memverifikasi transaksi: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat memverifikasi transaksi');
            });
        }
    }

    function fetchTransactions() {
        loadingIndicator.style.display = 'flex';

        fetch(`${apiBaseUrl}/payment`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayTransactions(data.data);
                } else {
                    transactionContainer.innerHTML = `
                        <div class="empty-state">
                            <h3>Terjadi Kesalahan</h3>
                            <p>${data.message || 'Gagal memuat data transaksi.'}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                transactionContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>Terjadi Kesalahan</h3>
                        <p>Gagal memuat data transaksi. Silakan coba lagi nanti.</p>
                    </div>
                `;
            })
            .finally(() => {
                loadingIndicator.style.display = 'none';
            });
    }

    function displayTransactions(transactions) {
        if (!transactions || transactions.length === 0) {
            transactionContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Tidak Ada Transaksi</h3>
                    <p>Belum ada transaksi yang perlu diverifikasi saat ini.</p>
                </div>
            `;
            return;
        }

        let html = '';

        // For demo purposes, we'll create sample transactions if API fails
        if (!transactions || transactions.length === 0) {
            transactions = [
                {
                    id: 'TRX-001',
                    user: 'Budi Santoso',
                    amount: 500000,
                    type: 'top-up',
                    method: 'Bank Transfer',
                    transaction_date: new Date().toISOString(),
                    status: 'pending'
                },
                {
                    id: 'TRX-002',
                    user: 'Dewi Lestari',
                    amount: 750000,
                    type: 'pembayaran',
                    method: 'E-Wallet',
                    transaction_date: new Date().toISOString(),
                    status: 'pending'
                },
                {
                    id: 'TRX-003',
                    user: 'Ahmad Reza',
                    amount: 1200000,
                    type: 'top-up',
                    method: 'Bank Transfer',
                    transaction_date: new Date().toISOString(),
                    status: 'verified'
                }
            ];
        }

        transactions.forEach(transaction => {
            const statusClass = getStatusClass(transaction.status);
            const formattedDate = formatDate(transaction.transaction_date || transaction.date);
            const formattedAmount = formatCurrency(transaction.amount);

            const transactionTypeText = transaction.type === 'top-up'
                ? `Top-up saldo ${formattedAmount}`
                : `Pembayaran kursus ${formattedAmount}`;

            const buttonsHtml = transaction.status === 'pending' ? `
                <div class="action-buttons">
                    <button class="enroll-btn" onclick="verifyTransaction('${transaction.id_transaction || transaction.id}')">Verifikasi</button>
                </div>
            ` : '';

            html += `
                <div class="trans-card ${statusClass}">
                    <div class="trans-content">
                        <h3>Transaksi #${transaction.id_transaction || transaction.id}</h3>
                        <p class="newLearner">Pembayaran oleh: ${transaction.user?.name || transaction.user}</p>
                        <p class="bill">${transactionTypeText}</p>
                        <p class="payment-method">Metode: ${transaction.method}</p>
                        <div class="payment-time">
                            <span><div class="icon icon-time"></div> ${formattedDate}</span>
                        </div>
                        ${buttonsHtml}
                    </div>
                </div>
            `;
        });

        transactionContainer.innerHTML = html;
    }

    window.verifyTransaction = verifyTransaction;
    fetchTransactions();
    
    // For demo purposes, show sample data if API is not available
    setTimeout(() => {
        if (document.getElementById('loadingIndicator').style.display !== 'none') {
            displayTransactions([]);
        }
    }, 3000);
});
