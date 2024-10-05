import { NewPage } from "/utils.js";
import { Settings } from "./settings.js";

export async function ConfirmationMail() {

    document.getElementById("confirmMail-submit").addEventListener("click", async () => {


        try {
            let code = document.getElementById("confirminputmail-code").value;
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
                body: JSON.stringify({ 'code': code , 'newemail':newemail})

            });

            if (!response.ok) {
                console.error('Failed to confrim user:', response.status, response.statusText);
                return;
            }
            const data = await response.json();
            console.log("*******data  confirmation  response **** is : ", data);
            if (data.status == 'redirect') {
                NewPage("/settings",Settings);
            }
            if (data.status == 'failed')
                document.getElementById("resetmail-errorMessage").textContent = "code not correct , check your email";

        }
        catch (error) { // Catch block should capture the error
            console.error('An error occurred:', error); // Log the error
        }
    });

}

