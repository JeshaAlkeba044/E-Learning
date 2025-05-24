document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('transactionContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const listContainer = document.querySelector('.tutor-list');

    const fetchTutors = async () => {
    try {
        const response = await fetch('http://localhost:3000/admin/allTutors');
        if (!response.ok) throw new Error('Gagal fetch tutor');

        const result = await response.json();
        const tutors = result.data || result || []; // fallback kalau ga pakai `.data`

        listContainer.innerHTML = '';

        if (tutors.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Empty Data</h3>
                    <p>Belum ada tutor yang terdaftar.</p>
                </div>
            `;
            return;
        }

        tutors.forEach(tutor => {
            const name = `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim();
            const card = document.createElement('div');
            card.classList.add('tutor-card');
            card.innerHTML = `
                <img src="../../img/${tutor.photo_path}" alt="${name || 'Tanpa Nama'}" class="tutor-image" />
                <div class="tutor-info">
                    <h3>${name || 'Tanpa Nama'}</h3>
                    <p><strong>Email:</strong> ${tutor.email || '-'}</p>
                    <p><strong>Telepon:</strong> ${tutor.phoneNumber || '-'}</p>
                    <p><strong>Bio:</strong> ${tutor.bio || '-'}</p>
                    <p><strong>Spesialisasi:</strong> ${tutor.specialization || '-'}</p>
                    <p><strong>YoE:</strong> ${tutor.YoE || '-'}</p>
                    <p><strong>Link Portofolio:</strong> <a href="${tutor.linkPorto}" target="_blank">${tutor.linkPorto || '-'}</a></p>
                    <button class="delete-btn" data-id="${tutor.id}">🗑️ Hapus</button>
                </div>
            `;
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Gagal mengambil data tutor:', error);
        listContainer.innerHTML = `
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
