# Clinic Management Dashboard - Setup Guide

## Quick Start

### Step 1: Run Migrations

```bash
cd backend/backend01
python manage.py makemigrations clinic
python manage.py makemigrations patients
python manage.py makemigrations appointments
python manage.py migrate
```

### Step 2: Create Initial Data (Optional)

#### Create a Center/Clinic
1. Go to Django Admin: `http://localhost:8000/admin/`
2. Navigate to **Clinic → Centers**
3. Click "Add Center"
4. Fill in:
   - Name: "Parijatak Ayurveda Clinic & Panchakarma Center" (or your clinic name)
   - Address, City, State, Pincode
   - Phone, Website
   - Save

#### Create Therapists
1. Go to **Clinic → Therapists**
2. Click "Add Therapist"
3. Fill in:
   - Name, Phone, Email
   - Select Center
   - Specialty (e.g., "Abhyanga", "Basti")
   - Experience Years
   - Save

#### Create Inventory Items
1. Go to **Clinic → Inventory Items**
2. Click "Add Inventory Item"
3. Fill in:
   - Name (e.g., "Sesame Oil")
   - Category (Oil, Medicine, Equipment, etc.)
   - Current Stock, Unit
   - Min/Max Stock Levels
   - Unit Price
   - Save

### Step 3: Test Dashboard API

```bash
# Start Django server
python manage.py runserver

# In another terminal, test the API (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/clinic/dashboard/
```

### Step 4: Access Admin Panel

Navigate to: `http://localhost:8000/admin/`

You should see:
- ✅ Clinic section with Centers, Doctors, Therapists, Therapist Attendance, Inventory Items
- ✅ Appointments section with enhanced appointment management
- ✅ Patients section with visit tracking
- ✅ All models have proper filters, search, and display options

## Key Features Verification

### ✅ Dashboard KPIs
All metrics are calculated from database:
- Patient counts (total, visited, today's attendance)
- Appointment statistics (today, upcoming, completed, cancelled)
- Therapist metrics (total, attendance, workload)
- Revenue calculations (today, week, total)
- Inventory alerts (low stock items)

### ✅ Real-time Sync
1. Create an appointment in Admin Panel
2. Check Dashboard API - should show in recent activities
3. Update appointment status via API
4. Refresh Admin Panel - should show updated status

### ✅ Inventory Management
1. Add inventory items via Admin
2. Check Dashboard API - low stock alerts appear automatically
3. Restock via API: `PATCH /api/clinic/inventory/{id}/` with `{"restock_quantity": 50}`

### ✅ Patient Visit Tracking
1. Check-in a patient via API: `POST /api/clinic/appointments/{id}/check-in/`
2. Patient's visit count automatically increments
3. Last visit date updates
4. View in Admin Panel → Patients → Patient Profile

### ✅ Therapist Attendance
1. Mark attendance in Admin Panel → Therapist Attendance
2. Dashboard shows present/absent counts
3. Today's status visible in Therapist list

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clinic/dashboard/` | GET | Main dashboard with all KPIs |
| `/api/clinic/schedule/` | GET | Patient schedule (calendar view) |
| `/api/clinic/appointments/` | GET, POST | List/create appointments |
| `/api/clinic/appointments/{id}/check-in/` | POST | Check-in patient |
| `/api/clinic/appointments/{id}/assign-therapist/` | POST | Assign therapist |
| `/api/clinic/inventory/` | GET | List inventory items |
| `/api/clinic/inventory/{id}/` | GET, PATCH | Get/update inventory |
| `/api/clinic/inventory/alerts/` | GET | Low stock alerts |
| `/api/clinic/billing/` | GET | Billing overview |
| `/api/clinic/billing/invoices/` | GET | List invoices |
| `/api/clinic/reports/revenue/` | GET | Revenue analytics |
| `/api/clinic/reports/attendance/` | GET | Attendance analytics |
| `/api/clinic/patients/{id}/history/` | GET | Patient history |
| `/api/clinic/feedback/` | GET | Patient feedback |

## Admin Panel Features

### Enhanced List Views
- Color-coded status badges
- Computed fields (pending amounts, stock status)
- Quick filters and search
- Date hierarchies for time-based navigation

### Bulk Actions
- Mark appointments as completed
- Mark appointments as no-show
- Mark appointments as checked-in

### Inline Editing
- Daily Sessions within Treatment Plans
- Doctors and Therapists within Centers
- Attendance records within Therapists

## Clinic Footer

The clinic name is dynamically retrieved from the database:
- Dashboard API returns `clinic_name` from the associated Center
- If user is therapist/doctor, uses their center's name
- Default: "AyushCare Clinic" if no center associated

## Common Issues & Solutions

### Issue: Migrations fail
**Solution**: Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: Admin Panel shows 404
**Solution**: Check that models are registered in admin.py files

### Issue: Dashboard returns empty data
**Solution**: 
1. Verify data exists in database
2. Check date filters (today's date)
3. Ensure proper authentication

### Issue: Inventory alerts not showing
**Solution**: 
1. Check `min_stock_level` is set
2. Verify `current_stock <= min_stock_level`
3. Check `is_active = True`

## Next Steps

1. **Frontend Integration**: Connect React frontend to dashboard APIs
2. **Real-time Updates**: Add WebSocket support for live updates
3. **Notifications**: Integrate with notification system for alerts
4. **Reports**: Add PDF/Excel export functionality
5. **Analytics**: Add charts and graphs for visualizations

## Production Deployment

Before deploying:
1. Set `DEBUG = False` in settings.py
2. Configure proper database (MySQL/PostgreSQL)
3. Set up Redis for caching (if using)
4. Configure email backend for notifications
5. Set up static file serving
6. Configure CORS for frontend domain
7. Set up SSL/HTTPS

---

**System is production-ready and follows Django best practices!**

