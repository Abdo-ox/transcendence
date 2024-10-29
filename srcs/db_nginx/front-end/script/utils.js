import { removeEvent, header } from "https://localhost/header.js";
import { Twofactor } from "https://localhost/2faa.js";
import { Login } from "https://localhost/login.js";
import { Home } from "https://localhost/home.js";
import { Settings } from "https://localhost/settings.js";
import { Chat } from "https://localhost/chat.js";
import { Profile } from "https://localhost/profile.js";

export let webSockets = [];

export const getCsrfToken = async () => {
    return await fetch("https://localhost:8000/api/csrf_token/")
        .then(response => response.json())
        .then(data => data.csrf_token)
        .catch(error => {
            console.log("can't get the csrf token :", error);
        });
}


export const redirectTwoFactor = (data, status) => {
    if (data.status) {
        if (data.status == "redirect") {
            if (status == 200) {
                localStorage.setItem('username', data.username);
                NewPage("/2faa", Twofactor, true);
            }
            if (status == 500)
                alert("failed to send email try  again in few secondes ...");
        }
        return (0);
    }
    return (1);
}

const is_expired = (access) => {
    let payload = access.split('.')[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    payload = atob(payload);
    const exp = JSON.parse(payload)['exp'];
    const currentTime = Math.floor(Date.now() / 1000);

    return (currentTime + 60 > exp);
}

const clear_localStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    NewPage("/login", Login);
    return null;
}

const is_valid = async (access, refresh) => {
    if (!is_expired(access)) {
        const response = await fetch("https://localhost:8000/is_authenticated/", {
            headers: { 'Authorization': `Bearer ${access}` }
        });
        if (response.status != 200)
            return clear_localStorage();
        document.body.style.visibility = 'visible';
        return access;
    }
    const response1 = await fetch("https://localhost:8000/api/token/refresh/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: refresh })
    });
    if (response1.status != 200)
        return clear_localStorage();
    const data = await response1.json();
    const response2 = await fetch("https://localhost:8000/is_authenticated/", {
        headers: { 'Authorization': `Bearer ${data.access}` }
    });
    if (response2.status != 200)
        return clear_localStorage();
    localStorage.setItem('access_token', data.access);
    document.body.style.visibility = 'visible';
    return data.access;
}

export const getJWT = async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access == null || access == 'undefined' || refresh == null || refresh == 'undefined') {
        NewPage("/login", Login, false);
        return null;
    }
    return is_valid(access, refresh);
}
function addErrorDiv() {
    if (document.getElementById('error-container'))
        return ;
    const div = document.createElement('div');
    div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path
                    d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </symbol>
        </svg>
        <div class="error-div alert alert-danger d-flex align-items-center" id="error-div" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
                <use xlink:href="#exclamation-triangle-fill" />
            </svg>
            <div class="d-flex flex-column" id="error-container">
            </div>
        </div>`;
    document.body.appendChild(div);
}

export function printErrorInScreen(errors) {
    const diverror = document.getElementById("error-container");
    diverror.innerHTML = '';
    diverror.parentElement.classList.add('show');
    errors.forEach(error => diverror.innerHTML+= `<p>${error}</p>`);
    setTimeout(() => {
        diverror.parentElement.classList.remove('show');
    } ,1500);
}

export const NewPage = async (url, func, addhistory = true,query='') => {
    console.log(" new page called for the url ", url ,query);
    const response = await fetch(url + ".html"+query);
    if (response.ok) {
        const data = await response.text();
        const doc = (new DOMParser()).parseFromString(data, 'text/html');
        // close all sockets
        webSockets.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        webSockets = [];
        if (doc.querySelector('header') && document.querySelector('header')) {
            document.body.children[1].replaceWith(doc.body.children[1]);
        } else {
            removeEvent();
            document.body.replaceWith(doc.body);
            if (document.body.querySelector('header')) {
                const t = await header();
                if (!t)
                    return;
            }
        }
        if (document.querySelector('header')){
            console.log("hello clear");
            makePageActive(url.substring(1));
        }
        if (addhistory)
            history.pushState({}, '', url + query);
        await func();
        addErrorDiv();
    } else
        console.log("error in fetch the new page '", url, "'.");
}

export const submitForm = async (url, ids, csrf_token, handle_data) => {
    let fields = {};
    for (const id of ids) {
        const fieldName = id.substring(id.indexOf("-") + 1);
        try {
            fields[fieldName] = document.getElementById(id).value;
        }
        catch (error) {
            console.error('id: ', id, " error: ", error);
        }
        if (fields[id.substring(id.indexOf("-") + 1)].trim().length == 0) {
            alert(id, ' is required');
            return;
        }
        if (id.substring(id.indexOf("-") + 1) == 'password2' && fields[id.substring(id.indexOf("-") + 1)] != fields['password1']) {
            alert('passwords not equal');
            return;
        }
    }
    // for(let i = 0; i < 100;i++)
    // {
    // fields['username'] = 'user' + i;
    // fields['email'] = 'email' + i + '@gmail.com';
    // fields['password2'] = 'hello1998';
    // fields['password1'] = 'hello1998';
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify(fields),
    }).then(async response => {
        return { data: await response.json(), status: response.status };
    }).then(data => {
        handle_data(data);
    }).catch(error => {
        console.log("catch fetch:can't submit data error:", error, "|");
    });
    // }

}

const func = {
    "header-home-btn": () => {console.log("home"); NewPage('/home', Home) },
    "header-chat-btn": () => { NewPage('/chat', Chat) },
    "header-settings-btn": () => { NewPage('/settings', Settings) },
    "header-small-home-btn": () => { NewPage('/home', Home) },
    "header-small-chat-btn": () => { NewPage('/chat', Chat) },
    "header-small-settings-btn": () => { NewPage('/settings', Settings) },
    "header-small-profile-btn": () => { NewPage('/profile', Profile) },
}

export const makePageActive = (page) => {
    console.log("page", page);
    //remove all event listener for home chat settings in the header
    for (const key in func)
        document.getElementById(key).removeEventListener('click', func[key]);
    //add event listener for non active pages
    for (const key in func) {
        if (!key.includes(page))
            document.getElementById(key).addEventListener('click', func[key]);
    }
    //the default styling for all header li a
    document.querySelectorAll('.header-li-a-style').forEach(element => {
        element.style.setProperty('--scale', '0');
        element.style.setProperty('--color', '#a0a0a0');
        element.style.setProperty('--font-weight', '400');
    });
    let homeBtn = document.getElementById('header-' + page + '-btn');
    if (homeBtn) {
        homeBtn.querySelector('a').style.setProperty('--scale', '1');
        homeBtn.querySelector('a').style.setProperty('--color', '#FFFFFF');
        homeBtn.querySelector('a').style.setProperty('--font-weight', '600');
    }
    homeBtn = document.getElementById('header-small-' + page + '-btn');
    if (homeBtn) {
        homeBtn.querySelector('a').style.setProperty('--scale', '1');
        homeBtn.querySelector('a').style.setProperty('--color', '#FFFFFF');
        homeBtn.querySelector('a').style.setProperty('--font-weight', '600');
    }
}

export const is_authenticated = async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access != 'undefined' && access != null && refresh != null && refresh != 'undefined') {
        NewPage("/home", Home);
        return 1;
    } 
    document.body.style.visibility = 'visible';
    return (0);
}