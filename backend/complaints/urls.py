from django.urls import path

from .views import (
    AdminComplaintListView,
    AdminComplaintStatusUpdateView,
    AdminSummaryView,
    ComplaintDashboardView,
    ComplaintDeleteView,
    ComplaintCreateView,
    UserComplaintListView,
)

urlpatterns = [
    path("", ComplaintCreateView.as_view(), name="complaint_create"),
    # Backward-compatible create URL used by existing frontend
    path("create/", ComplaintCreateView.as_view(), name="complaint_create_legacy"),
    path("my/", UserComplaintListView.as_view(), name="my_complaints"),
    path("admin/", AdminComplaintListView.as_view(), name="admin_complaints"),
    # Backward-compatible admin list URL
    path("admin/all/", AdminComplaintListView.as_view(), name="admin_complaints_legacy"),
    path("<int:pk>/status/", AdminComplaintStatusUpdateView.as_view(), name="update_status"),
    # Backward-compatible admin status URL
    path("admin/<int:pk>/status/", AdminComplaintStatusUpdateView.as_view(), name="admin_update_status"),
    path("<int:pk>/", ComplaintDeleteView.as_view(), name="complaint_delete"),
    path("dashboard/", ComplaintDashboardView.as_view(), name="complaint_dashboard"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin_summary"),
]
