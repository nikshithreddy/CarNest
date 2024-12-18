from rest_framework import serializers
from users.models import User, Conversation, Message
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from users.utils import Util
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    # We are writing this becoz we need confirm password field in our Registratin Request
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "password",
            "password2",
            "terms_and_conditions_accepted",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    # Validating Password and Confirm Password while Registration
    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password doesn't match"
            )
        return attrs

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = User
        fields = ["email", "password"]


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "date_of_birth",
            "government_id_type",
            "government_id_number",
            "profile_picture",
            "created_at",
            "addressLat",
            "addressLng",
            "address",
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        government_id_type = attrs.get("government_id_type")
        government_id_number = attrs.get("government_id_number")

        # Validate only if government_id_type is provided
        if government_id_type:
            valid_types = ["SSN", "Driver's License", "Passport"]

            if government_id_type not in valid_types:
                raise serializers.ValidationError(
                    {
                        "government_id_type": f"Invalid government ID type. Valid types are: {', '.join(valid_types)}."
                    }
                )

            if not government_id_number:
                raise serializers.ValidationError(
                    {
                        "government_id_number": "Government ID number is required for USA ID types."
                    }
                )

            # Validate SSN format
            if government_id_type == "SSN" and not re.match(
                r"^\d{3}-\d{2}-\d{4}$", government_id_number
            ):
                raise serializers.ValidationError(
                    {"government_id_number": "Invalid SSN format. Use XXX-XX-XXXX."}
                )

            # Validate Driver's License format (alphanumeric check)
            if government_id_type == "Driver's License" and not re.match(r'^[A-Z0-9]{1,9}$', government_id_number, re.IGNORECASE):
                raise serializers.ValidationError({
                  'government_id_number': "Invalid Driver's License format. Use 1 to 9 alphanumeric characters."
                })

            # Validate Passport format (alphanumeric, length between 6 and 9)
            if government_id_type == "Passport" and not re.match(
                r"^[A-Z0-9]{6,9}$", government_id_number
            ):
                raise serializers.ValidationError(
                    {
                        "government_id_number": "Invalid Passport format. Use 6 to 9 uppercase letters and digits."
                    }
                )

        return attrs

    def validate_profile_picture(self, value):
        if value.size > 2 * 1024 * 1024:  # 2MB limit
            raise serializers.ValidationError("Profile picture must be less than 2MB.")
        return value


class UserChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    password2 = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        user = self.context.get("user")
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password doesn't match"
            )
        user.set_password(password)
        user.save()
        return attrs


class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ["email"]

    def validate(self, attrs):
        email = attrs.get("email")
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            print("Encoded UID", uid)
            token = PasswordResetTokenGenerator().make_token(user)
            print("Password Reset Token", token)
            link = "https://carnest.xyz/api/user/reset/" + uid + "/" + token
            print("Password Reset Link", link)
            # Send EMail
            body = "Click Following Link to Reset Your Password " + link
            data = {
                "subject": "Reset Your Password from carnest-fullstack",
                "body": body,
                "to_email": user.email,
            }
            Util.send_email(data)
            return attrs
        else:
            raise serializers.ValidationError("You are not a Registered User")


class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    password2 = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        try:
            password = attrs.get("password")
            password2 = attrs.get("password2")
            uid = self.context.get("uid")
            token = self.context.get("token")
            if password != password2:
                raise serializers.ValidationError(
                    "Password and Confirm Password doesn't match"
                )
            id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("Token is not Valid or Expired")
            user.set_password(password)
            user.save()
            return attrs
        except DjangoUnicodeDecodeError as identifier:
            PasswordResetTokenGenerator().check_token(user, token)
            raise serializers.ValidationError("Token is not Valid or Expired")


class ConversationSerializer(serializers.ModelSerializer):
    second_participant_name = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "participants", "created_at", "second_participant_name"]
        read_only_fields = ["created_at", "participants"]

    def create(self, validated_data):
        user = self.context["request"].user
        second_user_id = self.context["request"].data.get("second_user_id")
        if not second_user_id:
            raise serializers.ValidationError(
                {"second_user_id": "This field is required."}
            )
        try:
            second_user = User.objects.get(id=second_user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"second_user_id": "The second user does not exist."}
            )
        conversation = Conversation.objects.create()
        conversation.participants.set([user, second_user])
        return conversation

    def get_second_participant_name(self, obj):
        user = self.context["request"].user
        if obj.participants.count() < 2:
            return None
        second_participant = obj.participants.exclude(id=user.id).first()

        if second_participant:
            return f"{second_participant.first_name} {second_participant.last_name}"
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["conversation", "sender", "created_at"]

    def get_sender_name(self, obj):
        return obj.sender.first_name + " " + obj.sender.last_name
