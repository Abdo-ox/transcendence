import { NewPage, getJWT , setRunedHeader} from "/home/utils.js";

setRunedHeader();

document.querySelectorAll('#settings-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/settings", false);
    })
});

document.querySelectorAll('#chat-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/chat", false);
    })
});

document.querySelectorAll('#home-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/home", false);
    })
});

document.querySelectorAll('profile-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/profile", false);
    })
});

const menuicon = document.getElementById("menu-icon");
if (menuicon)
    menuicon.addEventListener('click', () => {
        document.getElementById("side-bar").style.display = 'flex';
    });

const closeicon = document.getElementById("close-icon");
if (closeicon)
    closeicon.addEventListener('click', () => {
        document.getElementById("side-bar").style.display = 'none';
    });

fetch('https://localhost:8000/api/suggest/friend/', {
    headers: {
        'Authorization': `Bearer ${await getJWT()}`,
    }
}).then(response => {
    if (response.ok) {
        return response.json();
    }
    throw "error in loading data of the current user";
}).then(data => {
    document.getElementById("profile-image-header").src = data.currentUser.profile_image;
    document.getElementById("username-header").innerHTML = data.currentUser.username;
}).catch(error => {
    console.log(error);
});

document.getElementById("profile-box").addEventListener('click', () => {
    NewPage("/profile", false);
});