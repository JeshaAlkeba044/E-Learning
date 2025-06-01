document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.querySelector('.verification-list');

    const fetchUnverifiedTutors = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/unverifiedTutor'); 
            if (!response.ok) throw new Error('Gagal fetch tutor');

            const result = await response.json();

            const tutors = result.data || [];

            console.log(tutors);

            listContainer.innerHTML = '';

            if (tutors.length === 0) {
                listContainer.innerHTML = '<p style="color: #888888;">Belum ada tutor yang harus diverifikasi</p>';
                return;
            }

            tutors.forEach(tutor => {
                console.log("Tutor: ",tutor);
                const card = document.createElement('div');
                card.classList.add('verification-card');
                card.innerHTML = `
                <img src="http://localhost:3000${tutor.photo_path}" alt="${tutor.firstName}" class="verification-image" />
                <div class="verification-info">
                    <h3 class="verification-name">${tutor.firstName} ${tutor.lastName}</h3>
                    <p class="verification-subject">${tutor.subjects || '-'}</p>
                </div>
                <button class="verify-btn" data-id="${tutor.id_user}">Verifikasi</button>
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
            const response = await fetch(`http://localhost:3000/api/admin/verifyTutor/${tutorId}`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Verifikasi gagal');

            alert('Tutor berhasil diverifikasi! 🎉');
            cardElement.remove();
        } catch (error) {
            console.error('Verifikasi gagal:', error);
            alert('Terjadi kesalahan saat memverifikasi tutor');
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

    fetchUnverifiedTutors();
});
