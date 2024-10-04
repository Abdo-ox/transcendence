import { getCsrfToken } from "/utils.js";

// window.addEventListener('scroll', function () {
//     var header = document.querySelector('header');
//     header.classList.toggle('sticky', window.scrollY > 0);
// });

export  async function Landing()
{
    const csrf_token = await getCsrfToken();
    // loadAnotherPage('landing-login-btn', '/login.html'); newpage here 
}
