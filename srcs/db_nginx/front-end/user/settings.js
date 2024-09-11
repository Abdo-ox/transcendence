import { getJWT, NewPage , getCsrfToken} from "https://localhost/home/utils.js"

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const access = await getJWT();
        const csrf_token = await getCsrfToken();
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
                document.getElementById("name").innerHTML = data.current.username;
                document.getElementById("profile-image").src = data.current.profile_image;
                document.getElementById("profile-image1").src = data.current.profile_image;
                document.getElementById("profile-image2").src = data.current.profile_image;
                document.getElementById("username").value = data.current.username;
                document.getElementById("first-name").value = data.current.first_name;
                document.getElementById("second-name").value = data.current.last_name;
                document.getElementById("email").value = data.current.email;

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
        document.getElementById("chat-btn").addEventListener("click", () => {
            NewPage("/chat", true);
        })
        document.getElementById("home-btn").addEventListener("click", () => {
            NewPage("/home", true);
        })
        document.getElementById("name").addEventListener("click", () => {
            NewPage("/profile", true);
        })
        document.getElementById("Game-btn").addEventListener("click", () => {
            NewPage("/profile", true);
        })

        document.getElementById("save-btn").addEventListener("click", () => {

            console.log("hello from save ")
            const imageInput = document.getElementById('upload');
            const formData = new FormData();
            formData.append('image', imageInput.files[0]);  // File field

            // Send the form data using fetch
            fetch('https://localhost:8000/api/upload-profile/', {
                method: 'POST',
                headers: {
                    Authorization : `Bearer ${access}`,
                    'X-CSRFToken': csrf_token,
                },
                body: formData,
            })
            .then(response => {
                console.log("status_code", response.status);
                response.json();})
            .then(result => console.log(result))
            .catch(error => console.error('Error:', error));
        });
    }
    catch (error) {
        console.log("trtrtrtrtrtr", error);
    }


}, { once: true });
