import { getJWT } from "/utils.js";
// window.addEventListener('scroll', function () {
//     var header = document.querySelector('header');
//     header.classList.toggle('sticky', window.scrollY > 0);
// });

export async function Profile() {




    // const pourcentage3 = parseInt(document.getElementById('profile-level-progress').textContent.replace('%', ''));
    // const strokeDashoffset3 = 390 - (390 * pourcentage3 / 100);
    // const styleElement3 = document.createElement('style');
    // styleElement3.innerHTML = `@keyframes animeacheiv { 100% { stroke-dashoffset: ${strokeDashoffset3}; }}`;
    // document.head.appendChild(styleElement3);
    // document.getElementById('profile-level-line').style.animation = 'animeacheiv 2s linear forwards';

    /**  Endpoint game**/
    const response = await fetch('https://localhost:9090/gameprofile/', {
        headers: {
            'Authorization': `Bearer ${await getJWT()}`,

        }
    })
    if (!response.ok) {
        console.error('Failed to fetch current user:', response.status, response.statusText);
        return;
    }
    const data = await response.json();
    document.getElementById("profile-matchScore").innerHTML = data.totalGames;
    document.getElementById("profile-tournamentsScore").innerHTML = data.tournaments;
    let sum = data.tournaments + data.totalGames;
    if (sum > 0) {
        document.getElementById("profile-lose").innerHTML = ((data.losses / sum) * 100).toFixed(0) + '%';
        document.getElementById("profile-number").innerHTML = ((data.wins / sum) * 100).toFixed(0) + '%';
    } else {
        document.getElementById("profile-lose").innerHTML = '0%';
        document.getElementById("profile-number").innerHTML = '0%';
    }
    // Win rate animation
    const pourcentage = parseInt(document.getElementById('profile-number').textContent.replace('%', ''));
    const strokeDashoffset = 246 - (246 * pourcentage / 100);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `@keyframes animWin { 100% { stroke-dashoffset: ${strokeDashoffset}; }}`;
    document.head.appendChild(styleElement);
    document.querySelector('circle').style.animation = 'animWin 2s linear forwards';

    // Loss rate animation
    const pourcentage2 = parseInt(document.getElementById('profile-lose').textContent.replace('%', ''));
    const strokeDashoffset2 = 246 - (246 * pourcentage2 / 100);
    const styleElement2 = document.createElement('style');
    styleElement2.innerHTML = `@keyframes animLose { 100% { stroke-dashoffset: ${strokeDashoffset2}; }}`;
    document.head.appendChild(styleElement2);
    document.getElementById('profile-LossRate').style.animation = 'animLose 2s linear forwards';

    const Levels = [
        { level: 0, min: 0, max: 7 },
        { level: 1, min: 8, max: 21 },
        { level: 2, min: 22, max: 42 },
        { level: 3, min: 43, max: 63 }, 
        { level: 4, min: 64, max: 90 },
        { level: 5, min: 91, max: 110 },
        { level: 6, min: 111, max: 130 },
        { level: 7, min: 131, max: 150 },
    ];
    
    function updateProgress(currentPoints) {
        let currentLevel = 0;
        
        for (let i = 0; i < Levels.length; i++) {
            if (currentPoints >= Levels[i].min && currentPoints <= Levels[i].max) {
                currentLevel = Levels[i].level;
                break;
            }
        }
    
        let percentage = (currentPoints / 150) * 100; 
        const progressBar = document.getElementById('profile-level-progress');
        
        progressBar.style.width = percentage + '%';
    
        console.log(`Current Level: ${currentLevel}`);
        document.getElementById("current-level").innerHTML = currentLevel;
    }
    updateProgress(25);
    
}