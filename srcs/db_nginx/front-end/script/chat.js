import { createWebSocket } from 'https://10.14.60.29/socketsManager.js';
import { NewPage, getJWT, printErrorInScreen} from 'https://10.14.60.29/utils.js';
import { GamePlaySocket, OnlineList } from 'https://10.14.60.29/header.js';
import { Profile } from "https://10.14.60.29/profile.js"

let TargetUser = null; // make this variable local
export async function Chat() {
  const url = new URL(window.location.href);
  if (url.pathname === '/chat') {
    const params = new URLSearchParams(url.search);
    TargetUser = params.get('user');
  }

  let access_token = await getJWT();
  const data = await fetch('https://10.14.60.29:8000/api/user/data/', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    }
  })
    .then(response => response.json()) // Call json() to parse the response
    .then(data => {
      bodychat(data)
    })
    .catch(error => {
      console.error('Error:', error); // Handle errors
    });
}

async function bodychat(UserData) {
  const username = UserData.username;
  let htmlContent = 0;
  if (!htmlContent) {
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

    // if (frameElement) {
    //   frameElement.remove();
    // }
    const newFrame = document.createElement('div');
    newFrame.id = 'frame';
    newFrame.innerHTML = htmlContent;
    frameElement.replaceWith(newFrame);
    // document.body.appendChild(newFrame);
    fetchData();
    if (TargetUser && UserData.friends) {
      UserData.friends.forEach(friend => {
        if (friend.username === TargetUser) {
          createHtmlPrf();
          updateProfile(friend);
          chatListview(TargetUser);
          const newUrl = `/chat?user=${TargetUser}`
          history.pushState(null, '', newUrl);
        }
      });
    }


    document.getElementById('contacts-list').addEventListener('click', async event => {
      const contact = event.target.closest('.contact');
      if (!contact) {
        console.error('No .contact element found');
        return;
      }
      if (contact) {
        let imgElement = contact.querySelector('img');
        let user = {username: contact.id, profile_image: imgElement.src};
        createHtmlPrf();
        updateProfile(user);
        chatListview(contact.id);
      }
    });
  }

  /// handel play event
async  function GamePlay() {
    const profile_container = document.getElementById('profile-container');
    const contact_profile = profile_container.querySelector('.contact-profile');
    const nameElement = contact_profile.querySelector('p');
    let gamePlay = document.getElementById('game-play');

    // Remove existing event listener if it exists
    let clonedGamePlay = gamePlay.cloneNode(true);
    gamePlay.parentNode.replaceChild(clonedGamePlay, gamePlay);
    gamePlay = clonedGamePlay; // reassign the element after cloning
    gamePlay.addEventListener('click',  async (e) => {
      let access_token = await getJWT();
      const data = await fetch(`https://10.14.60.29:8000/api/UserStatus/?username=${encodeURIComponent(nameElement.textContent)}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'  // Optional, but a good practice
        }
      })
        .then(response => response.json()) // Call json() to parse the response
        .then(data => {
        if (OnlineList && !OnlineList.includes(nameElement.textContent) && data.is_online === false){
          printErrorInScreen('the target user is offline');
          return 0;}
        if (GamePlaySocket.readyState === WebSocket.OPEN && gamePlay.textContent === "play") {
            GamePlaySocket.send(JSON.stringify({
                'from': username,
                'targetUser': nameElement.textContent,
                'message': ` invites u to play.`,
                'flag': 'GameRq',
                'img': UserData.profile_image,
              }));
        }
        if (gamePlay.textContent === "cancel") {
            if (GamePlaySocket.readyState === WebSocket.OPEN) {
                GamePlaySocket.send(JSON.stringify({
                  'from': username,
                  'targetUser': nameElement.textContent,
                  'message': `${username} cancel play request.`,
                  'flag': 'GameRq',
                  'img': UserData.profile_image
                }));
              }
              gamePlay.textContent = "play";
        } else {
            gamePlay.textContent = "cancel";
        }
      })
      .catch(handleError);
    });
}

  // Function to create or toggle the menu panel

  function createmenuPanel(username) {
    let profile_container = document.getElementById('profile-container');
    // const contact_profile = profile_container.querySelector('.contact-profile');
    // const nameElement = contact_profile.querySelector('p');
    let menu = document.getElementById('menu');
    const joingame = document.createElement('button');
    const BlockUser = document.createElement('button');
    joingame.textContent = 'play'
    joingame.className = 'join-game';
    joingame.id = 'game-play';
    BlockUser.textContent = 'Block'
    BlockUser.className = 'BlockUser';
    BlockUser.id = 'BlockUser';

    if (!menu) {
      menu = document.createElement('div')
      menu.className = 'menu'
      menu.id = 'menu'
      menu.appendChild(joingame)
      menu.appendChild(BlockUser)
      profile_container.insertBefore(menu, profile_container.firstChild);
    }
    menu.classList.toggle('active');
    GamePlay();
    BlockUser.addEventListener('click', async () => {
      var chatLog = document.querySelector('#chat-log');
      const profileContainer = document.getElementById('profile-container');
      const targetContact = document.getElementById(username);
      const messageInput = document.querySelector('#chat-message-input');
      const messageSubmit = document.getElementById('submit-button');
      messageSubmit.remove();
      messageInput.remove();
      targetContact.remove()
      profileContainer.remove()
      if (GamePlaySocket.readyState === WebSocket.OPEN) {
        GamePlaySocket.send(JSON.stringify({
          'flag': 'Block',
          'targetUser': username,
          'from': UserData.username
        }));
      }
      if (chatLog) chatLog.textContent = '';
      const token = await getJWT();
      fetch(`https://10.14.60.29:8000/friend/unfriend/?username=${username}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => console.log(response.status));
    });
  }


  // Hide the menu panel if clicking outside
  document.addEventListener('click', event => {
    const menu = document.getElementById('menu');
    const VerticalDots = document.getElementById('VerticalDots');

    if (menu && menu.classList.contains('active') &&
      !menu.contains(event.target) &&
      !VerticalDots.contains(event.target)) {
      menu.classList.remove('active');
    }
  });

  function fetchData() {
    UserData.friends.forEach(friend => {
      createSuperuser(friend)
    });
  }

  function createHtmlPrf() {
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
          <img id="submit-button" src="https://10.14.60.29/images/send.svg"/>
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
    const img = document.createElement('img');
    img.src = user.profile_image;
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

  async function chatListview(user) {
    let access_token = await getJWT();
    const data = await fetch(`https://10.14.60.29:9000/chat/GetChatID/?username1=${encodeURIComponent(username)}&username2=${encodeURIComponent(user)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'  // Optional, but a good practice
      }
    })
      .then(response => response.json()) // Call json() to parse the response
      .then(data => {
          createWebSocket(data.ChatID, user);
      })
      .catch(handleError);
  }

  document.getElementById('search').addEventListener('input', event => {
    const contacts = document.querySelectorAll('#frame #sidepanel #contacts ul li.contact');
    let flag = false;
    UserData.friends.forEach(friend => {
      if (friend.username === event.target.value) {
        flag = true;
        const targetItem = document.getElementById(event.target.value);
        const parent = targetItem.parentNode;
        parent.insertBefore(targetItem, contacts[0]);
        contacts.forEach(contact => {
          if (friend.username != contact.id)
            contact.style.visibility = 'hidden';
          else
            contact.style.visibility = 'visible';
        });
      }
    });
    if (event.target.value == "" || flag === false) {
      contacts.forEach(contact => {
        if (flag === false && event.target.value)
          contact.style.visibility = 'hidden';
        else
          contact.style.visibility = 'visible';
      });
    }
  });

  function handleError(error) {
    
  }
  function updateProfile(user) {
    const profileContainer = document.getElementById('profile-container');
    profileContainer.innerHTML = '';
    
    const contactProfile = document.createElement('div');
    contactProfile.className = 'contact-profile';
    const VerticalDots = document.createElement('img');
    VerticalDots.src = "https://10.14.60.29/images/dots.svg"
    VerticalDots.className = "VerticalDots"
    VerticalDots.id = "VerticalDots"
    const img = document.createElement('img');
    img.src = user.profile_image;
    img.alt = '';

    const name = document.createElement('p');
    name.textContent = user.username;

    contactProfile.appendChild(img);
    contactProfile.appendChild(name);
    contactProfile.appendChild(VerticalDots);
    profileContainer.appendChild(contactProfile);
    name.addEventListener('click', () => {
      NewPage("/profile", Profile,true,"?user="+name.textContent); 
    });
    const newUrl = `/chat?user=${user.username}`
    history.pushState(null, '', newUrl);
    // Add click event listener to the VerticalDots icon
    document.getElementById('VerticalDots').addEventListener('click', event => {
      event.stopPropagation();
      createmenuPanel(user.username);
    });

  }
}

