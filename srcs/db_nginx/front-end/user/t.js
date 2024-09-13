// Handle image upload and display
const imageUpload = document.getElementById('imageUpload');
const imageWrapper = document.getElementById('imageWrapper');
let imgElement;
let cropBox;

imageUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        imageWrapper.innerHTML = '';  // Clear any previous images
        imgElement = new Image();
        imgElement.src = e.target.result;
        imgElement.style.width = '100%';
        imageWrapper.appendChild(imgElement);

        createCropBox(); // Create crop box when image is loaded
    };

    reader.readAsDataURL(file);
});

// Create a cropping box that users can drag
function createCropBox() {
    cropBox = document.createElement('div');
    cropBox.classList.add('crop-box');
    cropBox.style.width = '100px';
    cropBox.style.height = '100px';
    cropBox.style.top = '50px';
    cropBox.style.left = '50px';

    imageWrapper.appendChild(cropBox);

    makeDraggable(cropBox); // Make crop box draggable
}

// Make crop box draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Handle image cropping
document.getElementById('cropButton').addEventListener('click', function () {
    if (!imgElement || !cropBox) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imageRect = imgElement.getBoundingClientRect();
    const cropRect = cropBox.getBoundingClientRect();

    const scaleX = imgElement.naturalWidth / imageRect.width;
    const scaleY = imgElement.naturalHeight / imageRect.height;

    const cropWidth = cropRect.width * scaleX;
    const cropHeight = cropRect.height * scaleY;
    const cropX = (cropRect.left - imageRect.left) * scaleX;
    const cropY = (cropRect.top - imageRect.top) * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(imgElement, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const croppedImage = new Image();
    croppedImage.src = canvas.toDataURL();
    
    croppedImage.classList.add('img-fluid');

    const croppedResult = document.getElementById('croppedResult');
    croppedResult.innerHTML = '';
    croppedResult.appendChild(croppedImage);
});
