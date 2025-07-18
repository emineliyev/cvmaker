from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from .models import CV
import os
import logging
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from .tasks import generate_and_store_pdf
from .utils import get_template_config, render_cv_template, generate_pdf_from_html

logger = logging.getLogger(__name__)

DEFAULT_COLOR = '#e0aa28'
FALLBACK_COLOR = '#4e54c8'


def index(request):
    return render(request, 'cv/index.html')


def wizard_step1(request):
    if request.method == 'POST':
        if cropped := request.POST.get('cropped_image'):
            request.session['cv_photo_base64'] = cropped

        request.session['cv_personal'] = {
            key: request.POST.get(key) for key in [
                'first_name', 'last_name', 'position', 'email', 'phone', 'address', 'zip_code', 'city',
                'dob', 'birth_place', 'driver_license', 'gender', 'nationality', 'marital_status', 'linkedin', 'website'
            ]
        }
        return redirect('cv:step2')
    return render(request, 'cv/wizard/step1.html')


def wizard_step2(request):
    if request.method == 'POST':
        raw_data = request.POST.dict()

        sections = {
            'cv_experience': ('experience', ['position', 'city', 'employer', 'start_date', 'end_date', 'description',
                                             'currently_working']),
            'cv_education': ('education', ['degree', 'city', 'school', 'start_date', 'end_date', 'description']),
            'cv_courses': ('course', ['name', 'institution', 'start_date', 'end_date', 'description']),
            'cv_hobbies': ('hobby', ['name']),
            'cv_references': ('reference', ['company', 'contact_person', 'phone', 'email']),
            'cv_skills': ('skill', ['name', 'level']),
            'cv_languages': ('language', ['name', 'level']),
            'cv_portfolio': ('project', ['title', 'url']),
        }

        for key, (prefix, fields) in sections.items():
            request.session[key] = parse_repeated_form_data(prefix, fields, raw_data)

        request.session['cv_description'] = raw_data.get('description', '')

        return redirect('cv:step3')
    return render(request, 'cv/wizard/step2.html')


def wizard_step3(request):
    if request.method == 'GET' and 'template' in request.GET:
        request.session['cv_template'] = request.GET.get('template')
        request.session['cv_color'] = request.GET.get('color', FALLBACK_COLOR)
        return redirect('cv:checkout')

    templates = get_available_templates()
    for template in templates:
        config = get_template_config(template['name'])
        template['color'] = config.get('default_accent_color', FALLBACK_COLOR)

    # Получаем цвет из сессии или ставим дефолт
    accent_color = request.session.get('cv_color', FALLBACK_COLOR)

    return render(request, 'cv/wizard/step3.html', {
        'templates': templates,
        'accent_color': accent_color
    })


def parse_repeated_form_data(prefix, fields, raw_data):
    entries = []
    i = 0
    while f"{prefix}-{i}-{fields[0]}" in raw_data:
        entry = {field: raw_data.get(f"{prefix}-{i}-{field}", '') for field in fields}
        entry['currently_working'] = raw_data.get(f"{prefix}-{i}-currently_working") == 'on'
        entries.append(entry)
        i += 1
    return entries


def get_available_templates():
    template_dir = os.path.join(settings.BASE_DIR, 'templates', 'cv', 'template')
    templates = []

    for dir_name in os.listdir(template_dir):
        dir_path = os.path.join(template_dir, dir_name)
        if os.path.isdir(dir_path):
            config = get_template_config(dir_name)
            templates.append({
                'name': dir_name,
                'display_name': config['display_name'],
                'available_colors': config['available_colors'],
                'default_color': config['default_accent_color']
            })

    return templates


def get_cv_session_data(request):
    data = {
        'personal': request.session.get('cv_personal', {}),
        'experience': request.session.get('cv_experience', []),
        'education': request.session.get('cv_education', []),
        'courses': request.session.get('cv_courses', []),
        'languages': request.session.get('cv_languages', []),
        'skills': request.session.get('cv_skills', []),
        'hobbies': request.session.get('cv_hobbies', []),
        'references': request.session.get('cv_references', []),
        'portfolio': request.session.get('cv_portfolio', []),
        'description': request.session.get('cv_description', '')
    }
    if photo := request.session.get('cv_photo_base64'):
        data['personal']['photo'] = photo
    return data


def template_preview(request, template_name):
    config = get_template_config(template_name)

    if template_name not in [t['name'] for t in get_available_templates()]:
        raise Http404("Template not found")

    session_data = get_cv_session_data(request)

    accent_color = (
            request.GET.get('color')
            or request.session.get('cv_color')
            or config.get('default_accent_color', DEFAULT_COLOR)
    )

    context = {
        **session_data,
        'accent_color': accent_color,
        'template_display_name': config['display_name'],
    }

    return render_cv_template(request, template_name, context)


def checkout_view(request):
    required_keys = ['cv_template', 'cv_color']
    if not all(k in request.session for k in required_keys):
        return redirect('cv:step1')

    template_name = request.session.get('cv_template')
    accent_color = request.session.get('cv_color', DEFAULT_COLOR)

    if request.method == 'POST':
        return redirect('cv:payment-success')

    return render(request, 'cv/checkout_dummy.html', {
        'template_name': template_name,
        'accent_color': accent_color
    })


def payment_success_view(request):
    required_keys = ['cv_template', 'cv_color', 'cv_personal']
    if not all(k in request.session for k in required_keys):
        return redirect('cv:step1')

    if request.session.get('cv_created') and request.session.get('cv_id'):
        return redirect('cv:payment-success-page', cv_id=request.session['cv_id'])

    cv = CV.objects.create(
        title="Mənim CV-im",
        data=get_cv_session_data(request),
        template_name=request.session['cv_template'],
        color=request.session['cv_color'],
        user=request.user if request.user.is_authenticated else None
    )

    # Отправляем задачу на асинхронную генерацию PDF
    generate_and_store_pdf.delay(cv.id)

    request.session['cv_created'] = True
    request.session['cv_id'] = cv.id

    return redirect('cv:payment-success-page', cv_id=cv.id)


def payment_success_page(request, cv_id):
    # Проверяем, существует ли резюме
    cv = get_object_or_404(CV, id=cv_id)

    # Разрешаем доступ ТОЛЬКО если в сессии есть cv_id и он совпадает
    if request.session.get('cv_id') != cv.id:
        return redirect('cv:step1')

    # ⚠️ Не удаляем cv_id здесь — удалим его после скачивания PDF
    for key in ['cv_created', 'cv_template', 'cv_color']:
        request.session.pop(key, None)

    return render(request, 'cv/payment_success.html', {'cv_id': cv_id})


def download_pdf_view(request, cv_id):
    cv = get_object_or_404(CV, id=cv_id)

    # Защита доступа: авторизованный пользователь или разрешённый через сессию
    if cv.user:
        if not request.user.is_authenticated or request.user != cv.user:
            raise Http404("Вы не имеете доступа к этому резюме.")
    else:
        # Нет привязки к пользователю — разрешаем только если совпадает сессия
        if request.session.get('cv_id') != cv.id:
            raise Http404("Вы не имеете доступа к этому резюме.")

    # Генерация PDF, если ещё не был создан
    if not cv.pdf_file:
        config = get_template_config(cv.template_name)
        html_content = render_cv_template(request, cv.template_name, {
            **cv.data,
            'accent_color': cv.color or config['default_accent_color']
        }).content.decode('utf-8')

        pdf_bytes = generate_pdf_from_html(html_content, pdf_options={
            'format': 'A4',
            'margin': {'top': '1cm', 'bottom': '1cm', 'left': '1cm', 'right': '1cm'},
            'print_background': True,
        })

        cv.pdf_file.save(f"{cv.title}.pdf", ContentFile(pdf_bytes))
        cv.save()

        # Удаляем доступ из сессии (после генерации и скачивания)
        request.session.pop('cv_id', None)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{cv.title}.pdf"'
        return response

    # Если PDF уже есть — просто отдаём файл
    response = HttpResponse(cv.pdf_file.open(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{cv.title}.pdf"'

    # Удаляем доступ из сессии
    request.session.pop('cv_id', None)
    return response



