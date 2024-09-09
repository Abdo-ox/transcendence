import { NewPage, getJWT } from "https://localhost/home/utils.js";


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

    fetch('https://localhost:8000/api/suggest/friend/',{
        headers:{
            'Authorization': `Bearer ${access_token}`,
        }
    }).then(response => response.json()).then(data => {
       console.log("data", data);
        const suggestionscontainer = document.getElementById("suggestions-container");
        const currentUser = document.getElementById("name");
        const currentprof= document.getElementById("profile-image");
        currentUser.innerHTML = data.currentUser.username;
        currentprof.src= data.currentUser.profile_image;
        data.suggestions.forEach(user => {
            suggestionscontainer.innerHTML += `
            <div class="user">
                    <div class="info-user">
                        <img src="${user.profile_image}">
                        <h3>${user.username}</h3>
                    </div>
                    <button>send</button>
            </div>`
        });
    });
    // console.clear();
    // document.getElementById('profile-image').src = data.profile_image;
    // console.log("data:",typeof data, data.profile_image);
    document.getElementById("chat-btn").addEventListener('click', () => {
        NewPage("/chat/index.html");
    });
    document.getElementById("name").addEventListener('click', () => {
        NewPage("/profile.html");
    });
}, {once:true});