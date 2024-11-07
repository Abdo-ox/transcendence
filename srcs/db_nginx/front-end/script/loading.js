document.addEventListener('DOMContentLoaded', () => {
    const id = setInterval( () => {
        console.log("href:", window.location.href);
        if (window.location.href.includes("code=")) {
            window.opener.postMessage({
                'code': (new URL(window.location.href)).searchParams.get('code'),
            }, "*");
            window.close();
            clearInterval(id);
        }
    },1000);
});