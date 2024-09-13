import { createWebSocket } from './socketsManager.js';
import { getJWT } from 'https://localhost/home/utils.js';

const url = new URL(window.location.href);
let TargetUser = null;
// Check if the pathname is '/chat'
if (url.pathname === '/chat/') {
  // Get the query parameters
  const params = new URLSearchParams(url.search);

  // Extract a specific parameter (e.g., 'user')
  TargetUser = params.get('user');
  console.log(`user is ============== ${TargetUser}`)
}
else{
  console.log(`usl path name ${url.pathname}`)
}

let access_token = await getJWT();
const data = await fetch('https://localhost:8000/api/user/data/',{
  headers:{
      'Authorization': `Bearer ${access_token}`,
  }
})
.then(response => response.json()) // Call json() to parse the response
.then(data => {
  console.log(data)
  bodychat(data)
  // console.log(`user/data response "${JSON.stringify(data, null, 2)}"`)
})
.catch(error => {
  console.error('Error:', error); // Handle errors
});

function bodychat(UserData) {
  const username = UserData.username;
  let token = localStorage.getItem('access_token');;
  const GamePlaySocket = new WebSocket(`ws://127.0.0.1:9000/ws/notif/?token=${token}`);
  GamePlaySocket.onopen = () => {
    console.log('Notif WebSocket connection opened');
  };
  let htmlContent = 0;
  if (!htmlContent){
  htmlContent = `
	<div id="sidepanel">
		<div id="profile">
			<div class="wrap">
				<img id="profile-img" src="${UserData.profile_image}"/>
				<p>${username}</p>
			</div>
		</div>
		<div id="search">
			<label for=""><i class="fa fa-search" aria-hidden="true"></i></label>
			<input type="text" placeholder="Search contacts..." />
		</div>
		<div id="contacts">
        <ul id="contacts-list"></ul>
		</div>
	</div>
	<div id="content" class="content">
	</div>
    `;
    const frameElement = document.getElementById('frame');

    if (frameElement) {
      frameElement.remove();
    }
    const newFrame = document.createElement('div');
    newFrame.id = 'frame';
    newFrame.innerHTML = htmlContent;
  
    document.body.appendChild(newFrame);
    fetchData();
    if (UserData.friends){
    UserData.friends.forEach(friend => {
      if (friend.username === TargetUser){
        createHtmlPrf();
        updateProfile(TargetUser);
        chatListview(TargetUser, 'createWebSocket');
        GamePlay();
        // Create the new URL
        const newUrl = `https://localhost/chat/?user=${TargetUser}`
        console.log(`new query --------------- ${newUrl}`)
        history.pushState(null, '', newUrl);
      }
    });}

    document.getElementById('contacts-list').addEventListener('click', event => {
        const contact = event.target.closest('.contact');
        console.log(`the authonticat contact is ${username} , and the other contact is ${contact.id}`)
        const combinUsers = [username, contact.id]
        axios.post('http://127.0.0.1:9000/chat/create/', {
          messages: [],
          participants: combinUsers
        })
        .then(response => {
          console.log('heree iam ', response.data);      
        });
        if (contact) {
          console.log('contact exests')
          createHtmlPrf();
          updateProfile(contact.id);
          chatListview(contact.id, 'createWebSocket');
        }
        else{
          console.log(`conctact doesn't exests`)
        }
        GamePlay();
      });
  }

  /// handel play event
  function GamePlay(){
    document.getElementById('game-play').addEventListener('click', event => {
      const contact_profile = event.target.closest('.contact-profile')
      const nameElement = contact_profile.querySelector('p');
      if (nameElement != "")
        console.log(`play event happened and nameEl is ${nameElement.textContent}`)
        if (GamePlaySocket.readyState === WebSocket.OPEN) {
          // GamePlaySocket.onopen = () => {
          console.log('WebSocket connection opened');
          GamePlaySocket.send(JSON.stringify({
            'from': username,
            'to': nameElement.textContent
          }));
        // };
      }
    });
  }

  GamePlaySocket.onmessage = (e) => {
      var data = JSON.parse(e.data);
      console.log(`GamePlaySocket onmessage and this data is "${data['to']}"`);
      if (data['to'] === username)
        displayNotification(data['message'])
    };

    GamePlaySocket.onclose = () => {
      console.error('GamePlaySocket closed');
    };
    function displayNotification(message) {
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
      button.className  = 'button'
      button.textContent = 'accept'
      // accept.id = 'accept'
      var Notif = document.createElement('p');
      Notif.textContent = message;
      // Notif.textContent = 'play request';
      const img = document.createElement('img')
      img.src =  "https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg?w=996&t=st=1717845286~exp=1717845886~hmac=2e25e3c66793f5ddc2454b5ec1f103c4f76628b9043b8f8320fa703250a3a8b7";
      text.appendChild(Notif)
      accept.appendChild(button)
      notiItem.appendChild(img)
      notiItem.appendChild(text)
      notiItem.appendChild(accept)
      notifDiv.appendChild(notiItem)
    }
// Function to create or toggle the notification panel
  function createNotificationPanel() {
      let notificationPanel = document.getElementById('notif-div');
      
      if (!notificationPanel) {
          notificationPanel = document.createElement('div');
          notificationPanel.id = 'notif-div';
          notificationPanel.className = 'notif-div';
          // notificationPanel.innerHTML = '<p>This is your notification panel.</p>';
          document.body.insertBefore(notificationPanel, document.body.firstChild);
      }
      notificationPanel.classList.toggle('active');
  }

// Hide the notification panel if clicking outside
document.addEventListener('click', event => {
    const notificationPanel = document.getElementById('notif-div');
    const notifIcon = document.getElementById('notif');
    
    if (notificationPanel && notificationPanel.classList.contains('active') && 
        !notificationPanel.contains(event.target) && 
        !notifIcon.contains(event.target)) {
        notificationPanel.classList.remove('active');
    }
});

// Add click event listener to the notification icon
document.getElementById('notif').addEventListener('click', event => {
    event.stopPropagation(); // Prevent the event from bubbling up
    createNotificationPanel();
});

  function fetchData() {
    UserData.friends.forEach(friend => {
      createSuperuser(friend)
    });
  }

  function createHtmlPrf(){
    const contentDiv = document.getElementById("content");
    const htmlContent = `
    <div id="profile-container"></div>
    <div class="messages">
			<ul id="chat-log">
			</ul>
		</div>
    <div class="message-input">
      <div class="wrap">
        <div class="wrap">
          <input id="chat-message-input" type="text" placeholder="  Write your message..." />
          <button id="chat-message-submit" class="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
        </div>
    </div>`;

    contentDiv.innerHTML = htmlContent;
  }

  function createSuperuser(user) {
      const li = document.createElement('li');
      li.className = 'contact';
      li.id = user.username;

      const wrap = document.createElement('div');
      wrap.className = 'wrap';

      // const contactStatus = document.createElement('span');
      // contactStatus.className = 'contact-status busy';
    // ------------------------------- show the user data catched -------------------------------------
      // console.log(`friend object equal ======= ${JSON.stringify(user)}`)
      const img = document.createElement('img');
      img.src = "https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg?w=996&t=st=1717845286~exp=1717845886~hmac=2e25e3c66793f5ddc2454b5ec1f103c4f76628b9043b8f8320fa703250a3a8b7";
      img.alt = '';

      const meta = document.createElement('div');
      meta.className = 'meta';

      const name = document.createElement('p');
      name.className = 'name';
      name.textContent = user.username;

      const preview = document.createElement('p');
      preview.className = 'preview';

      meta.appendChild(name);
      meta.appendChild(preview);
      // wrap.appendChild(contactStatus);
      wrap.appendChild(img);
      wrap.appendChild(meta);
      li.appendChild(wrap);

      document.getElementById('contacts-list').appendChild(li);
  }

  function chatListview(user, FunctionTarget) {
    console.log(`chatlistview called user is ${user}`)
    axios.get('http://127.0.0.1:9000/chat/GetChatID/', {
      params: {
        username1: user,
        username2: username
  }})
    .then(response => {
      console.log('request send ....', response.data.ChatID)
      if (FunctionTarget === 'createWebSocket'){
        createWebSocket(response.data.ChatID, user);
        // GamePlaySocketEngine(response.data.ChatID, username, user);
      }
    })
    .catch(handleError);
  }

  function handleError(error) {
      if (error.response) {
          console.log('Error Status Code:', error.response.status);
          console.log('Error Data:', error.response.data);
      } else if (error.request) {
          console.log('No response received:', error.request);
      } else {
          console.log('Error:', error.message);
      }
      console.log('Error Config:', error.config);
  }

  function updateProfile(user) {
      const profileContainer = document.getElementById('profile-container');
      profileContainer.innerHTML = '';

      const contactProfile = document.createElement('div');
      contactProfile.className = 'contact-profile';
      const joingame = document.createElement('button');
      joingame.textContent = 'play'
      joingame.className = 'join-game';
      joingame.id = 'game-play';

      const img = document.createElement('img');
      img.src = "https://cdn.intra.42.fr/users/7f374d7bb3c60ce254cc0d66f25f1957/werrahma.JPG";
      img.alt = '';

      const name = document.createElement('p');
      name.textContent = user;

      contactProfile.appendChild(img);
      contactProfile.appendChild(name);
      contactProfile.appendChild(joingame);
      profileContainer.appendChild(contactProfile);
  
      const newUrl = `https://localhost/chat/?user=${user}`
      console.log(`new query --------------- ${newUrl}`)
      history.pushState(null, '', newUrl);
    }
}

