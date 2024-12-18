from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.serializers import  UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer, UserChangePasswordSerializer, SendPasswordResetEmailSerializer, UserPasswordResetSerializer, ConversationSerializer, MessageSerializer
# from users.serializers import UserLoginSerializer, 
from django.contrib.auth import authenticate
from users.renderers import UserRenderer
from users.models import User, Conversation, Message
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

# Generate Token Manually
def get_tokens_for_user(user):
  refresh = RefreshToken.for_user(user)
  return {
      'refresh': str(refresh),
      'access': str(refresh.access_token),
  }

class UserRegistrationView(APIView):
  renderer_classes = [UserRenderer]
  def post(self, request, format=None):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token = get_tokens_for_user(user)
    return Response({'token':token, 'msg':'Registration Successful'}, status=status.HTTP_201_CREATED)
  
class UserLoginView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.data.get('email')
        password = serializer.data.get('password')
        user = authenticate(email=email, password=password)
        if user is not None:
            token = get_tokens_for_user(user)
            return Response({'token':token, 'msg':'Login Success'}, status=status.HTTP_200_OK)
        else:
            return Response({'errors':{'non_field_errors':['Email or Password is not Valid']}}, status=status.HTTP_404_NOT_FOUND)
        
class UserProfileView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, user_id=None, format=None):
        user = self.get_user(user_id) if user_id else request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_id=None, format=None):
        user = self.get_user(user_id) if user_id else request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GovernmentIDTypesView(APIView):
    def get(self, request, format=None):
        id_types = ["SSN", "Driver's License", "Passport"]
        return Response(id_types, status=status.HTTP_200_OK)
    
class UserChangePasswordView(APIView):
  renderer_classes = [UserRenderer]
  permission_classes = [IsAuthenticated]
  def post(self, request, format=None):
    serializer = UserChangePasswordSerializer(data=request.data, context={'user':request.user})
    serializer.is_valid(raise_exception=True)
    return Response({'msg':'Password Changed Successfully'}, status=status.HTTP_200_OK)
  
class SendPasswordResetEmailView(APIView):
  renderer_classes = [UserRenderer]
  def post(self, request, format=None):
    serializer = SendPasswordResetEmailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response({'msg':'Password Reset link send. Please check your Email'}, status=status.HTTP_200_OK)

class UserPasswordResetView(APIView):
  renderer_classes = [UserRenderer]
  def post(self, request, uid, token, format=None):
    serializer = UserPasswordResetSerializer(data=request.data, context={'uid':uid, 'token':token})
    serializer.is_valid(raise_exception=True)
    return Response({'msg':'Password Reset Successfully'}, status=status.HTTP_200_OK)

class GetAllUsersView(APIView):
    """
    API View to retrieve all users.
    Only accessible by admin users.
    """
    permission_classes = [IsAuthenticated]  # You can modify this if needed

    def get(self, request, format=None):
        # from users.models import User 
        # from users.serializers import UserProfileSerializer

        # if not request.user.is_admin:  # Restrict access to admin users
        #     return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return conversations where the authenticated user is a participant.
        """
        user = self.request.user
        return Conversation.objects.filter(participants=user)

    def perform_create(self, serializer):
        serializer.save()



# Message ModelViewSet
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to filter messages by conversation ID.
        """
        conversation_id = self.kwargs.get('conversation_id') or self.request.query_params.get('conversation')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id)
        return Message.objects.all()
    def list(self, request, *args, **kwargs):
        """
        Return a custom response with conversation ID, message count, and the messages.
        """
        queryset = self.get_queryset()
        conversation_id = self.kwargs.get('conversation_id') or self.request.query_params.get('conversation')
        
        if not conversation_id:
            return Response({'error': 'Conversation ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the total count of messages in this conversation
        message_count = queryset.count()
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        participants = conversation.participants.exclude(id=request.user.id)
        participants_names = [f"{participant.first_name} {participant.last_name}" for participant in participants]
        # Serialize the messages
        serializer = self.get_serializer(queryset, many=True)
        
        # Structure the response
        return Response({
            'conversation_id': conversation_id,
            'message_count': message_count,
            'participants': participants_names,
            'result': serializer.data
        })
    def perform_create(self, serializer):
        """
        Custom logic to create a message under a specified conversation.
        """
        conversation_id = self.kwargs.get('conversation_id')
        if not conversation_id:
            return Response({'error': 'Conversation ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the conversation object
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Save the message with the sender and the conversation
        serializer.save(sender=self.request.user, conversation=conversation)