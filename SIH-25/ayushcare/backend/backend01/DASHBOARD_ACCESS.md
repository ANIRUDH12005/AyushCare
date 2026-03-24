# Clinic Dashboard - Quick Access Guide

## 🎯 Access the Dashboard

### Option 1: Direct URL (Recommended)
Simply open your browser and go to:
```
http://127.0.0.1:8000/
```
or
```
http://localhost:8000/
```

**If you're logged in as staff**, you'll automatically see the dashboard!

### Option 2: Dashboard URL
```
http://127.0.0.1:8000/dashboard/
```

## 🔐 Login Required

The dashboard requires staff access. To access:

1. **Create a staff user** (if you don't have one):
   ```bash
   python manage.py createsuperuser
   ```

2. **Or make an existing user staff**:
   - Go to `/admin/`
   - Navigate to Users
   - Edit a user
   - Check "Staff status"
   - Save

3. **Login**:
   - Go to `/admin/` and login
   - Then go to `/` or `/dashboard/`

## 📊 What You'll See

The dashboard displays:

✅ **Patient Metrics**
- Total registered patients
- Total patients visited
- Attended today
- Absent/No-show today
- Upcoming sessions

✅ **Appointment Metrics**
- Today's appointments
- Upcoming (7 days / 30 days)
- Completed appointments
- Cancelled appointments

✅ **Therapist Metrics**
- Total therapists
- Present/Absent today
- Assigned today
- Daily workload breakdown

✅ **Clinic Performance**
- Active/Completed therapy plans
- Pending sessions
- Revenue (today/week/total)

✅ **Inventory Alerts**
- Low stock items
- Out of stock items

✅ **Recent Activities**
- Recent appointments
- Recent notifications

## 🔄 Auto-Refresh

The dashboard automatically refreshes every 60 seconds to show the latest data.

You can also click the refresh button (bottom right) to manually refresh.

## 🔗 Quick Links

From the sidebar, you can:
- Access Admin Panel
- View Inventory Management
- View Billing & Invoicing
- View Feedback

All data is **real-time** and synchronized with the Django Admin Panel!

---

**Note**: Make sure you've run migrations before accessing:
```bash
python manage.py migrate
```


