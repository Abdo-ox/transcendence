import { NewPage, getJWT } from "https://10.14.60.29/utils.js";
import { Chat } from "https://10.14.60.29/chat.js";
import { UserStatusSock } from "https://10.14.60.29/header.js";
// window.addEventListener('scroll', function () {
//     var header = document.querySelector('header');
//     header.classList.toggle('sticky', window.scrollY > 0);
// });

export async function Profile() {

    let ProfileImg;
    const params = new URLSearchParams(window.location.search)
    let myuser = params.get('user');
    if (!myuser)
        myuser = '';
    {
        const ArryImag = ['url("/images/acheivements/firstServe.png")',
            'url("/images/acheivements/paddlemaster.jpeg")',
            'url("/images/acheivements/paddle.jpeg")',
            'url("/images/acheivements/rookie.jpg")']

        /**  Endpoint game**/
        const response = await fetch('https://10.14.60.29:9090/gameprofile/' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        document.getElementById("profile-username").innerHTML = data.username;
        document.getElementById("profile-userWelcome").innerHTML = data.username;
        document.getElementById("profile-coalition").src = data.coalition.image;
        ProfileImg = data.profile_image;
        document.getElementById("profile-profileimage").src = data.profile_image;
        document.getElementById("profile-matchScore").innerHTML = data.totalGames;
        document.getElementById("profile-tournamentsScore").innerHTML = data.tournaments;
        let sum = data.totalGames;
        if (sum > 0) {
            document.getElementById("profile-lose").innerHTML = ((data.losses / sum) * 100).toFixed(0) + '%';
            document.getElementById("profile-number").innerHTML = ((data.wins / sum) * 100).toFixed(0) + '%';
        } else {
            document.getElementById("profile-lose").innerHTML = '0%';
            document.getElementById("profile-number").innerHTML = '0%';
        }
        // Win rate animation
        const pourcentage = parseInt(document.getElementById('profile-number').textContent.replace('%', ''));
        const strokeDashoffset = 246 - (246 * pourcentage / 100);
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `@keyframes animWin { 100% { stroke-dashoffset: ${strokeDashoffset}; }}`;
        document.head.appendChild(styleElement);
        document.querySelector('circle').style.animation = 'animWin 2s linear forwards';

        // Loss rate animation
        const pourcentage2 = parseInt(document.getElementById('profile-lose').textContent.replace('%', ''));
        const strokeDashoffset2 = 246 - (246 * pourcentage2 / 100);
        const styleElement2 = document.createElement('style');
        styleElement2.innerHTML = `@keyframes animLose { 100% { stroke-dashoffset: ${strokeDashoffset2}; }}`;
        document.head.appendChild(styleElement2);
        document.getElementById('profile-LossRate').style.animation = 'animLose 2s linear forwards';

        const Levels = [
            { level: 0, min: 0, max: 7 },
            { level: 1, min: 8, max: 21 },
            { level: 2, min: 22, max: 42 },
            { level: 3, min: 43, max: 63 },
            { level: 4, min: 64, max: 90 },
            { level: 5, min: 91, max: 110 },
            { level: 6, min: 111, max: 130 },
            { level: 7, min: 131, max: 150 },
        ];

        function updateProgress(currentPoints) {
            let currentLevel = 0;
            for (let i = 0; i < Levels.length; i++) {
                if (currentPoints >= Levels[i].min && currentPoints <= Levels[i].max) {
                    currentLevel = Levels[i].level;
                    break;
                }
            }
            let percentage = (currentPoints / 150) * 100;
            const progressBar = document.getElementById('profile-level-progress');
            progressBar.style.width = percentage + '%';
            document.getElementById("current-level").innerHTML = currentLevel;
            document.getElementById("current-points").innerHTML = currentPoints;
        }
        updateProgress(data.score);


        /** calc pourcentage for acheivements**/
        function calcP(cond, requi) {
            let per;
            if (cond < requi)
                per = ((cond / requi) * 100).toFixed(0);
            else
                per = 100;
            return per;
        }

        const percentage = [];
        function CalcProgress(data) {
            /*FIRST SERVE*/
            percentage[0] = calcP(data.score, 7);
            /*Matchmaker*/
            percentage[1] = calcP(data.totalGames, 5);
            /*Paddle Master */
            percentage[2] = calcP(data.wins, 10);
            /*Rockie Score*/
            percentage[3] = calcP(data.score, 100);
        }

        const profileglass = document.querySelectorAll(".profile-glass");
        const progressCircle = document.querySelectorAll('.profile-progress');
        const ProgressPercent = document.querySelectorAll('.ProgressPercent');
        CalcProgress(data);

        let i = 0;
        ProgressPercent.forEach((element) => {
            element.firstChild.textContent = percentage[i];
            i++;
        })

        /*change pourcentage acheivement */
        const color = [];
        i = 0;
        progressCircle.forEach((element) => {

            if (percentage[i] == 100) {
                element.style.display = 'none';
                profileglass[i].style.background = "unset";
                profileglass[i].style.background = ArryImag[i];
                profileglass[i].style.backgroundRepeat = "no-repeat";
                profileglass[i].style.backgroundPosition = "center"; // Corrected property name
                profileglass[i].style.backgroundSize = "cover";

            }
            color[i] = getComputedStyle(element).getPropertyValue('--clr').trim();
            i++;
        })

        i = 0;
        progressCircle.forEach((element) => {
            element.style.background = `conic-gradient(${color[i]} 0%, ${color[i]} ${percentage[i]}%, transparent ${percentage[i]}%, transparent 100%)`;
            i++;
        })
    }

    function formattedDate(dateString) {
        const date = new Date();
        const dateform = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + ' ' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2);
        return dateform;
    }
    /***rank user*/
    {
        const response = await fetch('https://10.14.60.29:8000/api/rank?username=' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data.rank) {
            document.getElementById("profile-rank").textContent = data.rank;
        }
        else {
        }
    }


    /***multigame History */
    {
        const response = await fetch('https://10.14.60.29:9090/multigamehistory/' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data.length) {

            document.getElementById("history-para").style.display = 'none';
            data.forEach((element) => {

                document.getElementById("profile-arrayHistory").innerHTML +=
                    `<p class="dateplayed"> Played : <span>${formattedDate(element.created)}</span></p> 
                    <div class="profile-game-entry">
                            <div class="profile-player">
                                <img id="profile-player1" src="${element.player1.profile_image}" alt="Player 1 Profile Picture">
                                <span class="profile-player-name">${element.player1.username}</span>
                            </div>
                            <div class="profile-points">
                                <span class="profile-player-points">${element.player1Score}</span>
                                <span>:</span>
                                <span class="profile-opponent-points">${element.player2Score}</span>
                            </div>
                            <div class="profile-player">
                                <span   class="profile-player-name">${element.player2.username} </span>
                             <img  id="profile-player2" src="${element.player2.profile_image}" alt="Player 2 Profile Picture">
                            </div>
                        </div>`;
            })

        }

        // document.getElementById("profile-arrayHistory")
    }

    {
        const response = await fetch('https://10.14.60.29:9090/aigamehistory/' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,
            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data.length) {

            document.getElementById("history-para").style.display = 'none';
            data.forEach((element) => {

                document.getElementById("profile-arrayHistory").innerHTML +=
                    `<p class="dateplayed"> Played : <span>${formattedDate(element.created)}</span></p> 
                <div class="profile-game-entry">
                        <div class="profile-player">
                            <img id="profile-player1" src="${ProfileImg}" alt="Player 1 Profile Picture">
                            <span class="profile-player-name">${myuser}</span>
                        </div>
                        <div class="profile-points">
                            <span class="profile-player-points">${element.playerScore}</span>
                            <span>:</span>
                            <span class="profile-opponent-points">${element.aiScore}</span>
                        </div>
                        <div class="profile-player">
                            <span   class="profile-player-name">AI</span>
                         <img  id="profile-player2" src="/images/gameImges/aiplayer.jpeg" alt="Player 2 Profile Picture">
                        </div>
                    </div>`;
             })

        }

        // document.getElementById("profile-arrayHistory")
    }

    {
        const response = await fetch('https://10.14.60.29:8000/friend/userFriends?username=' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data.length) {
            document.getElementById("profile-users-list").innerHTML = `<div class="profile-searchBx">
                <a href="#"><i class='bx bx-search'></i></a>
                <input id="searchInput" type="text" placeholder="search">
            </div>`
            data.forEach((element) => {
                if (element.is_friend) {
                    document.getElementById("profile-users-list").innerHTML += `<div class="profile-user">
                <div class="profile-info-user">
                    <img id="imgID" class="profile-friendImg" src="${element.profile_image}">
                    ${element.is_online ? '<div class="online-indicator"></div>' : '<div class="decline-indicator"></div>'}
                    <h3 class="friendUserName">${element.username}</h3>
                </div>
                <img class="profile-chat" src="/images/profile_images/chat1.png">
                </div>`;
                }
                else {

                    document.getElementById("profile-users-list").innerHTML += `<div class="profile-user">
                <div class="profile-info-user">
                    <img id="imgID" class="profile-friendImg" src="${element.profile_image}">
                    <div  class="decline-indicator"></div> 
                    <h3 class="friendUserName">${element.username}</h3>
                </div>
                </div>`;
                }


            })
            document.getElementById("searchInput").addEventListener("input", function () {
                const searchTerm = this.value.toLowerCase();
                const users = document.querySelectorAll(".profile-user");

                users.forEach((user) => {

                    const username = (user.querySelector("h3.friendUserName").textContent).toLowerCase();
                    if (username.includes(searchTerm)) {
                        user.style.display = "";
                    } else {
                        user.style.display = "none";
                    }
                });
            });
            //   //  <div class="online-indicator"></div> 
            const friendsUserName = document.querySelectorAll(".friendUserName");
            const ChatIcons = document.querySelectorAll(".profile-chat");
            ChatIcons.forEach((icon, index) => {
                icon.addEventListener("click", async () => {
                    let query = friendsUserName[index].textContent;
                    NewPage("/chat", Chat, 1, "?user=" + query);
                });

            });
            const frindArray = document.querySelectorAll(".profile-info-user");
            UserStatusSock.onmessage = (e) => {
                var d = JSON.parse(e.data);
                frindArray.forEach(friend => {
                    const friendName = friend.querySelector("h3.friendUserName").textContent;
                    if (friendName === d.username) {
                        const t = friend.querySelector("div.decline-indicator");
                        if (d.is_online == "True" && t)
                            friend.querySelector("div.decline-indicator").style.backgroundColor = "green";
                        else if (t)
                            friend.querySelector("div.decline-indicator").style.backgroundColor = "red";
                    }
                });
            };

            const profileFriendImg = document.querySelectorAll(".profile-friendImg");
            profileFriendImg.forEach((friend, j) => {
                friend.addEventListener("click", async () => {
                    NewPage("/profile", Profile, 1, "?user=" + friendsUserName[j].textContent);
                })
            })
        }

    }


    // tournament history
    {
        const response = await fetch('https://10.14.60.29:9090/tournamenthistory/', {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        if (data.length) {
            data.forEach((elt) => {
                document.getElementById("profile-history-list").innerHTML += ` <div class="profile-tournament-item">
                               <img src="${elt.image}" alt="">
                                <div class="profile-card-body">
                                    <h4 class="profile-card-title">${elt.name}</h4>
                                    <div class="profile-para">
                                        <p class="profile-card-info">Date:<br><span>${formattedDate(elt.created)}</span></p>
                                        ${elt.winner && elt.winner.username.trim() == myuser ? '<p class="profile-card-info"><span>Winner</span></p>' : ''}
                                    </div>   
                                </div>
                            </div>`

            });
            document.getElementById("profile-history-list").innerHTML += ` 
                
        
            <ul class="settings-circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>`
        }
        else {
            document.getElementById("profile-history-list").innerHTML = ` <div>
                <h3>No Tournaments played yet</h3>
         </div>
            <ul class="settings-circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>`
        }
    }
}
