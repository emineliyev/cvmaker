# cv/urls.py
from django.urls import path
from .views import index, wizard_step1, wizard_step2, wizard_step3, template_preview, checkout_view, \
    payment_success_view, download_pdf_view, payment_success_page

app_name = 'cv'

urlpatterns = [
    path('', index, name='index'),
    path('create/step-1/', wizard_step1, name='step1'),
    path('create/step-2/', wizard_step2, name='step2'),
    path('create/step-3/', wizard_step3, name='step3'),
    path('checkout/', checkout_view, name='checkout'),
    path('payment/success/', payment_success_view, name='payment-success'),
    path('payment/success/<int:cv_id>/', payment_success_page, name='payment-success-page'),
    path('download/<int:cv_id>/', download_pdf_view, name='download_pdf'),
    path('template-preview/<str:template_name>/', template_preview, name='preview-template'),
]

