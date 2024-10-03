import { getCsrfToken, NewPage, submitForm, getJWT } from "https://localhost/home/utils.js";
console.log("the login.js called");

const handle_data = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    NewPage('/home', false);
}

const is_authenticated = async () => {
    const access = localStorage.getItem('access_token');
    console.log("check_is_authenticated: access=", access);
    if (access != 'undefined' && access != null)
        NewPage("/home");
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await is_authenticated();
        const csrf_token = await getCsrfToken();
        const ids = ['username', 'password'];

        document.getElementById('register-btn').addEventListener('click', () => {
            NewPage("/register", false);
        });

        document.getElementById('login-btn').addEventListener('click', (event) => {
            event.preventDefault();
            submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
        });

        document.body.addEventListener('keydown', (event) => {
            if (event.key == 'Enter')

                submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
            
        });

        document.getElementById('intra-btn').addEventListener('click', async () => {
            console.log('clicked');
            const response = await fetch("https://localhost:8000/api/42/data/");
            if (response.ok) {
                const data = await response.json();
                const url = new URLSearchParams(data.app);
                const dimention = `width=${window.width/2},height=${hwindow.height/2},left=${window.width/2 - window.width/4},top=${window.height/2 - window.height/4}`;
                const popup = window.open(data.base_url + '?' + url.toString(), 'OAuthPopup', dimention);
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
        document.getElementById("forgotpassword").addEventListener("click", async() => {
            NewPage("/resetpassword", false, true);

        });
    } catch (error) {
        console.log(error);
    }
}, { once: true });