# your_app_name/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/booking/(?P<booking_id>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
]
