from django.urls import path

from .views import (
    AdminComplaintListView,
    AdminComplaintStatusUpdateView,
    AdminSummaryView,
    ComplaintCreateView,
    UserComplaintListView,
)

urlpatterns = [
    path("create/", ComplaintCreateView.as_view(), name="complaint_create"),
    path("my/", UserComplaintListView.as_view(), name="my_complaints"),
    path("admin/all/", AdminComplaintListView.as_view(), name="admin_complaints"),
    path("admin/<int:pk>/status/", AdminComplaintStatusUpdateView.as_view(), name="admin_update_status"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin_summary"),
]
