import { getCsrfToken } from "./utils.js";



let t = await  getCsrfToken();
console.log("|", t, "|");

// document.getElementById("img-btn").addEventListener('click', async () => {
//     console.log("clicked");
//     const fileInput = document.getElementById('img-fld');
    // const file = fileInput.files[0]; // Grab the selected file
    
    // if (file) {
    //     console.log("happend here");
    //     // Create FormData to send the file
    //     const formData = new FormData();
    //     formData.append('file', file); // Append the file to the form data
        
        // Send the file using fetch API
        const url = "https://localhost:8000/api/hello/";
        fetch(url, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': t
            },
            body:JSON.stringify({username: 'clear', password:"hello"}),
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log("can't submit data error:", error, "|");
        });
    // }
// });
