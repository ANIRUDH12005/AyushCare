# progress/urls.py
from django.urls import path
from .views import (
    ProgressEntryCreateView,
    UserProgressListView,
    ProgressSummaryView,
    can_submit_progress,
)

urlpatterns = [
    path("create/", ProgressEntryCreateView.as_view(), name="progress-create"),
    path("my/", UserProgressListView.as_view(), name="progress-list"),
    path("summary/", ProgressSummaryView.as_view(), name="progress-summary"),
    path("can-submit/", can_submit_progress, name="can-submit-progress"),
]

