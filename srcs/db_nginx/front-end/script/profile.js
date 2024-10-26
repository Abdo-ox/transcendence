import { NewPage, getJWT } from "/utils.js";
import { Chat } from "/chat.js";
// window.addEventListener('scroll', function () {
//     var header = document.querySelector('header');
//     header.classList.toggle('sticky', window.scrollY > 0);
// });

export async function Profile() {
    const params = new URLSearchParams(window.location.search)
   let myuser = params.get('user');
    if(!myuser)
        myuser = '';
    console.log(myuser, "<_____--- is ");
    
    {
        const ArryImag = ['url("/images/acheivements/firstServe.png")',
            'url("/images/acheivements/paddlemaster.jpeg")',
            'url("/images/acheivements/paddle.jpeg")',
            'url("/images/acheivements/rookie.jpg")']

        /**  Endpoint game**/
        const response = await fetch('https://localhost:9090/gameprofile/' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            console.error('Failed to fetch current user:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        console.log("data is :", data);
        document.getElementById("profile-username").innerHTML = data.username;
        document.getElementById("profile-profileimage").src = data.profile_image;
        document.getElementById("profile-matchScore").innerHTML = data.totalGames;
        document.getElementById("profile-tournamentsScore").innerHTML = data.tournaments;
        let sum = data.tournaments + data.totalGames;
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
            console.log(`Current Level: ${currentLevel}`);
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

    /***multigame History */
    {
        const response = await fetch('https://localhost:9090/multigamehistory/' + myuser, {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            console.error('Failed to fetch current user:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        console.log("data multi game :", data);
        if (data.length) {
            // console.log( "0 is ",data[0].player1.username);
            // console.log("1 is ",data[1]);
            document.getElementById("history-para").style.display = 'none';
            data.forEach((element) => {

                document.getElementById("profile-arrayHistory").innerHTML +=
                    ` <div class="profile-game-entry">
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

    // {
    //     const response = await fetch('https://localhost:9090/tournaments/' + myuser, {
    //         headers: {
    //             'Authorization': `Bearer ${await getJWT()}`,

    //         }
    //     })
    //     if (!response.ok) {
    //         console.error('Failed to fetch current user:', response.status, response.statusText);
    //         return;
    //     }
    //     const data = await response.json();
    //     console.log("data tournament :", data);
    // }
    {
        const response = await fetch('https://localhost:8000/api/user/data/', {
            headers: {
                'Authorization': `Bearer ${await getJWT()}`,

            }
        })
        if (!response.ok) {
            console.error('Failed to fetch current user:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        console.log("data friend :", data);
        data.friends.forEach((element) => {
            document.getElementById("profile-users-list").innerHTML += `<div class="profile-user">
            <div class="profile-info-user">
                <img class="profile-friendImg" src="${element.profile_image}">
                <h3 class="friendUserName">${element.username}</h3>
            </div>
            <img class="profile-chat" src="/images/profile_images/chat1.png">
            </div>`;
        })
        const friendsUserName = document.querySelectorAll(".friendUserName");
        const ChatIcons = document.querySelectorAll(".profile-chat");
        ChatIcons.forEach((icon, index) => {
            icon.addEventListener("click", async () => {
                let query = friendsUserName[index].textContent;
                console.log("query: ", query);
                NewPage("/chat", Chat,1,"?user="+query);
            });

        });
        const profileFriendImg = document.querySelectorAll(".profile-friendImg");
        profileFriendImg.forEach((friend,j) =>{
            friend.addEventListener("click",async()=>{
                NewPage("/profile",Profile,1,"?user="+friendsUserName[j].textContent);
            })
        })

    }
    // {
    //     const response = await fetch('https://localhost:9090/tournamenthistory/', {
    //         headers: {
    //             'Authorization': `Bearer ${await getJWT()}`,

    //         }
    //     })
    //     if (!response.ok) {
    //         console.error('Failed to fetch current user:', response.status, response.statusText);
    //         return;
    //     }
    //     const data = await response.json();
    //     console.log("data tourn:", data);

    // }
}