<<<<<<< HEAD
import { is_authenticated, NewPage } from "https://10.14.60.29/utils.js";
import { Login } from "https://10.14.60.29/login.js";
=======
import { is_authenticated, NewPage } from "https://10.32.72.122/utils.js";
import { Login } from "https://10.32.72.122/login.js";
>>>>>>> e91eeb378735dd762cba6a600a6538a34ef40320


export  async function Landing()
{
    if (await is_authenticated())
        return;
    document.getElementById("landing-login-btn").addEventListener('click', ()=> NewPage('/login', Login, false));
}
