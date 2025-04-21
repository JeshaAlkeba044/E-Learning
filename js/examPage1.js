document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('exam-form');
    const submitBtn = document.getElementById('submit-btn');
    const manageButtons = document.getElementById('manage-buttons');
  
    let isCreated = false;
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      isCreated = true;
      submitBtn.style.display = 'none';
      manageButtons.style.display = 'block';
    });
  
    document.getElementById('edit-exam-btn').addEventListener('click', () => {
      submitBtn.style.display = 'inline-block';
      manageButtons.style.display = 'none';
    });
  
    document.getElementById('delete-exam-btn').addEventListener('click', () => {
      window.location.href = 'exam-list.html';
    });
  
    document.getElementById('add-question-btn').addEventListener('click', () => {
      window.location.href = 'examPage2.html';
    });
  });
  