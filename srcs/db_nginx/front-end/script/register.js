import { getCsrfToken, NewPage, submitForm, printErrorInScreen} from "/utils.js";
import { Login } from "/login.js"
import {faker } from "https://cdn.skypack.dev/@faker-js/faker" //to remove
import { is_authenticated } from "./utils.js";

const handle_data = (data_status) => {
    const data = data_status.data;
    const status = data_status.status;
    console.log("daata registred is ", data);
    if (data.state === 'registered')
        NewPage('/login',Login, false);
    else 
        printErrorInScreen(data.errors);
}

export async function Register() {
    if (await is_authenticated())
        return;
    console.log("register.js called");
    const csrf_token = await getCsrfToken();
    const ids = ['register-first_name', 'register-last_name', 'register-username', 'register-email', 'register-password1', 'register-password2'];
    let first = faker.name.firstName();
    let last = faker.name.lastName();
    document.getElementById('register-first_name').value = first;                     //to remove 
    document.getElementById('register-last_name').value = last;                       //to remove 
    document.getElementById('register-username').value = faker.internet.userName(first, last);//to remove 
    document.getElementById('register-email').value = faker.internet.email(first, last);      //to remove 
    const pass = faker.internet.password();                                                  //to remove 
    document.getElementById('register-password1').value = pass;                                       //to remove 
    document.getElementById('register-password2').value = pass;                                       //to remove 

    document.getElementById('register-submit-btn').addEventListener('click', (event) => {
        event.preventDefault();
        submitForm('https://localhost:8000/api/register/', ids, csrf_token, handle_data);
    });
}




















// /****** register form ** */
// const password = document.getElementById("register-password");
// const confirmPassword = document.getElementById("register-confirm_password");

// confirmPassword.addEventListener("input", () => {
//   if (password.value !== confirmPassword.value) {
//     confirmPassword.setCustomValidity("Passwords does not  match.");
//   } else {
//     confirmPassword.setCustomValidity("");
//   }
// })
