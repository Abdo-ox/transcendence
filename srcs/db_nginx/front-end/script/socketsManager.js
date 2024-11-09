<<<<<<< HEAD
import { getJWT } from 'https://10.14.60.29/utils.js';
=======
import { getJWT } from 'https://10.32.72.122/utils.js';
>>>>>>> e91eeb378735dd762cba6a600a6538a34ef40320
let chatSocket = null

export async function createWebSocket(ChatID, username)
{
  // const token = localStorage.getItem('access_token');
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
    chatSocket.close();
  let token = await getJWT();
<<<<<<< HEAD
  chatSocket = new WebSocket('wss://10.14.60.29:9000/ws/chat/' + ChatID + '/' + `?token=${token}`);
=======
  chatSocket = new WebSocket('wss://10.32.72.122:9000/ws/chat/' + ChatID + '/' + `?token=${token}`);
>>>>>>> e91eeb378735dd762cba6a600a6538a34ef40320
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
        // data['messages'].sort((a, b) => {
        // return new Date(a.timestamp) - new Date(b.timestamp);
        // });
        data['messages'].reverse()
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
        if (messageInputDom.value.trim() === ""){
            console.error('Message input DOM not found when submitting!');
        }
        else {
          const message = messageInputDom.value;
          chatSocket.send(JSON.stringify({
            'command': 'new_message',
            'message': message,
            'from': username,
            'ChatID': ChatID
          }));
          messageInputDom.value = '';
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
