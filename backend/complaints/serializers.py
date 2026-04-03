from rest_framework import serializers

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    image_url = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)

    class Meta:
        model = Complaint
        fields = (
            "id",
            "user",
            "title",
            "category",
            "category_display",
            "priority",
            "priority_display",
            "description",
            "image",
            "image_url",
            "status",
            "status_display",
            "created_at",
        )
        read_only_fields = ("status", "created_at")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ComplaintStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ("status",)

    def validate_status(self, value):
        allowed = {"pending", "resolved"}
        if value not in allowed:
            raise serializers.ValidationError("Status must be 'pending' or 'resolved'.")
        return value
