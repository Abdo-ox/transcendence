import { NewPage } from "https://10.14.60.29/utils.js";
import { Reset } from "https://10.14.60.29/reset.js"

export async function ResetPassword() {

    document.body.style.visibility = 'visible';
    document.getElementById("resetpass-submit").addEventListener("click", async () => { 
        try {
            let email = document.getElementById("resetpass-inputemail").value;
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
            if (gmailRegex.test(email)) {
                document.getElementById("resetpass-errorMessage").textContent = ""; // Clear error message
                console.log("Valid Gmail address:", email);
            } else {
                document.getElementById("resetpass-errorMessage").textContent = "Please enter a valid Gmail address!";
                return;
            }
            const response = await fetch('https://10.14.60.29:8000/resetpassword/', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ 'email': email })

            });

            if (!response.ok) {
                console.error('Failed to RESET user:', response.status, response.statusText);
                return;
            }
            const data = await response.json();
            console.log("*******data response **** is : ", data);
            if (data.status == 'redirect') {
                {
                    localStorage.setItem('email', email);
                    NewPage('/reset', Reset);
                }
            }
            if (data.status == 'failed') {
                document.getElementById("resetpass-error message").innerHTML = "failed to send code";
                document.getElementById("resetpass-error message").style.color = 'red';
            }
            else {
                document.getElementById("resetpass-error message").innerHTML = "No account with this email";
                document.getElementById("resetpass-error message").style.color = 'red';
            }
        }
        catch (error) { // Catch block should capture the error
            console.error('An error occurred:', error); // Log the error
        }
    });

}

