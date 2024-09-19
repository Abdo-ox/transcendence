import { getCsrfToken, EventNewPage, NewPage, submitForm } from "https://localhost/home/utils.js";

const handle_data = (data) => {
    console.log(data.access);
    if (data.access == 'undefined')
        console.error("access from backend is undefined");
    if (data.refresh == 'undefined')
        console.error("refresh from backend is undefined");
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    NewPage('/home');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const csrf_token =  getCsrfToken();
        console.error('csrf_token', csrf_token);
        const ids = ['username', 'password'];
             console.log(" pass by  login newpage");
        EventNewPage('register-btn', '/register');

        document.getElementById('login-btn').addEventListener('click', () => {
        console.log("*********************111****",ids);
            submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key == 'Enter')

                submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
        });

        document.getElementById('intra-btn').addEventListener('click', async () => {
            console.log('clicked');
            const response = await fetch("https://localhost:8000/api/42/data/");
            if (response.ok) {
                const data = await response.json();
                console.log("data", data);
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
                                handle_data(data);
                                popup.close();
                                clearInterval(pollPopup);
                                NewPage("/home", false);
                            } else {
                                console.error("response not ok in log with intra");
                                popup.close();
                                clearInterval(pollPopup);
                            }
                        }
                    }
                    catch (error) {
                        console.log("the catch catch errors", error);
                    }
                }, 1000);
            }
        });
    } catch (error) {
        console.log(error);
    }
}, { once: true });