import { getCsrfToken } from "./utils.js";


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
<<<<<<< HEAD
            body:JSON.stringify({username: 'clear', password:"hello"}),
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log("can't submit data error:", error, "|");
        });
    // }
// });
=======
            body: formData,
        })
    }
});
>>>>>>> 8b80d4e82052db74e712217454aee9059cf4a0e6
