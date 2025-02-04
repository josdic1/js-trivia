const init = () => {
  let questions = [];
  let formData = {};

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
            <th>Del</th>
          </tr>
        </thead>
        <tbody>
          ${questionList}
        </tbody>
      </table>
    `;

    list.addEventListener('click', function (e) {
      if (e.target.classList.contains("td-hover")) {
        const { id } = e.target
        const foundQuestion = questions.find(q => q.id === id)
        document.getElementById(id).tex

      } else {
        console.log('no')
      }

    })

    list.innerHTML = listHtml;





  }

  function renderForm() {
    const formHtml = `
      <input type='text' id='question' name='question' placeholder='Question goes here...' />
           <input type='text' id='answer' name='answer' placeholder='Answer goes here...' /><br>
           <select id='difficulty' name='difficulty'>
            <option value = '' selected disabled>Choose one...</option>
             <option value = 'easy'>Easy</option>
             <option value = 'medium'>Medium</option>
             <option value = 'hard'>Hard</option>
             <option value = 'impossible'>Impossible</option>
           </select>
      <button type='submit' id='submit' name='submit'> Submit </button>
    `;
    form.innerHTML = formHtml;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const qVal = document.getElementById("question").value;
      const aVal = document.getElementById("answer").value;
      const dVal = document.getElementById("difficulty").value;
      formData = {
        ...formData,
        question: qVal,
        answer: aVal,
        difficulty: dVal
      };
      await addQs(formData);
    });

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

  list.addEventListener("click", function (e) {
    if (e.target.name === 'del') {
      const qId = e.target.id;
      deleteQs(qId);
    }
  });
};

window.addEventListener("DOMContentLoaded", init);
