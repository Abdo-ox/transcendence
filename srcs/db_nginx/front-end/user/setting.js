function showProfile() {
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('security-section').style.display = 'none';
    
    document.querySelector('.profi').classList.add('active');
    document.querySelector('.secure').classList.remove('active');
}

function showSecurity() {
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('security-section').style.display = 'block';
    
    document.querySelector('.secure').classList.add('active');
    document.querySelector('.profi').classList.remove('active');
}
