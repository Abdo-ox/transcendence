import { NewPage, getJWT } from "/utils.js";

export const RemoteTournament = async () => {
    await getJWT();

    // get tournament name from local storage
    let tournament_name = localStorage.getItem('tournament_name');

    // connect to socket
    const socket = new WebSocket(`ws://localhost:9090/ws/tournament/?token=${token}`);

    // on open, send create or join / continue request

    // if create, i.e. no roomname in localstorage, send create request to socket
    if (!tournament_name) {
        // give user input field to name tournament
        // handle errors: duplicate name, size

        // after creation, take user to tournament bracket

    } else { // if user is joining / continuing a tournament, take them right to the tournament bracket

    }
}