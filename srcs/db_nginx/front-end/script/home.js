import { NewPage, getJWT, printErrorInScreen } from "https://localhost/utils.js";
import { GamePlaySocket } from "https://localhost/header.js";
import { Login } from "https://localhost/login.js";
import { Tournament } from "https://localhost/tournament.js";
import { Game } from "https://localhost/game.js";
import { Local } from "https://localhost/local.js";
import { Multi } from "https://localhost/multi.js";
import { TournamentFr } from "https://localhost/fr-tournament.js";

function joinOrContinue(array, action, homeCard) {
    array.forEach(tournament => {
        const divTournament = document.createElement('div');
        divTournament.classList.add('homeCard-card');
        divTournament.innerHTML += `
            <img src="${tournament.image}" alt="">
            <div class="homeCard-tr-name">
                <h2 class="homeCard-title" id="tournament-title">${tournament.name}</h2>
                <button class="home-btn">${action}</button>
            </div>`;
        divTournament.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation();
            sessionStorage.setItem("tournament_name", tournament.name);
            NewPage("/fr-tournament", TournamentFr);
        });
        homeCard.appendChild(divTournament);
    });
}

function tournaments(data) {
    console.log("tournament:", data);
    const homeCard = document.getElementById("home-card-stack");
    joinOrContinue(data.continue, 'Continue', homeCard);
    joinOrContinue(data.join, 'Join', homeCard);
}

function pieChart2(data) {
    const total = data.tournament + data.ai_match + data.friend_match + data.unkown_match;
    let tournament = ((data.tournament * 100) / total);
    let ai = ((data.ai_match * 100) / total);
    let friend = ((data.friend_match * 100) / total);
    let unknown = ((data.unkown_match * 100) / total);
    if (!total) {
        tournament = 0;
        ai = 0;
        friend = 0;
        unknown = 0;
    } else
        document.getElementById("home-nothing-chart-2")?.remove();
    document.getElementById('home-tournament').style.setProperty('--content', `"${tournament}%"`);
    document.getElementById('home-ai').style.setProperty('--content', `"${ai}%"`);
    document.getElementById('home-friend').style.setProperty('--content', `"${friend}%"`);
    document.getElementById('home-unknown').style.setProperty('--content', `"${unknown}%"`);
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
    let i = 4;
    data.forEach(user => {
        leaderboardcontainer.innerHTML += `<div class="home-user-class">
            <div class="home-rank-username">
                <p class="home-rank-user">${i++}</p>
                <h3>${user.username}</h3>
            </div>
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

const colors = ["#3CB371", "#FFD700", "#4682B4"];

function coalitionRank(data) {
    data.sort((a, b) => b - a);
    document.getElementById("home-coalition-winner").innerHTML = data[0].name;
    document.getElementById("home-coalFirst").src = data[0].image;
    document.getElementById("home-coalSecond").src = data[1].image;
    document.getElementById("home-coalThird").src = data[2].image;
}

function pieChart1(data) {
    console.log(data);
    const piechart1 = document.getElementById("home-pie-chart-1");
    const total = data.reduce((sum, obj) => sum + obj.score, 0);
    const src = [data[0].score / total * 100, data[1].score / total * 100, data[2].score / total * 100];

    if (total) {
        document.getElementById("home-nothing-chart-1")?.remove();
        const max = Math.max(...src);
        console.log(max);
        const index_max = src.indexOf(max);
        piechart1.style.setProperty('--percent', `"${max.toFixed(1)}%"`);
        piechart1.style.setProperty('--percent-color', `${colors[index_max]}`);
        coalitionRank(data);
    } else
        src.forEach((coalition, i) => src[i] = (isNaN(coalition) ? 0 : coalition));
    document.getElementById("home-night-spin-name").innerHTML = data[0].name;
    document.getElementById("home-night-spin-percent").innerHTML = src[0].toFixed(1) + '%';
    document.getElementById("home-ghost-paddle-name").innerHTML = data[1].name;
    document.getElementById("home-ghost-paddle-percent").innerHTML = src[1].toFixed(1) + '%';
    document.getElementById("home-eclipse-pong-name").innerHTML = data[2].name;
    document.getElementById("home-eclipse-pong-percent").innerHTML = src[2].toFixed(1) + '%';
    document.getElementById("home-pie-chart-1").style.setProperty('background', `conic-gradient(from 30deg,
        ${colors[0]}  ${Math.round(src[0] * 3.6)}deg,
        ${colors[1]}  ${Math.round(src[0] * 3.6)}deg ${Math.round(src[1] * 3.6)}deg,
        ${colors[2]}  ${Math.round(src[1] * 3.6)}deg ${Math.round(src[2] * 3.6)}deg)`);
}

const buttonsEventHandler = async (button, GamePlaySocket, action, currentUser) => {
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
    else {
        errors = await response.json();
        printErrorInScreen(errors.errors);
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
    if (!response.status) {
        console.error('Failed to fetch suggest friends.');
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
        NewPage("/fr-tournament", TournamentFr);
    });

    document.getElementById("home-logout-container").addEventListener('click', () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        NewPage("/login", Login, false);
    });
    const token = await getJWT();

    // tournament cards 
    fetch("https://localhost:9090/tournaments/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.status == 200)
            return response.json();
    }).then(data => tournaments(data)
    ).catch(error => printErrorInScreen(error));

    // tournament cards end

    fetch("https://localhost:9090/matchcount/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.status == 200)
            return response.json();
    }).then(data => pieChart2(data)
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

    fetch("https://localhost:8000/api/coalitions/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => response.json()).then(data => pieChart1(data));
    // fetch("https://localhost:8000/friend/userFriends?ajari", {
    //     headers:{
    //         Authorization: `Bearer ${token}`
    //     }
    // }).then(response => response.json()).then(data => console.log("data", data));
}