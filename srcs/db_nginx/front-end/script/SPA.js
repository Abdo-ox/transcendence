import { Landing } from "https://localhost/landingpage.js"
import { Login } from "https://localhost/login.js"
import { Register } from "https://localhost/register.js"
import { Home } from "https://localhost/home.js"
import { Settings } from "https://localhost/settings.js"
import { Profile } from "https://localhost/profile.js"
import { ResetPassword } from "https://localhost/resetpassword.js"
import { Reset } from "https://localhost/reset.js"
import { Tournament } from "https://localhost/tournament.js"
import { RemoteTournament } from "https://localhost/remotetournament.js"
import { Local } from "https://localhost/local.js"
import { Multi } from "https://localhost/multi.js"
import { Game } from "https://localhost/game.js"
import { NewPage } from "https://localhost/utils.js"
import { Chat } from "https://localhost/chat.js"
import { Twofactor } from "https://localhost/2faa.js"
import { ConfirmationMail } from "https://localhost/confirmationMail.js"
import { TournamentFr } from "https://localhost/fr-tournament.js"
import { NotFound } from "https://localhost/notfound.js"

const func = {
    "/home": Home,
    "/chat": Chat,
    "/settings":  Settings,
    "/profile":  Profile,
    
}

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname.replace(/(?!^\/)\/$/, "");
    window.addEventListener('popstate', (event) => {
        event.preventDefault();
        const name = window.location.pathname.replace(/(?!^\/)\/$/, "");
        if (name in func)
            NewPage(name, func[name], false);
        else 
            NewPage("/notfound", NotFound, false);
    });
    console.log(pathname)
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