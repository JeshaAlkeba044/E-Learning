document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/dashboardSummary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      console.log("jkhkjhkjgiug", result);

      if (result.success) {
        const { totalCourses, totalLearners, totalTransactions } = result.data;

        // Masukin ke elemen HTML
        document.getElementById("totalCourses").textContent = totalCourses;
        document.getElementById("totalLearners").textContent = totalLearners;
        document.getElementById("totalTransactions").textContent = totalTransactions;
      } else {
        console.error("Gagal ambil data dashboard:", result.message);
      }
    } catch (err) {
      console.error("Error saat fetch data dashboard:", err);
    }
});