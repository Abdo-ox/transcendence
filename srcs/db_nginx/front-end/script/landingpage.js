import { is_authenticated, NewPage } from "https://10.32.72.122/utils.js";
import { Login } from "https://10.32.72.122/login.js";


export  async function Landing()
{
    if (await is_authenticated())
        return;
    document.getElementById("landing-login-btn").addEventListener('click', ()=> NewPage('/login', Login, false));
}
