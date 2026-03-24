from django.contrib import admin

# Register your models here.
from clinic.models import Doctor

class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "specialty", "clinic")
    search_fields = ("name", "specialty", "clinic")

    class Meta:
        app_label = "Clinic Setup"