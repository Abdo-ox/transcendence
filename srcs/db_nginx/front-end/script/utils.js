import { removeEvent, header } from "/header.js";
import { Twofactor } from "/2faa.js";
import { Login } from "/login.js";
import { Home } from "/home.js";
import { Settings } from "/settings.js";
import { Chat } from "/chat.js";

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
            if (status == 200)
                {
                    localStorage.setItem('username',data.username);
                    NewPage("/2faa", Twofactor, true);
                }
            if (status == 500)
                alert("failed to send email try  again in few secondes ...");
        }
        return(0);
    }
    return(1);
}

const is_valid = async (access, refresh) => {

    let payload = access.split('.')[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    payload = atob(payload);
    const exp = JSON.parse(payload)['exp'];
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime + 60 <= exp) {

        const resp = await fetch("https://localhost:8000/is_authenticated/", {
            'Autorization': `Bearer ${access}`
        });
        if (resp.status == 401) {
            console.error("remove the atems form the local storage");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            NewPage("/login", Login, false);
            throw "access not expired but not valid";
        }
        return true;
    }
    if (refresh == 'null' || refresh == 'undefined') {
        NewPage("/login", Login);
        throw "expired token and refresh=" + refresh;
    }
    return false;
}

export const getJWT = async () => {
    try {
        const access = localStorage.getItem('access_token');
        if (access == null || access == 'undefined') {
            console.log("enter to if condition");
            NewPage("/login", Login, false);
            throw "null or undefined jwt =" + access;
        }
        else {
            const refresh = localStorage.getItem('refresh_token');
            if (await is_valid(access, refresh))
                return access;
            let token = null;
            const response = await fetch("https://localhost:8000/api/token/refresh/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refresh
                })
            });
            if (response.status == 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                NewPage("/login", Login);
                throw "expired access with invalid refresh=" + refresh;
            }
            const data = await response.json();
            token = data.access;
            localStorage.setItem('access_token', data.access);
            return token;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
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
            console.log("hello");
            if (document.body.querySelector('header'))
                if(!await header())
                    return;
            console.log("hello");
        }
        if (url == '/home' || url == '/chat' || url == '/settings')
            makePageActive(url.substring(1));
        console.log(" func is :",func);
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
            console.log("id:", id, "|");
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
    console.log("url is >>>>>>>>>>> : ", url);
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify(fields),
    }).then(response => {
        return response.json();
    }).then(data => {
        handle_data(data);
    }).catch(error => {
        console.log("catch fetch:can't submit data error:", error, "|");
    });
    // }

}
const func = {
    "home-btn": () => {NewPage('/home', Home)},
    "chat-btn": () => {NewPage('/chat', Chat)},
    "settings-btn": () => {NewPage('/settings', Settings)},
    "small-home-btn": () => {NewPage('/home', Home)},
    "small-chat-btn": () => {NewPage('/chat', Chat)},
    "small-settings-btn": () => {NewPage('/settings', Settings)},
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
    let homeBtn = document.getElementById(page + '-btn');
    if (homeBtn) {
        homeBtn.querySelector('a').style.setProperty('--scale', '1');
        homeBtn.querySelector('a').style.setProperty('--color', '#FFFFFF');
        homeBtn.querySelector('a').style.setProperty('--font-weight', '600');
    }
    homeBtn = document.getElementById('small-' + page + '-btn');
    if (homeBtn) {
        homeBtn.querySelector('a').style.setProperty('--scale', '1');
        homeBtn.querySelector('a').style.setProperty('--color', '#FFFFFF');
        homeBtn.querySelector('a').style.setProperty('--font-weight', '600');
    }
}