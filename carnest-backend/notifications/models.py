from django.db import models
from rides.models import Ride
from users.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

def get_default_content_type(model):
    if model:
        return ContentType.objects.get_for_model(model)
    else:
        return ContentType.objects.get_for_model(Ride)

class Notification(models.Model):
    content_type = models.ForeignKey(
        ContentType, 
        on_delete=models.CASCADE, 
        default=get_default_content_type
    )
    object_id = models.UUIDField() # Ride ID
    content_object = GenericForeignKey('content_type', 'object_id')

    subject = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    to = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.subject

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
