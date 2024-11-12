import { NewPage } from "https://10.14.60.29/utils.js"
import { Home } from "https://10.14.60.29/home.js"

export const NotFound = () => {
    document.body.style.visibility = 'visible';
    document.querySelector('button').addEventListener('click', () => NewPage('/home', Home));
}