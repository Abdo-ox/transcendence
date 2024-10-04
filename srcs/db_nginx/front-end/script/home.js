import { NewPage, getJWT, redirectTwoFactor, routing } from "/utils.js";
import {GamePlaySocket} from "/header.js";
import {Login} from "/login.js";
import { Tournament } from "./tournament.js";
import { Game } from "./game.js";
import { Local } from "./local.js";
import { Multi } from "./multi.js";

export async function Home() 
{
    let access_token = await getJWT();
    /**** coalition rank** */
    // const SettingBtn = document.getElementById('settings-btn');
    // SettingBtn.classList.remove('header-activ-page2'); 
    // if (!SettingBtn.classList.contains('header-li-a-style')) {
    //     SettingBtn.classList.add('header-li-a-style'); 
    // }

    // const chatBtn = document.getElementById('chat-btn');
    // chatBtn.classList.remove('header-activ-page2'); 
    // if (!chatBtn.classList.contains('header-li-a-style')) 
    //     chatBtn.classList.add('header-li-a-style'); 
 
    let myModal = undefined;

    let t1 = document.getElementById("home-coalFirst");
    let t2 = document.getElementById("home-coalSecond");
    let t3 = document.getElementById("home-coalThird");
    /**** add event listener for the nemu bar side ****/

    const response = await fetch('https://localhost:8000/api/suggest/friend/', {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    })
    if (!response.ok) {
        console.error('Failed to fetch suggest friends  :', response.status, response.statusText);
        return;
    }
    const data = await response.json();
  
    console.log("data   home : ****", data);
    const suggestionscontainer = document.getElementById("home-suggestions-container");
    suggestionscontainer.innerHTML = '';
    data.suggestions.forEach(user => {
        suggestionscontainer.innerHTML += `
                    <div class="home-user">
                            <div class="home-info-user">
                                <img src="${user.profile_image}">
                                <h3>${user.username}</h3>
                            </div>
                            <button class="home-request-btn" username="${user.username}">send</button>
                            <button class="home-cancel-btn" username="${user.username}">cancel</button>
                    </div>`;
    });
    document.querySelectorAll('.home-request-btn').forEach(button => 
    {
        button.addEventListener('click', async () => {
            console.log("the user you want to create a friendship with is: ", button.getAttribute('username'));
            const response = await fetch(`https://localhost:8000/friend/request/?username=${button.getAttribute('username')}`, {
                headers: {
                    Authorization: `Bearer ${await getJWT()}`
                }
            });
            console.log("response_status:", response.status)
            if (response.status == 200) {
                if (GamePlaySocket.readyState === WebSocket.OPEN) {
                    // GamePlaySocket.onopen = () => {
                    console.log('WebSocket connection opened inside home page');
                    GamePlaySocket.send(JSON.stringify({
                        'from': data.currentUser.username,
                        'to': button.getAttribute('username'),
                        'message': `${data.currentUser.username} send freind request.`
                    }));
                    // };
                }
                // button.style.display = 'none';
                // button.parentElement.querySelector('.home-cancel-btn').style.display = 'block';
            }
        });
    })
    // game events
        document.getElementById("home-ai-play").addEventListener('click', () => {
        NewPage("/game", Game);
    });

    document.getElementById("home-multi-play").addEventListener('click', () => {
        NewPage("/multi", Multi);
    });

    document.getElementById("home-local-play").addEventListener('click', () => {
        NewPage("/local", Local);
    });

    document.getElementById("tournament-local-btn").addEventListener('click', () => {
        myModal.hide();
        NewPage("/tournament", Tournament);
    });

    function showModal() {
        myModal = new bootstrap.Modal(document.getElementById('myModal'));
        myModal.show();
    }

    document.getElementById("home-add").addEventListener('click', async () => {
        showModal();
    });

    document.getElementById("home-logout-container").addEventListener('click', () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        NewPage("/login", Login, false);
    });
}