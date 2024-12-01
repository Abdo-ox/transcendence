import { Landing } from "https://10.14.60.29/landingpage.js"
import { Login } from "https://10.14.60.29/login.js"
import { Register } from "https://10.14.60.29/register.js"
import { Home } from "https://10.14.60.29/home.js"
import { Settings } from "https://10.14.60.29/settings.js"
import { Profile } from "https://10.14.60.29/profile.js"
import { ResetPassword } from "https://10.14.60.29/resetpassword.js"
import { Reset } from "https://10.14.60.29/reset.js"
import { Tournament } from "https://10.14.60.29/tournament.js"
import { Local } from "https://10.14.60.29/local.js"
import { Multi } from "https://10.14.60.29/multi.js"
import { Game } from "https://10.14.60.29/game.js"
import { NewPage } from "https://10.14.60.29/utils.js"
import { Chat } from "https://10.14.60.29/chat.js"
import { Twofactor } from "https://10.14.60.29/2faa.js"
import { ConfirmationMail } from "https://10.14.60.29/confirmationMail.js"
import { TournamentFr } from "https://10.14.60.29/fr-tournament.js"
import { NotFound } from "https://10.14.60.29/notfound.js"

const func = {
    "/home": Home,
    "/chat": Chat,
    "/settings":  Settings,
    "/profile":  Profile,
    "/local":  Local,
    "/tournament": Tournament,
    "/fr-tournament": TournamentFr,
    "/game": Game,
    "/multi": Multi,
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