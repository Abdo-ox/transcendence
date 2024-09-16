import { getJWT } from 'https://localhost/home/utils.js';
const token = await getJWT();

const canvas = document.getElementById("canvas");
const keys = [];
const socket = new WebSocket(`ws://localhost:9090/ws/multiplayer/?token=${token}`);

let c = 3;// countdown
let gameState = {}

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
    scaleGameState()
    if (gameState.countdown && gameState.started) {       
        countdown()
    }
    else {
        draw();
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
    // scale x
    gameState.paddle1.x *= canvas.width
    gameState.paddle2.x *= canvas.width
    gameState.ball.x *= canvas.width

    // scale y
    gameState.paddle1.y *= canvas.height
    gameState.paddle2.y *= canvas.height
    gameState.ball.y *= canvas.height
    gameState.ball.vx *= canvas.height
    gameState.ball.vy *= canvas.height
    gameState.ball.r *= canvas.height
    gameState.v *= canvas.height
    gameState.len *= canvas.height
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
        ctx.fillText(gameState.won ? "Winner!" : "Loser!", canvas.width / 2, canvas.height / 2);
    } else if (!gameState.started) {
        ctx.fillText("Waiting...", canvas.width / 2, canvas.height / 2);
    } else if (gameState.countdown) {
        ctx.fillText(c, canvas.width / 2, canvas.height / 2);
    }
}