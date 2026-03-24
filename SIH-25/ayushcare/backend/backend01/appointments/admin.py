from django.contrib import admin

from .models import (
    PanchakarmaProcedure,
    TreatmentPlan,
    DailySession,
    Appointment,
    Invoice,
)


# ======================
# Panchakarma Procedure
# ======================
@admin.register(PanchakarmaProcedure)
class PanchakarmaProcedureAdmin(admin.ModelAdmin):
    list_display = ("name", "typical_duration_days", "base_cost")
    search_fields = ("name",)


# ======================
# Daily Session Inline
# ======================
class DailySessionInline(admin.TabularInline):
    model = DailySession
    extra = 0


# ======================
# Treatment Plan
# ======================
@admin.register(TreatmentPlan)
class TreatmentPlanAdmin(admin.ModelAdmin):
    list_display = ("patient", "procedure", "doctor", "current_phase", "status")
    list_filter = ("status", "current_phase", "procedure")
    search_fields = ("patient__username", "procedure__name")
    inlines = [DailySessionInline]


# ======================
# Appointment
# ======================
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "date", "time", "status")
    list_filter = ("status", "appointment_type", "date")
    search_fields = ("patient__username", "doctor__user__username")


# ======================
# Invoice
# ======================
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "total_amount", "paid_amount", "payment_status", "created_at")
    list_filter = ("payment_status",)
    search_fields = ("patient__username",)
