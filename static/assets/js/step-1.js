document.addEventListener('DOMContentLoaded', function () {
    let cropper;
    const modalImage = document.getElementById('modalImage');
    const modalUploadImage = document.getElementById('modalUploadImage');
    const saveCroppedBtn = document.getElementById('saveCropped');
    const croppedImageInput = document.getElementById('croppedImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const photoModal = document.getElementById('photoModal');

    const iconPreview = document.getElementById('iconPreview');
    const imageActions = document.getElementById('imageActions');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    const openPhotoModal = document.getElementById('openPhotoModal');

    // When user selects file in modal
    modalUploadImage.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
            modalImage.src = reader.result;
            modalImage.style.display = 'block';

            // Destroy previous cropper if exists
            if (cropper) cropper.destroy();

            cropper = new Cropper(modalImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                movable: true,
                zoomable: true,
                rotatable: true,
                scalable: true,
            });

            saveCroppedBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    });

    // On Save button click, get cropped image and put it to main form preview and hidden input
    saveCroppedBtn.addEventListener('click', function () {
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingQuality: 'high',
        });

        const base64data = canvas.toDataURL('image/jpeg');

        // Set preview image on main form
        imagePreview.src = base64data;
        imagePreview.style.display = 'inline-block';

        // Set hidden input value to send to server
        croppedImageInput.value = base64data;
        localStorage.setItem('step1_cropped_image', base64data);


        // Close modal
        const modal = bootstrap.Modal.getInstance(photoModal);
        modal.hide();

        // Reset file input in modal for next upload
        modalUploadImage.value = '';
        cropper.destroy();
        cropper = null;
        modalImage.style.display = 'none';
        saveCroppedBtn.disabled = true;
    });

    // Optional: clear modal state on modal close
    photoModal.addEventListener('hidden.bs.modal', function () {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        modalImage.style.display = 'none';
        saveCroppedBtn.disabled = true;
        modalUploadImage.value = '';
    });

    // После обрезки изображения:
    saveCroppedBtn.addEventListener('click', function () {
        // ... твой код
        iconPreview.style.display = 'none';  // Скрыть иконку
        imageActions.style.display = 'flex'; // Показать действия
    });

// При клике на "Изменить"
    changePhotoBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // Чтобы не срабатывал повторный modal-open от button
        const modal = new bootstrap.Modal(photoModal);
        modal.show();
    });

// При клике на "Удалить"
    removePhotoBtn.addEventListener('click', function () {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        croppedImageInput.value = '';
        iconPreview.style.display = 'inline-block';
        imageActions.style.display = 'none';
    });
});

document.addEventListener('input', function (e) {
    if (e.target.name && e.target.type !== 'file') {
        localStorage.setItem('step1_' + e.target.name, e.target.value);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const fields = document.querySelectorAll('input');
    fields.forEach(field => {
        if (field.type !== 'file') {
            const val = localStorage.getItem('step1_' + field.name);
            if (val !== null) field.value = val;
        }
    });
    const savedImage = localStorage.getItem('step1_cropped_image');
    if (savedImage) {
        const imagePreview = document.getElementById('imagePreview');
        const croppedImageInput = document.getElementById('croppedImageInput');
        const iconPreview = document.getElementById('iconPreview');
        const imageActions = document.getElementById('imageActions');

        imagePreview.src = savedImage;
        imagePreview.style.display = 'inline-block';
        croppedImageInput.value = savedImage;
        if (iconPreview) iconPreview.style.display = 'none';
        if (imageActions) imageActions.style.display = 'flex';
    }

});
