import { NewPage, getCsrfToken, printNoteFor3Seconds} from "https://10.14.60.29/utils.js";
import { Login } from "https://10.14.60.29/login.js"

export async function Reset() {

    document.body.style.visibility = 'visible';
    document.getElementById("reset-submit").addEventListener("click", async () => {
        let code = document.getElementById("reset-code").value;
        let password = document.getElementById("reset-new-password").value;
        let confirmpass = document.getElementById("reset-confirmpass").value;
        let reseterrorMsg = document.getElementById("reset-errorMsg");
        let trimcode = code.trim();
        if (!/^\d{6}$/.test(code) || trimcode == '') {
            reseterrorMsg.textContent = 'Code must be exactly 6 digits long';
            return;
        }
     
        
        if (password !== confirmpass) {
            reseterrorMsg.textContent = 'password do not match.';
            return;
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
            reseterrorMsg.textContent = 'Password must include uppercase, lowercase, number, and special character.';
            return;
        }
        if (password.length < 8) {
            reseterrorMsg.textContent = 'Password must be at least 8 characters long.';
            return false;
        }
        const email = localStorage.getItem('email');
        fetch('https://10.14.60.29:8000/reset/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': await getCsrfToken(),
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ 'code': code, 'password': password, 'email': email })
        })
            .then(response => response.json())
            .then((data) => {
                if (data.status == 'success')
                    NewPage('/login', Login, false);
                if (data.status == 'failed')
                   printNoteFor3Seconds(data.message);
            })
            .catch((error) => {
            })
    });
}