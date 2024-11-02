import { NewPage, getJWT, webSockets } from "https://localhost/utils.js";
import { Home } from "https://localhost/home.js";

export const TournamentFr = async () => {
    let token = await getJWT();
    let tournament_name = sessionStorage.getItem('tournament_name');
    let tournamentState = undefined;
    let remotetournamentModal = undefined;
    let in_game = false

    // connect to socket
    const socket = new WebSocket(`wss://localhost:9090/ws/tournament/?token=${token}`);
    webSockets.push(socket);

    socket.onmessage = function (event) {
        tournamentState = JSON.parse(event.data);
        if (tournamentState.error) {
            sessionStorage.removeItem('tournament_name');
            const err = document.getElementById('tournament-name-error');
            err.textContent = tournamentState.message;
            err.style.display = '';
        } else if (tournamentState.players)
            displayTournamentBracket();
        else if (tournamentState.message) {
            document.getElementById('remotetournamentModalLabel').innerText = tournamentState.message;
            showModal();
            if (tournamentState.message == "This tournament is over!")
                sessionStorage.removeItem('tournament_name');
        } else if (tournamentState.users_data) {
            let player = document.getElementById("player1-name");
            player.innerHTML = tournamentState.user1;
            let op_img = document.getElementById("player1-img");
            op_img.src = tournamentState.user1img;
            player = document.getElementById("player2-name");
            player.innerHTML = tournamentState.user2;
            op_img = document.getElementById("player2-img");
            op_img.src = tournamentState.user2img;
        } else {
            gameState = tournamentState;
            if (!in_game) {
                in_game = true;
                document.getElementById('tournament-bracket').style.display = 'none';
                document.getElementById('game-container').style.display = 'flex';
                setCanvasSize();
            }
            scaleGameState();
            if (gameState.countdown) {
                countdown();
            }
            else {
                draw();
            }
        }
    }

    socket.onopen = function (event) {
        if (!tournament_name) {
            // give user input field to name tournament
            document.getElementById('tournament-name-input').style.display = '';
            document.getElementById('add-tournament-name').addEventListener('click', function() {
                const nameInput = document.getElementById('tournament-name');
                const nameError = document.getElementById('tournament-name-error');
                const name = nameInput.value.trim();

                // Reset error message
                nameError.style.display = 'none';
                nameError.textContent = '';

                // Validation checks
                if (!name) {
                    nameError.textContent = 'Nickname cannot be empty.';
                } else if (name.length > 30) {
                    nameError.textContent = "Nickname can't be longer than 30 characters.";
                } else {
                    // send create request message to socket and handle if duplicate
                    socket.send(JSON.stringify({
                        'create':true,
                        'name':name,
                    }));
                    sessionStorage.setItem('tournament_name', name);
                }
                // Show the error message
                nameError.style.display = 'flex';
            });

        } else {
            // if user is joining / continuing a tournament, take them right to the tournament bracket
            socket.send(JSON.stringify({
                'join':true,
                'name':tournament_name,
            }));
        }
    };

    function showModal() {
        remotetournamentModal = new bootstrap.Modal(document.getElementById('remotetournamentModal'));
        remotetournamentModal.show();
    };

    document.getElementById("okay-btn").addEventListener('click', () => {
        remotetournamentModal.hide();
        NewPage("/home", Home);
    });

    document.getElementById("play").addEventListener('click', () => {
        socket.send(JSON.stringify({
            'play':true,
        }));
    });

    function displayTournamentBracket() {
        const bracket = document.getElementById('tournament-bracket');
        // const img = document.getElementById('tournament-img');

        // img.src = tournamentState.image;
        let i = 1;
        tournamentState.players.forEach(element => {
            let box = document.getElementById(`player${i}`);
            box.textContent = element;
            i += 1;
        });

        i = 1;
        tournamentState.winners.forEach(element => {
            let j = 3;
            if (i < 3) {
                j = 1;
                if (tournamentState.players.indexOf(element) >= 2)
                    j = 2;
            }
            let box = document.getElementById(`winner${j}`);
            box.textContent = element;
            i += 1;
        });

        if (tournamentState.play)
            document.getElementById('play').style.display = '';
        else {
            document.getElementById('play').style.display = 'none';
        }

        document.getElementById('tournament-name-input').style.display = 'none';
        if (!in_game)
            bracket.style.display = 'flex';
    };

    // game logic //
    let remoteGameModal = undefined;
    // add event listner for chnaging the page to a new page
    document.getElementById("game-okay-btn").addEventListener('click', () => {
        remoteGameModal.hide();
        in_game = false;
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('tournament-bracket').style.display = 'flex';
    });

    const canvas = document.getElementById("canvas");
    const keys = [];

    let c = 3; // countdown
    let gameState = {};

    function countdown() {
        c = 3;
        draw();
        c--;
        const interval = setInterval(() => {
            draw();
        
            c--;
            if (c == 0)
                clearInterval(interval);
        }, 1000)
    }

    function scaleGameState() {
        gameState.paddle1.x *= canvas.height
        gameState.paddle2.x *= canvas.height
        gameState.ball.x    *= canvas.height
        
        // scale y
        gameState.paddle1.y = gameState.paddle1.y   * canvas.height
        gameState.paddle2.y = gameState.paddle2.y   * canvas.height
        gameState.ball.y    = gameState.ball.y      * canvas.height
        gameState.len       = gameState.len         * canvas.height
        gameState.ball.r    = gameState.ball.r      * canvas.height
    }

    function sendKey(key) {
        if (socket.readyState == socket.CLOSED)
            return
        socket.send(JSON.stringify({'key': key}));
    }

    document.addEventListener("keydown", function(event){
        if (keys[event.key] || !gameState.started || !in_game)
            return
        keys[event.key] = true;
        sendKey(event.key);
    });

    document.addEventListener("keyup", function(event){
        if (!gameState.started || !in_game)
            return
        keys[event.key] = false
        sendKey(event.key)
    });

    function showGameModal() {
        remoteGameModal = new bootstrap.Modal(document.getElementById('remoteGameModal'));
        remoteGameModal.show();
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
            const msg = document.getElementById("remoteGameModalLabel");
            msg.innerHTML = gameState.won ? "Winner!" : "Loser!";
            showGameModal();
        } else if (gameState.countdown) {
            ctx.fillText(c, canvas.width / 2, canvas.height / 2);
        }
    }
    function setCanvasSize() {
        let rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
    }
}