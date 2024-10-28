import { NewPage, getJWT } from "/utils.js";

export const Tournament = async () => {
    await getJWT();
    let n = JSON.parse(localStorage.getItem('n')) || 0;
    let nicknames = JSON.parse(localStorage.getItem('nicknames')) || [];
    let nicknameIndex = 1;
    let tournamentModal = undefined;
    let tournamentgameModal = undefined;
    let winners = JSON.parse(localStorage.getItem('winners')) || [];

    if (nicknames.length > 0) {
        displayTournamentBracket();
    } else {
        document.getElementById('nickname-input').style.display = '';
        document.getElementById('add-nickname').addEventListener('click', function() {
            const nicknameInput = document.getElementById('nickname');
            const nicknameError = document.getElementById('nickname-error');
            const nickname = nicknameInput.value.trim();

            // Reset error message
            nicknameError.style.display = 'none';
            nicknameError.textContent = '';

            // Validation checks
            if (!nickname) {
                nicknameError.textContent = 'Nickname cannot be empty.';
            } else if (nickname.length > 15) {
                nicknameError.textContent = "Nickname can't be longer than 15 characters.";
            } else if (nicknames.includes(nickname)) {
                nicknameError.textContent = 'Nickname already exists.';
            } else {
                // Valid nickname
                nicknames.push(nickname);
                nicknameInput.value = '';
                nicknameInput.placeholder = `Enter nickname ${++nicknameIndex}`;
            
                if (nicknames.length === 4) {
                    localStorage.setItem('nicknames', JSON.stringify(nicknames));
                    document.getElementById('nickname-input').style.display = 'none';
                    displayTournamentBracket();
                }
                return; // Exit the function after successfully adding a nickname
            }

            // Show the error message
            nicknameError.style.display = 'block';
        });
    }



    function displayTournamentBracket() {
        const bracket = document.getElementById('tournament-bracket');
        bracket.style.display = 'flex';

        let playerBox = document.getElementById(`player1`);
        playerBox.textContent = nicknames[0];
        playerBox = document.getElementById(`player2`);
        playerBox.textContent = nicknames[1];
        playerBox = document.getElementById(`player3`);
        playerBox.textContent = nicknames[2];
        playerBox = document.getElementById(`player4`);
        playerBox.textContent = nicknames[3];

        let i = 1;
        winners.forEach(element => {
            let box = document.getElementById(`winner${i}`);
            box.textContent = element;
            i += 1;
        });

        if (n >= 3) {
            localStorage.removeItem('n');
            localStorage.removeItem('nicknames');
            localStorage.removeItem('winners');
        }
    };

    document.getElementById('play').addEventListener('click', function() {
        if (n >= 3)
            NewPage("/tournament", Tournament);
        else {
            const msg = document.getElementById("tournamentModalLabel");
            let player1 = '';
            let player2 = '';
            if (!n) {
                player2 = nicknames[1];
                player1 = nicknames[0];
            } else if (n == 1) {
                player1 = nicknames[2];
                player2 = nicknames[3];
            } else {
                player1 = winners[0];
                player2 = winners[1];
            }
            msg.innerHTML = `${player1} Vs. ${player2}`;
            showModal();
        }
    });

    // Function to trigger modal programmatically
    function showModal() {
        tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
        tournamentModal.show();
    };

    document.getElementById('tournament-play-btn').addEventListener('click', function() {
        tournamentModal.hide();
        const bracket = document.getElementById('tournament-bracket');
        bracket.style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';

        // game
        let player1 = '';
        let player2 = '';
        if (!n) {
            player2 = nicknames[1];
            player1 = nicknames[0];
        } else if (n == 1) {
            player1 = nicknames[2];
            player2 = nicknames[3];
        } else {
            player1 = winners[0];
            player2 = winners[1];
        }


        document.getElementById('game-player1').textContent = player1;
        document.getElementById('game-player2').textContent = player2;

        document.getElementById("okay-btn").addEventListener('click', () => {
            tournamentgameModal.hide();
            NewPage("/tournament", Tournament);
        });

        const canvas = document.getElementById("canvas");
        const keys = [];
    
        let rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
    
        // Function to trigger modal programmatically
        function showModal() {
            tournamentgameModal = new bootstrap.Modal(document.getElementById('tournamentgameModal'));
            tournamentgameModal.show();
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
                this.max = 7; // max score
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
                if (this.player1.score == this.max || this.player2.score == this.max)
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
                this.ctx.font = this.font_weight+"px Poppins";
                this.ctx.textAlign = "center";
                this.ctx.fillText(this.player1.score, 0.06 * canvas.width, 0.06 * canvas.width);
                this.ctx.fillText(this.player2.score, canvas.width - 0.06 * canvas.width, 0.06 * canvas.width);
            
                if (this.over) {
                    this.ctx.fillText(this.player1.score > this.player2.score ? `${player1} Won!` : `${player2} Won!`, canvas.width / 2, canvas.height / 2);
                    winners.push(this.player1.score > this.player2.score ? player1 : player2)
                    localStorage.setItem('winners', JSON.stringify(winners));
                    const msg = document.getElementById("tournamentgameModalLabel");
                    msg.innerHTML = this.player1.score > this.player2.score ? `${player1} Won!` : `${player2} Won!`;
                    n += 1;
                    localStorage.setItem('n', JSON.stringify(n));
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
    
        document.addEventListener("keydown", function(event){
            if (!game.started) {
                game.started = true;
                game.gameLoop();
            }
            keys[event.key] = true;
        });
    
        document.addEventListener("keyup", function(event){
            keys[event.key] = false;
        });
    });
}