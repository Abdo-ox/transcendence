import { Landing } from "/landingpage.js"
import { Login } from "/login.js"
import { Register } from "/register.js"
import { Home } from "/home.js"
import { Settings } from "/settings.js"
import { Profile } from "/profile.js"
import { ResetPassword } from "/resetpassword.js"
import { Tournament } from "/tournament.js"
import { Local } from "/local.js"
import { Multi } from "/multi.js"
import { Game } from "/game.js"
import { NewPage } from "/utils.js"
import { Chat } from "/chat.js"
import { Twofactor } from "/2faa.js"

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    switch (pathname) {
        case "/home":
            NewPage("/home", Home);
            break;
        case "/landingpage":
            NewPage("/landingpage", Landing);
            break;
        case "/login":
            console.log("login");
            NewPage("/login", Login);
            break;
        case "/register":
            NewPage("/register", Register);
            break;
        case "/settings":
            NewPage("/settings", Settings);
            break;
        case "/resetpassword":
            NewPage("/resetpassword", ResetPassword);
            break;
        case "/profile":
            NewPage("/profile", Profile);
            break;
        case "/chat":
            NewPage("/chat", Chat);
        case "/2faa":
            NewPage("/2faa", Twofactor);
            break;
        case "/game":
            NewPage("/game", Game);
            break;
        case "/local":
            NewPage("/local", Local);
            break;
        case "/multi":
            NewPage("/multi", Multi);
            break;
        case "/tournament":
            NewPage("/tournament", Tournament);
            break;
    }
});