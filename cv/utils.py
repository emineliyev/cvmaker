import os
import json
from functools import lru_cache
import logging
from django.conf import settings
from django.shortcuts import render

logger = logging.getLogger(__name__)
DEFAULT_COLOR = '#3366cc'


@lru_cache(maxsize=32)
def get_template_config(template_name):
    config_path = os.path.join(settings.BASE_DIR, 'templates', 'cv', 'template', template_name, 'config.json')
    try:
        with open(config_path, encoding='utf-8') as f:
            config = json.load(f)
            default_color = config.get('default_accent_color', DEFAULT_COLOR)
            available_colors = config.get('available_colors', [default_color])
            return {
                'default_accent_color': default_color,
                'available_colors': available_colors,
                'display_name': config.get('display_name', template_name.capitalize())
            }
    except Exception as e:
        logger.warning(f"Ошибка чтения конфига шаблона {template_name}: {e}")
        return {
            'default_accent_color': DEFAULT_COLOR,
            'available_colors': [DEFAULT_COLOR],
            'display_name': template_name.capitalize()
        }


def render_cv_template(request, template_name, context):
    return render(request, f'cv/template/{template_name}/template.html', context)


def generate_pdf_from_html(html: str, output_path=None, pdf_options=None):
    default_options = {
        'format': 'A4',
        'margin': {
            'top': '2cm',
            'bottom': '2cm',
            'left': '2cm',
            'right': '2cm'
        },
        'print_background': True
    }

    # Объединяем переданные pdf_options с дефолтными
    if pdf_options:
        default_options.update(pdf_options)

    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html, wait_until='domcontentloaded', timeout=30000)
        pdf_bytes = page.pdf(**default_options)
        browser.close()

    if output_path:
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
        return None

    return pdf_bytes
