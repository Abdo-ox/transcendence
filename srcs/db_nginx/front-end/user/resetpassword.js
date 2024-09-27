import { getCsrfToken, NewPage, submitForm, getJWT } from "https://localhost/home/utils.js";

document.getElementById("submit").addEventListener("click", async () => {

   let email= document.getElementById("inputemail").value;
    fetch('https:://localhost:8000/resetpassword/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': await getCsrfToken(),
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({'email' : email})
    })
    .then(response => response.json())
    .then((data)=>{
        console.log("data : ",data);
    })
    .catch((error)=>{
        console.log(error);
    })
});