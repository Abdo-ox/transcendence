let nicknames = [];
let nicknameIndex = 1;
let game = 0;

document.getElementById('add-nickname').addEventListener('click', function() {
    const nicknameInput = document.getElementById('nickname');
    const nickname = nicknameInput.value.trim();

    if (nickname) {
        nicknames.push(nickname);
        nicknameInput.value = '';
        nicknameInput.placeholder = `Enter nickname ${++nicknameIndex}`;

        if (nicknames.length === 4) {
            document.getElementById('nickname-input').style.display = 'none';
            displayTournamentBracket();
        }
    } else {
        alert('Please enter a valid nickname.');
    }
});

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

    document.getElementById('winner').textContent = '?';
};

document.getElementById('play').addEventListener('click', function() {
    const msg = document.getElementById("myModalLabel");
    msg.innerHTML = `${nicknames[0]} Vs. ${nicknames[1]}`;
    showModal();
});

// Function to trigger modal programmatically
function showModal() {
    var myModal = new bootstrap.Modal(document.getElementById('myModal'));
    myModal.show();
};