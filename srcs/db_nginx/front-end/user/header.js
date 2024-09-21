import { NewPage } from "/home/utils.js";

document.querySelectorAll('#settings-btn').forEach(button => {
    console.log(button);
    button.addEventListener('click', () => {
        NewPage("/settings", true);
    })
});

document.querySelectorAll('#chat-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/chat", true);
    })
});

document.querySelectorAll('#home-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/home", true);
    })
});

document.querySelectorAll('profile-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/profile", true);
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