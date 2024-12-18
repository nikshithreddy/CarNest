
from rest_framework.routers import DefaultRouter
from .views import RidesViewSet

router = DefaultRouter()

router.register(r'', RidesViewSet, basename='rides')

urlpatterns = router.urls
