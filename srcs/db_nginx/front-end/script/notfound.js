import { NewPage } from "/utils.js"
import { Home } from "/home.js"

export const NotFound = () => {
    document.body.style.visibility = 'visible';
    document.querySelector('button').addEventListener('click', () => NewPage('/home', Home));
}