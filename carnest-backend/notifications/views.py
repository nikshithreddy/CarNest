from rest_framework import viewsets
from .models import Notify
from .serializers import NotifySerializer

class NotifyViewSet(viewsets.ModelViewSet):
    queryset = Notify.objects.all()
    serializer_class = NotifySerializer
