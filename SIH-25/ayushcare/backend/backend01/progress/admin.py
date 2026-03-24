from django.contrib import admin
from .models import ProgressEntry


@admin.register(ProgressEntry)
class ProgressEntryAdmin(admin.ModelAdmin):
    list_display = [
        "patient", "appointment", "entry_date", "day_number",
        "pain_level", "sleep_quality", "energy_level", "created_at"
    ]
    list_filter = ["entry_date", "day_number", "is_therapy_day"]
    search_fields = ["patient__username", "patient__email", "notes"]
    readonly_fields = ["created_at", "updated_at"]

