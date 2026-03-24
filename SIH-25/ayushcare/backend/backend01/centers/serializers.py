from rest_framework import serializers
from clinic.models import Center


class CenterSerializer(serializers.ModelSerializer):
    coordinates = serializers.SerializerMethodField()
    specialties = serializers.ListField(child=serializers.CharField(), default=list)

    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()

    class Meta:
        model = Center
        fields = "__all__"

    def get_coordinates(self, obj):
        return {
            "lat": obj.latitude,
            "lng": obj.longitude,
        }

    def get_image1_url(self, obj):
        if obj.image1:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image1.url) if request else obj.image1.url
        return None

    def get_image2_url(self, obj):
        if obj.image2:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image2.url) if request else obj.image2.url
        return None
