import { NewPage, getJWT, redirectTwoFactor } from "https://localhost/utils.js";
import { Profile } from "https://localhost/profile.js"
import { Multi } from "https://localhost/multi.js";
import { TournamentFr } from "https://localhost/fr-tournament.js";
let CurrentUser = "";
export let GamePlaySocket = null;
export let UserStatusSock = null;
async function FriendRqEvent(notifItem, endpoint, data) {
    ////
    const token = await getJWT();
    fetch(`https://localhost:8000/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.ok) {
            if (GamePlaySocket.readyState === WebSocket.OPEN) {
                GamePlaySocket.send(JSON.stringify({
                    'from': data['to'],
                    'to': data['from'],
                    'message': `${endpoint}`,
                    'flag': 'FriendR',
                    'img': '',
                    'playwith': 'null',
                    'block': 'false'
                }));
            }
            console.log("hello");
            notifItem.remove();
        }
        else
            throw response.json();
    }).catch(error => console.log(error));
}

async function GameRqEvent(data, notiItem) {
    notiItem.remove()
    if (data['tournament']){
        sessionStorage.setItem('tournament_name', data['tournament'])
        NewPage("/fr-tournament", TournamentFr)
    }
    else {
        GamePlaySocket.send(JSON.stringify({
            'playwith': data['from'],
            'room_name': data['to'] + '_' + data['from'],
            'block': 'false'
        }))
        console.log(`inside Friend event handler`)
        sessionStorage.setItem('room_name', data['to'] + '_' + data['from']);
        console.log(`from target ${sessionStorage.getItem('room_name')}`)
        NewPage("/multi", Multi);
    }
    ////
}

function createNewNotifItem(data) {
    const notiItem = document.createElement('div');

    notiItem.id = 'notifItem-' + data.from;
    notiItem.innerHTML = `
        <img src="${data.img}">
        <p>${data.from} ${data.message}.</p>
        <svg class="header-svg-accept" id="accept" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#314D1C"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        <svg class="header-svg-decline" id="decline" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5D0E07"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        `
    notiItem.setAttribute('class', 'notiItem');
    return notiItem;
}

export function displayNotification(data) {
    console.log(data);
    if (data['flag'] == 'FriendR') {
        if (data['message'].includes('decline')) {
            console.log("home-user-" + data['from']);
            const accept = document.getElementById("home-user-" + data['from'])?.querySelector('.home-send-btn');
            const cancel = document.getElementById("home-user-" + data['from'])?.querySelector('.home-cancel-btn');
            if (accept && cancel) {
                accept.style.display = 'block';
                cancel.style.display = 'none';
            }
            return;
        } else if (data['message'].includes('cancel')) {
            document.getElementById("notifItem-" + data['from'])?.remove();
            return;
        }
        else if (data['message'].includes('accept')) {
            document.getElementById("home-user-" + data['from'])?.remove();
            return;
        }
    }
    var notiItem = createNewNotifItem(data);
    const acceptButton = notiItem.querySelector('#accept');
    const declineButton = notiItem.querySelector('#decline');
    if (data['flag'] === 'GameR') {
        // const timeout = setTimeout(() => {
        //     notiItem.remove();
        //     sendJS(data);
        //     clearTimeout(timeout);
        //     console.log('Element removed due to inactivity.');
        // }, 10000); // 5 seconds
        acceptButton.addEventListener('click', function () {
            GameRqEvent(data, notiItem);
        });
        declineButton.addEventListener('click', () => declineEvent(data, notiItem));
    }
    if (data['flag'] === 'FriendR') {
        acceptButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/accept/?username=${data['from']}`, data));
        declineButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/decline/?username=${data['from']}`, data));
    }
    document.getElementById('header-notif-div').appendChild(notiItem);
}

function sendJS(data){
    if (GamePlaySocket.readyState === WebSocket.OPEN) {
        GamePlaySocket.send(JSON.stringify({
            'message': `request removed by ${data.to}`,
            'block': 'false',
            'playwith': 'null',
            'to': data.to,
            'from': data.from,
            'flag': 'GameR',
            'img': data['img']
        }));
    }
}

function declineEvent(data, notiItem){
    const parts = notiItem.id.split('-');
    const dataFrom = parts[1]; // This gets the part after 'notifItem-'
    
    console.log(`dataFrom isss --- ${dataFrom}`); // Output: someUser
    if (GamePlaySocket.readyState === WebSocket.OPEN) {
        GamePlaySocket.send(JSON.stringify({
            'message': `request removed by ${CurrentUser}`,
            'block': 'false',
            'playwith': 'null',
            'to': CurrentUser,
            'from': dataFrom,
            'flag': 'GameR',
            'img': data['img']
        }));
    }
    notiItem.remove()
}

function Handler() {
    const notificationPanel = document.getElementById('header-notif-div');
    const menu = document.getElementById('header-side-bar');
    notificationPanel.style.display = 'none';
    menu.style.display = 'none';
}

export function removeEvent() {
    document.body.removeEventListener('click', Handler);
}



const addheader = () => {
    const header = document.querySelector('header');
    header.innerHTML = `
        <div id="header-notif-div" class="header-notif-div"></div>
        <a class="header-logo"><img id="header-logo" src="/images/fourtnite4k/neoon.png" alt="Logo"></a>
        <ul class="header-nav header-hide-in-small-size">
            <li id="header-home-btn"><a  class="header-li-a-style">Home</a></li>
            <li id="header-chat-btn"><a class="header-li-a-style">Chat</a></li>
            <li id="header-settings-btn"><a class="header-li-a-style">settings</a></li>
        </ul>
        <div class="header-action">
            <div class="header-notification-icon-container">
                <svg class="header-notification-icon bel header-hide-in-small-size" id="header-notification-icon"
                    xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 0 24 24" width="35px" fill="#e8eaed">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
            </div>
            <div id="header-profile-box" class="header-profile-box header-hide-in-small-size">
                <div class="header-img-bx">
                    <img id="header-profile-image" src="" alt="">
                </div>
                <a id="header-username" class="header-name"></a>
            </div>
            <!-- icon shows in small screen -->
            <div class="header-show-in-small-size">
                <div class="header-menu-icon-container" id="header-menu-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"
                        fill="#FFFFFF">
                        <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                    </svg>
                </div>
            </div>
        </div>
        <!-- nemu bar showed in small screen with click in three line icon  -->
        <ul class="header-nav-side" id="header-side-bar">
            <svg id="header-close-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"
                fill="#FFFFFF">
                <path
                    d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
            <li id="header-small-home-btn"><a class="header-li-a-style">Home</a></li>
            <li id="header-small-chat-btn"><a class="header-li-a-style">Chat</a></li>
            <li id="header-small-profile-btn"><a class="header-li-a-style">Profile</a></li>
            <li id="header-small-settings-btn"><a class="header-li-a-style">settings</a></li>
        </ul>`;
    window.addEventListener('scroll', () => {
        header.classList.toggle('header-sticky', window.scrollY > 0);
    });
    document.getElementById("header-notif-div").addEventListener('click', (event) => event.stopPropagation());
    document.getElementById("header-logo").addEventListener('click', () => NewPage('/home', Home));
}

export async function header() {
    let UserName;
    const access_token = await getJWT();
    if (!access_token)
        return;
    addheader();
    try {
        const response = await fetch('https://localhost:8000/api/currentUser/', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch current user:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        if (!redirectTwoFactor(data, response.status))
            return (0);
        CurrentUser = data.username;
        UserName=CurrentUser;
        document.getElementById("header-profile-image").src = data.profile_image;
        document.getElementById("header-username").innerHTML = data.username;
    }
    catch (error) {
        console.error('An error occurred:', error);
    }

    if (GamePlaySocket)
        GamePlaySocket.close();
    UserStatusSock = new WebSocket(`wss://localhost:9000/ws/status/?token=${access_token}`);
    GamePlaySocket = new WebSocket(`wss://localhost:9000/ws/notif/?token=${access_token}`);
    UserStatusSock.onopen = () => {
        console.log('UserStatusSock');
    }
    GamePlaySocket.onopen = () => {
        console.log('Notif WebSocket connection opened');
    };
    UserStatusSock.onmessage = (e) => {
        var data = JSON.parse(e.data);
        console.log(`userstatus ----<  ${JSON.stringify(data)}`)
    }
    GamePlaySocket.onmessage = (e) => {
        var data = JSON.parse(e.data);
        console.log(`data is   ${JSON.stringify(data)}`)
        // console.log(`GamePlaySocket onmessage from: "${data['from']} to: ${data['to']} and message is  ${data.message}"`);
        if (data.block === 'false' && data['to'] === CurrentUser && data['message'].includes("cancel")) {
            document.getElementById("notifItem-" + data['from'])?.remove();
            console.log(`request cancled`)
        }
        else if (data.block === 'false' && data['from'] === CurrentUser && data['message'].includes("removed")){
            console.log(`inside make gameplay 'cancel' condition`)
            var gamePlay = "";
            gamePlay = document.getElementById('game-play');
            if (gamePlay.textContent === "cancel")
                gamePlay.textContent = "play";
        }
        else if (data.block === 'false' && data['to'] === CurrentUser && !data['message'].includes("cancel") && !data['message'].includes("removed")) {
            console.log(`--------- inside 3`)
            displayNotification(data)
        }
        else if (data.block == 'false' && data['playwith'] === CurrentUser) {
            console.log(`--------- inside 4`)
            sessionStorage.setItem('room_name', data['room_name']);
            console.log(`from the sender ${sessionStorage.getItem('room_name')}`)
            NewPage("/multi", Multi);
        }
        else if (data.block === 'True' && data['block_target'] === CurrentUser) {
            console.log(`------- inside 5`)
            const targetContact = document.getElementById(data.from);
            const profileContainer = document.getElementById('profile-container');

            if (targetContact) targetContact.remove();

            if (profileContainer) {
                const nameElement = profileContainer.querySelector('.contact-profile p');
                if (nameElement && nameElement.textContent === data.from) {
                    const chatLog = document.querySelector('#chat-log');
                    const messageInput = document.querySelector('#chat-message-input');
                    const messageSubmit = document.getElementById('submit-button');

                    // Remove elements only if they exist
                    messageSubmit?.remove();
                    messageInput?.remove();
                    profileContainer.remove();

                    // Clear chat log efficiently
                    if (chatLog) chatLog.textContent = '';
                }
            }

        }
    };

    GamePlaySocket.onclose = () => {
        console.error('GamePlaySocket closed');
    };

    const menuicon = document.getElementById("header-menu-icon");
    if (menuicon) {
        menuicon.addEventListener('click', (event) => {
            event.stopPropagation();
            document.getElementById("header-side-bar").style.setProperty('display', 'flex', 'important');
        });
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > 850)
            document.getElementById("header-side-bar")?.style.setProperty('display', 'none', 'important');
    });
    const closeicon = document.getElementById("header-close-icon");
    if (closeicon) {
        closeicon.addEventListener('click', () => {
            document.getElementById("header-side-bar").style.display = 'none';
        });
    }



    document.getElementById("header-profile-box").addEventListener('click', () => {
        NewPage("/profile", Profile,true,"?user="+UserName);
    });

    // Add click event listener to the notification icon
    document.getElementById('header-notification-icon')?.addEventListener('click', async event => {
        event.stopPropagation(); // Prevent the event from bubbling up
        document.body.style.setProperty('--count-notification', 'none');
        const token = await getJWT();
        fetch("https://localhost:8000/friend/friendRequest/readed/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const notif = document.getElementById('header-notif-div');
        if (notif.style.display == 'block')
            notif.style.display = 'none';
        else
            notif.style.display = 'block';
    });

    // Hide the notification panel if clicking outside
    document.body.addEventListener('click', Handler);

    const access = await getJWT();
    if (!access)
        return;
    fetch("https://localhost:8000/friend/friendRequests/", {
        headers: {
            'Authorization': `Bearer ${access}`,
        }
    }).then(response => {
        if (response.ok)
            return response.json();
        console.log("error in fetch friend requests");
    }).then(data => {
        data.forEach(sender => {
            const notiItem = createNewNotifItem({ 'from': sender.username, 'to': CurrentUser.username, 'img': sender.profile_image, message: 'send friend request' });
            const acceptButton = notiItem.querySelector('#accept');
            const declineButton = notiItem.querySelector('#decline');
            acceptButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/accept/?username=${sender.username}`, { 'from': sender.username, 'to': CurrentUser }));
            declineButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/decline/?username=${sender.username}`, { 'from': sender.username, 'to': CurrentUser }));
            document.getElementById("header-notif-div").appendChild(notiItem);
        });
        const number = data.filter(item => item.is_read === false).length;
        if (number)
            document.body.style.setProperty('--count-notification', `"${number}"`)
    }).catch(error => {
        console.log("can't fetch friend requests error accured ", error);
    });
    return 1;
}