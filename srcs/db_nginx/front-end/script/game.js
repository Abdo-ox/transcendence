import { NewPage, getJWT } from "/utils.js";

export const Game = async () => {
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
    // add event listner for chnaging the page to a new page
    document.getElementById("play-btn").addEventListener('click', () => {
        NewPage("/game", Game);
    });


    /* ---->  game logic  <---- */
    const canvas = document.getElementById("canvas");
    const keys = [];
    const socket = new WebSocket(`ws://localhost:9090/ws/game/?token=${token}`);

    let rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    let gameStarted = false;
    let uaig = false;
    let gameState = NaN;
    let count_down = false;
    let c = 3;

    function countdown() {
        const interval = setInterval(() => {
            draw();

            c--;
            if (c == 0)
                clearInterval(interval);
        }, 1000)
    }

    socket.onopen = function (event) {
        socket.send(JSON.stringify({
            'start': true,
            'width': canvas.width * devicePixelRatio,
            'height': canvas.height * devicePixelRatio
        }));
    };

    socket.onmessage = function (event) {
        gameState = JSON.parse(event.data);
        if (gameState.uaig) {
            uaig = true;
            const msg = document.getElementById("myModalLabel");
            msg.innerHTML = "Already in game!";
            showModal();
        } else {
            count_down = false;
            draw();
        }
    };

    function sendKey(key) {
        if (!uaig) {
            if (!gameStarted) {
                socket.send(JSON.stringify({ 'start_game': true }));
                gameStarted = true;
                count_down = true;
                countdown();
            }
            socket.send(JSON.stringify({ 'key': key }));
        }
    }

    document.addEventListener("keydown", function (event) {
        if (keys[event.key])
            return
        keys[event.key] = true;
        sendKey(event.key);
    });

    document.addEventListener("keyup", function (event) {
        keys[event.key] = false
        sendKey(event.key)
    });

    // Function to trigger modal programmatically
    function showModal() {
        var myModal = new bootstrap.Modal(document.getElementById('myModal'));
        myModal.show();
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
        ctx.font = font_weight + "px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(gameState.paddle1.score, 0.05 * canvas.width, 0.05 * canvas.width);
        ctx.fillText(gameState.paddle2.score, canvas.width - 0.05 * canvas.width, 0.05 * canvas.width);

        if (gameState.over) {
            ctx.fillText(gameState.paddle1.score >= gameState.paddle2.score ? "Winner!" : "Loser!", canvas.width / 2, canvas.height / 2);
            const msg = document.getElementById("myModalLabel");
            msg.innerHTML = gameState.paddle1.score >= gameState.paddle2.score ? "Winner!" : "Loser!";
            showModal();
        } else if (!gameStarted) {
            ctx.fillText("Press any key to start!", canvas.width / 2, canvas.height / 2);
        } else if (count_down) {
            ctx.fillText(c, canvas.width / 2, canvas.height / 2);
        }
    }
}