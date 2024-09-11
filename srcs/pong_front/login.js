document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form");
    const formTitle = document.getElementById("formTitle");
    const toggle = document.getElementById("toggle");
    let isLogin = true;

    toggle.addEventListener("click", () => {
        isLogin = !isLogin;
        formTitle.textContent = isLogin ? "Login" : "Signup";
        toggle.textContent = isLogin ? "Don't have an account? Signup" : "Already have an account? Login";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (isLogin) {
            await loginUser(username, password);
        } else {
            await signupUser(username, password);
        }
    });

    async function loginUser(username, password) {
        try {
            const response = await fetch('http://localhost:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password})
            })
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token)
                window.location.href = '/index.html'
            } else {
                const errorData = await response.json()
                console.error(errorData.error)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    async function signupUser(username, password) {
        try {
            const response = await fetch('http://localhost:8000/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('token', data.token)
                window.location.href = '/index.html'
            } else {
                const errorData = await response.json()
                console.error('Error:', errorData.error)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }
});
