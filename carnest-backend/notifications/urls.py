from django.urls import path
from .views import NotifyViewSet
from django.urls import include, path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("" ,NotifyViewSet,basename="notifications") 

urlpatterns = [
    path("", include(router.urls)),
]