import { NewPage, getJWT, webSockets } from "/utils.js";


export const Multi = async () => {
    let token = await getJWT();
    fetch('https://localhost:8000/api/currentUser/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    }).then(response => response.json()).then(data => {
        const player1 = document.getElementById("player1-name");
        const player1_img = document.getElementById("player1-img");
        player1.innerHTML = data.username;
        player1_img.src = data.profile_image;
    });
    let multiModal = undefined;
    // add event listner for chnaging the page to a new page
    document.getElementById("play-btn").addEventListener('click', () => {
        multiModal.hide();
        NewPage("/multi", Multi);
    });


    /* ---->  game logic  <---- */
    let room_name = localStorage.getItem('room_name');
    const canvas = document.getElementById("canvas");
    const keys = [];
    let socket = undefined
    if (room_name) {
        socket = new WebSocket(`wss://localhost:9090/ws/multiplayer/${room_name}/?token=${token}`);
        localStorage.removeItem('room_name');
    } else
        socket = new WebSocket(`wss://localhost:9090/ws/multiplayer/?token=${token}`);
    webSockets.push(socket);

    let c = 3; // countdown
    let gameState = {};
    let uaig = false;
    let rev = false; // to reverse gamestate if player 2

    let rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    socket.onopen = function(event) {
        socket.send(JSON.stringify({
            'start': true,
        }));
    };


    socket.onmessage = function(event) {
        gameState = JSON.parse(event.data);
        if (gameState.role) {
            if (gameState.role == 'paddle2')
                rev = true;
            const player2 = document.getElementById("player2-name");
            player2.innerHTML = gameState.username;
            const op_img = document.getElementById("player2-img");
            op_img.src = gameState.img;
        } else if (gameState.uaig) {
            uaig = true;
                const msg = document.getElementById("multiModalLabel");
                msg.innerHTML = "Already in game!";
                showModal();
        } else {
            scaleGameState()
            if (gameState.countdown && gameState.started) {       
                countdown()
            }
            else {
                draw();
            }
        }
    };

    function countdown() {
        const interval = setInterval(() => {
            draw();
        
            c--;
            if (c == 0)
                clearInterval(interval);
        }, 1000)
    }

    function scaleGameState() {
        if (!rev) {
            // scale x
            gameState.paddle1.x *= canvas.width
            gameState.paddle2.x *= canvas.width
            gameState.ball.x    *= canvas.width
        } else {
            // scale x
            gameState.paddle1.x = (1 - gameState.paddle1.x) * canvas.width
            gameState.paddle2.x = (1 - gameState.paddle2.x) * canvas.width
            gameState.ball.x    = (1 - gameState.ball.x)    * canvas.width
        }
        // scale y
        gameState.paddle1.y = gameState.paddle1.y   * canvas.height
        gameState.paddle2.y = gameState.paddle2.y   * canvas.height
        gameState.ball.y    = gameState.ball.y      * canvas.height
        gameState.len       = gameState.len         * canvas.height
        gameState.ball.r    = gameState.ball.r      * canvas.height
    }

    function sendKey(key) {
        socket.send(JSON.stringify({'key': key}));
    }

    document.addEventListener("keydown", function(event){
        if (keys[event.key] || !gameState.started || uaig || socket.CLOSED)
            return
        keys[event.key] = true;
        sendKey(event.key);
    });

    document.addEventListener("keyup", function(event){
        if (!gameState.started || uaig || socket.CLOSED)
            return
        keys[event.key] = false
        sendKey(event.key)
    });

    // Function to trigger modal programmatically
    function showModal() {
        multiModal = new bootstrap.Modal(document.getElementById('multiModal'));
        multiModal.show();
    }

    function draw() {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.r, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillRect(gameState.paddle1.x, gameState.paddle1.y, gameState.ball.r, gameState.len);
        ctx.fillRect(gameState.paddle2.x, gameState.paddle2.y, gameState.ball.r, gameState.len);

        let font_weight = Math.round(0.06 * canvas.height)
        ctx.font = font_weight+"px Poppins";
        ctx.textAlign = "center";
        if (!rev) {
            ctx.fillText(gameState.paddle1.score, 0.05 * canvas.width, 0.05 * canvas.width);
            ctx.fillText(gameState.paddle2.score, canvas.width - 0.05 * canvas.width, 0.05 * canvas.width);
        } else {
            ctx.fillText(gameState.paddle2.score, 0.05 * canvas.width, 0.05 * canvas.width);
            ctx.fillText(gameState.paddle1.score, canvas.width - 0.05 * canvas.width, 0.05 * canvas.width);
        }

        if (gameState.over) {
            console.log('here')
            ctx.fillText(gameState.won ? "Winner!" : "Loser!", canvas.width / 2, canvas.height / 2);
            const msg = document.getElementById("multiModalLabel");
            msg.innerHTML = gameState.won ? "Winner!" : "Loser!";
            showModal();
        } else if (!gameState.started) {
            ctx.fillText("Waiting...", canvas.width / 2, canvas.height / 2);
        } else if (gameState.countdown) {
            ctx.fillText(c, canvas.width / 2, canvas.height / 2);
        }
    }
}
