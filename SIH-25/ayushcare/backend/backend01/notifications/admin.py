from django.contrib import admin
from .models import DoctorNote, Notification, Feedback


@admin.register(DoctorNote)
class DoctorNoteAdmin(admin.ModelAdmin):
    list_display = ("title", "doctor", "patient", "visible_to_patient", "created_at")
    list_filter = ("visible_to_patient", "doctor")
    search_fields = ("title", "doctor__user__username", "patient__username")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "notification_type",
        "is_sent",
        "scheduled_at",
        "sent_at",
    )
    list_filter = ("notification_type", "is_sent")
    search_fields = ("title", "user__username")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("patient", "treatment_plan", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("patient__username",)
