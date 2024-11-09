import { getJWT, NewPage, getCsrfToken } from "https://10.14.60.29/utils.js"
import { Home } from "https://10.14.60.29/home.js"
import { Login } from "https://10.14.60.29/login.js";


export async function Twofactor() {

    let acc = await getJWT();
    if (acc == null || acc == 'undefined')
        NewPage("/login", Login, false);
    document.body.style.visibility = 'visible';

    // const user = localStorage.getItem('username');
    // if(user)
    //     document.getElementById('twofa-user').innerHTML = user;
    document.getElementById("twofa-submit").addEventListener("click", async () => {

        const digits = document.querySelectorAll('.twofa-digit');
        let message = document.getElementById('twofa-message');

        let code = '';
        digits.forEach(input => {
            code += input.value;
        })
        if (code.length !== 6 || isNaN(Number(code))) {

            message.textContent = "Please enter a valid 6-digit numeric code.";
            message.style.color = "red";
        }
        else {

            fetch('https://10.14.60.29:8000/verify_2fa_code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getJWT()}`,
                    'X-CSRFToken': await getCsrfToken(),
                },
                body: JSON.stringify({ code: code })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status == "success") {
                        localStorage.setItem('twofa-passed', true);
                        NewPage("/home", Home, true);
                    } else {
                        message.innerText = 'Verification failed. Please try again.';
                    }
                })
                .catch(error => {
                    message.innerText = 'An error occurred. Please try again later.';
                });

        }

    });
}

