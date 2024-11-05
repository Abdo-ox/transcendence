import { NewPage, getJWT } from "https://localhost/utils.js";
import { Settings } from "https://localhost/settings.js";
import { Login } from "https://localhost/login.js";

export async function ConfirmationMail() {

    let acc = await getJWT();
    if (acc == null || acc == 'undefined')
        NewPage("/login", Login);
    document.body.style.visibility = 'visible';
    document.getElementById("confirmMail-submit").addEventListener("click", async () => {
        try {
            let code = document.getElementById("confirmMail-inputemail").value;
            let trimcode = code.trim();
            if (!/^\d{6}$/.test(code) || trimcode == '') {
                reseterrorMsg.textContent = 'Code must be exactly 6 digits long';
                return;
            }
            let newemail = localStorage.getItem("NewEmail");
            const response = await fetch('https://localhost:8000/MailValidation/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${await getJWT()}`,
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ 'code': code, 'newemail': newemail })

            });

            if (!response.ok) {
                console.error('Failed to confrim user:', response.status, response.statusText);
                return;
            }
            const data = await response.json();
            if (data.status == 'redirect') {
                NewPage("/settings", Settings);
            }
            if (data.status == 'failed')
                document.getElementById("resetmail-errorMessage").textContent = "code not correct , check your email";

        }
        catch (error) { // Catch block should capture the error
            console.error('An error occurred:', error); // Log the error
        }
    });

}

