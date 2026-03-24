# centers/urls.py
from django.urls import path
from .views import CenterListView, CenterDetailView

urlpatterns = [
    path("", CenterListView.as_view(), name="centers-list"),
    path("<int:pk>/", CenterDetailView.as_view(), name="center-detail"),
]
