import { NewPage, getJWT, redirectTwoFactor } from "/utils.js";
import { Profile } from "/profile.js"
import { Multi } from "./multi.js";


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
                    'img': 'clear',
                    'playwith': 'null'
                }));
            }
            console.log("hello");
            notifItem.remove();
        }
        else
            throw response.json();
    }).catch(error => console.log(error));
}

async function GameRqEvent(data) {
    GamePlaySocket.send(JSON.stringify({
        'playwith': data['from']
    }))
    console.log(`inside Friend event handler`)
    localStorage.setItem('room_name', data['to'] + '_' + data['from']);
    NewPage("/multi", Multi);
    ////
}

function createNewNotifItem(from) {
    const notiItem = document.createElement('div');

    notiItem.id = 'notifItem-' + from.username;
    notiItem.innerHTML = `
        <img src="${from.profile_image}">
        <p>${from.username} send friend request.</p>
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
            if (accept && cancel){
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
    var notiItem = createNewNotifItem({ username: data['from'], profile_image: data['img'] });
    const acceptButton = notiItem.querySelector('#accept');
    const declineButton = notiItem.querySelector('#decline');
    if (data['flag'] === 'GameR') {
        acceptButton.addEventListener('click', function () {
            GameRqEvent(data);
        });
        declineButton.addEventListener('click', () => notiItem.remove());
    }
    if (data['flag'] === 'FriendR') {
        acceptButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/accept/?username=${data['from']}`, data));
        declineButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/decline/?username=${data['from']}`, data));
    }
    document.getElementById('header-notif-div').appendChild(notiItem);
}

function Handler() {
    const notificationPanel = document.getElementById('header-notif-div');
    notificationPanel.style.display = 'none';
}

export function removeEvent() {
    document.body.removeEventListener('click', Handler);
}

export let GamePlaySocket = null;

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
            <svg class="header-notification-icon bel header-hide-in-small-size" id="header-notification-icon"
                xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 0 24 24" width="35px" fill="#e8eaed">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
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
}

export async function header() {
    const access_token = await getJWT();
    if (!access_token)
        return;
    addheader();
    let CurrentUser = "";
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
        document.getElementById("header-profile-image").src = data.profile_image;
        document.getElementById("header-username").innerHTML = data.username;
    }
    catch (error) {
        console.error('An error occurred:', error);
    }

    if (GamePlaySocket)
        GamePlaySocket.close();
    GamePlaySocket = new WebSocket(`ws://127.0.0.1:9000/ws/notif/?token=${access_token}`);
    GamePlaySocket.onopen = () => {
        console.log('Notif WebSocket connection opened');
    };

    GamePlaySocket.onmessage = (e) => {
        var data = JSON.parse(e.data);
        console.log(`GamePlaySocket onmessage from: "${data['from']} to: ${data['to']}"`);
        if (data['to'] === CurrentUser)
            displayNotification(data);
        else if (data['playwith'] === CurrentUser)
            NewPage("/multi", Multi);
    };

    GamePlaySocket.onclose = () => {
        console.error('GamePlaySocket closed');
    };

    const menuicon = document.getElementById("header-menu-icon");
    if (menuicon) {
        menuicon.addEventListener('click', () => {
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
        NewPage("/profile", Profile);
    });

    // Add click event listener to the notification icon
    document.getElementById('header-notification-icon')?.addEventListener('click', event => {
        event.stopPropagation(); // Prevent the event from bubbling up
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
            const notiItem = createNewNotifItem(sender);
            const acceptButton = notiItem.querySelector('#accept');
            const declineButton = notiItem.querySelector('#decline');
            acceptButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/accept/?username=${sender.username}`, {'from': sender.username, 'to': CurrentUser}));
            declineButton.addEventListener('click', () => FriendRqEvent(notiItem, `friend/decline/?username=${sender.username}`, {'from': sender.username, 'to': CurrentUser}));
            document.getElementById("header-notif-div").appendChild(notiItem);
        });
    }).catch(error => {
        console.log("can't fetch friend requests error accured ", error);
    });
    return 1;
}