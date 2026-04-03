from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Complaint
from .permissions import IsAdminRole
from .serializers import ComplaintSerializer, ComplaintStatusUpdateSerializer


class ComplaintCreateView(generics.CreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user)


class AdminComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = Complaint.objects.select_related("user").all()


class AdminComplaintStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ComplaintStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = Complaint.objects.all()


class AdminSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status="pending").count()
        in_progress = Complaint.objects.filter(status="in_progress").count()
        resolved = Complaint.objects.filter(status="resolved").count()
        return Response(
            {
                "total": total,
                "pending": pending,
                "in_progress": in_progress,
                "resolved": resolved,
            }
        )
