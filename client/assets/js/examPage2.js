document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('exam-form');
    const questionList = document.getElementById('question-list');
    const finishBtn = document.getElementById('finish-btn');

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const question = document.getElementById('question').value;
      const optionA = document.getElementById('optionA').value;
      const optionB = document.getElementById('optionB').value;
      const optionC = document.getElementById('optionC').value;
      const optionD = document.getElementById('optionD').value;
      const correct = document.getElementById('correct').value.toUpperCase();

      const questionCard = document.createElement('div');
      questionCard.className = 'form-section';

      questionCard.innerHTML = `
        <p><strong>Question:</strong> <span class="text">${question}</span></p>
        <ul style="list-style: none;">
          <li>A. <span class="text">${optionA}</span></li>
          <li>B. <span class="text">${optionB}</span></li>
          <li>C. <span class="text">${optionC}</span></li>
          <li>D. <span class="text">${optionD}</span></li>
        </ul>
        <p><strong>Correct Answer:</strong> <span class="text">${correct}</span></p>
        <div class="btn-group">
          <button class="edit-question-btn">Update</button>
          <button class="delete-question-btn">Delete</button>
        </div>
      `;

      questionList.appendChild(questionCard);
        
      if (questionList.children.length > 0) {
        finishBtn.style.display = 'inline-block';
      }

      form.reset();
    });

    questionList.addEventListener('click', function(e) {
      const card = e.target.closest('.form-section');
      if (e.target.classList.contains('delete-question-btn')) {
        card.remove();
        if (questionList.children.length === 0) {
            finishBtn.style.display = 'none';
        }
      } else if (e.target.classList.contains('edit-question-btn')) {
        const spans = card.querySelectorAll('.text');
        const [q, a, b, c, d, correct] = spans;

        document.getElementById('question').value = q.innerText;
        document.getElementById('optionA').value = a.innerText;
        document.getElementById('optionB').value = b.innerText;
        document.getElementById('optionC').value = c.innerText;
        document.getElementById('optionD').value = d.innerText;
        document.getElementById('correct').value = correct.innerText;

        card.remove(); 
      }
    });

    finishBtn.addEventListener('click', () => {
        alert('Exam berhasil ditambahkan!');
    });
});