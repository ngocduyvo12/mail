document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //add click event to send a new email
  document.getElementById('sendEmail').addEventListener('click', send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#one-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#one-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //fetch sent mail 
  fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //print emails
      console.log(emails);
      //print emails to front end via div id emails-view
      for (var i = 0; i < emails.length; i++) {
        //html's body
        var emails_content = 
          `<div class="card-header">
            ${emails[i].sender}
          </div>
          <div class="card-body">
            <h5 class="card-title">${emails[i].subject}</h5>
            <p class="card-text">${emails[i].body.substring(0, 100) + "..."}</p>
            <p class="card-text">${emails[i].timestamp}</p>
            <button type="button" class="btn btn-primary" onclick="read_email(${emails[i].id})">Read</button>
          </div>`;

        if(emails[i].read == true){
          $('#emails-view').append(
            `<div class="card read" >
              ${emails_content}
            </div>`
          )
        }else if(emails[i].read == false){
          $('#emails-view').append(
            `<div class="card unread" >
              ${emails_content}
            </div>`
          )
        }
      }
    })
    .catch(error => {
      console.log('Error:', error)
    })

}

function send_email(event) {
  event.preventDefault();
  //select the input from the forms to be used later
  //get the values from the form
  var recipients = document.querySelector('#compose-recipients').value;
  var subject = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;

  //send the post request to '/emails'
  fetch('http://127.0.0.1:8000/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      //Print result
      console.log(result);
    })


  //change the page to sent email:
  load_mailbox('sent')
}

//function to retrieve a single email when a read button is pressed
function read_email(id){


  // //console log id to test
  // console.log(id)

  //clear out emails-view div and display one-email-view div
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#one-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //fetch email from the database using the id provided
  fetch(`http://127.0.0.1:8000/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    //console log the email for debugging
    console.log(email)

    //print this email to the page
    $('#one-email-view').html(`
        <div class="card">
          <div class="card-header">
            From: ${email.sender}
            <br>
            To: ${email.recipients}
            <br>
            Subject: ${email.subject}
            <br>
            Timestamp: ${email.timestamp}
          </div>
          <div class="card-body">
            <p class="card-text">${email.body}</p>
            <button type="button" class="btn btn-primary" onclick="read_email(${email.id})">Reply</button>
          </div>
        </div>`)
  })
  .catch(error => {
    console.log("error:" + error)
  })

  //update the email's read status to true
  fetch(`http://127.0.0.1:8000/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}