import { Landing } from "/landingpage.js"
import { Login } from "/login.js"
import { Register } from "/register.js"
import { Home } from "/home.js"
import { Settings } from "/settings.js"
import { Profile } from "/profile.js"
import { ResetPassword } from "/resetpassword.js"
import { Reset } from "/reset.js"
import { Tournament } from "/tournament.js"
import { RemoteTournament } from "/remotetournament.js"
import { Local } from "/local.js"
import { Multi } from "/multi.js"
import { Game } from "/game.js"
import { NewPage } from "/utils.js"
import { Chat } from "/chat.js"
import { Twofactor } from "/2faa.js"
import { ConfirmationMail } from "/confirmationMail.js"
import { TournamentFr } from "./fr-tournament.js"
import { NotFound } from "./notfound.js"

const func = {
    "/home": Home,
    "/chat": Chat,
    "/settings":  Settings,
    "/profile":  Profile,
    
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("SPA page called");
    const pathname = window.location.pathname;
    window.addEventListener('popstate', (event) => {
        event.preventDefault();
        const name = window.location.pathname;
        console.log(`name:${name} func:${func[name]}`);
        NewPage(name, func[name], false);
    });
    switch (pathname) {
        case "/":
            NewPage("/landingpage", Landing, false);
            break;
        case "/home":
            NewPage("/home", Home, false);
            break;
        case "/landingpage":
            NewPage("/landingpage", Landing, false);
            break;
        case "/login":
            NewPage("/login", Login, false);
            break;
        case "/register":
            NewPage("/register", Register, false);
            break;
        case "/settings":
            NewPage("/settings", Settings, false);
            break;
        case "/resetpassword":
            NewPage("/resetpassword", ResetPassword, false);
            break;
        case "/reset":
            NewPage("/reset", Reset, false);
            break;
        case "/profile":
            NewPage("/profile", Profile, false);
            break;
        case "/chat":
            NewPage("/chat", Chat, false);
            break;
        case "/2faa":
            NewPage("/2faa", Twofactor, false);
            break;
        case "/game":
            NewPage("/game", Game, false);
            break;
        case "/local":
            NewPage("/local", Local, false);
            break;
        case "/multi":
            NewPage("/multi", Multi, false);
            break;
        case "/tournament":
            NewPage("/tournament", Tournament, false);
            break;
        case "/remotetournament":
            NewPage("/remotetournament", RemoteTournament, false);
            break;
        case "/confirmationMail":
            NewPage("/confirmationMail", ConfirmationMail, false);
            break;
        case "/fr-tournament":
            NewPage("/fr-tournament", TournamentFr, false);
            break;
        default:
            NewPage("/notfound", NotFound, false);
    }
});