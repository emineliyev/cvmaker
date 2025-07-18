from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from .models import CV
from .utils import get_template_config, generate_pdf_from_html
from celery import shared_task
import logging


@shared_task
def generate_and_store_pdf(cv_id):
    logger = logging.getLogger(__name__)
    logger.info(f"📄 Начата генерация PDF для CV #{cv_id}")

    try:
        cv = CV.objects.get(id=cv_id)
    except CV.DoesNotExist:
        logger.error(f"❌ CV с id={cv_id} не найден.")
        return

    # Сбор контекста
    config = get_template_config(cv.template_name)
    context = {
        **cv.data,
        'accent_color': cv.color or config['default_accent_color']
    }

    # ✅ Рендерим шаблон БЕЗ request
    html = render_to_string(f'cv/template/{cv.template_name}/template.html', context)

    # Генерация PDF
    pdf_bytes = generate_pdf_from_html(html, pdf_options={
        'format': 'A4',
        'margin': {'top': '1cm', 'bottom': '1cm', 'left': '1cm', 'right': '1cm'},
        'print_background': True,
    })

    if pdf_bytes:
        filename = f"cv_{cv.id}.pdf"
        cv.pdf_file.save(filename, ContentFile(pdf_bytes))
        cv.save()
        logger.info(f"✅ PDF успешно сохранён и прикреплён к CV #{cv.id}")
    else:
        logger.error(f"❌ Не удалось сгенерировать PDF для CV #{cv.id}")
