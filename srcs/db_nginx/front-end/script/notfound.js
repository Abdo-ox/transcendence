import { NewPage } from "https://10.32.72.122/utils.js"
import { Home } from "https://10.32.72.122/home.js"

export const NotFound = () => {
    document.body.style.visibility = 'visible';
    document.querySelector('button').addEventListener('click', () => NewPage('/home', Home));
}