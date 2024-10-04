import { getCsrfToken, NewPage, submitForm, getJWT } from "/utils.js";
import { Home } from "/home.js";
import { Register } from "/register.js";
import { ResetPassword } from "/resetpassword.js";
console.log("the login.js called");

const  handle_data = async (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    fetch('https://localhost:8000/api/twoFaCalled/',{
        headers:{
            Authorization: `Bearer ${await getJWT()}`
        }
    })
    .then(response => {
        return response.json()})
    .then((data) => {
        console.log("passs   by handle hetre");
       console.log("dara ok",data);
        NewPage('/home', Home);
    })
    .catch((error) =>{
        console.log("errrrrrrrrror her login :",error);
    })
    // console.log("ended here ==============");
    // NewPage('/home', Home);
}

const is_authenticated = async () => {
    const access = localStorage.getItem('access_token');
    console.log("check_is_authenticated: access=", access);
    if (access != 'undefined' && access != null) {
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
                            handle_data(data);
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
        NewPage("/resetpassword", ResetPassword, false);
    });

}