from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import RegisterSerializer, LoginSerializer

@api_view(['GET'])
def test_users(request):
    return Response({"message": "Backend conectado correctamente 🚀"})


@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.save()
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.validated_data['result'], status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    profile = getattr(request.user, 'profile', None)
    role = profile.role if profile else None
    return Response(
        {
            'id': request.user.id,
            'email': request.user.email,
            'role': role,
        },
        status=status.HTTP_200_OK,
    )

