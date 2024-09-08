import { getCsrfToken } from "./utils.js";




document.getElementById("img-btn").addEventListener('click', async () => {
    console.log("clicked");
    let t = await  getCsrfToken();
    const fileInput = document.getElementById('img-fld');
    const file = fileInput.files[0]; // Grab the selected file
    
    if (file) {
        console.log("happend here");
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file); // Append the file to the form data
        
        console.log("|", "t.trim()", "|");
        // Send the file using fetch API
        fetch('https://localhost:8000/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': t
            },
            body: formData,
            credentials: 'same-origin',
        }).then(response => console.log(response));
    }
});