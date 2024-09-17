import { NewPage, getJWT } from "https://localhost/home/utils.js";


try {
    let token = await getJWT();
    fetch('https://localhost:8000/api/suggest/friend/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    }).then(response => response.json()).then(data => {
        const currentUser = document.getElementById("name");
        const player1 = document.getElementById("player1-name");
        const currentprof = document.getElementById("profile-image");
        const player1_img = document.getElementById("player1-img");
        currentUser.innerHTML = data.currentUser.username;
        player1.innerHTML = data.currentUser.username;
        currentprof.src = data.currentUser.profile_image;
        player1_img.src = data.currentUser.profile_image;
    });
    // add event listner for chnaging the page to a new page
    document.getElementById("chat-btn").addEventListener('click', () => {
        NewPage("/chat", true);
    });
    document.getElementById("settings-btn").addEventListener('click', () => {
        NewPage("/settings", true);
    });
    document.getElementById("name").addEventListener('click', () => {
        NewPage("/profile", true);
    });
    document.getElementById("profile-image").addEventListener('click', () => {
        NewPage("/profile", true);
    });
    document.getElementById("logo").addEventListener('click', () => {
        NewPage("/home", true);
    });
    document.getElementById("home-btn").addEventListener('click', () => {
        NewPage("/home", true);
    });
    document.getElementById("play-btn").addEventListener('click', () => {
        NewPage("/multi", true);
    });


    /* ---->  game logic  <---- */
    const canvas = document.getElementById("canvas");
    const keys = [];
    const socket = new WebSocket(`ws://localhost:9090/ws/multiplayer/?token=${token}`);

    let c = 3; // countdown
    let gameState = {}
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

            // scale y
            gameState.paddle1.y *= canvas.height
            gameState.paddle2.y *= canvas.height
            gameState.ball.y    *= canvas.height
            // gameState.ball.vx   *= canvas.height
            // gameState.ball.vy   *= canvas.height
            gameState.ball.r    *= canvas.height
            // gameState.v         *= canvas.height
            gameState.len       *= canvas.height
        } else {
            // scale x
            gameState.paddle1.x = (1 - gameState.paddle1.x) * canvas.width
            gameState.paddle2.x = (1 - gameState.paddle2.x) * canvas.width
            gameState.ball.x    = (1 - gameState.ball.x)    * canvas.width

            // scale y
            gameState.paddle1.y = (1 - gameState.paddle1.y) * canvas.height
            gameState.paddle2.y = (1 - gameState.paddle2.y) * canvas.height
            gameState.ball.y    = (1 - gameState.ball.y)    * canvas.height
            // gameState.ball.vy   = (1 - gameState.ball.vy)   * canvas.height
            // gameState.ball.vx   = (1 - gameState.ball.vx)   * canvas.height
            gameState.ball.r    = (1 - gameState.ball.r)    * canvas.height
            // gameState.v         = (1 - gameState.v)         * canvas.height
            gameState.len       = (1 - gameState.len)       * canvas.height
        }
    }

    function sendKey(key) {
        socket.send(JSON.stringify({'key': key}));
    }

    document.addEventListener("keydown", function(event){
        if (keys[event.key] || !gameState.started)
            return
        keys[event.key] = true;
        sendKey(event.key);
    });

    document.addEventListener("keyup", function(event){
        if (!gameState.started)
            return
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
        ctx.font = font_weight+"px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(gameState.paddle1.score, 0.05 * canvas.width, 0.05 * canvas.width);
        ctx.fillText(gameState.paddle2.score, canvas.width - 0.05 * canvas.width, 0.05 * canvas.width);

        if (gameState.over) {
            ctx.fillText(gameState.won ? "Winner!" : "Loser!", canvas.width / 2, canvas.height / 2);
            const msg = document.getElementById("myModalLabel");
            msg.innerHTML = gameState.won ? "Winner!" : "Loser!";
            showModal();
        } else if (!gameState.started) {
            ctx.fillText("Waiting...", canvas.width / 2, canvas.height / 2);
        } else if (gameState.countdown) {
            ctx.fillText(c, canvas.width / 2, canvas.height / 2);
        }
    }
} catch(error){
    console.log(error);
}
