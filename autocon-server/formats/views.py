from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import UserProfile

from .models import FormatoTecnico, FormularioInstancia, ImagenFormulario
from .serializers import (
    FormatoTecnicoSerializer,
    FormularioInstanciaSerializer,
    ImagenFormularioSerializer,
)


def _is_present(value):
    if value is None:
        return False
    if isinstance(value, str):
        return value.strip() != ""
    if isinstance(value, list):
        return len(value) > 0
    return True


def _is_field_completed(campo, value):
    tipo = campo.get("tipo")

    if tipo in ["texto", "fecha", "numero", "seleccion", "aprobacion"]:
        return _is_present(value)

    if tipo == "aprobacion_doble":
        if not isinstance(value, dict):
            return False
        revisiones = value.get("revisiones", []) or []
        primera = revisiones[0] if len(revisiones) > 0 else None
        segunda = revisiones[1] if len(revisiones) > 1 else None
        if primera not in [True, False] or segunda not in [True, False]:
            return False
        if campo.get("observacion", False) and not _is_present(
            value.get("observacion")
        ):
            return False
        return True

    if tipo == "aprobacion_con_fecha":
        if not isinstance(value, dict):
            return False
        if value.get("conforme") not in [True, False]:
            return False
        if not _is_present(value.get("fecha")):
            return False
        if campo.get("observacion", False) and not _is_present(
            value.get("observacion")
        ):
            return False
        return True

    if tipo == "novedad":
        if not isinstance(value, dict):
            return False
        return (
            _is_present(value.get("de"))
            and _is_present(value.get("a"))
            and _is_present(value.get("observacion"))
        )

    if tipo == "no_conformidad":
        if not isinstance(value, dict):
            return False
        return _is_present(value.get("item")) and _is_present(value.get("solucion"))

    return _is_present(value)


def _validate_required_fields(schema, datos):
    errors = []
    secciones = schema.get("secciones", []) if isinstance(schema, dict) else []

    for seccion in secciones:
        for campo in seccion.get("campos", []):
            campo_id = campo.get("id")
            label = campo.get("label", campo_id)
            value = datos.get(campo_id)

            if not _is_field_completed(campo, value):
                errors.append(f"{label}: campo obligatorio")

    firmas = schema.get("firmas", []) if isinstance(schema, dict) else []
    firmas_data = datos.get("__firmas", {}) if isinstance(datos, dict) else {}
    if not isinstance(firmas_data, dict):
        firmas_data = {}

    for firma in firmas:
        firma_id = firma.get("id")
        firma_label = firma.get("label", firma_id)
        firma_value = firmas_data.get(firma_id)
        if not _is_present(firma_value):
            errors.append(f"{firma_label}: firma obligatoria")

    return errors


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
    profile = getattr(request.user, "profile", None)
    if not profile or profile.role != UserProfile.SUPERVISOR_TECNICO:
        return Response(
            {"detail": "Solo los supervisores pueden diligenciar formatos"},
            status=status.HTTP_403_FORBIDDEN,
        )

    estado = request.data.get("estado", FormularioInstancia.BORRADOR)
    formato_id = request.data.get("formato")
    datos = request.data.get("datos") or {}

    if estado == FormularioInstancia.ENVIADO:
        try:
            formato = FormatoTecnico.objects.get(pk=formato_id, activo=True)
        except FormatoTecnico.DoesNotExist:
            return Response(
                {"detail": "Formato no encontrado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validation_errors = _validate_required_fields(formato.schema, datos)
        if validation_errors:
            return Response(
                {
                    "detail": "Hay campos obligatorios sin diligenciar",
                    "errors": validation_errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        FormularioInstancia.objects.filter(usuario=request.user)
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
        FormularioInstancia.objects.filter(usuario=request.user)
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
    profile = getattr(request.user, "profile", None)
    if not profile or profile.role != UserProfile.SUPERVISOR_TECNICO:
        return Response(
            {"detail": "Solo los supervisores pueden modificar formatos"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        instancia = FormularioInstancia.objects.get(pk=pk, usuario=request.user)
    except FormularioInstancia.DoesNotExist:
        return Response(
            {"error": "Instancia no encontrada"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = FormularioInstanciaSerializer(instancia)
        data = serializer.data
        data["imagenes"] = ImagenFormularioSerializer(
            instancia.imagenes.all(), many=True, context={"request": request}
        ).data
        return Response(data)

    elif request.method == "PUT":
        # Extraemos los campos permitidos para actualizar
        datos = request.data.get("datos", instancia.datos)
        estado = request.data.get("estado", instancia.estado)

        if estado == FormularioInstancia.ENVIADO:
            validation_errors = _validate_required_fields(
                instancia.formato.schema,
                datos,
            )
            if validation_errors:
                return Response(
                    {
                        "detail": "Hay campos obligatorios sin diligenciar",
                        "errors": validation_errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        instancia.datos = datos
        instancia.estado = estado
        instancia.save()

        serializer = FormularioInstanciaSerializer(instancia)
        return Response(serializer.data)

    elif request.method == "DELETE":
        instancia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Imágenes de instancias ────────────────────────────────────────


def _get_instancia_for_images(request, instancia_pk):
    """Helper: valida permisos y retorna la instancia o una Response de error."""
    profile = getattr(request.user, "profile", None)
    if not profile or profile.role != UserProfile.SUPERVISOR_TECNICO:
        return Response(
            {"detail": "Solo los supervisores pueden gestionar imágenes"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        return FormularioInstancia.objects.get(pk=instancia_pk, usuario=request.user)
    except FormularioInstancia.DoesNotExist:
        return Response(
            {"detail": "Formulario no encontrado"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def subir_imagenes(request, instancia_pk):
    """Sube una o varias imágenes y las asocia a la instancia indicada."""
    result = _get_instancia_for_images(request, instancia_pk)
    if isinstance(result, Response):
        return result
    instancia = result

    archivos = request.FILES.getlist("imagenes")
    if not archivos:
        return Response(
            {"detail": "No se enviaron imágenes."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validar límite de cantidad
    cantidad_actual = instancia.imagenes.count()
    if cantidad_actual + len(archivos) > ImagenFormulario.MAX_IMAGES_PER_INSTANCE:
        disponibles = ImagenFormulario.MAX_IMAGES_PER_INSTANCE - cantidad_actual
        return Response(
            {
                "detail": (
                    f"Se alcanzó el límite máximo de "
                    f"{ImagenFormulario.MAX_IMAGES_PER_INSTANCE} imágenes por formulario. "
                    f"Puedes agregar {disponibles} más."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validar cada archivo individualmente
    for archivo in archivos:
        # Validar tipo MIME
        if archivo.content_type not in ImagenFormulario.ALLOWED_TYPES:
            return Response(
                {
                    "detail": (
                        f'Formato no permitido en "{archivo.name}". '
                        f"Solo se aceptan JPG y PNG."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar tamaño
        if archivo.size > ImagenFormulario.MAX_FILE_SIZE:
            max_mb = ImagenFormulario.MAX_FILE_SIZE // (1024 * 1024)
            return Response(
                {
                    "detail": (
                        f'La imagen "{archivo.name}" excede el tamaño '
                        f"máximo de {max_mb}MB."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # Crear los registros
    creadas = []
    for archivo in archivos:
        img = ImagenFormulario.objects.create(
            instancia=instancia,
            imagen=archivo,
            nombre_original=archivo.name,
            tamano=archivo.size,
        )
        creadas.append(img)

    serializer = ImagenFormularioSerializer(
        creadas, many=True, context={"request": request}
    )
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def eliminar_imagen(request, instancia_pk, imagen_pk):
    """Elimina una imagen específica de una instancia."""
    result = _get_instancia_for_images(request, instancia_pk)
    if isinstance(result, Response):
        return result
    instancia = result

    try:
        imagen = instancia.imagenes.get(pk=imagen_pk)
    except ImagenFormulario.DoesNotExist:
        return Response(
            {"detail": "Imagen no encontrada."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Eliminar archivo físico del disco
    if imagen.imagen:
        imagen.imagen.delete(save=False)

    imagen.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
