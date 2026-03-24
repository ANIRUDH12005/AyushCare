"""
Dashboard HTML Views - Visual monitoring page
"""
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, Sum, Q, F
from django.contrib.auth.models import User
from patients.models import PatientProfile
from appointments.models import Appointment, TreatmentPlan, DailySession, Invoice
from clinic.models import Therapist, TherapistAttendance, Center, InventoryItem
from notifications.models import Notification


@staff_member_required
def dashboard_view(request):
    """
    Main dashboard page - Visual monitoring interface
    All KPIs calculated from database in real-time
    """
    today = date.today()
    now = timezone.now()
    
    # Get clinic/center context
    center = None
    clinic_name = "AyushCare Clinic"
    
    if hasattr(request.user, 'therapist_profile') and request.user.therapist_profile.center:
        center = request.user.therapist_profile.center
        clinic_name = center.name
    elif hasattr(request.user, 'doctor') and request.user.doctor.center:
        center = request.user.doctor.center
        clinic_name = center.name
    else:
        # Try to get first center as default
        first_center = Center.objects.first()
        if first_center:
            center = first_center
            clinic_name = center.name
    
    # ======================
    # PATIENT METRICS
    # ======================
    total_patients = PatientProfile.objects.filter(is_active=True).count()
    patients_visited = PatientProfile.objects.filter(total_visits__gt=0).count()
    patients_attended_today = Appointment.objects.filter(
        date=today,
        status__in=["checked_in", "completed"]
    ).values("patient").distinct().count()
    patients_absent_today = Appointment.objects.filter(
        date=today,
        status="no_show"
    ).values("patient").distinct().count()
    upcoming_sessions = Appointment.objects.filter(
        date__gte=today,
        date__lte=today + timedelta(days=7),
        status__in=["scheduled", "checked_in"],
        appointment_type="therapy"
    ).count()
    
    patient_metrics = {
        "total_registered": total_patients,
        "total_visited": patients_visited,
        "attended_today": patients_attended_today,
        "absent_today": patients_absent_today,
        "upcoming_sessions": upcoming_sessions,
    }
    
    # ======================
    # APPOINTMENT METRICS
    # ======================
    today_appointments = Appointment.objects.filter(date=today).count()
    upcoming_7_days = Appointment.objects.filter(
        date__gte=today,
        date__lte=today + timedelta(days=7),
        status__in=["scheduled", "checked_in"]
    ).count()
    upcoming_30_days = Appointment.objects.filter(
        date__gte=today,
        date__lte=today + timedelta(days=30),
        status__in=["scheduled", "checked_in"]
    ).count()
    completed_appointments = Appointment.objects.filter(status="completed").count()
    cancelled_appointments = Appointment.objects.filter(status="cancelled").count()
    
    appointment_metrics = {
        "today_count": today_appointments,
        "upcoming_7_days": upcoming_7_days,
        "upcoming_30_days": upcoming_30_days,
        "completed": completed_appointments,
        "cancelled": cancelled_appointments,
    }
    
    # ======================
    # THERAPIST METRICS
    # ======================
    total_therapists = Therapist.objects.filter(is_active=True).count()
    therapists_present_today = TherapistAttendance.objects.filter(
        date=today,
        status="present"
    ).count()
    therapists_absent_today = TherapistAttendance.objects.filter(
        date=today,
        status="absent"
    ).count()
    therapists_assigned = Appointment.objects.filter(
        date=today,
        status__in=["scheduled", "checked_in"],
        therapist__isnull=False
    ).values("therapist").distinct().count()
    
    # Therapist workload
    therapist_workload = Appointment.objects.filter(
        date=today,
        therapist__isnull=False
    ).values("therapist__name").annotate(
        workload=Count("id")
    ).order_by("-workload")[:10]
    
    therapist_metrics = {
        "total": total_therapists,
        "present_today": therapists_present_today,
        "absent_today": therapists_absent_today,
        "assigned_today": therapists_assigned,
        "workload": [
            {
                "therapist": item["therapist__name"],
                "count": item["workload"]
            }
            for item in therapist_workload
        ],
    }
    
    # ======================
    # CLINIC PERFORMANCE
    # ======================
    active_plans = TreatmentPlan.objects.filter(status="ongoing").count()
    completed_plans = TreatmentPlan.objects.filter(status="completed").count()
    pending_sessions = DailySession.objects.filter(
        treatment_plan__status="ongoing",
        session_date__gte=today
    ).count()
    
    # Revenue
    revenue_today = Invoice.objects.filter(
        created_at__date=today,
        payment_status__in=["paid", "partial"]
    ).aggregate(total=Sum("paid_amount"))["total"] or Decimal("0.00")
    
    week_start = today - timedelta(days=today.weekday())
    revenue_this_week = Invoice.objects.filter(
        created_at__date__gte=week_start,
        payment_status__in=["paid", "partial"]
    ).aggregate(total=Sum("paid_amount"))["total"] or Decimal("0.00")
    
    total_revenue = Invoice.objects.filter(
        payment_status__in=["paid", "partial"]
    ).aggregate(total=Sum("paid_amount"))["total"] or Decimal("0.00")
    
    clinic_performance = {
        "active_plans": active_plans,
        "completed_plans": completed_plans,
        "pending_sessions": pending_sessions,
        "revenue": {
            "today": revenue_today,
            "this_week": revenue_this_week,
            "total": total_revenue,
        },
    }
    
    # ======================
    # RECENT ACTIVITIES
    # ======================
    recent_appointments = Appointment.objects.filter(
        date__gte=today - timedelta(days=7)
    ).select_related("patient", "doctor", "therapist").order_by("-date", "-time")[:10]
    
    recent_notifications = Notification.objects.filter(
        created_at__gte=now - timedelta(days=7)
    ).order_by("-created_at")[:10]
    
    # Format recent appointments for template
    formatted_appointments = []
    for apt in recent_appointments:
        try:
            formatted_appointments.append({
                "patient": apt.patient.username if apt.patient else "Unknown",
                "date": apt.date.strftime("%Y-%m-%d") if apt.date else "",
                "time": apt.time.strftime("%H:%M") if apt.time else "",
                "status": apt.status,
            })
        except:
            continue
    
    # Format recent notifications
    formatted_notifications = [
        {
            "title": notif.title,
            "type": notif.notification_type,
            "created_at": notif.created_at,
        }
        for notif in recent_notifications
    ]
    
    # ======================
    # INVENTORY ALERTS
    # ======================
    low_stock_items = InventoryItem.objects.filter(
        is_active=True
    ).annotate(
        stock_ratio=F("current_stock") / F("min_stock_level")
    ).filter(
        current_stock__lte=F("min_stock_level")
    )[:10]
    
    inventory_alerts = [
        {
            "name": item.name,
            "category": item.category,
            "current_stock": float(item.current_stock),
            "min_stock_level": float(item.min_stock_level),
            "unit": item.unit,
            "status": item.stock_status,
        }
        for item in low_stock_items
    ]
    
    # ======================
    # CONTEXT
    # ======================
    context = {
        "clinic_name": clinic_name,
        "current_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "patient_metrics": patient_metrics,
        "appointment_metrics": appointment_metrics,
        "therapist_metrics": therapist_metrics,
        "clinic_performance": clinic_performance,
        "recent_appointments": formatted_appointments,
        "recent_notifications": formatted_notifications,
        "inventory_alerts": inventory_alerts,
    }
    
    return render(request, "clinic/dashboard.html", context)

