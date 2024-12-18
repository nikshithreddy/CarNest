from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Notify

class NotifySerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        slug_field='model',
        queryset=ContentType.objects.all()
    )
    
    class Meta:
        model = Notify
        fields = ['id', 'content_type', 'object_id', 'subject', 'message', 'read']

    def create(self, validated_data):
        return Notify.objects.create(**validated_data)
