import { getCsrfToken, NewPage, submitForm, printErrorInScreen, is_authenticated} from "https://10.14.60.29/utils.js";
import { Login } from "https://10.14.60.29/login.js"

const handle_data = (data_status) => {
    const data = data_status.data;
    const status = data_status.status;
    if (data.state === 'registered')
        NewPage('/login',Login, false);
    else 
        printErrorInScreen(data.errors);
}

export async function Register() {
    if (await is_authenticated())
        return;
    const csrf_token = await getCsrfToken();
    const ids = ['register-first_name', 'register-last_name', 'register-username', 'register-email', 'register-password1', 'register-password2'];

    const registerButton = document.getElementById('register-submit-btn');
    registerButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.target.style.pointerEvents = 'none';
        registerButton.classList.add('non-active');
        await submitForm('https://10.14.60.29:8000/api/register/', ids, csrf_token, handle_data);
        registerButton.style.pointerEvents = 'auto';
        registerButton.classList.remove('non-active');
    });
}




















// /****** register form ** */
// const password = document.getElementById("register-password");
// const confirmPassword = document.getElementById("register-confirm_password");

// confirmPassword.addEventListener("input", () => {
//   if (password.value !== confirmPassword.value) {
//     confirmPassword.setCustomValidity("Passwords does not  match.");
//   } else {
//     confirmPassword.setCustomValidity("");
//   }
// })
