import { NewPage, getJWT, webSockets } from "/utils.js";

export const RemoteTournament = async () => {
    let token = await getJWT();

    // get tournament name from local storage
    let tournament_name = localStorage.getItem('tournament_name');
    const response = await fetch('http://localhost:9090/matchcount/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    const data = await response.json();
    console.log(data)
    // connect to socket
    const socket = new WebSocket(`ws://localhost:9090/ws/tournament/?token=${token}`);
    webSockets.push(socket);

    socket.onmessage = function(event) {
        let tournamentState = JSON.parse(event.data);
        console.log(tournamentState);
    }

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
            }
            // send create request message to socket and handle if duplicate
            socket.send(JSON.stringify({
                'create':true,
                'name':name,
            }));

            // Show the error message
            nameError.style.display = 'block';
        });

        // after creation, take user to tournament bracket

    } else { // if user is joining / continuing a tournament, take them right to the tournament bracket

    }
}