import { NewPage, getJWT } from "/utils.js";
import { GamePlaySocket } from "/header.js";
import { Login } from "/login.js";
import { Tournament } from "./tournament.js";
import { RemoteTournament } from "./remotetournament.js";
import { Game } from "./game.js";
import { Local } from "./local.js";
import { Multi } from "./multi.js";
import { TournamentFr } from "./fr-tournament.js";

function pieChart2(data) {
    const total = data.tournament + data.ai_match + data.friend_match + data.unkown_match;
    let tournament = (data.tournament * 100) / total;
    let ai = (data.ai_match * 100) / total;
    let friend = (data.friend_match * 100) / total;
    let unknown = (data.unkown_match * 100) / total;
    document.getElementById('home-tournament').style.setProperty('--content', `"${tournament}"`);
    document.getElementById('home-ai').style.setProperty('--content', `"${ai}"`);
    document.getElementById('home-friend').style.setProperty('--content', `"${friend}"`);
    document.getElementById('home-unknown').style.setProperty('--content', `"${unknown}"`);
    tournament = (data.tournament * 360) / total;
    ai = (data.ai_match * 360) / total;
    friend = (data.friend_match * 360) / total;
    unknown = (data.unkown_match * 360) / total;
    document.getElementById('home-pie-chart-2').style.setProperty('background', `
        radial-gradient(circle, #1b2141 40%, transparent 41%),
        conic-gradient(from 30deg,
            #d16ba5 0 ${friend}deg,
            #86a8e7 0 ${friend + ai}deg,
            #ffd600 0 ${friend + ai + unknown}deg,
            #0091ad 0 ${friend + ai + unknown + tournament}deg)`);
}

function fillPhase(target_phase, user_data) {
    document.getElementById(`home-${target_phase}-img`).src = user_data.profile_image;
    document.getElementById(`home-${target_phase}-username`).innerHTML = user_data.username;
    document.getElementById(`home-${target_phase}-score`).innerHTML = user_data.score;
}

function laederBoard(data) {
    console.log("leader board:", data);
    const leaderboardcontainer = document.getElementById('home-leader-board');
    data.sort((a, b) => b.score - a.score);
    if (data.length > 0)
        fillPhase('first', data[0]);
    if (data.length > 1)
        fillPhase('second', data[1]);
    if (data.length > 2)
        fillPhase('third', data[2]);
    for (let i = 0; i < 3 && data.length; i++)
        data.shift();
    data.forEach(user => {
        leaderboardcontainer.innerHTML += `<div class="home-user-class">
            <h3>${user.username}</h3>
            <div class="home-up-down">
                <p>+${user.last_score}</p>
                <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960"
                    width="15px" fill="#75FB4C">
                    <path
                        d="m296-224-56-56 240-240 240 240-56 56-184-183-184 183Zm0-240-56-56 240-240 240 240-56 56-184-183-184 183Z" />
                </svg>
            </div>
            <p class="home-score-value">${user.score} point</p>
            <img src="${user.profile_image}">
        </div>`
    });
}

const buttonsEventHandler = async (button, GamePlaySocket, action, currentUser) => {
    console.log(`button:${button}`);
    const response = await fetch(`https://localhost:8000/friend/${action[0]}/?username=${button.getAttribute('username')}`, {
        headers: {
            Authorization: `Bearer ${await getJWT()}`
        }
    });
    if (response.status == 200) {
        if (GamePlaySocket.readyState === WebSocket.OPEN) {
            GamePlaySocket.send(JSON.stringify({
                'from': currentUser.username,
                'to': button.getAttribute('username'),
                'message': `${action[0]} friend request.`,
                'flag': 'FriendR',
                'img': currentUser.profile_image,
                'playwith': 'null',
                'block': 'false'
            }));
        }
        button.style.display = 'none';
        button.parentElement.querySelector(`.home-${action[1]}-btn`).style.display = 'block';
    }
}

export async function Home() {
    let access_token = await getJWT();
    if (!access_token)
        return;
    /**** coalition rank** */
    let t1 = document.getElementById("home-coalFirst");
    let t2 = document.getElementById("home-coalSecond");
    let t3 = document.getElementById("home-coalThird");
    function CompareScore(score1, score2, score3) {
        let scores = [score1, score2, score3];
        scores.sort((a, b) => b - a);
        console.log("first place", scores[0]);
        console.log("second place", scores[1]);
        console.log("3 place", scores[2]);
    }
   
    /*****js of card tournaments***** */
    const stack = document.querySelector(".homeCard-stack");
    const cards = Array.from(stack.children)
        .reverse()
        .filter((child) => child.classList.contains("homeCard-card"));

    cards.forEach((card) => stack.appendChild(card));

    function moveCard() {
        const lastCard = stack.lastElementChild;
        if (lastCard.classList.contains("homeCard-card")) {
            lastCard.classList.add("homeCard-swap");

            setTimeout(() => {
                lastCard.classList.remove("homeCard-swap");
                stack.insertBefore(lastCard, stack.firstElementChild);
            }, 1200);
        }
    }

    // let autoplayInterval = setInterval(moveCard, 4000);

    stack.addEventListener("click", function (e) {
        const card = e.target.closest(".homeCard-card");
        if (card && card === stack.lastElementChild) {
            card.classList.add("homeCard-swap");

            setTimeout(() => {
                card.classList.remove("homeCard-swap");
                stack.insertBefore(card, stack.firstElementChild);
            }, 1200);
        }
    });
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

    const suggestionscontainer = document.getElementById("home-suggestions-items");
    suggestionscontainer.innerHTML = '';
    data.suggestions.forEach(user => {
        suggestionscontainer.innerHTML += `
            <div class="home-user" id="home-user-${user.username}">
                    <div class="home-info-user">
                        <div class="home-suggestion-img">
                            <img src="${user.profile_image}">
                        </div>
                        <h3>${user.username}</h3>
                    </div>
                    <button class="home-send-btn" username="${user.username}">send</button>
                    <button class="home-cancel-btn" username="${user.username}">cancel</button>
            </div>`;
    });

    document.querySelectorAll('.home-send-btn').forEach(button => {
        button.addEventListener('click', () => buttonsEventHandler(button, GamePlaySocket, ['send', 'cancel'], data.currentUser));
    });

    document.querySelectorAll('.home-cancel-btn').forEach(button => {
        button.addEventListener('click', () => buttonsEventHandler(button, GamePlaySocket, ['cancel', 'send'], data.currentUser));
    });
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

    document.getElementById("home-local-button").addEventListener('click', async () => {
        NewPage("/tournament", Tournament);
    });

    document.getElementById("home-add").addEventListener('click', event => {
        sessionStorage.removeItem('tournament_name');
        NewPage("/remotetournament", RemoteTournament);
    });

    document.getElementById("home-logout-container").addEventListener('click', () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        NewPage("/login", Login, false);
    });
    const token = await getJWT();

    // tournament cards 
    // const tours = await fetch("https://localhost:9090/multigamehistory/", {
    //     headers: {
    //         Authorization: `Bearer ${token}`
    //     }
    // });


    // let test = await tours.json();
    // document.getElementById("tournament-title").innerText = test[0].name;
    // document.getElementById("join").addEventListener('click', () => {
    //     sessionStorage.setItem('tournament_name', document.getElementById("tournament-title").innerText);
    //     NewPage("/remotetournament", RemoteTournament);
    // });

    // tournament cards end

    fetch("https://localhost:9090/matchcount/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.status == 200)
            return response.json();
    }).then(data => pieChart2(dt)
    ).catch(error => console.log("error in fetch matchcount :", error));

    fetch("https://localhost:9090/leaderboard/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.status == 200)
            return response.json();
    }).then(data => laederBoard(data)
    ).catch(error => console.log("error in fetch matchcount :", error));
}