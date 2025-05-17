document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('transactionContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const fetchTutors = async () => {
        loadingIndicator.style.display = 'block';

        try {
        const response = await fetch('http://localhost:3000/api/getTutors');
        if (!response.ok) throw new Error('Fetch gagal');

        const tutors = await response.json();
        loadingIndicator.style.display = 'none';
        container.innerHTML = '';

        if (tutors.length === 0) {
            container.innerHTML = `
            <div class="empty-state">
                <h3>Data Kosong</h3>
                <p>Belum ada tutor yang terdaftar.</p>
            </div>
            `;
            return;
        }

        tutors.forEach(tutor => {
            const card = document.createElement('div');
            card.classList.add('tutor-card');
            card.innerHTML = `
            <h3>${tutor.name || 'Tanpa Nama'}</h3>
            <p>Email: ${tutor.email || '-'}</p>
            <p>Role: Tutor</p>
            <button class="delete-btn" data-id="${tutor.id}">🗑️ Hapus</button>
            `;
            container.appendChild(card);
        });

        } catch (error) {
        console.error('Gagal memuat data tutor:', error);
        loadingIndicator.style.display = 'none';
        container.innerHTML = `
            <div class="empty-state">
            <h3>Terjadi Kesalahan</h3>
            <p>Gagal memuat list Tutor. Silakan coba lagi nanti.</p>
            </div>
        `;
        }
    };

    const deleteTutor = async (tutorId, cardElement) => {
        const confirmDelete = confirm("Yakin ingin menghapus tutor ini? Aksi ini tidak bisa dibatalkan 🥺");
        if (!confirmDelete) return;

        try {
        const response = await fetch(`http://localhost:3000/deteleTutors/${tutorId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Gagal menghapus tutor');

        alert("Tutor berhasil dihapus ✅");
        cardElement.remove();
        } catch (error) {
        console.error("Gagal menghapus tutor:", error);
        alert("Terjadi kesalahan saat menghapus tutor 😣");
        }
    };

    container.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
        const btn = e.target;
        const tutorId = btn.getAttribute('data-id');
        const card = btn.closest('.tutor-card');
        await deleteTutor(tutorId, card);
        }
    });

    fetchTutors();
});
