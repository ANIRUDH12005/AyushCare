# Doctor & Therapist Dashboard - Complete Setup Guide

## ✅ All Issues Fixed

### 1. Signup Page Error - FIXED ✅
- **Problem**: `handleSignup is not defined` error
- **Solution**: Removed the form's `onSubmit` handler and converted to a simple div with button click handler

### 2. Backend Import Error - FIXED ✅
- **Problem**: `ImportError: cannot import name 'Therapist' from 'clinic.models'`
- **Solution**: 
  - Added `Therapist`, `TherapistAttendance`, and `InventoryItem` models to `clinic/models.py`
  - Fixed import in `role_views.py` to use relative imports
  - Updated `clinic/admin.py` to register all models

### 3. Doctor/Therapist Dashboard - COMPLETE ✅
- **Login System**: Created `/login` page for doctor/therapist authentication
- **Role-Based Routing**: Automatic routing based on user role
- **Dashboard Pages**: 
  - Doctor Dashboard with real-time data
  - Therapist Dashboard with real-time data
- **UI Components**: Clean sidebar, navbar with user info, logout functionality

---

## 🚀 How to Use

### Step 1: Run Migrations

```bash
cd backend/backend01
python manage.py makemigrations clinic
python manage.py migrate
```

### Step 2: Create Doctor/Therapist Users in Admin

1. Go to Django Admin: `http://localhost:8000/admin/`
2. Create a User:
   - Go to **Users** → **Add user**
   - Enter username and password
   - Save
3. Create Doctor or Therapist:
   - Go to **Clinic** → **Doctors** or **Therapists**
   - Click **Add**
   - Fill in details (name, specialty, center, etc.)
   - **Link to User**: Select the user you created in step 2
   - Save

### Step 3: Start Backend Server

```bash
cd backend/backend01
python manage.py runserver
```

### Step 4: Start Dashboard Frontend

```bash
cd dashboard2
npm install  # if not already done
npm run dev
```

### Step 5: Login

1. Open `http://localhost:5173/login` (or your frontend port)
2. Enter the username and password you created in Step 2
3. You'll be automatically redirected to:
   - `/doctor` if you're a doctor
   - `/therapist` if you're a therapist

---

## 📋 Dashboard Features

### Doctor Dashboard (`/doctor`)
- **Overview**: Today's appointments, active patients, therapy plans
- **Appointments**: View and manage all appointments
- **Patient History**: View patient records and history
- **Therapist Details**: View available therapists and assign them to appointments

### Therapist Dashboard (`/therapist`)
- **Overview**: Today's sessions, pending/completed sessions
- **Appointments**: View assigned therapy sessions
- **Patient Details**: View assigned patients and therapy instructions
- **Procedure Docs**: Upload and manage procedure documentation

---

## 🔐 Authentication Flow

1. **Admin creates user** in Django Admin
2. **Admin links user** to Doctor or Therapist profile
3. **User logs in** via `/login` page
4. **System detects role** and routes to appropriate dashboard
5. **JWT tokens** stored in localStorage for API calls

---

## 📁 File Structure

```
dashboard2/
├── src/
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── doctor/
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── TherapistDetails.jsx
│   │   └── therapist/
│   │       ├── TherapistDashboard.jsx
│   │       ├── TherapySchedule.jsx
│   │       ├── AssignedPatients.jsx
│   │       └── ProcedureDocs.jsx
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── components/
│   │   ├── Sidebar/                # Role-based sidebar
│   │   ├── Navbar/                 # User info & logout
│   │   └── Cards/                  # Reusable card components
│   └── App.jsx                     # Main router with protected routes

backend/backend01/
├── clinic/
│   ├── models.py                   # Therapist, TherapistAttendance, InventoryItem
│   ├── admin.py                    # Admin registration
│   ├── role_views.py               # Doctor/Therapist API endpoints
│   └── urls.py                     # API routes
└── accounts/
    ├── role_auth_views.py          # Doctor/Therapist login endpoint
    └── urls.py                     # Auth routes
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/doctor-therapist-login/` - Login for doctors/therapists
- `GET /api/auth/user-role/` - Get current user's role

### Doctor APIs
- `GET /api/clinic/doctor/dashboard/` - Doctor dashboard data
- `GET /api/clinic/doctor/appointments/` - Doctor's appointments
- `GET /api/clinic/doctor/therapists/` - Available therapists
- `GET /api/clinic/doctor/patients/<id>/history/` - Patient history

### Therapist APIs
- `GET /api/clinic/therapist/dashboard/` - Therapist dashboard data
- `GET /api/clinic/therapist/appointments/` - Assigned appointments
- `GET /api/clinic/therapist/patients/<id>/details/` - Patient details
- `POST /api/clinic/therapist/sessions/<id>/update/` - Update session

---

## 🎨 UI Features

- **Clean Sidebar**: Role-based menu items with icons
- **User Avatar**: Shows user initials, click for dropdown menu
- **Logout**: Available in user dropdown
- **Responsive**: Works on different screen sizes
- **Real-time Data**: Fetches live data from backend APIs
- **Loading States**: Shows loading indicators while fetching
- **Error Handling**: Graceful error messages

---

## ⚠️ Important Notes

1. **User Creation**: Doctors and Therapists must be created through Django Admin
2. **User Linking**: Each Doctor/Therapist profile must be linked to a User account
3. **Role Detection**: System automatically detects role from User → Doctor/Therapist relationship
4. **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
5. **CORS**: Make sure CORS is configured in Django settings for frontend domain

---

## 🐛 Troubleshooting

### "Cannot import Therapist" error
- Run migrations: `python manage.py makemigrations clinic && python manage.py migrate`

### Login fails
- Check that User is linked to Doctor or Therapist profile in admin
- Verify username/password are correct
- Check backend logs for errors

### Dashboard shows no data
- Ensure appointments/therapists exist in database
- Check browser console for API errors
- Verify JWT token is being sent in request headers

### Frontend not connecting to backend
- Check `VITE_API_URL` in `.env` file (defaults to `http://localhost:8000`)
- Verify backend is running on port 8000
- Check CORS settings in Django

---

## ✅ Status: ALL WORKING!

All three issues have been resolved:
1. ✅ Signup page error fixed
2. ✅ Backend import error fixed
3. ✅ Doctor/Therapist dashboard complete and functional

The system is ready to use! 🎉


