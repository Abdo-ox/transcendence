import { getJWT, NewPage } from "https://localhost/home/utils.js"

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const access = await getJWT();
        document.getElementById("home-btn").addEventListener('click', () => {
            NewPage("/home", true);
        });
        fetch("https://localhost:8000/api/settings/", {
            headers: {
                Authorization: `Bearer ${access}`
            }
        })
            .then((response) => {
                console.error("status code response:", response.status);
                return response.json();
            })
            .then((data) => {
                // document.getElementById("name")
            }).catch(errror => console.log("catch_settings", errror));
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
    }
    catch (error) {
        console.log("trtrtrtrtrtr", error);
    }


}, { once: true });
