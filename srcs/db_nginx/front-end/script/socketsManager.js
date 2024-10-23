import { getJWT } from '/utils.js';
let chatSocket = null

export async function createWebSocket(ChatID, username)
{
  // const token = localStorage.getItem('access_token');
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
    chatSocket.close();
  let token = await getJWT();
  chatSocket = new WebSocket('ws://127.0.0.1:9000/ws/chat/' + ChatID + '/' + `?token=${token}`);
  chatSocket.onopen = () => {
    console.log('WebSocket is open now.');
    
    var chatLog = document.querySelector('#chat-log');
    if (chatLog) {
      while (chatLog.firstChild) {
        chatLog.removeChild(chatLog.firstChild);
      }
      console.log(`fetch data method called`)
      fetchMessages();
    } else {
      console.error('Chat log element not found!');
    }
  };
  
    chatSocket.onmessage = (e) => {
      var data = JSON.parse(e.data);
      if (data['command'] === 'messages') {
        data['messages'].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
        });
        for (let i = 0; i < data['messages'].length; i++) {
          // console.log('data obj is', data['messages'][i].timestamp);
          createMessage(data['messages'][i]);
        }
      } else if (data['command'] === 'new_message') {
        console.log('command is new_message')
        createMessage(data['message']);
      }
    };
  
    chatSocket.onclose = () => {
      console.error('Chat socket closed');
    };
  
    const messageInput = document.querySelector('#chat-message-input');
    const messageSubmit = document.getElementById('submit-button');
  
    if (messageInput) {
      console.log('messageInput pressed')
      messageInput.onkeyup = function (e) {
        console.log('User pressed a key');
        if (e.key === 'Enter') {
          console.log('User pressed Enter');
          if (messageSubmit) {
            messageSubmit.click();
          } else {
            console.error('Submit button not found!');
          }
        }
      };
    } else {
      console.error('Message input element not found!');
    }
  
    if (messageSubmit) {
      messageSubmit.onclick = function (e) {
        console.log('Submit button clicked');
        const messageInputDom = document.getElementById('chat-message-input');
        if (messageInputDom.value != "") {
          const message = messageInputDom.value;
          chatSocket.send(JSON.stringify({
            'command': 'new_message',
            'message': message,
            'from': username,
            'ChatID': ChatID
          }));
          messageInputDom.value = '';
        } else {
          console.error('Message input DOM not found when submitting!');
        }
      };
    } else {
      console.error('Message submit button not found!');
    }
  
    function fetchMessages() {
      chatSocket.send(JSON.stringify({'command': 'fetch_messages', 'username': username, 'ChatID': ChatID}));
    }

    function scrollToBottom() {
      const messagesContainer = document.querySelector('.messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function createMessage(data) {
        var author = data['author'];
        var msgListTag = document.createElement('li');
        // var imgTag = document.createElement('img');
        var pTag = document.createElement('p');
        pTag.textContent = data.content;
        // imgTag.src = "https://cdn.intra.42.fr/users/7f374d7bb3c60ce254cc0d66f25f1957/werrahma.JPG";

        if (author === username) {
          msgListTag.className = 'replies';
        }
        else {
          msgListTag.className = 'sent';
        }

        // msgListTag.appendChild(imgTag);
        msgListTag.appendChild(pTag);
        var chatLOG = document.querySelector('#chat-log')
        if (chatLOG)
            chatLOG.appendChild(msgListTag);
          scrollToBottom();
    }
}

export function GamePlaySocketEngine(ChatID, From, To) {
  console.log(`the play request from ${From}`)
  console.log(`I'm inside the GamePlaySocketEngine and ChatID equals ${ChatID}`);

  const GamePlaySocket = new WebSocket('ws://127.0.0.1:9000/ws/notif/');
  let nameElement = ""
  document.getElementById('game-play').addEventListener('click', event => {
    const contact_profile = event.target.closest('.contact-profile')
    nameElement = contact_profile.querySelector('p');
    if (nameElement != "")
      console.log(`play event happened and nameEl is ${nameElement.textContent}`)
    // chatListview(nameElement.textContent, 'GamePlaysock');
  });
  if (nameElement != ""){
    console.log(`nameElement is ${nameElement}`)
    GamePlaySocket.onopen = () => {
      console.log('WebSocket connection opened');
      GamePlaySocket.send(JSON.stringify({
        'ChatID': ChatID,
        'from': From,
        'to': To
      }));
    };
    GamePlaySocket.onmessage = (e) => {
      var data = JSON.parse(e.data);
      console.log(`GamePlaySocket onmessage and this data is "${data}"`);
      console.log(`To from method is ${To} and 'to' from serverside is ${data['to']}`)
      if (data['to'] === From)
        displayNotification(data['message'])
    };

    GamePlaySocket.onclose = () => {
      console.error('GamePlaySocket closed');
    };
    function displayNotification(message) {
      // Your logic to display the notification to the user
      alert(`New notification: ${message}`);
    }
  }
}
