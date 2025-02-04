const init = () => {
  let inEditMode = false;
  let questions = [];
  let formData = {};
  let selectedQuestion = {
    id: '',
    question: '',
    answer: '',
    difficulty: ''
  }

  const message = document.getElementById("message");
  const list = document.getElementById("list");
  const form = document.getElementById("form");

  fetchQs();

  function renderList() {
    const questionList = questions.map(q => `
      <tr id="row-${q.id}">
        <td>${q.id}</td>
        <td class='td-hover' id="${q.id}">${q.question}</td>
          <td>${q.difficulty}</td>
             <td>
          <button type="button" name="edit" id="${q.id}"> O </button>
        </td>
        <td>
          <button type="button" name="del" id="${q.id}"> X </button>
        </td>
      </tr>
    `).join("");

    const listHtml = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Level</th>
            <th>Edit</th>
            <th>Del</th>
          </tr>
        </thead>
        <tbody>
          ${questionList}
        </tbody>
      </table>
    `;


    list.innerHTML = listHtml;

  }

  list.addEventListener('click', function (e) {
    if (e.target.classList.contains("td-hover")) {
      const { id } = e.target
      const foundQuestion = questions.find(q => q.id === id)
      document.getElementById('message').innerHTML = foundQuestion.answer
    }

  })


  function renderForm() {
    const formHtml = `
      <input type='text' id='question' name='question' placeholder='Question goes here...' />
           <input type='text' id='answer' name='answer' placeholder='Answer goes here...' />
           <select id='difficulty' name='difficulty'>
            <option value = '' selected disabled>Choose one...</option>
             <option value = 'easy'>Easy</option>
             <option value = 'medium'>Medium</option>
             <option value = 'hard'>Hard</option>
             <option value = 'impossible'>Impossible</option>
           </select>
      <button type='submit' class='submit' id='submit' name='submit'> Submit </button>
      <button type='button' id='clear' name='clear'> Clear </button>
    `;
    form.innerHTML = formHtml;

    const clearBtn = document.getElementById('clear')
    clearBtn.addEventListener('click', function (e) {
      if (e.target.id === 'clear') {
        clearForm()
      }
    })

    form.addEventListener('submit', handleSubmitClick)
  }

  list.addEventListener("click", function (e) {
    if (e.target.name === 'del') {
      const qId = e.target.id;
      deleteQs(qId);
    } else {
      if (e.target.name === 'edit') {
        inEditMode = true
        const qId = e.target.id;
        const obj = questions.find(q => q.id === qId)
        selectedQuestion = obj
        document.getElementById("question").value = obj.question
        document.getElementById("answer").value = obj.answer
        document.getElementById("difficulty").value = obj.difficulty
      }
    }
  });

  async function handleSubmitClick(e) {
    e.preventDefault();
    const qVal = document.getElementById("question").value;
    const aVal = document.getElementById("answer").value;
    const dVal = document.getElementById("difficulty").value;
    if (!inEditMode) {
      const newQuestion = {
        ...formData,
        question: qVal,
        answer: aVal,
        difficulty: dVal
      };
      await addQs(newQuestion);
      formData = newQuestion
    } else {
      const updatedQuestion = {
        ...selectedQuestion,
        id: selectedQuestion.id,
        question: qVal,
        answer: aVal,
        difficulty: dVal
      };
      await updateQs(updatedQuestion);
      selectedQuestion = updatedQuestion
    }
  }



  function clearForm() {
    document.getElementById("question").value = ''
    document.getElementById("answer").value = ''
    document.getElementById("difficulty").value = ''
    document.getElementById("message").textContent = ''
  }


  async function fetchQs() {
    try {
      const r = await fetch("http://localhost:3000/questions");
      if (!r.ok) {
        throw new Error("Bad response from server");
      }
      const data = await r.json();
      questions = data
      renderList();
      renderForm();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteQs(qId) {
    try {
      console.log("Trying to delete ID:", qId);

      const r = await fetch(`http://localhost:3000/questions/${qId}`, {
        method: "DELETE",
      });

      if (!r.ok) {
        throw new Error(`Delete failed: ${r.status} ${r.statusText}`);
      }


      await fetchQs()
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  }

  async function updateQs(question) {
    const qId = question.id
    try {
      console.log("Trying to update ID:", qId);
      const r = await fetch(`http://localhost:3000/questions/${qId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question)
      });
      if (!r.ok) {
        throw new Error(`Update failed: ${r.status} ${r.statusText}`);
      }
      await fetchQs()
    } catch (error) {
      console.error("Error updating question:", error);
    }
  }

  async function addQs(newQ) {
    try {
      const r = await fetch("http://localhost:3000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQ),
      });

      if (!r.ok) {
        throw new Error(`POST failed: ${r.status} ${r.statusText}`);
      }
      await fetchQs();
    } catch (error) {
      console.error(error);
    }
  }


};



window.addEventListener("DOMContentLoaded", init);
