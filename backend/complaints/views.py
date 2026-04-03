from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied

from config.api import success_response
from .models import Complaint
from .permissions import IsAdminRole, IsOwnerOrAdmin
from .serializers import ComplaintSerializer, ComplaintStatusUpdateSerializer


class ComplaintCreateView(generics.CreateAPIView):
    """
    POST /api/complaints/
    Create a complaint for the logged-in user.
    """

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            "Complaint created successfully.",
            serializer.data,
            status_code=status.HTTP_201_CREATED,
        )


class UserComplaintListView(generics.ListAPIView):
    """
    GET /api/complaints/my/
    List complaints created by logged-in user.
    Supports filters:
    - status
    - category
    - search (title, description)
    """

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Complaint.objects.filter(user=self.request.user)
        status_param = self.request.query_params.get("status")
        category_param = self.request.query_params.get("category")
        search_param = self.request.query_params.get("search")
        priority_param = self.request.query_params.get("priority")

        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        if priority_param:
            queryset = queryset.filter(priority=priority_param)
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param)
                | Q(description__icontains=search_param)
            )
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return success_response("Complaints fetched successfully.", serializer.data)


class AdminComplaintListView(generics.ListAPIView):
    """
    GET /api/complaints/admin/
    Admin-only list of all complaints.
    Supports filters:
    - status
    - category
    - search (title, description)
    """

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Complaint.objects.select_related("user").all()
        status_param = self.request.query_params.get("status")
        category_param = self.request.query_params.get("category")
        search_param = self.request.query_params.get("search")
        priority_param = self.request.query_params.get("priority")

        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        if priority_param:
            queryset = queryset.filter(priority=priority_param)
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param)
                | Q(description__icontains=search_param)
            )
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return success_response("Complaints fetched successfully.", serializer.data)


class AdminComplaintStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/complaints/<id>/status/
    Admin-only status update.
    """

    serializer_class = ComplaintStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = Complaint.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            "Complaint status updated successfully.",
            serializer.data,
            status_code=status.HTTP_200_OK,
        )


class ComplaintDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/complaints/<id>/
    Owner can delete own complaint while status is pending. Admin can delete any.
    """

    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    queryset = Complaint.objects.all()

    def perform_destroy(self, instance):
        user = self.request.user
        if getattr(user, "role", None) != "admin" and instance.status != "pending":
            raise PermissionDenied("You can only delete complaints that are still pending.")
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return success_response(
            "Complaint deleted successfully.",
            [],
            status_code=status.HTTP_200_OK,
        )


class AdminSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status="pending").count()
        in_progress = Complaint.objects.filter(status="in_progress").count()
        resolved = Complaint.objects.filter(status="resolved").count()
        return success_response(
            "Complaint summary fetched successfully.",
            {
                "total": total,
                "pending": pending,
                "in_progress": in_progress,
                "resolved": resolved,
            },
            status_code=status.HTTP_200_OK,
        )


class ComplaintDashboardView(generics.GenericAPIView):
    """
    GET /api/complaints/dashboard/
    Dashboard stats for frontend cards.
    - Admin: all complaints
    - User: own complaints
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = Complaint.objects.all()
        if request.user.role != "admin":
            queryset = queryset.filter(user=request.user)

        # Single aggregate query for efficiency
        stats = queryset.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status="pending")),
            resolved=Count("id", filter=Q(status="resolved")),
        )

        return success_response(
            "Dashboard stats fetched successfully.",
            {
                "total": stats["total"] or 0,
                "pending": stats["pending"] or 0,
                "resolved": stats["resolved"] or 0,
            },
            status_code=status.HTTP_200_OK,
        )
