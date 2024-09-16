import { NewPage, getJWT } from "https://localhost/home/utils.js";


try {
    let token = await getJWT();
    fetch('https://localhost:8000/api/suggest/friend/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    }).then(response => response.json()).then(data => {
        console.log("data", data);
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
        NewPage("/game", true);
    });


    /* ---->  game logic  <---- */
    const canvas = document.getElementById("canvas");
    const keys = [];
    const socket = new WebSocket(`ws://localhost:9090/ws/game/?token=${token}`);

    let rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    let gameStarted = false;
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

    socket.onopen = function(event) {
        socket.send(JSON.stringify({
            'start': true,
            'width': canvas.width * devicePixelRatio,
            'height': canvas.height * devicePixelRatio
        }));
    };

    socket.onmessage = function(event) {
        gameState = JSON.parse(event.data);
        count_down = false;
        draw();
    };

    function sendKey(key) {
        if (!gameStarted) {
            socket.send(JSON.stringify({'start_game': true}));
            gameStarted = true;
            count_down = true;
            console.log(gameState);
            countdown();
        }
        socket.send(JSON.stringify({'key': key}));
    }

    document.addEventListener("keydown", function(event){
        if (keys[event.key])
            return
        keys[event.key] = true;
        sendKey(event.key);
    });

    document.addEventListener("keyup", function(event){
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
        ctx.font = font_weight+"px 'Zen Dots'";
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
} catch(error){
    console.log(error);
}