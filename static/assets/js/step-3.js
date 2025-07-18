document.addEventListener("DOMContentLoaded", function () {
    const previewModal = new bootstrap.Modal('#previewModal');
    const templatePreviewFrame = document.getElementById('templatePreviewFrame');
    const downloadBtn = document.getElementById('downloadBtn');
    const selectTemplateBtn = document.getElementById('selectTemplateBtn');
    let selectedTemplate = null;
    let selectedColor = '#4e54c8';

    // Обработка клика по карточке шаблона
    document.querySelectorAll('.template-card-container').forEach(card => {
        card.addEventListener('click', function () {
            // Выделяем шаблон
            document.querySelectorAll('.template-card-container').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Получаем данные шаблона
            selectedTemplate = this.dataset.template;
            selectedColor = this.dataset.color || this.dataset.defaultColor || '#4e54c8';
            const availableColors = (this.dataset.availableColors || '').split(',').filter(c => c);

            // Рендерим цветовые кнопки
            renderColorOptions(availableColors, selectedColor);

            // Обновляем iframe
            templatePreviewFrame.src = this.dataset.previewUrl + '?color=' + encodeURIComponent(selectedColor) + '&scale=0.7';

            previewModal.show();
            downloadBtn.disabled = false;
        });

        // Мини-кнопки смены цвета (в списке)
        card.querySelectorAll('.color-option-mini').forEach(option => {
            option.addEventListener('click', function (e) {
                e.stopPropagation();
                selectedColor = this.dataset.color;
                const iframe = card.querySelector('iframe');
                iframe.src = card.dataset.previewUrl + '?color=' + encodeURIComponent(selectedColor) + '&scale=0.3333';
                card.dataset.color = selectedColor;
            });
        });
    });

    // Выбор цвета внутри модалки
    function renderColorOptions(colors, selectedColor) {
        const container = document.querySelector(".color-options");
        container.innerHTML = "";

        colors.forEach(color => {
            const div = document.createElement("div");
            div.classList.add("color-option");
            div.style.backgroundColor = color;
            div.dataset.color = color;
            if (color === selectedColor) {
                div.classList.add("selected");
            }
            // Навешиваем обработчик сразу после создания
            div.addEventListener('click', function () {
                container.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.dataset.color;

                // Обновить preview iframe в модалке
                templatePreviewFrame.src = templatePreviewFrame.src.split('?')[0] + '?color=' + encodeURIComponent(selectedColor) + '&scale=0.7';

                // Обновляем карточку выбранного шаблона
                const card = document.querySelector(`.template-card-container[data-template="${selectedTemplate}"]`);
                if (card) {
                    // Обновляем data-color
                    card.dataset.color = selectedColor;

                    // Обновляем мини-превью цвета
                    const previewBox = card.querySelector('.color-preview');
                    if (previewBox) {
                        previewBox.style.backgroundColor = selectedColor;
                    }

                    // Обновляем iframe превью на карточке
                    const miniFrame = card.querySelector('iframe');
                    if (miniFrame) {
                        miniFrame.src = card.dataset.previewUrl + '?color=' + encodeURIComponent(selectedColor) + '&scale=0.3333';
                    }
                }
            });

            container.appendChild(div);
        });
    }


    // Кнопка "Выбрать шаблон"
    selectTemplateBtn.addEventListener('click', function () {
        previewModal.hide();
        downloadBtn.disabled = false; // <-- лучше сюда
    });


    downloadBtn.addEventListener('click', function () {
        if (selectedTemplate) {
            const card = document.querySelector(`.template-card-container[data-template="${selectedTemplate}"]`);
            const colorFromCard = card?.dataset?.color || '#e0aa28';

            fetch(`/create/step-3/?template=${encodeURIComponent(selectedTemplate)}&color=${encodeURIComponent(colorFromCard)}`)
                .then(() => {
                    window.location.href = '/checkout/';
                });
        }
    });


    // Убираем скролл из iframe
    document.querySelectorAll('iframe').forEach(iframe => {
        iframe.setAttribute('scrolling', 'no');
        iframe.style.overflow = 'hidden';
    });
});