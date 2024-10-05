import { getJWT, NewPage, getCsrfToken } from "/utils.js"
import { Home } from "/home.js"


export async function Twofactor() {
    console.log("test");
    
    // const user = localStorage.getItem('username');
    // if(user)
    //     document.getElementById('twofa-user').innerHTML = user;
    document.getElementById("twofa-submit").addEventListener("click", async () => {

        const digits = document.querySelectorAll('.twofa-digit');
        let message = document.getElementById('twofa-message');

        let code = '';
        digits.forEach(input => {
            console.log("input :",input.value);
            code += input.value;
        })
        console.log("code : ", code,code.length, isNaN(Number(code)))
        if (code.length !== 6 || isNaN(Number(code))) {

            message.textContent = "Please enter a valid 6-digit numeric code.";
            message.style.color = "red";
        }
        else 
        {

            fetch('https://localhost:8000/verify_2fa_code/', {
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
                    console.log("data come here :", data);
                    if (data.status == "success") {
                        localStorage.setItem('twofa-passed',true);
                        NewPage("/home", Home, true);
                    } else {
                        message.innerText = 'Verification failed. Please try again.';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    message.innerText = 'An error occurred. Please try again later.';
                });

        }

    });
}




// // // Handle form submission for verifying the code
// // document.getElementById('2fa-form').addEventListener('submit', (e) => {
// //     e.preventDefault();
// //     const code = document.getElementById('verification-code').value;
// //     // Here you can send the verification code to the backend for validation
// //     // Add the necessary logic for validation (e.g., making another API call to verify the code)
// // });

