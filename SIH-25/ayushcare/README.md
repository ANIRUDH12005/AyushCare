# AyushCare - Ayurveda Healthcare Management System

AyushCare is a comprehensive healthcare management system designed for Ayurveda and Panchakarma treatments. It streamlines patient registration, appointment scheduling, treatment tracking, and billing.

## 🌟 Features

- **Patient Management**: Detailed profiles, history tracking, and Prakriti/Vikriti analysis.
- **Appointment Scheduling**: Smart scheduling with conflict detection.
- **Treatment Plans**: Track Panchakarma therapies with phase-wise monitoring.
- **Real-time Notifications**: Instant updates via WebSocket and Firebase.
- **Billing & Invoicing**: Integrated billing system.
- **Role-based Access**: Separate portals for Doctors, Receptionists, and Patients.

## 🛠️ Tech Stack

### Backend
- **Framework**: Django REST Framework (Python)
- **Database**: MySQL (Production), SQLite (Dev)
- **Real-time**: Django Channels + Redis
- **Async Tasks**: Celery + Redis
- **Authentication**: JWT (SimpleJWT)

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context / Hooks
- **HTTP Client**: Axios

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Redis (for real-time features)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in `backend/` (or root depending on config):
   ```env
   DJANGO_SECRET_KEY=your-secret-key
   DEBUG=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **Schema**: `http://localhost:8000/api/schema/`

## 🔒 Security Note

This project uses environment variables for sensitive credentials. Ensure you have a `.env` file properly configured before running in production.
