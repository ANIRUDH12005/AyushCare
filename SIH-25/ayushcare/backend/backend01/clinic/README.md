# Clinic Management Dashboard System

## Overview

A comprehensive Django-based Clinic Management Dashboard system fully integrated with Django Admin Panel. All data is stored in the database and synchronized in real-time between the dashboard and admin panel.

## Architecture

### Data Flow
```
Django Admin Panel → Database → Dashboard API → Frontend
         ↑                                    ↓
         └────────── Real-time Sync ──────────┘
```

**Key Principle**: Any data inserted/updated through the dashboard OR admin panel is immediately reflected in both interfaces.

## Models

### Core Models

1. **Therapist** (`clinic/models.py`)
   - Manages therapist information
   - Linked to Center and User account
   - Tracks specialty and experience

2. **TherapistAttendance** (`clinic/models.py`)
   - Daily attendance tracking
   - Status: present, absent, late, on_leave
   - Tracks check-in/check-out times

3. **InventoryItem** (`clinic/models.py`)
   - Manages clinic inventory (oils, medicines, equipment)
   - Stock level tracking with alerts
   - Automatic low-stock detection

4. **Enhanced Models**
   - **PatientProfile**: Added `total_visits`, `last_visit_date`, `first_visit_date`
   - **Appointment**: Added `therapist`, `checked_in_at`, `completed_at`, `no_show` status

## Django Admin Configuration

All models are fully registered with comprehensive admin configurations:

### Features
- ✅ `list_display` - Custom columns with computed fields
- ✅ `search_fields` - Full-text search
- ✅ `list_filter` - Advanced filtering
- ✅ `inlines` - Related object management
- ✅ Color-coded status badges
- ✅ Bulk actions for common operations
- ✅ Date hierarchies for time-based navigation

### Admin URLs
- `/admin/clinic/therapist/` - Therapist management
- `/admin/clinic/therapistattendance/` - Attendance tracking
- `/admin/clinic/inventoryitem/` - Inventory management
- `/admin/appointments/appointment/` - Appointment management (enhanced)
- `/admin/patients/patientprofile/` - Patient profiles (with visit tracking)

## Dashboard API Endpoints

### Main Dashboard
```
GET /api/clinic/dashboard/
```
Returns all KPIs calculated from database:
- Patient Metrics (total, visited, attended today, absent, upcoming sessions)
- Appointment Metrics (today, upcoming 7/30 days, completed, cancelled)
- Therapist Metrics (total, present/absent today, assigned, workload)
- Clinic Performance (active/completed plans, pending sessions, revenue)

### Patient Schedule
```
GET /api/clinic/schedule/?start_date=2024-01-01&end_date=2024-01-31
```
Calendar-based schedule with all appointments in date range.

### Appointment Management
```
GET /api/clinic/appointments/?status=scheduled&date=2024-01-15
POST /api/clinic/appointments/
POST /api/clinic/appointments/{id}/check-in/
POST /api/clinic/appointments/{id}/assign-therapist/
```

### Inventory Management
```
GET /api/clinic/inventory/?category=oil&low_stock=true
GET /api/clinic/inventory/{id}/
PATCH /api/clinic/inventory/{id}/  # Update stock
GET /api/clinic/inventory/alerts/
```

### Billing & Invoicing
```
GET /api/clinic/billing/
GET /api/clinic/billing/invoices/?status=pending
GET /api/clinic/billing/invoices/{id}/
```

### Reports & Analytics
```
GET /api/clinic/reports/
GET /api/clinic/reports/revenue/?start_date=2024-01-01&end_date=2024-01-31
GET /api/clinic/reports/attendance/?start_date=2024-01-01&end_date=2024-01-31
```

### Patient History
```
GET /api/clinic/patients/{patient_id}/history/
```

### Feedback
```
GET /api/clinic/feedback/
```

## KPI Calculations

All metrics are calculated from database queries - **NO hardcoded data**.

### Patient Metrics
```python
total_patients = PatientProfile.objects.filter(is_active=True).count()
patients_visited = PatientProfile.objects.filter(total_visits__gt=0).count()
patients_attended_today = Appointment.objects.filter(
    date=today, status__in=["checked_in", "completed"]
).values("patient").distinct().count()
```

### Revenue Calculations
```python
revenue_today = Invoice.objects.filter(
    created_at__date=today,
    payment_status__in=["paid", "partial"]
).aggregate(total=Sum("paid_amount"))["total"]
```

### Therapist Workload
```python
therapist_workload = Appointment.objects.filter(
    date=today, therapist__isnull=False
).values("therapist__name").annotate(
    workload=Count("id")
).order_by("-workload")
```

## Permissions

### Access Control
- **Admin**: Full control via Django Admin
- **Clinic Manager**: Staff access to dashboard APIs
- **Therapist**: Limited access (own appointments, attendance)

### Decorators
```python
@method_decorator(staff_member_required, name='dispatch')
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
```

## Setup Instructions

### 1. Run Migrations
```bash
cd backend/backend01
python manage.py makemigrations
python manage.py migrate
```

### 2. Create Superuser (if needed)
```bash
python manage.py createsuperuser
```

### 3. Access Admin Panel
Navigate to: `http://localhost:8000/admin/`

### 4. Access Dashboard API
All endpoints require authentication:
```bash
# Get dashboard data
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/clinic/dashboard/
```

## Usage Examples

### Check-in Patient
```python
POST /api/clinic/appointments/123/check-in/
```
- Updates appointment status to "checked_in"
- Sets `checked_in_at` timestamp
- Automatically increments patient's visit count

### Assign Therapist
```python
POST /api/clinic/appointments/123/assign-therapist/
Body: {"therapist_id": 5}
```

### Restock Inventory
```python
PATCH /api/clinic/inventory/10/
Body: {"restock_quantity": 50}
```
- Adds quantity to current stock
- Updates `last_restocked` date

### Mark Attendance
```python
# Via Admin Panel
Admin → Therapist Attendance → Add Attendance
# Or via API (can be added)
```

## Real-time Sync

### How It Works
1. **Admin Panel Changes**: 
   - User updates data in Django Admin
   - Changes saved to database
   - Dashboard API queries same database
   - Changes immediately visible in dashboard

2. **Dashboard Changes**:
   - User updates via API
   - Changes saved to database
   - Admin Panel shows updated data on refresh
   - Both use same Django ORM models

### Example Flow
```
1. Admin creates new appointment in Admin Panel
   → Saved to Appointment model
   
2. Dashboard API queries appointments
   → GET /api/clinic/dashboard/
   → Returns new appointment in recent_activities
   
3. Frontend displays updated data
   → Real-time sync achieved
```

## Inventory Alerts

Automatic low-stock detection:
```python
low_stock_items = InventoryItem.objects.filter(
    current_stock__lte=F("min_stock_level")
)
```

Dashboard shows alerts for:
- Items below minimum stock level
- Out of stock items
- Items needing restocking

## Best Practices

1. **Always use database queries** - Never hardcode KPI values
2. **Use select_related/prefetch_related** - Optimize database queries
3. **Validate permissions** - Check user roles before allowing actions
4. **Handle errors gracefully** - Return proper error messages
5. **Use transactions** - For multi-step operations (check-in, billing)

## Frontend Integration

### Example React Component
```javascript
// Fetch dashboard data
const response = await fetch('/api/clinic/dashboard/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Display KPIs
console.log(data.patient_metrics.total_registered);
console.log(data.appointment_metrics.today_count);
console.log(data.clinic_performance.revenue.today);
```

## Testing

### Test Dashboard Endpoints
```bash
# Using Django test client
python manage.py test clinic.tests
```

### Test Admin Panel
1. Create test data via Admin Panel
2. Verify data appears in Dashboard API
3. Update data via API
4. Verify changes in Admin Panel

## Troubleshooting

### Dashboard shows zero values
- Check if data exists in database
- Verify date filters are correct
- Check user permissions

### Admin Panel not showing new fields
- Run migrations: `python manage.py migrate`
- Clear browser cache
- Check model registration in admin.py

### API returns 403 Forbidden
- Verify user is staff: `user.is_staff = True`
- Check authentication token
- Verify permission_classes

## Future Enhancements

- [ ] Real-time WebSocket updates for dashboard
- [ ] Advanced analytics with charts
- [ ] Export reports to PDF/Excel
- [ ] Email notifications for low stock
- [ ] Mobile app integration
- [ ] Multi-clinic support with filtering

## Support

For issues or questions:
1. Check Django Admin Panel for data verification
2. Review API responses for error messages
3. Check database directly if needed
4. Review logs for detailed errors

---

**Built with Django, Django REST Framework, and Django Admin Panel**
**Production-ready architecture following Coursera-style best practices**

