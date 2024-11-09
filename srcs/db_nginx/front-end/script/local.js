import { NewPage, getJWT } from "https://10.32.72.122/utils.js";

export const Local = async () => {
    let token = await getJWT();
    let localModal = undefined;
    document.getElementById("play-btn").addEventListener('click', () => {
        localModal.hide();
        NewPage("/local", Local);
    });

    const canvas = document.getElementById("canvas");
    const keys = [];


    let rect = canvas.getBoundingClientRect();

    if (window.innerWidth > 450) {
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
    }

    // Function to trigger modal programmatically
    function showModal() {
        localModal = new bootstrap.Modal(document.getElementById('localModal'));
        localModal.show();
    }

    class Game {
        constructor() {
            this.ctx = canvas.getContext("2d");
            this.over = false;
            this.started = false;
            this.v = 0.015 * canvas.height;
            this.vy = 0.01 * canvas.height;
            this.len = 0.25 * canvas.height; // paddles len
            this.r = 0.015 * canvas.height; // radius of ball and width of paddles
            this.ball = {
                x: canvas.width / 4,
                y: canvas.height / 3,
                x_d: 1,
                y_d: 1, // x and y directions
            };
            this.player1 = {
                x: 0.02 * canvas.width,
                y: canvas.height / 2 - this.len / 2,
                score: 0,
            };
            this.player2 = {
                x: canvas.width - 0.02 * canvas.width - this.r,
                y: canvas.height / 2 - this.len / 2,
                score: 0,
            };
        }

        updatePaddle(player) {
            if (player == 2) {
                if (keys['ArrowUp'] && this.player2.y - this.v >= 0) {
                    this.player2.y -= this.v;
                }
                else if (keys['ArrowDown'] && this.player2.y + this.len + this.v <= canvas.height) {
                    this.player2.y += this.v;
                }
            }
            else {
                if (keys['w'] && this.player1.y - this.v >= 0) {
                    this.player1.y -= this.v;
                }
                else if (keys['s'] && this.player1.y + this.len + this.v <= canvas.height) {
                    this.player1.y += this.v;
                }
            }
        }

        updateBall() {
            if ((this.ball.y - this.r <= 0 && this.ball.y_d == -1) || (this.ball.y + this.r >= canvas.height && this.ball.y_d == 1)) {
                this.ball.y_d *= -1;
            }
            if (this.ball.x - this.r <= 0 && this.ball.x_d == -1) {
                this.player2.score += 1;
                this.ball.x_d *= -1;
                this.ball.x = canvas.width / 4;
                this.ball.y = Math.random() * canvas.height;
            }
            else if (this.ball.x + this.r >= canvas.width && this.ball.x_d == 1) {
                this.player1.score += 1;
                this.ball.x_d *= -1;
                this.ball.x = canvas.width * 0.75;
                this.ball.y = Math.random() * canvas.height;
            }
            else if (this.ball.x_d == -1 && this.ball.x - this.r <= this.player1.x + this.r && this.ball.x - this.r >= this.player1.x && this.ball.y >= this.player1.y - this.r && this.ball.y <= this.player1.y + this.len + this.r)
                this.ball.x_d *= -1;
            else if (this.ball.x_d == 1 && this.ball.x + this.r >= this.player2.x && this.ball.x + this.r <= this.player2.x + this.r && this.ball.y >= this.player2.y - this.r && this.ball.y <= this.player2.y + this.len + this.r)
                this.ball.x_d *= -1;
            this.ball.x += this.v * this.ball.x_d;
            this.ball.y += this.vy * this.ball.y_d;
            if (this.player1.score == 7 || this.player2.score == 7)
                this.over = 1;
        }

        draw() {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);

            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.r, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillRect(this.player1.x, this.player1.y, this.r, this.len);
            this.ctx.fillRect(this.player2.x, this.player2.y, this.r, this.len);
            this.font_weight = Math.round(0.06 * canvas.height);
            this.ctx.font = this.font_weight + "px Poppins";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.player1.score, 0.06 * canvas.width, 0.06 * canvas.width);
            this.ctx.fillText(this.player2.score, canvas.width - 0.06 * canvas.width, 0.06 * canvas.width);

            if (this.over) {
                this.ctx.fillText(this.player1.score > this.player2.score ? "Player 1 Won!" : "Player 2 Won!", canvas.width / 2, canvas.height / 2);
                const msg = document.getElementById("localModalLabel");
                msg.innerHTML = this.player1.score > this.player2.score ? "Player 1 Won!" : "Player 2 Won!";
                showModal();
            } else if (!this.started) {
                this.ctx.fillText("Press any key to start!", canvas.width / 2, canvas.height / 2);
            }
        }

        gameLoop() {
            this.updatePaddle(1);
            this.updatePaddle(2);
            this.updateBall();
            this.draw();
            if (!this.over)
                requestAnimationFrame(this.gameLoop.bind(this))
        }
    }

    let game = new Game();
    game.draw();

    document.addEventListener("keydown", function (event) {
        if (!game.started) {
            game.started = true;
            game.gameLoop();
        }
        keys[event.key] = true;
    });

    document.addEventListener("keyup", function (event) {
        keys[event.key] = false;
    });

}