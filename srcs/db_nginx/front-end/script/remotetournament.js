import { NewPage, getJWT, webSockets } from "/utils.js";
import { Home } from "./home.js";

export const RemoteTournament = async () => {
    let token = await getJWT();

    let tournament_name = localStorage.getItem('tournament_name');
    let tournamentState = undefined;
    let tournamentModal = undefined;

    // connect to socket
    const socket = new WebSocket(`wss://localhost:9090/ws/tournament/?token=${token}`);
    webSockets.push(socket);

    socket.onmessage = function (event) {
        tournamentState = JSON.parse(event.data);
        console.log(tournamentState);
        if (tournamentState.duplicate) {
            const err = document.getElementById('tournament-name-error').textContent = "This name has already been used.";
            err.style.display = '';
        } else if (tournamentState.players)
            displayTournamentBracket();
        else if (tournamentState.message) {
            document.getElementById('tournamentModalLabel').innerText = tournamentState.message;
            showModal();
        }
    }

    socket.onopen = function (event) {
        // if create, i.e. no roomname in localstorage, send create request to socket
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
                }
                // Show the error message
                nameError.style.display = 'block';
            });

        } else {
            // if user is joining / continuing a tournament, take them right to the tournament bracket
            console.log(tournament_name);
            socket.send(JSON.stringify({
                'join':true,
                'name':tournament_name,
            }));
            localStorage.removeItem('tournament_name');
        }
    };

    function showModal() {
        tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
        tournamentModal.show();
    };

    document.getElementById("okay-btn").addEventListener('click', () => {
        tournamentModal.hide();
        NewPage("/home", Home);
    });

    function displayTournamentBracket() {
        const bracket = document.getElementById('tournament-bracket');

        let i = 1;
        tournamentState.players.forEach(element => {
            let box = document.getElementById(`player${i}`);
            box.textContent = element;
            i += 1;
        });

        i = 1;
        tournamentState.winners.forEach(element => {
            let box = document.getElementById(`winner${i}`);
            box.textContent = element;
            i += 1;
        });

        if (tournamentState.play)
            document.getElementById('play').style.display = '';

        document.getElementById('tournament-name-input').style.display = 'none';
        bracket.style.display = 'flex';
    };
}