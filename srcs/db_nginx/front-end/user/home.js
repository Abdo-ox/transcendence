import { NewPage, getJWT ,redirectTwoFactor} from "https://localhost/home/utils.js";
console.log("home.js called");

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("tokeN=>", localStorage.getItem('access_token'));
        console.log("tokeN=>", localStorage.getItem('refresh_token'));
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
        fetch('https://localhost:8000/api/suggest/friend/', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            }
            })
            .then(response => {
                console.log("Response status code:", response.status);
                // if (!response.ok) {
                // throw new Error('Network response was not ok');
                // }
                return response.json().then(data => ({ data, status: response.status }));
            })
            .then(({ data, status }) => {
            redirectTwoFactor(data, status);
            console.log("data : ****", data);
            const suggestionscontainer = document.getElementById("suggestions-container");
            const currentUser = document.getElementById("name");
            const currentprof = document.getElementById("profile-image");
            currentUser.innerHTML = data.currentUser.username;
            currentprof.src = data.currentUser.profile_image;
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
        document.getElementById("chat-btn").addEventListener('click', () => {
            NewPage("/chat", true);
        });
        document.getElementById("settings-btn").addEventListener('click', () => {
            NewPage("/settings", true);
        });
        document.getElementById("name").addEventListener('click', () => {
            NewPage("/profile", true);
        });
    } catch(error){
        console.log(error);
    }
}, { once: true });