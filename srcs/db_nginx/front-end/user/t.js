import { getCsrfToken } from "https://localhost/home/utils.js";


let t = await  getCsrfToken();
console.log(t);


document.getElementById("img-btn").addEventListener('click', () => {
    console.log("clicked");
    const fileInput = document.getElementById('img-fld');
    const file = fileInput.files[0];

    if (file) {
        console.log("happend here");
        const formData = new FormData();
        console.log("formdata:", formData);
        formData.append('file', file);
        fetch('https://localhost:8000/upload/', {
            method: 'POST', 
            headers: {
                'X-CSRFToken': t 
            },
            body: formData,
        })
    }
});