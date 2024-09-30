import { NewPage, getJWT, setRunedHeader } from "/home/utils.js";

setRunedHeader();


const access_token = await getJWT();
let CurrentUser = "";
const data = await fetch('https://localhost:8000/api/user/data/',{
    headers:{
        'Authorization': `Bearer ${access_token}`,
    }
  })
  .then(response => response.json()) // Call json() to parse the response
  .then(data => {
    CurrentUser = data.username;
    // console.log(`user/data response "${JSON.stringify(data, null, 2)}"`)
  })
export const GamePlaySocket = new WebSocket(`ws://127.0.0.1:9000/ws/notif/?token=${access_token}`);
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

document.querySelectorAll('#settings-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/settings", false);
    })
});

document.querySelectorAll('#chat-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/chat", false);
    })
});

document.querySelectorAll('#home-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/home", false);
    })
});

document.querySelectorAll('profile-btn').forEach(button => {
    button.addEventListener('click', () => {
        NewPage("/profile", false);
    })
});

const menuicon = document.getElementById("menu-icon");
if (menuicon) {
    console.log("menuicon :", menuicon);
    menuicon.addEventListener('click', () => {
        document.getElementById("side-bar").style.setProperty('display', 'flex', 'important');
    });
}

const closeicon = document.getElementById("close-icon");
if (closeicon) {
    closeicon.addEventListener('click', () => {
        document.getElementById("side-bar").style.display = 'none';
    });
}

fetch('https://localhost:8000/api/currentUser/', {
    headers: {
        'Authorization': `Bearer ${await getJWT()}`,
    }
}).then(response => {
    if (response.ok) {
        return response.json();
    }
    throw "error in loading data of the current user";
}).then(data => {
    console.log("data", data);
    document.getElementById("profile-image-header").src = data.currentUser.profile_image;
    document.getElementById("username-header").innerHTML = data.currentUser.username;
}).catch(error => {
    console.log(error);
});

document.getElementById("profile-box").addEventListener('click', () => {
    NewPage("/profile", false);
});

// Add click event listener to the notification icon
document.getElementById('notification-icon')?.addEventListener('click', event => {
    event.stopPropagation(); // Prevent the event from bubbling up
    // createNotificationPanel();
    const notificationPanel = document.getElementById('notif-div');
    if (notificationPanel.style.display == 'block')
        notificationPanel.style.display = 'none';
    else
        notificationPanel.style.display = 'block';
});

// Hide the notification panel if clicking outside
document.addEventListener('click', event => {
    // const notificationPanel = document.getElementById('notif-div');
    // const notifIcon = document.getElementById('notification-icon');

    // if (notificationPanel && notificationPanel.classList.contains('active') && 
    //     !notificationPanel.contains(event.target) && 
    //     !notifIcon.contains(event.target)) {
    //     notificationPanel.classList.remove('active');
    // }
    const notificationPanel = document.getElementById('notif-div');
    notificationPanel.style.display = 'none';

});


export function displayNotification(message) {
    createNotificationPanel();
    var notifDiv = document.getElementById('notif-div');
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
    // Notif.textContent = 'play request';
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
    let notificationPanel = document.getElementById('notif-div');
    notificationPanel.style.display = 'block';
}

fetch("https://localhost:8000/friend/friendRequests/", {
    headers: {
        'Authorization': `Bearer ${await getJWT()}`,
    }
}).then(response => {
    if (response.ok)
        return response.json();
    console.log("error in fetch friend requests");
}).then(data => {
    console.log("data", data);
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
        notifItem.querySelector(".button").addEventListener('click', async() => {
            console.log("hello the button friendrequest is clickec");
            fetch("https://localhost:8000/friend/accept/?username=" + sender.username, {
                headers: {
                    'Authorization': `Bearer ${await getJWT()}`,
                }
            });
        });
        document.getElementById("notif-div").appendChild(notifItem);
    });
}).catch(error => {
    console.log("can't fetch friend requests error accured ", error);
});