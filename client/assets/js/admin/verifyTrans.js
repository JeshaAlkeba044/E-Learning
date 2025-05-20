document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:3000';
    const transactionContainer = document.getElementById('transactionContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'yellow';
            case 'verified': return 'green';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const verifyTransaction = async (transactionId) => {
        const confirmVerify = confirm('Yakin ingin memverifikasi transaksi ini?');
        if (!confirmVerify) return;

        try {
            const response = await fetch(`${apiBaseUrl}/admin/payment/${transactionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                alert('Transaksi berhasil diverifikasi!');
                await fetchTransactions();
            } else {
                alert(`Gagal memverifikasi transaksi: ${data.message}`);
            }
        } catch (error) {
            console.error('Error verifying transaction:', error);
            alert('Terjadi kesalahan saat memverifikasi transaksi.');
        }
    };

    const fetchTransactions = async () => {
        loadingIndicator.style.display = 'flex';

        try {
            const response = await fetch(`${apiBaseUrl}/admin/pendingPayment`);
            const data = await response.json();

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
        } catch (error) {
            console.error('Error fetching transactions:', error);
            transactionContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Terjadi Kesalahan</h3>
                    <p>Gagal memuat data transaksi. Silakan coba lagi nanti.</p>
                </div>
            `;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    const displayTransactions = (transactions) => {
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

        transactions.forEach((transaction) => {
            const statusClass = getStatusClass(transaction.status);
            const formattedDate = formatDate(transaction.transaction_date);
            const formattedAmount = formatCurrency(transaction.amount);
            const fullName = `${transaction.user.firstName} ${transaction.user.lastName}`;
            const courseTitle = transaction.course?.title || 'Kursus tidak ditemukan';

            html += `
                <div class="trans-card ${statusClass}">
                    <div class="trans-content">
                        <p class="newLearner">Pembayaran oleh: ${fullName}</p>
                        <p class="bill">Pembayaran kursus <strong>${courseTitle}</strong> senilai ${formattedAmount}</p>
                        <p class="payment-method">Metode: ${transaction.payment_method}</p>
                        <div class="payment-time">
                            <span><div class="icon icon-time"></div> ${formattedDate}</span>
                        </div>
                        ${transaction.status === 'pending' ? `
                            <div class="action-buttons">
                                <button class="enroll-btn" onclick="verifyTransaction('${transaction.id_transaction}')">Verifikasi</button>
                            </div>` : ''}
                    </div>
                </div>
            `;
        });

        transactionContainer.innerHTML = html;
    };

    window.verifyTransaction = verifyTransaction;

    fetchTransactions();

    setTimeout(() => {
        if (loadingIndicator.style.display !== 'none') {
            displayTransactions([]);
        }
    }, 3000);
});
