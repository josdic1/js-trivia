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
  const form = document.getElementById("form");
  const filter = document.getElementById("filter");
  const list = document.getElementById("list");

  fetchQs();




  function renderList(listData) {
    const questionList = listData.map(question => `
      <tr>
        <td>${question.id}</td>
        <td class='td-hover' id="${question.id}">${question.question}</td>
        <td>${question.difficulty}</td>
        <td><button type='button' id="${question.id}" name="edit">Edit</button></td>
        <td><button type='button' id="${question.id}" name="del">Del</button></td>
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

    list.addEventListener('click', function (e) {
      if (e.target.classList.contains("td-hover")) {
        const { id } = e.target
        const questionMatch = questions.find(q => q.id === id)
        message.textContent = questionMatch.answer
      }
    })

  }



  function renderFilter() {
    const filterHtml =
      `<p>
        <label>Filter by: </label>
        <input type='text' id="textFilter" name='textFilter'  class="filter-input" placeholder='Text match...'>
            <select id='selectFilter' name='selectFilter' class="filter-input" >
            <option value = 'all' selected disabled>Difficulty...</option>
             <option value = 'easy'>Easy</option>
             <option value = 'medium'>Medium</option>
             <option value = 'hard'>Hard</option>
             <option value = 'impossible'>Impossible</option>
           </select>
           <button type='button' id='clearFilter'> Reset </button>
        </p>`


    filter.innerHTML = filterHtml

    document.getElementById('textFilter').addEventListener('input', updateFilter)

    document.getElementById('selectFilter').addEventListener('change', updateFilter)

    document.getElementById('clearFilter').addEventListener('click', clearFilter)

  }

  let filterValue = {
    textFilter: '',
    selectFilter: 'all'
  }

  let filteredList = []
  function updateFilter(e) {
    const { id, value } = e.target;
    filterValue = {
      ...filterValue,
      [id]: value
    };

    filteredList = questions.filter(q =>
      q.question.toLowerCase().includes(filterValue.textFilter.toLowerCase()) &&
      (filterValue.selectFilter === "all" || q.difficulty === filterValue.selectFilter)
    );

    renderList(filteredList);
  }




  function clearFilter() {
    document.getElementById('textFilter').value = ''
    document.getElementById('selectFilter').value = 'all'

    filterValue = {
      textFilter: '',
      selectFilter: 'all'
    }

    filteredList = [...questions]
    renderList(questions)
  }


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
    const qId = e.target.id;

    if (e.target.name === 'del') {
      deleteQs(qId);
    } else if (e.target.name === 'edit') {
      inEditMode = true;
      message.textContent = "⚠️ Edit Mode";
      const obj = questions.find(q => q.id === qId);
      selectedQuestion = obj;

      document.getElementById("question").value = obj.question;
      document.getElementById("answer").value = obj.answer;
      document.getElementById("difficulty").value = obj.difficulty;
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
    clearForm()
  }

  function clearForm() {
    document.getElementById("question").value = ''
    document.getElementById("answer").value = ''
    document.getElementById("difficulty").value = ''
    document.getElementById("message").textContent = ''
    inEditMode = false
  }


  async function fetchQs() {
    try {
      const r = await fetch("http://localhost:3000/questions");
      if (!r.ok) {
        throw new Error("Bad response from server");
      }
      const data = await r.json();
      questions = data
      renderList(data);
      renderForm();
      renderFilter();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteQs(qId) {
    try {
      // console.log("Trying to delete ID:", qId);

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
      // console.log("Trying to update ID:", qId);
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
