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
    console.log("at getjwt-> access:",access);
    if (access == null || access == undefined) {
        NewPage("/login");
        return null;
    }
    else {
        let payload = access.split('.')[1];
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        payload = atob(payload);
        const exp = JSON.parse(payload)['exp'];
    
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime + 60 <= exp) {
            console.log("enter here");
            const resp = fetch("https://localhost:8000/token/valid",{
                'Autorizaion': `Bearer ${access}`
            });
            if (resp.status == 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                NewPage("/login");
            }
            return access;
        }
        const refresh = localStorage.getItem('refresh_token');

        if (refresh == null ||  refresh == undefined)
            NewPage("/login");
        let token = null;
        const response = await fetch("https://localhost:8000/api/token/refresh/",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refresh
            })
        });
        if (response.status == 401)
            NewPage("/login");
        else {
            const data = await response.json();
            token = data.access;
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
        }
        return token;
    }
}

export const NewPage = (url) => {
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
        history.pushState({}, '', url);
    }).catch(error => {
        console.log("can't load page :", error);
    });
    throw "change page";
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
    for(let i = 0; i < 10;i++)
    {
    fields['username'] = 'user' + i;
    fields['email'] = 'email' + i + '@gmail.com';
    fields['password2'] = 'hello1998';
    fields['password1'] = 'hello1998';
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
        console.log("catch fetch:can't submit data error:", error, "|");
    }); 
    }
    
}