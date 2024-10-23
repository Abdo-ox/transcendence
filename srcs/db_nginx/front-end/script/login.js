import { getCsrfToken, NewPage, submitForm, getJWT } from "/utils.js";
import { Home } from "/home.js";
import { Register } from "/register.js";
import { ResetPassword } from "/resetpassword.js";
import { is_authenticated } from "./utils.js";
console.log("the login.js called");

const handle_data = async (data_status) => {
    const data = data_status.data;
    const status = data_status.status;
    console.log("data access : ",data);
    if (status == 200) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
   

        await fetch('https://localhost:8000/api/twoFaCalled/', {
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
                console.log("error in login :", error);
            });
    } else {
        // handle error of login 
        console.log("error:", data_status);
    }
}


async function oAuthHandler(ancor, loginButton, event) {

    const response = await fetch("https://localhost:8000/api/42/callback/", {
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
    }
    loginButton.style.pointerEvents = 'auto';
    loginButton.classList.remove("non-active");
    ancor.style.pointerEvents = 'auto';
    ancor.classList.remove("non-active");
}

export async function Login() {
    console.log("hello");
    if (await is_authenticated())
        return;
    console.log("hello");
    const csrf_token = await getCsrfToken();
    const ids = ['login-username', 'login-password'];

    document.getElementById('login-register-btn').addEventListener('click', () => {
        NewPage("/register", Register, false);
    });

    const ancor = document.getElementById('login-intra-btn'); 
    const loginButton = document.getElementById('login-login-btn'); 
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault();
        loginButton.style.pointerEvents = 'none';
        loginButton.classList.add("non-active");
        ancor.style.pointerEvents = 'none';
        ancor.classList.add("non-active");
        await submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
        loginButton.style.pointerEvents = 'auto';
        loginButton.classList.remove("non-active");
        ancor.style.pointerEvents = 'auto';
        ancor.classList.remove("non-active");
    });

    ancor.addEventListener('click', async () => {
        loginButton.style.pointerEvents = 'auto';
        loginButton.classList.remove("non-active");
        ancor.style.pointerEvents = 'auto';
        ancor.classList.remove("non-active");
        const response = await fetch("https://localhost:8000/api/42/data/");
        if (response.ok) {
            const data = await response.json();
            const url = new URLSearchParams(data.app);
            window.removeEventListener('message', oAuthHandler);
            window.addEventListener('message', oAuthHandler.bind(null, ancor, loginButton));
            const popup = window.open(data.base_url + '?' + url.toString(), 'OAuthPopup', `width=600,height=700,left=${window.innerWidth / 2 - 300 + window.screenX},top=${window.innerHeight / 2 - 350 + window.screenY}`);
        }
    });
    document.getElementById("login-forgotpassword").addEventListener("click", async () => {
        console.log("i am here ****************");
        NewPage("/resetpassword", ResetPassword, false);
    });

}