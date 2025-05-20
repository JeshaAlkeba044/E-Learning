document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('transactionContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const fetchTutors = async () => {
        loadingIndicator.style.display = 'block';

        try {
        const response = await fetch('http://localhost:3000/admin/allTutors');
        if (!response.ok) throw new Error('Fetch gagal');

        const tutors = await response.json();
        loadingIndicator.style.display = 'none';
        container.innerHTML = '';

        if (tutors.length === 0) {
            container.innerHTML = `
            <div class="empty-state">
                <h3>Empty Data</h3>
                <p>Belum ada tutor yang terdaftar.</p>
            </div>
            `;
            return;
        }

        tutors.forEach(tutor => {
            const card = document.createElement('div');
            const name = (tutor.firstName || '') + ' ' + (tutor.lastName || '');
            card.classList.add('tutor-card');
            card.innerHTML = `
            <img src="../../img/${tutor.photo_path}" alt="${tutor.name}" class="tutor-image" />
            <h3>${name.trim() || 'Tanpa Nama'}</h3>
            <p>Email: ${tutor.email || '-'}</p>
            <p>Nomor Telepon: ${tutor.phoneNumber || '-'}</p>
            <p>Bio: ${tutor.bio || '-'}</p>
            <p>Specilization: ${tutor.specialization || '-'}</p>
            <p>YoE: ${tutor.YoE || '-'}</p>
            <p>Link Porto: ${tutor.linkPorto || '-'}</p>
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
