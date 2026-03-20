from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import FormatoTecnico, FormularioInstancia
from .serializers import FormatoTecnicoSerializer, FormularioInstanciaSerializer


# ── Formatos (plantillas) ──────────────────────────────────────────

@api_view(["GET"])
def lista_formatos(request):
    formatos = FormatoTecnico.objects.filter(activo=True)
    serializer = FormatoTecnicoSerializer(formatos, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def detalle_formato(request, pk):
    try:
        formato = FormatoTecnico.objects.get(pk=pk, activo=True)
        serializer = FormatoTecnicoSerializer(formato)
        return Response(serializer.data)
    except FormatoTecnico.DoesNotExist:
        return Response(
            {"error": "Formato no encontrado"},
            status=status.HTTP_404_NOT_FOUND,
        )


# ── Formularios (instancias) ──────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def guardar_formulario(request):
    serializer = FormularioInstanciaSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(usuario=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Dashboard ─────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Retorna las estadísticas para las tarjetas del dashboard."""
    ahora = timezone.now()
    inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    qs = FormularioInstancia.objects.filter(usuario=request.user)

    data = {
        "completados": qs.filter(estado=FormularioInstancia.ENVIADO).count(),
        "pendientes": qs.filter(estado=FormularioInstancia.BORRADOR).count(),
        "este_mes": qs.filter(fecha__gte=inicio_mes).count(),
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_submissions(request):
    """Retorna las 5 instancias más recientes con datos del formato asociado."""
    recientes = (
        FormularioInstancia.objects
        .filter(usuario=request.user)
        .select_related("formato")
        .order_by("-fecha")[:5]
    )

    data = [
        {
            "id": inst.id,
            "titulo": inst.formato.nombre,
            "codigo": inst.formato.codigo,
            "estado": inst.estado,
            "fecha": inst.fecha.isoformat(),
        }
        for inst in recientes
    ]
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_submissions(request):
    """Retorna todas las instancias (historial) enviadas/guardadas por el usuario."""
    envios = (
        FormularioInstancia.objects
        .filter(usuario=request.user)
        .select_related("formato")
        .order_by("-fecha")
    )

    data = [
        {
            "id": inst.id,
            "titulo": inst.formato.nombre,
            "codigo": inst.formato.codigo,
            "estado": inst.estado,
            "fecha": inst.fecha.isoformat(),
        }
        for inst in envios
    ]
    return Response(data)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def detalle_instancia(request, pk):
    """Obtiene una instancia existente o la actualiza (datos y estado), o la elimina."""
    try:
        instancia = FormularioInstancia.objects.get(pk=pk, usuario=request.user)
    except FormularioInstancia.DoesNotExist:
        return Response({"error": "Instancia no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = FormularioInstanciaSerializer(instancia)
        return Response(serializer.data)

    elif request.method == "PUT":
        # Extraemos los campos permitidos para actualizar
        datos = request.data.get("datos", instancia.datos)
        estado = request.data.get("estado", instancia.estado)

        instancia.datos = datos
        instancia.estado = estado
        instancia.save()

        serializer = FormularioInstanciaSerializer(instancia)
        return Response(serializer.data)
        
    elif request.method == "DELETE":
        instancia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
