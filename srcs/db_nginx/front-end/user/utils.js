export const getCsrfToken = async () => {
    return fetch("https://localhost:8000/api/csrf_token/")
        .then(response =>response.json())
        .then(data => data.csrf_token)
            .catch(error => {
            console.log("can't get the csrf token :", error);
        });
}

export const getJWT = async () => {
    const access = localStorage.getItem('access_token');
    if (access === null) {
        console.log("is settent");
        NewPage("/user/login.html");
    }
    else {
        let payload = access.split('.')[1];
        console.log("|", payload);
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        console.log("|", payload);
        payload = atob(payload);
        console.log("|", payload);
        const exp = JSON.parse(payload)['exp'];
        console.log("|", payload);
    
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime + 60 <= exp) {
            const resp = fetch("https://localhost:8000/token/valid",{
                'Autorizaion': `Bearer ${access}`
            });
            if (resp.status == 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                NewPage("/user/login.html");
                return;
            }
            return access;
        }
        const refresh = localStorage.getItem('refresh_token');
        if (refresh == null)
            NewPage("/user/login.html");
        console.log("refresh:", refresh);
        const token_data = await fetch("https://localhost:8000/api/token/refresh/",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refresh
            })
        }).then(response => response.json());
        return token_data['access'];
    }
}

export const NewPage = (url) => {
    // window.location.pathname = "/chat/index.html"
    fetch(url)
    .then(response => response.text())
    .then(data => {
        let domparser = new DOMParser();
        const doc = domparser.parseFromString(data,'text/html');

        const event = new Event('DOMContentLoaded', {
            cancelable: true,
            bubbles: true,
        });

        document.head.innerHTML = doc.head.innerHTML;
        document.body.innerHTML = doc.body.innerHTML;

        let scripts = doc.querySelectorAll('script');
        document.querySelectorAll('script').forEach(script => script.remove());
        let j = 0;
        
        scripts.forEach(script => {
            console.log(`||||||||||||||||||||||||=>>>> ${script.src} <<<<<<`);
            let element = document.createElement('script');
            if (script.src) {
                element.src = script.src;
                element.type = 'module';
            }
            element.onload = () => {
                if (++j == scripts.length) 
                    document.dispatchEvent(event);
            };
            element.onerror = () => console.log("errrrrrrrrrrrror in on error ");
            document.body.appendChild(element);
        });
        console.log(`usl iss ->>> ${url}`)
        history.pushState({}, '', url);
    }).catch(error => {
        console.log("can't load page :", error);
    });
}

export const EventNewPage = (id, url) => {
    document.getElementById(id).addEventListener('click', () => {
        NewPage(url);
    });
}

export const submitForm = (url, ids, csrf_token, handle_data) => {
    let fields = {};
    for (const id of ids) {
        fields[id] = document.getElementById(id).value;
        if (fields[id].trim().length == 0) {
            alert(id ,' is required');
            return ;
        }
        if (id == 'password2' && fields[id] != fields['password1']) {
            alert('passwords not equal');
            return ;
        }
    }
    fetch(url, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        },
        body:JSON.stringify(fields),
    }).then(response => {
        if (response.redirected) {
            NewPage(response.url);
            return ;
        }
        return response.json();
    }).then(data => {
        handle_data(data);
    }).catch(error => {
        console.log("can't submit data error:", error, "|");
    })
}