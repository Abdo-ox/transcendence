import { is_authenticated, NewPage } from "./utils.js";
import { Login } from "/login.js";


export  async function Landing()
{
    if (await is_authenticated())
        return;
    document.getElementById("landing-login-btn").addEventListener('click', ()=> NewPage('/login', Login, false));
}
