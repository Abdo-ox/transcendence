import { getJWT } from 'https://localhost/home/utils.js';
const token = await getJWT();

const currentUser = document.getElementById("name");
const pNameField = document.getElementById("player")
pNameField.innerHTML = currentUser.innerHTML;
console.log('hnaa', pNameField.innerHTML, currentUser.innerHTML);

const canvas = document.getElementById("canvas");
const keys = [];
const socket = new WebSocket(`ws://localhost:9090/ws/game/?token=${token}`);

let rect = canvas.getBoundingClientRect();

canvas.width = rect.width * devicePixelRatio;
canvas.height = rect.height * devicePixelRatio;

console.log(canvas.width, canvas.height)

let gameStarted = false;

socket.onopen = function(event) {
    socket.send(JSON.stringify({
        'start': true,
        'width': canvas.width * devicePixelRatio,
        'height': canvas.height * devicePixelRatio
    }));
};

socket.onmessage = function(event) {
    const gameState = JSON.parse(event.data);
    draw(gameState);
};

function sendKey(key) {
    if (!gameStarted) {
        socket.send(JSON.stringify({'start_game': true}));
        gameStarted = true;
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

function draw(gameState) {
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
    } else if (!gameState.started) {
        ctx.fillText("Press any key to start!", canvas.width / 2, canvas.height / 2);
    }
}