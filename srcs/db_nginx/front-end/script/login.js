import { getCsrfToken, NewPage, submitForm, getJWT } from "/utils.js";
import { Home } from "/home.js";
import { Register } from "/register.js";
import { ResetPassword } from "/resetpassword.js";
console.log("the login.js called");

const  handle_data = async (data_status) => {
    const data = data_status.data;
    const status = data_status.status;

    if (status == 200){
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        await fetch('https://localhost:8000/api/twoFaCalled/',{
            headers:{
                Authorization: `Bearer ${data.access}`
            }
        })
        .then(response => {
            return response.json()})
        .then((data) => {
            NewPage("/home", Home);
        })
        .catch((error) =>{
            console.log("error in login :", error);
        });
    } else {
        // handle error of login 
        console.log("error:", data_status);
    } 
}

const is_authenticated = async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    console.log("check_is_authenticated: access=", access);
    console.log("check_is_authenticated: refresh=", refresh);
    if (access != 'undefined' && access != null && refresh != null && refresh != 'undefined') {
        NewPage("/home", Home);
        return 1;
    }
    return (0);
}


export async function Login() {
    console.log("hello");
    if(await is_authenticated())
        return;
    console.log("hello");
    const csrf_token = await getCsrfToken();
    const ids = ['login-username', 'login-password'];

    document.getElementById('login-register-btn').addEventListener('click', () => {
        NewPage("/register", Register, false);
    });

    document.getElementById('login-login-btn').addEventListener('click', (event) => {
        event.preventDefault();
        submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
    });

    document.body.addEventListener('keydown', (event) => {
        if (event.key == 'Enter')
            submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);

    });

    document.getElementById('login-intra-btn').addEventListener('click', async () => {
        console.log('clicked');
        const response = await fetch("https://localhost:8000/api/42/data/");
        if (response.ok) {
            const data = await response.json();
            const url = new URLSearchParams(data.app);
            const popup = window.open(data.base_url + '?' + url.toString(), 'OAuthPopup', 'width=600,height=600');
            const pollPopup = setInterval(async () => {
                if (popup.closed) {
                    clearInterval(pollPopup);
                    return;
                }
                try {
                    if (popup.location && 'href' in popup.location && popup.location.href.includes("code=")) {
                        const url = new URL(popup.location.href);
                        const code = url.searchParams.get('code');
                        clearInterval(pollPopup);
                        const response = await fetch("https://localhost:8000/api/42/callback/", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ code: code })
                        });
                        if (response.ok) {
                            const data = await response.json();
                            console.log(data);
                            popup.close();
                            clearInterval(pollPopup);
                            handle_data({data, status: response.status});
                        } else {
                            console.error("response not ok in log with intra");
                            popup.close();
                            clearInterval(pollPopup);
                        }
                    }
                } catch (error) {
                    console.log("the catch catch errors", error);
                }
            }, 1000);
        }
    });
    document.getElementById("login-forgotpassword").addEventListener("click", async () => {
        console.log("i am here ****************");
        NewPage("/resetpassword", ResetPassword, false);
    });

}