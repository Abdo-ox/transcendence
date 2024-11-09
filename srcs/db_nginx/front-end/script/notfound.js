<<<<<<< HEAD
import { NewPage } from "https://10.14.60.29/utils.js"
import { Home } from "https://10.14.60.29/home.js"
=======
import { NewPage } from "https://10.32.72.122/utils.js"
import { Home } from "https://10.32.72.122/home.js"
>>>>>>> e91eeb378735dd762cba6a600a6538a34ef40320

export const NotFound = () => {
    document.body.style.visibility = 'visible';
    document.querySelector('button').addEventListener('click', () => NewPage('/home', Home));
}