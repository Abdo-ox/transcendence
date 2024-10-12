import { createWebSocket } from '/socketsManager.js';
import { getJWT } from '/utils.js';
import { GamePlaySocket } from '/header.js';
console.log("chat called");
let TargetUser = null; // make this variable local
export async function Chat() {
  const url = new URL(window.location.href);
  // Check if the pathname is '/chat'
  if (url.pathname === '/chat/?') {
    const params = new URLSearchParams(url.search);
    TargetUser = params.get('user');
  }
  else {
    console.log(`usl path name ${url.pathname}`)
  }

  let access_token = await getJWT();
  const data = await fetch('https://localhost:8000/api/user/data/', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    }
  })
    .then(response => response.json()) // Call json() to parse the response
    .then(data => {
      console.log(`bodychat is call`, data)
      bodychat(data)
    })
    .catch(error => {
      console.error('Error:', error); // Handle errors
    });
}

async function bodychat(UserData) {
  const username = UserData.username;
  console.log(`username from bodychat is === ${username}`)
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

    if (frameElement) {
      frameElement.remove();
    }
    const newFrame = document.createElement('div');
    newFrame.id = 'frame';
    newFrame.innerHTML = htmlContent;

    document.body.appendChild(newFrame);
    fetchData();
    if (UserData.friends) {
      UserData.friends.forEach(friend => {
        if (friend.username === TargetUser) {
          createHtmlPrf();
          updateProfile(TargetUser);
          chatListview(TargetUser, 'createWebSocket');
          // GamePlay();
          // Create the new URL
          const newUrl = `https://localhost/chat/?user=${TargetUser}`
          console.log(`new query --------------- ${newUrl}`)
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
      console.log(`target user iss ${contact.id}`)
      console.log(`the authonticat contact is ${username} , and the other contact is ${contact.id}`)
      let access_token = await getJWT();
      console.log(`contacts-list event called and the access token is ${access_token}`)

      const data = await fetch(`http://127.0.0.1:9000/chat/GetChatID/?username1=${encodeURIComponent(username)}&username2=${encodeURIComponent(contact.id)}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'  // Optional, but a good practice
        }
      })
        .then(response => response.json()) // Call json() to parse the response
        .then(data => {
          console.log(data)
          // console.log(`user/data response "${JSON.stringify(data, null, 2)}"`)
        })
        .catch(error => {
          console.error('Error:', error); // Handle errors
        });
      if (contact) {
        console.log('contact exests')
        createHtmlPrf();
        updateProfile(contact.id);
        chatListview(contact.id, 'createWebSocket');
      }
      else {
        console.log(`conctact doesn't exests`)
      }
      // GamePlay();
    });
  }

  /// handel play event
  function GamePlay() {
    document.getElementById('game-play').addEventListener('click', event => {
      const profile_container = document.getElementById('profile-container');
      const contact_profile = profile_container.querySelector('.contact-profile');
      const nameElement = contact_profile.querySelector('p');
      console.log(`game play nameElement is ${nameElement}`)
      if (nameElement != "")
        console.log(`play event happened and nameEl is ${nameElement.textContent}`)
      if (GamePlaySocket.readyState === WebSocket.OPEN) {
        // GamePlaySocket.onopen = () => {
        console.log('WebSocket connection opened');
        GamePlaySocket.send(JSON.stringify({
          'from': username,
          'to': nameElement.textContent,
          'message': `${username} invites u to play.`,
          'flag': 'GameR'
        }));
        // };
      }
    });
  }

  // GamePlaySocket.onmessage = (e) => {
  //     var data = JSON.parse(e.data);
  //     console.log(`GamePlaySocket onmessage and this data is "${data['to']}"`);
  //     if (data['to'] === username)
  //       displayNotification(data['message'])
  //   };

  //   GamePlaySocket.onclose = () => {
  //     console.error('GamePlaySocket closed');
  //   };

  // Function to create or toggle the menu panel

  function createmenuPanel() {
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
      let profile_container = document.getElementById('profile-container')
      profile_container.insertBefore(menu, profile_container.firstChild);
    }
    menu.classList.toggle('active');
    GamePlay();
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

  async function chatListview(user, FunctionTarget) {
    let access_token = await getJWT();
    console.log(`chatlistview called user is ${user}`)
    const data = await fetch(`http://127.0.0.1:9000/chat/GetChatID/?username1=${encodeURIComponent(username)}&username2=${encodeURIComponent(user)}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'  // Optional, but a good practice
      }
    })
      .then(response => response.json()) // Call json() to parse the response
      .then(data => {
        console.log('request send ....', data.ChatID)
        if (FunctionTarget === 'createWebSocket') {
          createWebSocket(data.ChatID, user);
          // GamePlaySocketEngine(response.data.ChatID, username, user);
        }
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
    const VerticalDots = document.createElement('img');
    VerticalDots.src = "https://localhost/chat/images/dots.svg"
    VerticalDots.className = "VerticalDots"
    VerticalDots.id = "VerticalDots"
    const img = document.createElement('img');
    img.src = "https://cdn.intra.42.fr/users/7f374d7bb3c60ce254cc0d66f25f1957/werrahma.JPG";
    img.alt = '';

    const name = document.createElement('p');
    name.textContent = user;

    contactProfile.appendChild(img);
    contactProfile.appendChild(name);
    contactProfile.appendChild(VerticalDots);
    profileContainer.appendChild(contactProfile);

    const newUrl = `https://localhost/chat/?user=${user}`
    history.pushState(null, '', newUrl);
    // Add click event listener to the VerticalDots icon
    document.getElementById('VerticalDots').addEventListener('click', event => {
      event.stopPropagation();
      createmenuPanel();
    });

  }
}

