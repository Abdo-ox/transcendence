function handleClick(mode) {
    if (mode == 'Tournament')
        window.location.href = '/tournaments.html' // TODO: create tournament page
    else if (mode == '1v1')
        window.location.href = '/multi.html'
    else if (mode == '1vAI')
        window.location.href = '/game.html'
}