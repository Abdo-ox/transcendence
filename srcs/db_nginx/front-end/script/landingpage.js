import { is_authenticated, NewPage } from "https://10.14.60.29/utils.js";
import { Login } from "https://10.14.60.29/login.js";


export  async function Landing()
{
    if (await is_authenticated())
        return;
    document.getElementById("landing-login-btn").addEventListener('click', ()=> NewPage('/login', Login, false));
}
