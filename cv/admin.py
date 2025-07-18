from django.contrib import admin

from django.utils.html import format_html

from cv.models import CV


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at', 'pdf_link')
    readonly_fields = ['pdf_file']

    def pdf_link(self, obj):
        if obj.pdf_file:
            return format_html('<a href="{}" download>📄 Yüklə</a>', obj.pdf_file.url)
        return "—"
    pdf_link.short_description = "PDF"
