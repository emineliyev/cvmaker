from django.db import models
from django.contrib.auth.models import User


class CV(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255, default="Моё резюме")
    data = models.JSONField()  # персональные данные, опыт, образование и т.д.
    template_name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, default="#000000")
    pdf_file = models.FileField(upload_to='cv_pdfs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.user or 'Гость'}"