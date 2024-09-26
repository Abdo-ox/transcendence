import { NewPage } from "/home/utils.js";



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

console.log("the header executed successfully")