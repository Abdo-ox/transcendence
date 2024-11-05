import { getJWT, getCsrfToken, NewPage } from "https://localhost/utils.js"
import { ConfirmationMail } from "https://localhost/confirmationMail.js"
import { printNoteFor3Seconds } from "https://localhost/utils.js"
export async function Settings() {

    let userdata = null;
    const fields = ['username', 'first_name', 'last_name'];
    const csrf_token = await getCsrfToken();
    fetch("https://localhost:8000/api/settings/", {
        headers: {
            Authorization: `Bearer ${await getJWT()}`
        }
    })
        .then(response => {
            return response.json()
        })
        .then((data) => {
            userdata = data;
            console.log("data : ", data)
            console.log("data.current.username", data.username)
            // document.getElementById("settings-name").innerHTML = data.username;
            // document.getElementById("settings-profile-image").src = data.profile_image;
            document.getElementById("settings-profile-image1").src = data.profile_image;
            document.getElementById("setting-nameID").textContent = data.username;
            document.getElementById("settings-username").value = data.username;
            document.getElementById("settings-first_name").value = data.first_name;
            document.getElementById("settings-last_name").value = data.last_name;
            document.getElementById("settings-email").value = data.email;
            document.getElementById('settings-enable2fa').checked = data.enable2fa;
            if (data.intraNet) {
                document.getElementById("settings-username").readOnly = true;
                document.getElementById("settings-last_name").readOnly = true;
                document.getElementById("sett-change-email").style.display = "none";
                document.getElementById("email-label-sett").style.display = "none";
                document.getElementById("settings-change-btn").style.display = "none";
                document.getElementById("settings-para").style.display = "block";
                document.getElementById("settings-passText").style.display = "block";
                document.getElementById("settings-changePassword").style.display = "none";
            }
        })
        .catch(errror => console.log("catch_settings", errror));

    const profileBtn = document.getElementById("settings-profile-btn");
    const securityBtn = document.getElementById("settings-security-btn");
    const profileInfo = document.getElementById("settings-profile-info");
    const securityInfo = document.getElementById("settings-security-info");
    const firsShow = document.getElementById("settings-firstShow");
    profileBtn.addEventListener("click", function () {
        document.getElementById("settings-SaveImg").style.display = 'none';
        profileInfo.style.display = "block";
        securityInfo.style.display = "none";
        document.getElementById("settings-crop-image-container").style.display = "none";
        firsShow.style.display = "none";
        profileBtn.classList.add("settings-active-class");
        securityBtn.classList.remove("settings-active-class");
    });

    securityBtn.addEventListener("click", function () {
        document.getElementById("settings-SaveImg").style.display = 'none';
        securityInfo.style.display = "block";
        profileInfo.style.display = "none";
        document.getElementById("settings-crop-image-container").style.display = "none";
        firsShow.style.display = "none";
        securityBtn.classList.add("settings-active-class");
        profileBtn.classList.remove("settings-active-class");
    });
    document.getElementById("settings-pen").addEventListener("click", () => {
        console.log("pass by pen");
        profileInfo.style.display = "none";
        securityInfo.style.display = "none";
        document.getElementById("settings-firstShow").style.display = "none";
        document.getElementById("settings-second").style.height = "600px";
        document.getElementById("settings-crop-image-container").style.display = "flex";
    });
    let imgElement;
    let cropBox;
    let boxRect;
    let canvas = null;
    const imageWrapper = document.getElementById("settings-image-wrapper");
    const imageInput = document.getElementById('settings-upload');
    console.log("find upload id");
    imageInput.addEventListener("change", (event) => {
        console.log("the event change is triggered");
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            imageWrapper.innerHTML = ``;
            imgElement = new Image();
            imgElement.src = e.target.result;
            imgElement.classList.add('settings-img-to-crop');
            imageWrapper.appendChild(imgElement);
            createCropBox();
        };
        reader.readAsDataURL(file);

        function createCropBox() {
            cropBox = document.createElement('div');
            cropBox.classList.add('settings-cropBox');
            console.log("img.offsetleft", imgElement.offsetLeft);
            imageWrapper.appendChild(cropBox);
            boxRect = document.querySelector('.settings-cropBox').getBoundingClientRect();
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
                    const imageRect = imgElement.getBoundingClientRect();
                    even.preventDefault();
                    p1 = p3 - even.clientX;
                    p2 = p4 - even.clientY;
                    p3 = even.clientX;
                    p4 = even.clientY;
                    let left = element.offsetLeft - p1;
                    let top = element.offsetTop - p2;
                    left = (left + boxRect.width > imageRect.width) ? imageRect.width - boxRect.width : left;
                    top = (top + boxRect.height > imageRect.height) ? imageRect.height - boxRect.height : top;
                    left = (left < 0) ? 0 : left;
                    top = (top < 0) ? 0 : top;
                    element.style.top = top + "px";
                    element.style.left = left + "px";
                }
                document.onmouseup = () => {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            }
        }
    });

    document.getElementById('settings-crop-btn').addEventListener('click', () => {
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
        document.getElementById("settings-profile-image1").src = canvas.toDataURL();
        document.getElementById("header-profile-image").src = canvas.toDataURL();
        document.getElementById("settings-crop-image-container").style.display = "none";
        document.getElementById("settings-SaveImg").style.display = "flex";
        document.getElementById("settings-SaveImg").style.flexDirection = "column";
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

    document.getElementById("settings-save-btn").addEventListener("click", async () => {
        let edited = false;
        let editedData = {};
        try {
            fields.forEach(field => {
                console.log(" feild 2 : ", field);
                const element = document.getElementById("settings-" + field);
                if ((element.value).trim() == '') {
                    printNoteFor3Seconds("field" + field + " should not be empty");
                    throw "empty field";
                }
                if (element.value != userdata[field])
                
                    edited = true;
                editedData[field] = element.value;

                  

            });
            if (edited) {
                console.log("edited Data : ", editedData);
                const response = await fetch('https://localhost:8000/api/update/', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${await getJWT()}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(editedData)
                })
                if (!response.ok) {
                    console.error('Failed to fetch update data:', response.status, response.statusText);
                    return;
                }
                const data = await response.json();
                if (data.data == "edited") {
                    printNoteFor3Seconds("Data edited succussefely");
                    document.getElementById("settings-name").innerHTML = editedData['username'];
                    document.getElementById("settings-username").value = editedData['username'];
                    document.getElementById("settings-first_name").value = editedData['first_name'];
                    document.getElementById("settings-last_name").value = editedData['last_name'];
                }
                else {
                    document.getElementById("resetmail-user-errorMessage").textContent = "username is already in use ";
                    console.log("Failed to update ", response.statusText);
                }
            }
        }
        catch (error) {
            console.log("failed to update data in catch : ", error);
        }
    });
    document.getElementById("settings-savapassword").addEventListener("click", async () => {
        let actuallpass = document.getElementById("settings-password1").value;
        let newpass = document.getElementById("settings-password2").value;
        if (actuallpass.trim() == '' || newpass.trim() == '') {
            printNoteFor3Seconds("Password should be a number and letter ");
            throw "empty field";
        }
        if (actuallpass == newpass) {
            printNoteFor3Seconds("type a new password this is the same actual password");
            throw "password not change";
        }

        fetch('https://localhost:8000/api/ChangePassword/', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await getJWT()}`,
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ 'actualPassword': actuallpass, 'newPassword': newpass })

        })
            .then(response => response.json())
            .then(data => {
                if (data['status'] == 'success')
                    printNoteFor3Seconds("password updated successfuly");
                else
                    printNoteFor3Seconds("Actuall password was not correct ");
            })
            .catch((error) => {
                console.log("error on change password is ", error);
            })
    });

    document.getElementById("settings-saveid").addEventListener("click", async () => {

        const formData = new FormData();
        try {
            if (canvas) {
                const blobimage = dataURLToBlob(canvas.toDataURL('image/webp'));
                formData.append('image', blobimage, 'cropped-image.webp');
            }
            if (!formData.entries().next().done) {
                fetch('https://localhost:8000/api/upload-profile/', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${await getJWT()}`,
                        'X-CSRFToken': await getCsrfToken(),
                    },
                    body: formData,
                })
                    .then(response => {
                        if (response.ok) {
                            document.getElementById("settings-profile-image1").src = canvas.toDataURL();
                            document.getElementById("settings-SaveImg").style.display = "none";
                        }

                    }).catch(error => console.error('Error:', error));
            }
        }
        catch {
            console.log("error uplod pic");
        }

    });
    document.getElementById("settings-change-btn").addEventListener("click", async () => {
        let email = document.getElementById("settings-email").value;
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (gmailRegex.test(email)) {
            document.getElementById("resetmail-errorMessage").textContent = "";
            console.log("Valid Gmail address:", email);
        } else {
            document.getElementById("resetmail-errorMessage").textContent = "Please enter a valid Gmail address!";
            return;
        }
        const response = await fetch('https://localhost:8000/MailConfirmation/', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await getJWT()}`,
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ 'newemail': email })

        });

        if (!response.ok) {
            console.error('Failed to confirm user:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        console.log("*******data mail response **** is : ", data);
        if (data.status == 'redirect') {
            localStorage.setItem("NewEmail", email)
            NewPage("/confirmationMail", ConfirmationMail);
        }
        if (data.status == 'failed')
            document.getElementById("resetmail-errorMessage").textContent = "Failed to send email code check again!";
        if (data.status == 'dublicated')
            document.getElementById("resetmail-errorMessage").textContent = "Email is already in use!";

    });


    document.getElementById("settings-enable2fa").addEventListener("change", async (event) => {
        const checkbox = event.target;
        let is_2Fa_enabled = checkbox.checked;
        checkbox.disabled = true;

        try {
            const response = await fetch('https://localhost:8000/api/Enable2Fa/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${await getJWT()}`,
                    'X-CSRFToken': await getCsrfToken(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'is_2Fa_enabled': is_2Fa_enabled })
            });

            const data = await response.json();

            if (data['status'] === 'success') {
                printNoteFor3Seconds(`Two Factor Authentication is ${is_2Fa_enabled ? 'enabled' : 'disabled'}`)
            } else {
                checkbox.checked = !is_2Fa_enabled;
                printNoteFor3Seconds("Failed to update Two Factor state");
            }
        } catch (error) {
            console.error("Enable 2FA error:", error);
            checkbox.checked = !is_2Fa_enabled;
        } finally {
            checkbox.disabled = false;
        }
    });

}
