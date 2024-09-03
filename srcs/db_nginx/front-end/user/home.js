import { NewPage, getJWT } from "./utils.js";


document.addEventListener('DOMContentLoaded', () => {
    /***window scrool */
    window.addEventListener('scroll', function () {
        var header = document.querySelector('header');
        header.classList.toggle('sticky', window.scrollY > 0);
    });


    /**** coalition rank** */

    let t1 = document.getElementById("coalFirst");
    let t2 = document.getElementById("coalSecond");
    let t3 = document.getElementById("coalThird");

    /**tournament box  */

    // var swiper = new Swiper(".swiper-container", {
    //     effect: "cards",
    //     grabCursor: true,
    //     initialSlide: 2,
    //     speed: 500,
    //     loop: true,
    //     rotate: true,
    //     mousewheel: {
    //         invert: false,
    //     },
    // });

    let t = { a: 'home', b: 'api', func: () => console.log("hello") };

    console.log(typeof t, t);
    let s = JSON.stringify(t);
    t = JSON.parse(s);
    console.log(typeof t, t);
    console.log(typeof s, s);

    document.getElementById("chat-btn").addEventListener('click', () => {
        NewPage("/chat/index.html");
    });

    // console.log("hello:", localStorage.getItem('accessToken'));

    // fetch("https://localhost:8000/api/user/data/", {
    //     headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    //     }
    // }).then(data => {
    //     return data.json();
    // }).then(data => console.log("hello::::===>", data))
    // .catch(error => console.log("catsherror: ", error));
    getJWT('https://localhost:8000/api/user/data/', 'GET', {
           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }, null );
});