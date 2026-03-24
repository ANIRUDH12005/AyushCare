from django.contrib import admin

# Register your models here.

# patients/admin.py
from django.contrib import admin
from .models import PatientProfile


@admin.register(PatientProfile)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("full_name", "center", "age", "gender", "prakriti", "is_active")
    list_filter = ("center", "gender", "prakriti", "is_active")
    search_fields = ("full_name", "user__username", "phone")
