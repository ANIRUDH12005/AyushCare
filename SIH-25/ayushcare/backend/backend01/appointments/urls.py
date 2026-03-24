from django.urls import path
from .views import (
    AppointmentCreateView,
    UserAppointmentsListView,
    AppointmentCancelView,
    DoctorsByCenterView,
    AppointmentDetailView,
)

urlpatterns = [
    path("create/", AppointmentCreateView.as_view()),
    path("my/", UserAppointmentsListView.as_view()),

    path("<int:pk>/", AppointmentDetailView.as_view()),

    path("cancel/<int:id>/", AppointmentCancelView.as_view()),
    path(
        "center/<int:center_id>/doctors/",
        DoctorsByCenterView.as_view(),
    ),
]
