from rest_framework.routers import DefaultRouter
from django.urls import path
from booking.views import BookingRideViewSet, Chat

router = DefaultRouter()

# Register the BookingRideViewSet
router.register(r'', BookingRideViewSet, basename='booking-ride')


urlpatterns = [
    path("chats/", Chat.as_view())
] + router.urls
