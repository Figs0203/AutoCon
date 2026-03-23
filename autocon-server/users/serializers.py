from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import UserProfile

CORPORATE_EMAIL_ERROR = "Solo se permiten correos @tipinterventoria.com"


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)

    def validate_email(self, value):
        email = value.strip().lower()
        if not email.endswith("@tipinterventoria.com"):
            raise serializers.ValidationError(CORPORATE_EMAIL_ERROR)
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Este correo ya esta registrado")
        return email

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        role = validated_data["role"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )
        UserProfile.objects.create(user=user, role=role)
        token, _ = Token.objects.get_or_create(user=user)

        return {
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": role,
            },
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        if not email.endswith("@tipinterventoria.com"):
            raise serializers.ValidationError(CORPORATE_EMAIL_ERROR)

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Credenciales invalidas")

        profile = getattr(user, "profile", None)
        if not profile:
            raise serializers.ValidationError("Usuario sin perfil de rol")

        token, _ = Token.objects.get_or_create(user=user)
        attrs["result"] = {
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": profile.role,
            },
        }
        return attrs
