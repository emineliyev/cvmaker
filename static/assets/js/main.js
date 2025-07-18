// Пример обновления шагов
function updateWizard(currentStep) {
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentStep - 1) step.classList.add('completed');
        if (index === currentStep - 1) step.classList.add('active');
    });

    // Обновляем прогресс-бар (33%, 66%, 100%)
    const progress = ((currentStep - 1) / (document.querySelectorAll('.wizard-step').length - 1)) * 100;
    document.querySelector('.wizard-progress-bar').style.width = `${progress}%`;
}

// Использование: updateWizard(2); для перехода на 2й шаг

function changeImage(imgId, newSrc) {
    const img = document.getElementById(imgId);
    if (img) {
        img.src = newSrc;
    }
}