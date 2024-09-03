import { getCsrfToken, EventNewPage, submitForm } from "./utils.js";

const handle_data = (data) => {
    console.log(data);
}


document.addEventListener('DOMContentLoaded', async () => {
    const csrf_token = await getCsrfToken();
    const ids = ['username', 'password'];

    EventNewPage('register-btn', '/register.html');

    document.getElementById('login-btn').addEventListener('click', () => {
        submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key == 'Enter')
            submitForm('https://localhost:8000/api/token/', ids, csrf_token, handle_data);
    });

    document.getElementById('intra-btn').addEventListener('click', () => {
        console.log('clicked');
        fetch("https://localhost:8000/api/42/data/").then(response => {
            return response.json();
            console.log(response);
        }).then(data => {
            const url = new URLSearchParams(data.app);
            const popup = window.open(data.base_url + '?' + url.toString(), 'OAuthPopup', 'width=600,height=600');
            console.log("__________-------------->\n", data.app);
            const pollPopup = setInterval(()=> {
                if (popup.closed) {
                    clearInterval(pollPopup);
                    return;
                }
                try {
                    if (popup.location && popup.location.href && popup.location.href.includes("code=")){
                        const url = new URL(popup.location.href);
                        const code = url.searchParams.get('code');
                        console.log("the code is:", code);
                        popup.close();
                        clearInterval(pollPopup);
                        console.log("clear interval ===========================>");
                        fetch("https://localhost:8000/api/42/callback/", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ code: code })
                        })
                        .then(response => {
                            console.log("Callback response received:", response);
                            if (!response.ok) {
                                throw new Error("Callback request failed");
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log("Response from Django backend:", data);
                            localStorage.setItem('accessToken', data.access);
                            fetch("https://localhost:8000/api/user/data/",{
                                headers:{
                                    'Authorization': `Bearer ${data.access}`,
                                }
                            }).then(data => {
                                return data.json();
                            }).then(data => console.log("hello::::===>", data));
                            // console.log("Token stored in localStorage:", localStorage.getItem('accessToken'));
                        }).catch(error => {
                            console.error("Error sending code to Django backend:", error);
                        });
                    }
                }
                catch (error) {
                    console.log("the catch catch errors");
                }
            },1000);
            // window.location.href = data.base_url + "?" + url.toString();
        }).catch(error => {
            console.log("error in loading data of Oauth");
        });
        // function getQueryParams() {
        //     const url = new URL(window.location.href);
        //     const params = new URLSearchParams(url.search);
        //     let queryParams = {};
        //     for (const [key, value] of params.entries()) {
        //         queryParams[key] = value;
        //     }
        //     return queryParams;
        // }

        // const queryParams = getQueryParams();

        // const authCode = queryParams['code'];
        // if (authCode) {
        //     console.log("Authorization code:", authCode);

        //     // Send the code to the Django backend
            // fetch("https://localhost:8000/api/42/callback/", {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ code: authCode })
            // })
            // .then(response => {
            //     console.log("Callback response received:", response);
            //     if (!response.ok) {
            //         throw new Error("Callback request failed");
            //     }
            //     return response.json();
            // })
            // .then(data => {
            //     console.log("Response from Django backend:", data);
            //     localStorage.setItem('accessToken', data.access);

            //     console.log("Token stored in localStorage:", localStorage.getItem('accessToken'));

            // })
            //     .catch(error => {
            //         console.error("Error sending code to Django backend:", error);
            //     });
        // } else {
        //     console.log("No authorization code found in the URL");
        // }


    });
}, { once: true });