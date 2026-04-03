from django.conf import settings
from django.db import models


class Complaint(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
    )
    CATEGORY_CHOICES = (
        ("technical", "Technical"),
        ("hostel", "Hostel"),
        ("academic", "Academic"),
        ("transport", "Transport"),
        ("other", "Other"),
    )
    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="complaints"
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="technical")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    description = models.TextField()
    image = models.ImageField(upload_to="complaints/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_response = models.TextField(blank=True, default="", help_text="Optional message visible to the user.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.status}"
