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
        <td>${q.question}</td>
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

    list.innerHTML = listHtml;
  }

  function renderForm() {
    const formHtml = `
      <input type='text' id='question' name='question' placeholder='Question goes here...' />
      <button type='submit' id='submit' name='submit'> Submit </button>
    `;
    form.innerHTML = formHtml;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const qVal = document.getElementById("question").value;

      formData = { question: qVal };
      await addQs(formData);
    });
  }

  async function fetchQs() {
    try {
      const r = await fetch("http://localhost:3000/questions");
      if (!r.ok) {
        throw new Error("Bad response from server");
      }
      questions = await r.json();
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
