const prefix = 'step2_';
let counters = {
    experience: 0,
    education: 0,
    course: 0,
    reference: 0,
    skill: 0,
    portfolio: 0,
    language: 0,
    hobby: 0,
};

function removeBlock(elem) {
    const block = elem.closest('.border');
    if (!block) return;

    // Удаление localStorage
    const inputs = block.querySelectorAll('[name]');
    inputs.forEach(input => {
        localStorage.removeItem(prefix + input.name);
    });

    // Обновление счётчика
    const type = block.dataset.type;
    if (type && counters[type] > 0) {
        counters[type]--;
        updateCounterDisplay(type);
    }

    block.remove();
}


function updateCounterDisplay(type) {
    const badge = document.getElementById(`${type}-count`);
    if (badge) {
        badge.textContent = counters[type];
    }
}


function templateBlock(type, index, fieldsHtml, dataType = '') {
    return `
    <div class="border rounded p-3 mb-3" data-type="${dataType}">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>${type} #${index + 1}</strong>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeBlock(this)"><i class="fas fa-trash"></i></button>
        </div>
        ${fieldsHtml}
    </div>`;
}


function insertAndRestore(containerId, fields, prefixName) {
    document.getElementById(containerId).insertAdjacentHTML('beforeend', fields);
    document.querySelectorAll(`#${containerId} [name^="${prefixName}"]`).forEach(el => restoreFieldValue(el));
}

function restoreFieldValue(el) {
    const saved = localStorage.getItem(prefix + el.name);
    if (saved !== null) el.value = saved;
}


function addExperience() {
    const i = counters.experience++;
    const name = `experience-${i}`;
    const fields = templateBlock('Təcrübə', i, `
        <div class="row">
            <div class="col-md-4 mb-2">
                <input class="form-control" name="${name}-position" placeholder="Vəzifə">
            </div>
            <div class="col-md-4 mb-2">
                <input class="form-control" name="${name}-employer" placeholder="İşəgötürən">
            </div>
            <div class="col-md-4 mb-2">
                <input class="form-control" name="${name}-city" placeholder="Şəhər">
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-2">
                <input class="form-control" type="month" name="${name}-start_date">
            </div>
            <div class="col-md-6 mb-2">
                <input class="form-control" type="month" name="${name}-end_date" id="${name}-end_date">
                <div class="form-check mt-1">
                    <input class="form-check-input currently-working-checkbox" type="checkbox" 
                           name="${name}-currently_working" 
                           data-end="${name}-end_date" id="${name}-currently-working">
                    <label class="form-check-label" for="${name}-currently-working">
                        Hazırda işləyirəm
                    </label>
                </div>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-12">
                <textarea class="form-control" name="${name}-description" placeholder="Təsvir"></textarea>
            </div>
        </div>
    `, 'experience');
    insertAndRestore('workExperienceContainer', fields, name);
    updateCounterDisplay('experience');

    // Добавим обработчик для блокировки поля "end_date"
    const checkbox = document.querySelector(`#${name}-currently-working`);
    const endDateInput = document.getElementById(`${name}-end_date`);
    if (checkbox && endDateInput) {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                endDateInput.disabled = true;
                endDateInput.value = '';
            } else {
                endDateInput.disabled = false;
            }
        });
    }
}

function addEducation() {
    const i = counters.education++;
    const name = `education-${i}`;
    const fields = templateBlock('Təhsil', i, `
            <div class="row mb-2">
                <div class="col-md-4 mb-2">
                    <input class="form-control" name="${name}-degree" placeholder="Dərəcə">
                </div>
                <div class="col-md-4 mb-2">
                    <input class="form-control" name="${name}-school" placeholder="Məktəb / Universitet">
                </div>
                <div class="col-md-4 mb-2">
                    <input class="form-control" name="${name}-city" placeholder="Şəhər">
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-md-6 mb-2">
                    <input class="form-control" type="month" name="${name}-start_date">
                </div>
                <div class="col-md-6 mb-2">
                    <input class="form-control" type="month" name="${name}-end_date">
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-12">
                    <textarea class="form-control" name="${name}-description" placeholder="Təsvir"></textarea>
                </div>
            </div>
        `, 'education');
    insertAndRestore('educationContainer', fields, name);
    updateCounterDisplay('education');
}

function addCourse() {
    const i = counters.course++;
    const name = `course-${i}`;
    const fields = templateBlock('Kurs', i, `
            <div class="row mb-2">
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-name" placeholder="Kursun adı">
                </div>
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-institution" placeholder="Qurum">
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-md-6 mb-2">
                    <input class="form-control" type="month" name="${name}-start_date">
                </div>
                <div class="col-md-6 mb-2">
                    <input class="form-control" type="month" name="${name}-end_date">
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <textarea class="form-control" name="${name}-description" placeholder="Description"></textarea>
                </div>
            </div>
        `, 'course');
    insertAndRestore('coursesContainer', fields, name);
    updateCounterDisplay('course')
}

function addReference() {
    const i = counters.reference++;
    const name = `reference-${i}`;
    const fields = templateBlock('Referans', i, `
            <div class="row">
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-company" placeholder="Şirkət adı">
                </div>
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-contact_person" placeholder="Əlaqədar şəxs">
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-phone" placeholder="Phone Number">
                </div>
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-email" placeholder="E-poçt">
                </div>
            </div>
        `, 'reference');
    insertAndRestore('referencesContainer', fields, name);
    updateCounterDisplay('reference')
}

function addSkill() {
    const i = counters.skill++;
    const name = `skill-${i}`;
    const fields = templateBlock('Bacarıq', i, `
            <div class="row">
                <div class="col-md-8 mb-2">
                    <input class="form-control" name="${name}-name" placeholder="Bacarıq">
                </div>
                <div class="col-md-4">
                    <select class="form-select" name="${name}-level">
                        <option value="">Səviyyə</option>
                        <option>Başlanğıc</option>
                        <option>Orta</option>
                        <option>Qabaqcıl</option>
                        <option>Ekspert</option>
                    </select>
                </div>
            </div>
        `, 'skill');
    insertAndRestore('skillsContainer', fields, name);
    updateCounterDisplay('skill')
}

function addPortfolio() {
    const i = counters.portfolio++;
    const name = `project-${i}`;
    const fields = templateBlock('Layihə', i, `
            <div class="row">
                <div class="col-md-6 mb-2">
                    <input class="form-control" name="${name}-title" placeholder="Layihənin adı">
                </div>
                <div class="col-md-6">
                    <input class="form-control" name="${name}-url" placeholder="Layihənin URL-i">
                </div>
            </div>
        `, 'portfolio');
    insertAndRestore('portfolioContainer', fields, name);
    updateCounterDisplay('portfolio')
}

function addLanguage() {
    const i = counters.language++;
    const name = `language-${i}`;
    const fields = templateBlock('Dil', i, `
            <div class="row">
                <div class="col-md-8 mb-2">
                    <input class="form-control" name="${name}-name" placeholder="Dil">
                </div>
                <div class="col-md-4">
                    <select class="form-select" name="${name}-level">
                        <option value="">Səviyyə</option>
                        <option>Əsas</option>
                        <option>Orta</option>
                        <option>Səlis</option>
                        <option>Doğma</option>
                    </select>
                </div>
            </div>
        `, 'language');
    insertAndRestore('languagesContainer', fields, name);
    updateCounterDisplay('language')
}


function addHobby() {
    const i = counters.hobby++;
    const name = `hobby-${i}`;
    const fields = templateBlock('Maraq', i, `
        <div class="row">
            <div class="col-12">
                <input class="form-control" name="${name}-name" placeholder="Hobbi və ya maraq">
            </div>
        </div>
    `, 'hobby');
    insertAndRestore('hobbiesContainer', fields, name);
    updateCounterDisplay('hobby');
}


// Автовосстановление данных при загрузке
document.addEventListener('DOMContentLoaded', function () {
    // Автовосстановление блоков на основе ключей в localStorage
    for (let key in localStorage) {
        if (key.startsWith('step2_skill-') && key.endsWith('-name')) {
            addSkill(); // добавит и восстановит данные автоматически
        }
        if (key.startsWith('step2_experience-') && key.endsWith('-position')) {
            addExperience();
        }
        if (key.startsWith('step2_education-') && key.endsWith('-degree')) {
            addEducation();
        }
        if (key.startsWith('step2_course-') && key.endsWith('-name')) {
            addCourse();
        }
        if (key.startsWith('step2_reference-') && key.endsWith('-company')) {
            addReference();
        }
        if (key.startsWith('step2_project-') && key.endsWith('-title')) {
            addPortfolio();
        }
        if (key.startsWith('step2_language-') && key.endsWith('-name')) {
            addLanguage();
        }
        if (key.startsWith('step2_hobby-') && key.endsWith('-name')) {
            addHobby();
        }

    }

    // Восстановление значений для всех полей
    document.querySelectorAll('input[name], textarea[name], select[name]').forEach(restoreFieldValue);
});


// Автосохранение
document.addEventListener('input', function (e) {
    if (e.target.name) {
        localStorage.setItem(prefix + e.target.name, e.target.value);
    }
});


document.addEventListener('change', function (e) {
    if (e.target.name) {
        localStorage.setItem(prefix + e.target.name, e.target.value);
    }
});