window.addEventListener('load',function(e)
{
  setTimer();
  //SELECTORS
    const dataArray = [];
    const form = document.querySelector('form');
    const error = document.querySelector('.error');
    
    // Focus effect for first input
    const firstInput = form.querySelector('input[name="description"]');
    firstInput.addEventListener('focus', onFocus);

      //Submit Event
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const description = e.currentTarget.elements.description.value.trim();
      const type = e.currentTarget.elements.type.value;
      const amount = e.currentTarget.elements.currency.value;

      //Data Object
      const transaction = {
        description,
        type,
        amount,
        key: Date.now()
      };

      // Validation
      if (description !== "" && type !== "" && amount !== "" && amount !== '0' && type !== 'type') {
        error.classList.add("d-none");
        newTransaction(transaction);
        updateTotalsDebit();
        form.reset();
      } else {
        error.classList.remove('d-none');
        error.classList.add('show');
      }
    });


    function onFocus(e) {
      error.classList.add("d-none");
      error.classList.remove('show');
    }

    // Add New Transaction To the DOM
    //Template 
    // Modal state for delete
    let pendingDelete = null;

    function newTransaction(transaction) {
      const newTransactions = document.querySelector('.transactions tbody');
      const template = `
        <tr class="${transaction.type} animate__animated animate__fadeIn">
          <td>${transaction.description}</td>
          <td><span class="badge badge-${transaction.type === 'debit' ? 'danger' : 'success'} text-uppercase">${transaction.type}</span></td>
          <td class="amount">$${parseFloat(transaction.amount).toFixed(2)}</td>
          <td class="tools">
            <button type="button" class="btn btn-sm btn-outline-danger delete" data-key="${transaction.key}" title="Delete"><i class="fa fa-trash-o"></i></button>
          </td>
        </tr>
      `;
      const docFragment = document.createRange().createContextualFragment(template);
      const newRow = docFragment.querySelector('tr');
      if (!newRow) {
        // Fallback: create row using DOM if template fails
        const fallbackRow = document.createElement('tr');
        fallbackRow.className = `${transaction.type} animate__animated animate__fadeIn`;
        fallbackRow.innerHTML = `
          <td>${transaction.description}</td>
          <td><span class="badge badge-${transaction.type === 'debit' ? 'danger' : 'success'} text-uppercase">${transaction.type}</span></td>
          <td class="amount">$${parseFloat(transaction.amount).toFixed(2)}</td>
          <td class="tools">
            <button type="button" class="btn btn-sm btn-outline-danger delete" data-key="${transaction.key}" title="Delete"><i class="fa fa-trash-o"></i></button>
          </td>
        `;
        dataArray.push(transaction);
        const deleteBtn = fallbackRow.querySelector('.delete');
        deleteBtn.addEventListener('click', function(e) {
          const key = parseInt(e.currentTarget.dataset.key);
          const removeIndex = dataArray.findIndex(item => item.key === key);
          if (removeIndex !== -1) {
            pendingDelete = {
              row: fallbackRow,
              index: removeIndex,
              isFallback: true
            };
            $('#deleteConfirmModal').modal('show');
          }
        });
        newTransactions.appendChild(fallbackRow);
        return;
      }
      const deleteBtn = newRow.querySelector('.delete');
      dataArray.push(transaction);
      deleteBtn.addEventListener('click', function(e) {
        const key = parseInt(e.currentTarget.dataset.key);
        const removeIndex = dataArray.findIndex(item => item.key === key);
        if (removeIndex !== -1) {
          pendingDelete = {
            row: newRow,
            index: removeIndex,
            isFallback: false
          };
          $('#deleteConfirmModal').modal('show');
        }
      });
      newTransactions.appendChild(newRow);
    }

    // Modal event handlers
    function setupDeleteModalHandlers() {
      const confirmBtn = document.getElementById('confirmDeleteBtn');
      const cancelBtn = document.getElementById('cancelDeleteBtn');
      if (confirmBtn && cancelBtn) {
        confirmBtn.addEventListener('click', function() {
          if (pendingDelete) {
            // Always re-find the row and index in case DOM/data changed
            const { row } = pendingDelete;
            // Find the key from the button in the row
            const deleteBtn = row.querySelector('.delete');
            if (!deleteBtn) { pendingDelete = null; $('#deleteConfirmModal').modal('hide'); return; }
            const key = parseInt(deleteBtn.dataset.key);
            // Find the latest index in dataArray and row in DOM
            const newTransactions = document.querySelector('.transactions tbody');
            const rows = Array.from(newTransactions.children);
            const realRow = rows.find(r => r.querySelector('.delete') && parseInt(r.querySelector('.delete').dataset.key) === key);
            const index = dataArray.findIndex(item => item.key === key);
            if (realRow && index !== -1) {
              realRow.classList.remove('animate__fadeIn');
              realRow.classList.add('animate__fadeOut');
              setTimeout(() => {
                if (realRow.parentNode) realRow.parentNode.removeChild(realRow);
                dataArray.splice(index, 1);
                updateTotalsDebit();
                pendingDelete = null;
              }, 500);
            }
            $('#deleteConfirmModal').modal('hide');
          }
        });
        cancelBtn.addEventListener('click', function() {
          pendingDelete = null;
        });
      }
    }

    // Ensure modal handlers are set up after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupDeleteModalHandlers);
    } else {
      setupDeleteModalHandlers();
    }

/* =========================================================================== */


/* ==================================CALCULATION=============================== */
    function updateTotalsDebit() {
        const totalDisplayDebit = document.querySelectorAll('.debits');
        const totalDisplayCredits = document.querySelectorAll('.credits');
        const calcObject = dataArray.reduce(function(calcObject, transaction) {
            if (transaction.type === 'debit') {
                calcObject.totalDebits += parseFloat(transaction.amount);
            } else if (transaction.type === 'credit') {
                calcObject.totalCredits += parseFloat(transaction.amount);
            }
            return calcObject;
        }, { totalDebits: 0, totalCredits: 0 });
        totalDisplayDebit.forEach(el => el.textContent = `$${calcObject.totalDebits.toFixed(2)}`);
        totalDisplayCredits.forEach(el => el.textContent = `$${calcObject.totalCredits.toFixed(2)}`);
    }
/* =========================================================================== */

   //Timer
   function setTimer()
   {
        let timerSet;


        window.onclick = timer;
        
        function timer()
        {
          clearTimeout(timerSet);
          timerSet = setTimeout(alertDialog, 200000);//200000

        }

        function alertDialog()
        {
          alert('Page will be refreshed');
          reloadPage();
        }

        function reloadPage()
        {
          window.location = self.location.href;
        }


   }
 
    
  /*=============Template========= */
  /*
        <table>
            <tr class="debit">
              <td>Tim Horton's</td>
              <td>debit</td>
              <td class="amount">$1.89</td>
              <td class="tools">
                <i class="delete fa fa-trash-o"></i>
              </td>
            </tr>
        </table> 
    */
  /*============================= */


  //Digital Clock

  function showTime(){
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    
    if(h == 0){
        h = 12;
    }
    
    if(h > 12){
        h = h - 12;
        session = "PM";
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
    
}

showTime();

})//END OF LOAD
