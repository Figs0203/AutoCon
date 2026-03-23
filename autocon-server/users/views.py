from django.contrib.auth.models import User
from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from formats.models import FormularioInstancia

from .models import UserProfile
from .serializers import LoginSerializer, RegisterSerializer


@api_view(["GET"])
def test_users(request):
    return Response({"message": "Backend conectado correctamente 🚀"})


@api_view(["POST"])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.save()
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.validated_data["result"], status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    profile = getattr(request.user, "profile", None)
    role = profile.role if profile else None
    return Response(
        {
            "id": request.user.id,
            "email": request.user.email,
            "role": role,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def socios_dashboard(request):
    profile = getattr(request.user, "profile", None)
    role = profile.role if profile else None

    if role != UserProfile.SOCIOS:
        return Response(
            {"detail": "Solo disponible para usuarios socios"},
            status=status.HTTP_403_FORBIDDEN,
        )

    supervisores = User.objects.filter(
        profile__role=UserProfile.SUPERVISOR_TECNICO
    ).order_by("email")

    supervisor_ids = list(supervisores.values_list("id", flat=True))

    counts_by_user = {
        row["usuario"]: row["total"]
        for row in (
            FormularioInstancia.objects.filter(usuario_id__in=supervisor_ids)
            .values("usuario")
            .annotate(total=Count("id"))
        )
    }

    supervisores_data = []
    for supervisor in supervisores:
        full_name = f"{supervisor.first_name} {supervisor.last_name}".strip()
        nombre = full_name or supervisor.email
        supervisores_data.append(
            {
                "id": supervisor.id,
                "nombre": nombre,
                "email": supervisor.email,
                "formatos_diligenciados": counts_by_user.get(supervisor.id, 0),
            }
        )

    ahora = timezone.now()
    inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    qs = FormularioInstancia.objects.filter(usuario_id__in=supervisor_ids)

    resumen = {
        "total_supervisores": supervisores.count(),
        "total_formatos_diligenciados": qs.count(),
        "formatos_enviados": qs.filter(estado=FormularioInstancia.ENVIADO).count(),
        "formatos_borrador": qs.filter(estado=FormularioInstancia.BORRADOR).count(),
        "formatos_este_mes": qs.filter(fecha__gte=inicio_mes).count(),
    }

    return Response(
        {
            "resumen": resumen,
            "supervisores": supervisores_data,
        },
        status=status.HTTP_200_OK,
    )
