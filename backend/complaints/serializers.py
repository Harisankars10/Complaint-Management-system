from rest_framework import serializers

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = (
            "id",
            "user",
            "title",
            "description",
            "image",
            "image_url",
            "status",
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
