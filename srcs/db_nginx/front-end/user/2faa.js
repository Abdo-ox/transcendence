import { getJWT, NewPage, getCsrfToken } from "https://localhost/home/utils.js"


document.addEventListener('DOMContentLoaded', async () => {
    console.log("test");
    document.getElementById("Verify").addEventListener("click", async () => {
        const codeInput = document.getElementById('2fa-code');
        const code = codeInput.value;
        const errorMessage = document.getElementById('error-message');
        if (code.length !== 6) {
            errorMessage.innerText = 'The code must be exactly 6 digits long.';
        }
        if (isNaN(code)) {
            errorMessage.innerText = 'The code must be a number.';
        }
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
                    document.getElementById("2fa-container").innerText= 'FA verification successful';
                    NewPage("/home", true);
                } else {
                    errorMessage.innerText = 'Verification failed. Please try again.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.innerText = 'An error occurred. Please try again later.';
            });

    })

});


// // // Handle form submission for verifying the code
// // document.getElementById('2fa-form').addEventListener('submit', (e) => {
// //     e.preventDefault();
// //     const code = document.getElementById('verification-code').value;
// //     // Here you can send the verification code to the backend for validation
// //     // Add the necessary logic for validation (e.g., making another API call to verify the code)
// // });

