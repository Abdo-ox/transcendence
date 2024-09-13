import { getJWT, NewPage, getCsrfToken } from "https://localhost/home/utils.js"

function showProfile() {
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('security-section').style.display = 'none';

    document.querySelector('.profi').classListshowProfile.add('active');
    document.querySelector('.secure').classList.remove('active');
}

function showSecurity() {
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('security-section').style.display = 'block';

    document.querySelector('.secure').classList.add('active');
    document.querySelector('.profi').classList.remove('active');
}

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

        document.getElementById("chat-btn").addEventListener("click", () => {
            NewPage("/chat", true);
        });
        document.getElementById("home-btn").addEventListener("click", () => {
            NewPage("/home", true);
        });
        document.getElementById("name").addEventListener("click", () => {
            NewPage("/profile", true);
        });
        document.getElementById("Game-btn").addEventListener("click", () => {
            NewPage("/profile", true);
        });
        document.getElementById("pen").addEventListener("click", () => {
            document.getElementById("crop-image-container").style.display = "flex";
        });
        let imgElement;
        let cropBox;
        let boxRect;
        let canvas = null;
        const imageWrapper = document.getElementById("image-wrapper");
        let imageRect = imageWrapper.getBoundingClientRect();
        const imageInput = document.getElementById('upload');
        imageInput.addEventListener("change", (event) => {
            console.log("the event change is triggered");
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                imageWrapper.innerHTML = ``;
                imgElement = new Image();
                imgElement.src = e.target.result;
                imgElement.style.width = `100%`;
                imgElement.style.bottom = '50px'
                imageWrapper.appendChild(imgElement);
                createCropBox();
            };
            reader.readAsDataURL(file);

            function createCropBox() {
                cropBox = document.createElement('div');
                cropBox.classList.add('cropBox');
                imageWrapper.appendChild(cropBox);
                boxRect = document.querySelector('.cropBox').getBoundingClientRect();
                makeDraggable(cropBox);
            };

            function makeDraggable(element) {
                let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
                element.onmousedown = (event1) => {
                    event1
                    console.log("the onmousedown event triggered");
                    event1.preventDefault();
                    p3 = event1.clientX;
                    p4 = event1.clientY;
                    document.onmousemove = (even) => {
                        console.log("the onmousemove triggered", boxRect.width);
                        even.preventDefault();
                        p1 = p3 - even.clientX;
                        p2 = p4 - even.clientY;
                        p3 = even.clientX;
                        p4 = even.clientY;
                        let left = element.offsetLeft - p1;
                        let top = element.offsetTop - p2;
                        // left = left < 0 ? 0: left;
                        // top = top < 0 ? 0: top;

                        // left = (left + boxRect.width > imageRect.width) ? imageRect.width- boxRect.width: left;
                        // top = (top + boxRect.height > imageRect.height ) ? imageRect.height- boxRect.height: top;
                        console.log("left:", left);
                        console.log("top:", top);
                        element.style.top = top + "px";
                        element.style.left = left + "px";
                    }
                    document.onmouseup = () => {
                        console.log("the onmouseup triggered");
                        document.onmouseup = null;
                        document.onmousemove = null;
                    }
                }
            }
        });

        document.getElementById('crop-btn').addEventListener('click', () => {
            canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const timageRect = imgElement.getBoundingClientRect();
            const cropRect = cropBox.getBoundingClientRect();

            const scaleX = imgElement.naturalWidth / timageRect.width;
            const scaleY = imgElement.naturalHeight / timageRect.height;
            console.log("cropRect width:", cropRect.width);
            console.log("cropRect height:", cropRect.height);
            const width = cropRect.width * scaleX;
            const height = cropRect.height * scaleY;
            const X = (cropRect.left - timageRect.left) * scaleX;
            const Y = (cropRect.top - timageRect.top) * scaleY;
            console.log("X:", X);
            console.log("Y:", Y);
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(imgElement, X, Y, width, height, 0, 0, width, height);
            document.getElementById("profile-image2").src = canvas.toDataURL();
            document.getElementById("crop-image-container").style.display = "none";
        });

        function dataURLToBlob(dataURL) {
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }
            return new Blob([arrayBuffer], { type: mimeString });
        }

        document.getElementById("save-btn").addEventListener("click", async () => {
            if (canvas) {
                const formData = new FormData();
                const blobimage =  dataURLToBlob(canvas.toDataURL('image/webp'));
                formData.append('image', blobimage, 'cropped-image.webp');

                // Send the form data using fetch
                fetch('https://localhost:8000/api/upload-profile/', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${await getJWT()}`,
                        'X-CSRFToken': await getCsrfToken(),
                    },
                    body: formData,
                })
                .then(response => {
                    console.log("status_code", response.status);
                    response.json();
                })
                .then(result => console.log(result))
                .catch(error => console.error('Error:', error));
            }
        });
    }
    catch (error) {
        console.log("trtrtrtrtrtr", error);
    }


}, { once: true });
