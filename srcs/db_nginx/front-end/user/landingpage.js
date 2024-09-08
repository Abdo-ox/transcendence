import { getCsrfToken, loadAnotherPage } from "https://localhost/home/utils.js";

window.addEventListener('scroll',function(){
    var header = document.querySelector('header');
    header.classList.toggle('sticky',window.scrollY > 0);
});
document.addEventListener('DOMContentLoaded', async () => {
    const csrf_token = await getCsrfToken();
    loadAnotherPage('login-btn', '/login.html');
}, { once: true });
