document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.querySelector('.verification-list');

    const fetchUnverifiedTutors = async () => {
        try {
        const response = await fetch('http://localhost:3000/admin/unverifiedTutor'); // ganti sesuai endpoint kamu
        if (!response.ok) throw new Error('Gagal fetch tutor');

        const data = await response.json();
        listContainer.innerHTML = '';

        if (data.length === 0) {
            listContainer.innerHTML = '<p>Tidak ada tutor yang perlu diverifikasi saat ini 💤</p>';
            return;
        }

        data.forEach(tutor => {
            const card = document.createElement('div');
            card.classList.add('verification-card');
            card.innerHTML = `
            <img src="/api/placeholder/80/80" alt="${tutor.name}" class="verification-image" />
            <div class="verification-info">
                <h3 class="verification-name">${tutor.name}</h3>
                <p class="verification-subject">${tutor.subjects || '-'}</p>
            </div>
            <button class="verify-btn" data-id="${tutor.id}">Verifikasi</button>
            `;
            listContainer.appendChild(card);
        });
        } catch (error) {
        console.error('Gagal mengambil data tutor:', error);
        listContainer.innerHTML = '<p style="color:red;">Gagal memuat data tutor</p>';
        }
    };

    const verifyTutor = async (tutorId, cardElement) => {
        try {
        const response = await fetch(`http://localhost:3000/verifyTutor${tutorId}/`, {
            method: 'PATCH'
        });

        if (!response.ok) throw new Error('Verifikasi gagal');

        alert('Tutor berhasil diverifikasi! 🎉');
        cardElement.remove();
        } catch (error) {
        console.error('Verifikasi gagal:', error);
        alert('Terjadi kesalahan saat memverifikasi tutor 😢');
        }
    };

    listContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('verify-btn')) {
        const btn = e.target;
        const tutorId = btn.getAttribute('data-id');
        const card = btn.closest('.verification-card');

        await verifyTutor(tutorId, card);
        }
    });

    // Load tutors saat halaman siap
    fetchUnverifiedTutors();
});
