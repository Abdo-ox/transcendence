import { NewPage, getCsrfToken } from "/utils.js";
import { Login } from "/login.js"

export async function Reset() {
    


    // let myinput = document.getElementById('reset-new-password');
    // var letter = document.getElementById("reset-letter");
    // var capital = document.getElementById("reset-capital");
    // var number = document.getElementById("reset-number");
    // var length = document.getElementById("reset-length");

    // myinput.onfocus = function () {
    //     document.getElementById("reset-message").style.display = 'block';
    // }
    // myinput.onblur = function () {
    //     document.getElementById("reset-message").style.display = 'none';
    // }
    // myinput.onkeyup = function () {
    //     var lowercaseletter = /[a-z]/g;/*select the lower case world*/
    //     if (myinput.value.match(lowercaseletter)) {
    //         letter.classList.remove("invalid");
    //         letter.classList.add("valid");
    //     }
    //     else {
    //         letter.classList.remove("valid");
    //         letter.classList.add("invalid");
    //     }

    //     var uppercaseletter = /[A-Z]/g;/*select the lower case world*/
    //     if (myinput.value.match(uppercaseletter)) {
    //         capital.classList.remove("invalid");
    //         capital.classList.add("valid");
    //     }
    //     else {
    //         capital.classList.remove("valid");
    //         capital.classList.add("invalid");
    //     }
    //     var numbers = /[0-9]/g;
    //     if (myinput.value.match(numbers)) {
    //         number.classList.remove("invalid");
    //         number.classList.add("valid");
    //     }
    //     else {
    //         number.classList.remove("valid");
    //         number.classList.add("invalid");
    //     }

    //     if (myinput.value.length >= 8) {
    //         length.classList.remove("invalid");
    //         length.classList.add("valid");
    //     }
    //     else {
    //         length.classList.remove("valid");
    //         length.classList.add("invalid");
    //     }
  
    document.getElementById("reset-submit").addEventListener("click", async () => {
        let code = document.getElementById("reset-code").value;
        // let myinput = document.getElementById('reset-code');
        let password = document.getElementById("reset-new-password").value;
        if (code.trim() == '' || password.trim() == '') {
            document.getElementById("reset-error").innerHTML = "Feils required ";
        }
        if (code.length != 6 || code.isNaN())
            document.getElementById("reset-error1").innerHTML = "Code format not valid ! should be a 6 digits";
        const email = localStorage.getItem('email');

        if (email) {
            console.log("Retrieved email from localStorage:", email);
        } else {
            console.log("No email found in localStorage.");
        }
        fetch('https://localhost:8000/reset/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': await getCsrfToken(),
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ 'code': code, 'password': password ,'email': email})
        })
            .then(response => response.json())
            .then((data) => {
                console.log(" *** data response ", data);
                if (data.status == 'success')
                    NewPage('/login', Login);
                if (data.status == 'failed')
                    alert(data.message);
            })
            .catch((error) => {
                console.log(" error ", error);
            })
    });
}