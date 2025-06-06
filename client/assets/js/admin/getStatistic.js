// assets/js/admin/getStatistic.js
let revenueChart, transactionsChart;

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('refreshData')?.addEventListener('click', refreshData);
});

function initCharts(revenueData, transactionsData) {
    // Destroy existing charts if they exist
    if (revenueChart) revenueChart.destroy();
    if (transactionsChart) transactionsChart.destroy();

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Pendapatan Bulanan (Rp Juta)',
                    data: revenueData || [2.5, 3.8, 4.1, 8.1, 12.6],
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: '#4361ee',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4361ee',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    // Transactions Chart
    const transactionsCtx = document.getElementById('transactionsChart')?.getContext('2d');
    if (transactionsCtx) {
        transactionsChart = new Chart(transactionsCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Jumlah Transaksi',
                    data: transactionsData || [25, 42, 55, 85, 105],
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: '#f44336',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }
}

function refreshData() {
    // Simulate data refresh
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading';
    loadingMessage.innerHTML = '<span></span><span></span><span></span>';
    
    const transactionsTable = document.getElementById('transactionsTable');
    const parent = transactionsTable?.parentNode;
    
    if (transactionsTable && parent) {
        transactionsTable.style.display = 'none';
        parent.appendChild(loadingMessage);
        
        setTimeout(() => {
            parent.removeChild(loadingMessage);
            transactionsTable.style.display = 'table';
            
            // Show refresh notification
            alert('Data berhasil diperbarui!');
        }, 1500);
    }
}