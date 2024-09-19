import { NewPage, getJWT, routing } from "https://localhost/home/utils.js";
console.log("home.js called");


window.removeEventListener('popstate',routing);
window.addEventListener('popstate',routing);

document.addEventListener('DOMContentLoaded', async () => {
    try {
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
        /**** add event listener for the nemu bar side ****/

        document.getElementById("menu-icon").addEventListener('click', () => {
            document.getElementById("side-bar").style.display = 'flex';
        });
        document.getElementById("close-icon").addEventListener('click', () => {
            document.getElementById("side-bar").style.display = 'none';
        });
        fetch('https://localhost:8000/api/suggest/friend/', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            }
        }).then(response => response.json()).then(data => {
            console.log("data", data);
            const suggestionscontainer = document.getElementById("suggestions-container");
            const currentUser = document.getElementById("name");
            const currentprof = document.getElementById("profile-image");
            currentUser.innerHTML = data.currentUser.username;
            currentprof.src = data.currentUser.profile_image;
            suggestionscontainer.innerHTML = '';
            data.suggestions.forEach(user => {
                suggestionscontainer.innerHTML += `
                    <div class="user">
                            <div class="info-user">
                                <img src="${user.profile_image}">
                                <h3>${user.username}</h3>
                            </div>
                            <button class="request-btn" username="${user.username}">send</button>
                            <button class="cancel-btn" username="${user.username}">cancel</button>
                    </div>`;
            });
            document.querySelectorAll('.request-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    console.log("the user you want to create a friendship with is: ", button.getAttribute('username'));
                    const responce = await fetch(`https://localhost:8000/friend/request/?username=${button.getAttribute('username')}`,{
                        headers: {
                            Authorization: `Bearer ${await getJWT()}`
                        }
                    });
                    if (responce.status == 200){
                        button.style.display = 'none';
                        button.parentElement.querySelector('.cancel-btn').style.display = 'block';
                    }
                });
            });

            document.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const responce = await fetch(`https://localhost:8000/friend/cancel/?username=${button.getAttribute('username')}`,{
                        headers: {
                            Authorization: `Bearer ${await getJWT()}`
                        }
                    });
                    if (responce.status == 200){
                        button.style.display = 'none';
                        button.parentElement.querySelector('.request-btn').style.display = 'block';
                    }
                });
            });
        });

        // add event listner for chnaging the page to a new page

        document.getElementById("chat-btn").addEventListener('click', () => {
            NewPage("/chat", true);
        });
        document.getElementById("settings-btn").addEventListener('click', () => {
            NewPage("/settings", true);
        });
        document.getElementById("name").addEventListener('click', () => {
            NewPage("/profile", true);
        });

        // game events

        document.getElementById("ai-play").addEventListener('click', () => {
            NewPage("/game", true);
        });

        document.getElementById("multi-play").addEventListener('click', () => {
            NewPage("/multi", true);
        });

        document.getElementById("local-play").addEventListener('click', () => {
            NewPage("/local", true);
        });

        // end of game events

        // add event listener for sending friend request

        const response = await fetch("https://localhost:8000/friend/request/?username=user1", {
            headers: {
                
                
            }
        });

    } catch (error) {
        console.log(error);
    }
}, { once: true });