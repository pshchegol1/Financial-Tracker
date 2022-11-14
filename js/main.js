window.addEventListener('load',function(e)
{
  setTimer();
  //SELECTORS
    const dataArray = [];
    const form = document.querySelector('form');
    const error = document.querySelector('.error');
    
    console.log(form,error);
    
      /*==============FOCUS========== */
    const d = document.querySelector('.frm-control');
    d.addEventListener('focus',onFocus)
      /*============================= */

      //Submit Event
    form.addEventListener('submit',function(e)
    {
        const description = e.currentTarget.elements.description.value;
        const type = e.currentTarget.elements.type.value;
        const amount =  e.currentTarget.elements.currency.value;

        // //? Clear Input Fields Selector First option
        // const inputs =  document.querySelectorAll('[name="description"], [name="type"], [name="currency"]');
      
        // console.log(description,type,amount);
        // inputs.forEach(input => {
        //   input.value = '';
        // });

        //? Second Option to clear all input fields after submit : form.reset();

        //Data Object
        const transaction = 
        {
          description,
          type,
          amount,
          key: Date.now()
          
        };
        /*==============VALIDATION========== */

        let valDescription = description;
        let valType = type;
        let valAmount = amount;

        if(valDescription !== "" && valType !== "" && valAmount !== "" && valAmount !== '0' && valType !== 'type')
        {
            console.log('Success!');
            error.classList.add("hide");
            newTransaction(transaction)
            updateTotalsDebit()


            
            
            
        }
        else
        {
            console.log('Fail!');
            error.classList.remove('hide');
        }
        /*======END OF==VALIDATION========== */
      
        e.preventDefault();
        form.reset();


        
        
    })//END OF SUBMIT EVENT


    function onFocus(e) 
    {
        
        error.classList.add("hide");
        /* e.currentTarget.removeEventListener("click", onFocus); */
    }

    // Add New Transaction To the DOM
    //Template 
   function newTransaction(transaction)
   {
      const newTransactions = document.querySelector('.transactions tbody');
      const template  = 
      `
        <table class="transaction">
            <tr class="${transaction.type}">
              <td>${transaction.description}</td>
              <td>${transaction.type}</td>
              <td class="amount">${transaction.amount}</td>
              <td class="tools">
                <i class="delete fa fa-trash-o" data-key="${transaction.key}"></i>
              </td>
            </tr>
        </table> 
      `
      const docFragment = document.createRange().createContextualFragment(template);
      const newTransaction = docFragment.querySelector('tr');
      const deleteIcon = newTransaction.querySelector('.delete');
      

      

      dataArray.push(transaction);
      

/* ==============================REMOVE===================================== */
      //Remove Event
      deleteIcon.addEventListener('click',function(e)
      {
        console.log(e.currentTarget.dataset.key, transaction.key)
        //remove action
        const removeTransaction = dataArray.find(function(item, index)
        {
          if(item.key === parseInt(e.currentTarget.dataset.key))
          {
            
            item.index = index;
            console.log(item);
            return item
          }
        })

        confirm("Are you sure You want to Delete this Transaction?")

        // data array
       

         // remove from the dom
        newTransactions.removeChild(newTransactions.children[removeTransaction.index])
         dataArray.splice(removeTransaction.index, 1)
        updateTotalsDebit()
       
      })//end of remove
      newTransactions.appendChild(newTransaction);
       
   }//END of newTransaction

/* =========================================================================== */


/* ==================================CALCULATION=============================== */
   function updateTotalsDebit()
   {
     const totalDisplayDebit = document.querySelectorAll('.debits');
     const totalDisplayCredits = document.querySelectorAll('.credits');
     
     
      
     const calcObject = dataArray.reduce(function(calcObject, transaction)
      {
        if(transaction.type === 'debit')
        {
           calcObject.totalDebits += parseFloat(transaction.amount)
           return calcObject
        }
        else if(transaction.type === 'credit')
        {
          calcObject.totalCredits += parseFloat(transaction.amount)
          return calcObject
        }
       


      },{totalDebits:0, totalCredits:0 })
      totalDisplayDebit[0].textContent = `$${calcObject.totalDebits.toFixed(2)}`
      totalDisplayCredits[0].textContent = `$${calcObject.totalCredits.toFixed(2)}`
      
   }//End of updateTotalsDebit
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
