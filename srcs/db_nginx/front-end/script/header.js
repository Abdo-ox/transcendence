import { NewPage, getJWT, redirectTwoFactor } from "/utils.js";
import { Profile } from "/profile.js"

export function displayNotification(message) {
    createNotificationPanel();
    var notifDiv = document.getElementById('header-notif-div');
    var notiItem = document.createElement('div');
    notiItem.id = 'notiItem'
    notiItem.className = 'notiItem'
    var text = document.createElement('div');
    text.className = 'text'
    var accept = document.createElement('div');
    accept.className = 'accept'
    var button = document.createElement('button');
    button.className = 'button'
    button.textContent = 'accept'
    var Notif = document.createElement('p');
    Notif.textContent = message;
    const img = document.createElement('img')
    img.src = "https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg?w=996&t=st=1717845286~exp=1717845886~hmac=2e25e3c66793f5ddc2454b5ec1f103c4f76628b9043b8f8320fa703250a3a8b7";
    text.appendChild(Notif)
    accept.appendChild(button)
    notiItem.appendChild(img)
    notiItem.appendChild(text)
    notiItem.appendChild(accept)
    notifDiv.appendChild(notiItem)
}

export function createNotificationPanel() {
    let notificationPanel = document.getElementById('header-notif-div');
    notificationPanel.style.display = 'block';
}

function Handler() {
    const notificationPanel = document.getElementById('header-notif-div');
    notificationPanel.style.display = 'none';
}

export function removeEvent() {
    document.removeEventListener('click', Handler);
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


    GamePlaySocket = new WebSocket(`ws://127.0.0.1:9000/ws/notif/?token=${access_token}`);
    GamePlaySocket.onopen = () => {
        console.log('Notif WebSocket connection opened');
    };

    GamePlaySocket.onmessage = (e) => {
        var data = JSON.parse(e.data);
        console.log(`GamePlaySocket onmessage and this data is "${data['to']}"`);
        if (data['to'] === CurrentUser)
            displayNotification(data['message'])
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
        const notif  = document.getElementById('header-notif-div');
        if (notif.style.display == 'block')
            notif.style.display = 'none';
        else
            notif.style.display = 'block';
    });

    // Hide the notification panel if clicking outside
    document.addEventListener('click', Handler);


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
            const notifItem = document.createElement('div');
            notifItem.className = "notiItem";
            notifItem.id = "notiItem";
            notifItem.innerHTML = `
            <img src="${sender.profile_image}">
                <div class="text">
                    <p>${sender.username} send u friend request.</p>
                </div>
            <div class="accept"><button class="button">accept</button></div>`
            notifItem.querySelector(".button").addEventListener('click', async () => {
                fetch("https://localhost:8000/friend/accept/?username=" + sender.username, {
                    headers: {
                        'Authorization': `Bearer ${await getJWT()}`,
                    }
                });
            });
            document.getElementById("header-notif-div").appendChild(notifItem);
        });
    }).catch(error => {
        console.log("can't fetch friend requests error accured ", error);
    });
    return 1;
}