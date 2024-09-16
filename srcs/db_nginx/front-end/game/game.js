import { NewPage, getJWT } from "https://localhost/home/utils.js";


try {
    let access_token = await getJWT();
    fetch('https://localhost:8000/api/suggest/friend/', {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    }).then(response => response.json()).then(data => {
        console.log("data", data);
        const currentUser = document.getElementById("name");
        const currentprof = document.getElementById("profile-image");
        currentUser.innerHTML = data.currentUser.username;
        currentprof.src = data.currentUser.profile_image;
    });
    // add event listner for chnaging the page to a new page
    document.getElementById("chat-btn").addEventListener('click', () => {
        NewPage("/chat", true);
    });
    document.getElementById("settings-btn").addEventListener('click', () => {
        NewPage("/settings", true);
    });
    document.getElementById("name").addEventListener('click', () => {
        NewPage("/profile", true);
    });
    document.getElementById("profile-image").addEventListener('click', () => {
        NewPage("/profile", true);
    });
    document.getElementById("logo").addEventListener('click', () => {
        NewPage("/home", true);
    });
    document.getElementById("home-btn").addEventListener('click', () => {
        NewPage("/home", true);
    });
} catch(error){
    console.log(error);
}