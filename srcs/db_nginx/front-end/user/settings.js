import { getJWT, NewPage, getCsrfToken, routing } from "https://localhost/home/utils.js"

let userdata = null;
const fields = ['username', 'first_name', 'last_name', 'email'];

window.removeEventListener('popstate', routing);
window.addEventListener('popstate', routing);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const csrf_token = await getCsrfToken();
        fetch("https://localhost:8000/api/settings/", {
            headers: {
                Authorization: `Bearer ${await getJWT()}`
            }
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                userdata = data.current;
                document.getElementById("profile-image1").src = data.current.profile_image;
                document.getElementById("username").value = data.current.username;
                document.getElementById("first_name").value = data.current.first_name;
                document.getElementById("last_name").value = data.current.last_name;
                document.getElementById("email").value = data.current.email;
            }).catch(errror => console.log("catch_settings", errror));
            
        document.getElementById("pen").addEventListener("click", () => {
            console.log("pass by pen");
            profileInfo.style.display = "none";
            securityInfo.style.display = "none";
            document.getElementById("firstShow").style.display = "none";
            document.getElementById("second").style.height = "600px";
            document.getElementById("crop-image-container").style.display = "flex";
        });
        let imgElement;
        let cropBox;
        let boxRect;
        let canvas = null;
        const imageWrapper = document.getElementById("image-wrapper");
        const imageInput = document.getElementById('upload');
        console.log("find upload id");
        imageInput.addEventListener("change", (event) => {
            console.log("the event change is triggered");
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                imageWrapper.innerHTML = ``;
                imgElement = new Image();
                imgElement.src = e.target.result;
                imgElement.classList.add('img-to-corp');
                imageWrapper.appendChild(imgElement);
                createCropBox();
            };
            reader.readAsDataURL(file);

            function createCropBox() {
                cropBox = document.createElement('div');
                cropBox.classList.add('cropBox');
                console.log("img.offsetleft", imgElement.offsetLeft);
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
            document.getElementById("profile-image1").src = canvas.toDataURL();
            document.getElementById("profile-image").src = canvas.toDataURL();
            document.getElementById("crop-image-container").style.display = "none";
            document.getElementById("SaveImg").style.display = "flex";
            document.getElementById("SaveImg").style.flexDirection = "column";
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
            const formData = new FormData();
            let edited = false;
            let editedData = {};
            try {
                fields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element.value.trim() == '') {
                        alert("field" + field + " should not be empty");
                        throw "empty field";
                    }
                    if (element.value != userdata[field])
                        edited = true;
                    editedData[field] = element.value;
                });
                if (edited) {
                    const response = await fetch('https://localhost:8000/api/update/', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${await getJWT()}`,
                            // 'X-CRFToken': await getCsrfToken(),
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(editedData)
                    })
                    if (response.ok) 
                    {
                        console.log(response);
                        document.getElementById("name").innerHTML = editedData['username'];
                        document.getElementById("username").value = editedData['username'];
                        document.getElementById("first_name").value = editedData['first_name'];
                        document.getElementById("last_name").value = editedData['last_name'];
                        document.getElementById("email").value = editedData['email'];
                    }
                    else
                        console.log("Failed to update ", response.statusText);
                }
            }
            catch (error) {
                console.log("failed to update data in catch : ", error);
            }
        });
        document.getElementById("savapassword").addEventListener("click", async () => {
            let actuallpass = document.getElementById("password1").value;
            let newpass = document.getElementById("password2").value;
            if (actuallpass.trim() == '' || newpass.trim() == '') {
                alert("Password should be a number and letter ");
                throw "empty field";
            }
            if (actuallpass == newpass) {
                alert("type a new password this is the same actual password");
                throw "password not change";
            }

            // if (newpass.length() < 8) {
            //     alert("the password should be on minimum 8 characters");
            //     throw "password too short";
            // }
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
                        alert("password updated successfuly");
                    else
                        alert("Actuall password was not correct ");
                })
                .catch((error) => {
                    console.log("error on change password is ", error);
                })
        });

        // try {
        //     if (canvas) {
        //         const blobimage = dataURLToBlob(canvas.toDataURL('image/webp'));
        //         formData.append('image', blobimage, 'cropped-image.webp');
        //     }
        //     fields.forEach(field => {
        //         const element = document.getElementById(field);
        //         if (element.value.trim() == '') {
        //             alert("field " + field + " should not be empy");
        //             throw "empty field";
        //         }
        //         if (element.value != userdata[field])
        //             edited = true;
        //         editedData[field] = element.value;
        //     });
        //     if (edited)
        //         formData.append('data', JSON.stringify(editedData));
        //     if (!formData.entries().next().done) {
        //         fetch('https://localhost:8000/api/upload-profile/', {
        //             method: 'POST',
        //             headers: {
        //                 Authorization: `Bearer ${await getJWT()}`,
        //                 'X-CSRFToken': await getCsrfToken(),
        //             },
        //             body: formData,
        //         })
        //             .then(response => {
        //                 console.log("status_code", response.status);
        //                 if (response.status == 200){
        //                     document.getElementById("name").innerHTML = editedData['username'];
        //                     document.getElementById("profile-image").src = canvas.toDataURL();
        //                     document.getElementById("profile-image1").src =canvas.toDataURL();
        //                     document.getElementById("profile-image2").src =canvas.toDataURL();
        //                     document.getElementById("username").value = editedData['username'];
        //                     document.getElementById("first_name").value = editedData['first_name'];
        //                     document.getElementById("last_name").value = editedData['last_name'];
        //                     document.getElementById("email").value = editedData['email'];
        //                 }
        //             }).catch(error => console.error('Error:', error));
        //     }
        // } catch (error) {
        //     console.error(error);
        // }

        document.getElementById("saveid").addEventListener("click", async () => {

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
                                document.getElementById("profile-image").src = canvas.toDataURL();
                                console.log("change bam bam");
                                document.getElementById("SaveImg").style.display = "none";
                            }

                        }).catch(error => console.error('Error:', error));
                }
            }
            catch {
                console.log("error uplod pic");
            }

        });

        function initializeCheckbox() {
            const is2faEnabled = localStorage.getItem('is2faEnabled') === 'true';
            const checkbox = document.getElementById("enable2fa");
            checkbox.checked = is2faEnabled;
        }
        initializeCheckbox()
        document.getElementById("enable2fa").addEventListener("change", async (event) => {
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
                    localStorage.setItem('is2faEnabled', is_2Fa_enabled);
                    alert(`Two Factor Authentication is ${is_2Fa_enabled ? 'enabled' : 'disabled'}`);
                } else {
                    checkbox.checked = !is_2Fa_enabled;
                    alert("Failed to update Two Factor state");
                }
            } catch (error) {
                console.error("Enable 2FA error:", error);
                checkbox.checked = !is_2Fa_enabled;
            } finally {
                checkbox.disabled = false;
            }
        });


    }
    catch (error) {
        console.log("trtrtrtrtrtr", error);
    }
}, { once: true });
// EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
// EMAIL_HOST = 'api.reducte.tech'  
// EMAIL_PORT = 587 
// EMAIL_USE_TLS = True
// EMAIL_HOST_USER = 'mail@api.reducte.tech' 
// EMAIL_HOST_PASSWORD = 'IUGIULJ43'  # your email password
// DEFAULT_FROM_EMAIL = EMAIL_HOST_USER