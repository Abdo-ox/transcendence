import { NewPage } from "https://localhost/utils.js"
import { Home } from "https://localhost/home.js"

export const NotFound = () => {
    document.body.style.visibility = 'visible';
    document.querySelector('button').addEventListener('click', () => NewPage('/home', Home));
}