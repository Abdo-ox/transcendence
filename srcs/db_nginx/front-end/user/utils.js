export const getCsrfToken = async () => {
    return await fetch("https://localhost:8000/api/csrf_token/")
        .then(response =>response.json())
        .then(data => data.csrf_token)
            .catch(error => {
            console.log("can't get the csrf token :", error);
        });
}

export const getJWT = async () => {
    const access = localStorage.getItem('access_token');
    console.log("access at n getjwt:", access);
    if (access == null || access == 'undefined') {
        console.log("enter to if condition");
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
            const resp = fetch("https://localhost:8000/is_authenticated/",{
                'Autorization': `Bearer ${access}`
            });
            if (resp.status == 401) {
                console.error("remove the atems form the local storage");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                NewPage("/login", true, false);
            }
            return access;
        }
        const refresh = localStorage.getItem('refresh_token');
        if (refresh == 'null' ||  refresh == 'undefined')
            NewPage("/login", true);
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
        if (response.status == 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            NewPage("/login", true);
        }
        else {
            const data = await response.json();
            token = data.access;
            console.log("the new token:", data.access);
            localStorage.setItem('access_token', data.access);
        }
        return token;
    }
}

export const NewPage = (url, thr=true, addhistory=true) => {
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
                element.src = script.src + '?t=' + new Date().getTime(); 
                element.type = 'module';
            }
            element.onload = () => {
                if (++j == scripts.length) {
                    console.log("dispatch event");
                    document.dispatchEvent(event);
                }
            };
            element.onerror = () => console.log("error in on error to load js file in NewPage");
            document.body.appendChild(element);
        });
        if (addhistory)
            history.pushState({}, '', url);
    }).catch(error => {
        console.log("can't load page :", error);
    });
    if (thr)
        throw "change page to:=>" + url;
}

export const submitForm = (url, ids, csrf_token, handle_data) => {
    let fields = {};
    for (const id of ids) {
        try{
            fields[id] = document.getElementById(id).value;
        }
        catch(error){
            console.error('id: ', id, " error: ",error);
        }
        if (fields[id].trim().length == 0) {
            alert(id ,' is required');
            return ;
        }
        if (id == 'password2' && fields[id] != fields['password1']) {
            alert('passwords not equal');
            return ;
        }
    }
    // for(let i = 0; i < 10;i++)
    // {
    // fields['username'] = 'user' + i;
    // fields['email'] = 'email' + i + '@gmail.com';
    // fields['password2'] = 'hello1998';
    // fields['password1'] = 'hello1998';
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
    // }
    
}


const t = () => {
    getJWT().then((token) => {
        console.log("hello:", token);
    })
}

export const routing = (event) => {
    console.error("hello word=>", window.location.pathname);
    NewPage(window.location.pathname, true, false);
}