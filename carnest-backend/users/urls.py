from rest_framework.routers import DefaultRouter
from django.urls import path
from users.views import UserRegistrationView, UserLoginView, UserProfileView, UserChangePasswordView, SendPasswordResetEmailView, UserPasswordResetView, GetAllUsersView, GovernmentIDTypesView, ConversationViewSet, MessageViewSet
router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='profile-detail'),
    path('changepassword/', UserChangePasswordView.as_view(), name='changepassword'),
    path('send-reset-password-email/', SendPasswordResetEmailView.as_view(), name='send-reset-password-email'),
    path('reset-password/<uid>/<token>/', UserPasswordResetView.as_view(), name='reset-password'),
    path('all/', GetAllUsersView.as_view(), name='get-all-users'),  # Add this line
    path('government-id-types/', GovernmentIDTypesView.as_view(), name='government-id-types'),  
    path('conversations/<int:conversation_id>/messages/', MessageViewSet.as_view({'get': 'list', 'post': 'create'}), name='conversation-messages'), 
]

urlpatterns += router.urls
