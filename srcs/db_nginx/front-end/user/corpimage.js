document.addEventListener('DOMContentLoaded', () => {
    const inputImage = document.getElementById("input-image");
    const contaImage = document.getElementById("container");

    inputImage.addEventListener('change', (event) => {
        console.log("the event change is triggered");
        const file = event.target.files[0];
        const imageReader = new FileReader();

        imageReader.onload = (param) => {
            const tocorpimage = new Image();
            tocorpimage.src = param.target.result;
            tocorpimage.style.with = "100%";
            contaImage.appendChild(tocorpimage);
        };
        imageReader.readAsDataURL(file);
    });
});