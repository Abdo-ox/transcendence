import { getCsrfToken, NewPage, submitForm, is_authenticated, printErrorInScreen } from "https://10.32.72.122/utils.js";
import { Home } from "https://10.32.72.122/home.js";
import { Register } from "https://10.32.72.122/register.js";
import { ResetPassword } from "https://10.32.72.122/resetpassword.js";
console.log("the login.js called");

const handle_data = async (data_status) => {
    const data = data_status.data;
    const status = data_status.status;
    if (status == 200) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        await fetch('https://10.32.72.122:8000/api/twoFaCalled/', {
            headers: {
                Authorization: `Bearer ${data.access}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then((data) => {
                console.log("pathname:", window.location.pathname);
                NewPage("/home", Home);
            })
            .catch((error) => {
                document.getElementById("error-container").innerHTML = `hello world again and again`;
                console.log("error in login :", error);
            });
        
    } else {
        console.log("error:", data_status);
        printErrorInScreen([data_status.data.detail]);
    }
}


async function oAuthHandler(ancor, loginButton, event) {
    const response = await fetch("https://10.32.72.122:8000/api/42/callback/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: event.data.code })
    });
    if (response.ok) {
        const data = await response.json();
        handle_data({ data, status: response.status });
    } else {
        console.error("response not ok in log with intra");
        printErrorInScreen(['response not ok in log with intra']);
    }
    loginButton.style.pointerEvents = 'auto';
    loginButton.classList.remove("non-active");
    ancor.style.pointerEvents = 'auto';
    ancor.classList.remove("non-active");
}

export async function Login() {

    document.getElementById("login-forgotpassword").addEventListener("click", async (event) => {
        event.preventDefault();
        NewPage("/resetpassword", ResetPassword, false);
    });

    if (await is_authenticated())
        return;
    const csrf_token = await getCsrfToken();
    const ids = ['login-username', 'login-password', 'login-rememberMe'];

    document.getElementById('login-register-btn').addEventListener('click', () => {
        NewPage("/register", Register, false);
    });
    const rememberMeCheckbox = document.getElementById("login-rememberMe");
    rememberMeCheckbox.checked = localStorage.getItem("rememberMe") === "true";
    rememberMeCheckbox.addEventListener("change", function () {
        localStorage.setItem("rememberMe", rememberMeCheckbox.checked)
    });
    const ancor = document.getElementById('login-intra-btn');
    const loginButton = document.getElementById('login-login-btn');
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault();
        loginButton.style.pointerEvents = 'none';
        loginButton.classList.add("non-active");
        ancor.style.pointerEvents = 'none';
        ancor.classList.add("non-active");
        await submitForm('https://10.32.72.122:8000/api/token/', ids, csrf_token, handle_data);
        loginButton.style.pointerEvents = 'auto';
        loginButton.classList.remove("non-active");
        ancor.style.pointerEvents = 'auto';
        ancor.classList.remove("non-active");
    });

    ancor.addEventListener('click', async () => {
        loginButton.style.pointerEvents = 'none';
        loginButton.classList.remove("non-active");
        ancor.style.pointerEvents = 'none';
        ancor.classList.remove("non-active");
        const response = await fetch("https://10.32.72.122:8000/api/42/data/");
        if (response.ok) {
            const data = await response.json();
            const url = new URLSearchParams(data.app);
            window.removeEventListener('message', oAuthHandler);
            window.addEventListener('message', oAuthHandler.bind(null, ancor, loginButton));
            const popup = window.open(data.base_url + '?' + url.toString(), 'OAuthPopup', `width=600,height=700,left=${window.innerWidth / 2 - 300 + window.screenX},top=${window.innerHeight / 2 - 350 + window.screenY}`);
        }
    });

}   