import { removeEvent, header } from "/header.js";
import { Twofactor } from "/2faa.js";
import { Login } from "/login.js";
import { Home } from "/home.js";
import { Settings } from "/settings.js";
import { Chat } from "/chat.js";
import { Profile } from "/profile.js";

export let webSockets = [];

export const routing = (event) => {
    // NewPage(window.location.pathname, true, false);
}

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
const isReallyTokenValid = async (access) => {

    const resp = await fetch("https://localhost:8000/is_authenticated/", {
        'Autorization': `Bearer ${access}`
    });
    if (resp.status == 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        NewPage("/login", Login, false);
        throw "access not expired but not valid";
    }
    return true;
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

export const NewPage = async (url, func, addhistory = true) => {
    console.log(" new page called for the url ", url);
    const response = await fetch(url + ".html");
    if (response.ok) {
        const data = await response.text();
        const doc = (new DOMParser()).parseFromString(data, 'text/html');

        if (doc.querySelector('header') && document.querySelector('header')) {
            // close all sockets
            webSockets.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            });
            webSockets = [];
            document.body.children[1].replaceWith(doc.body.children[1]);
        } else {
            removeEvent();
            document.body.replaceWith(doc.body);
            if (document.body.querySelector('header')) {
                if (!await header())
                    return;
            }
        }
        if (document.querySelector('header'))
            makePageActive(url.substring(1));
        func();
        window.removeEventListener('popstate', routing);
        window.addEventListener('popstate', routing);
        if (addhistory)
            history.pushState({}, '', url);
    } else {
        console.log("error in fetch the new page '", url, "'.");
    }
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
    "header-home-btn": () => { NewPage('/home', Home) },
    "header-chat-btn": () => { NewPage('/chat', Chat) },
    "header-settings-btn": () => { NewPage('/settings', Settings) },
    "header-small-home-btn": () => { NewPage('/home', Home) },
    "header-small-chat-btn": () => { NewPage('/chat', Chat) },
    "header-small-settings-btn": () => { NewPage('/settings', Settings) },
    "header-small-profile-btn": () => { NewPage('/profile', Profile) },
}

export const makePageActive = (page) => {
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

export const acceptFriendRequest = (button) => {
    button.addEventListener('click', async () => {
        const resp = await fetch("https://localhost:8000/friend/accept/", { headers: {
            'Authorization': `Bearer ${access_token}`,
        }}).then(response => ({'data': response.json(), 'status': response.status }));
        if (resp.status == 200)
            console.log("friend request accepted")
        else {
            console.log("error", resp.data.error);
        }
    });
}