import { NewPage, getJWT } from "./utils.js";


document.addEventListener('DOMContentLoaded', async () => {
    let access_token = await getJWT();
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

    const data = await fetch('https://localhost:8000/api/user/data/', {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    }).then(response => {
        return response.json();
    });

    console.clear();
    document.getElementById('profile-image').src = data.profile_image;
    console.log("data:",typeof data, data.profile_image);
    document.getElementById("chat-btn").addEventListener('click', () => {
        NewPage("/chat/index.html");
    });
}, {once:true});