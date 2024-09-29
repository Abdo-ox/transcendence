import { NewPage } from "https://localhost/home/utils.js";

document.getElementById("submit").addEventListener("click", async () => {

    let email = document.getElementById("inputemail").value;
    fetch('https://localhost:8000/resetpassword/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ 'email': email })

    })
        .then(response => response.json())
        .then((data) => {
            console.log("*******data response **** is : ", data);
            if (data.status == 'redirect')
                {
                    NewPage('/reset' + '?email='+ email, true)
                }
            if (data.status == 'failed')
            {
                document.getElementById("error message").innerHTML = "failed to send code";
                document.getElementById("error message").style.color = 'red';
            }
            else {
                document.getElementById("error message").innerHTML = "No account with this email";
                document.getElementById("error message").style.color = 'red';
            }
        })
        .catch((error) => {
            console.log(error);
        })
});