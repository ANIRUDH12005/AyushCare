from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from datetime import date, timedelta

from .models import Doctor, Center, Therapist, TherapistAttendance, InventoryItem


# ======================
# Doctor Admin
# ======================
@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialty", "center", "phone", "user_link")
    list_filter = ("center", "specialty")
    search_fields = ("name", "phone", "user__username", "user__email")
    raw_id_fields = ("user", "center")
    
    def user_link(self, obj):
        if obj.user:
            url = reverse("admin:auth_user_change", args=[obj.user.pk])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return "-"
    user_link.short_description = "User Account"


# ======================
# Therapist Attendance Inline
# ======================
class TherapistAttendanceInline(admin.TabularInline):
    model = TherapistAttendance
    extra = 0
    fields = ("date", "status", "check_in_time", "check_out_time", "notes")
    readonly_fields = ("date",)


# ======================
# Therapist Admin
# ======================
@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    list_display = ("name", "center", "specialty", "experience_years", "is_active", "user_link")
    list_filter = ("center", "specialty", "is_active")
    search_fields = ("name", "phone", "email", "user__username")
    raw_id_fields = ("user", "center")
    inlines = [TherapistAttendanceInline]
    
    def user_link(self, obj):
        if obj.user:
            url = reverse("admin:auth_user_change", args=[obj.user.pk])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return "-"
    user_link.short_description = "User Account"


# ======================
# Therapist Attendance Admin
# ======================
@admin.register(TherapistAttendance)
class TherapistAttendanceAdmin(admin.ModelAdmin):
    list_display = ("therapist", "date", "status", "check_in_time", "check_out_time")
    list_filter = ("status", "date", "therapist__center")
    search_fields = ("therapist__name", "therapist__center__name")
    # date_hierarchy = "date"
    ordering = ["-date", "therapist__name"]


# ======================
# Inventory Item Admin
# ======================
@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        "name", 
        "category", 
        "center", 
        "current_stock", 
        "unit", 
        "is_active"
    )
    list_filter = ("category", "center", "is_active")
    search_fields = ("name", "description", "center__name")
    raw_id_fields = ("center",)


# ======================
# Doctor Inline for Center
# ======================
class DoctorInline(admin.TabularInline):
    model = Doctor
    extra = 1
    fields = ("name", "specialty", "phone", "timing", "user")
    raw_id_fields = ("user",)


# ======================
# Therapist Inline for Center
# ======================
class TherapistInline(admin.TabularInline):
    model = Therapist
    extra = 1
    fields = ("name", "specialty", "phone", "email", "is_active")
    raw_id_fields = ("user",)


# ======================
# Center Admin
# ======================
@admin.register(Center)
class CenterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "state",
        "phone",
        "rating",
        "popular",
        "created_at"
    )
    list_filter = ("city", "state", "popular", "rating")
    search_fields = ("name", "address", "city", "phone")
    # date_hierarchy = "created_at"
    
    inlines = [DoctorInline, TherapistInline]
