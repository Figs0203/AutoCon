import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from ..models import FormatoTecnico, FormularioInstancia, ImagenFormulario

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _isolate_media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "test-media"


def _uploaded(name, content_type, size_bytes=16):
    return SimpleUploadedFile(name, b"a" * size_bytes, content_type=content_type)


@pytest.mark.django_db
class TestImagenesFormulario:
    """
    Test relacionados a los casos de prueba para HU-04 — Anexar imágenes a formularios.
    """

    def setup_method(self):
        self.supervisor_user = User.objects.create_user(
            username="supervisor", password="pass1234"
        )
        UserProfile.objects.create(
            user=self.supervisor_user, role=UserProfile.SUPERVISOR_TECNICO
        )

        self.socio_user = User.objects.create_user(username="socio", password="pass1234")
        UserProfile.objects.create(user=self.socio_user, role=UserProfile.SOCIOS)

        self.formato = FormatoTecnico.objects.create(
            nombre="Inspeccion",
            codigo="FOR-001",
            schema={"secciones": []},
            activo=True,
        )

        self.instancia_supervisor = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.supervisor_user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

        self.instancia_socio = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.socio_user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

    def _client_for(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        return client

    # ---------------------------------------------------------------
    #  Subir imagen válida (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_subir_imagen_valida(self):
        """El sistema permite subir una imagen válida correctamente."""
        client = self._client_for(self.supervisor_user)
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"
        data = {"imagenes": _uploaded("foto.jpg", "image/jpeg")}

        response = client.post(url, data, format="multipart")

        assert response.status_code == 201
        assert isinstance(response.data, list)
        assert len(response.data) == 1
        assert "id" in response.data[0]
        assert "imagen" in response.data[0]
        assert ImagenFormulario.objects.filter(
            instancia=self.instancia_supervisor
        ).count() == 1

    # ---------------------------------------------------------------
    #  CP07 Subir varias imágenes (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_subir_varias_imagenes(self):
        """El sistema permite subir varias imágenes en un solo request."""
        client = self._client_for(self.supervisor_user)
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"
        data = {
            "imagenes": [
                _uploaded("foto1.jpg", "image/jpeg"),
                _uploaded("foto2.png", "image/png"),
            ]
        }

        response = client.post(url, data, format="multipart")

        assert response.status_code == 201
        assert len(response.data) == 2
        assert ImagenFormulario.objects.filter(
            instancia=self.instancia_supervisor
        ).count() == 2

    # ---------------------------------------------------------------
    #  Formato inválido (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_formato_invalido(self):
        """El sistema rechaza archivos con formato no permitido."""
        client = self._client_for(self.supervisor_user)
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"
        data = {"imagenes": _uploaded("archivo.pdf", "application/pdf")}

        response = client.post(url, data, format="multipart")

        assert response.status_code == 400
        assert "detail" in response.data
        assert "Formato no permitido" in str(response.data["detail"])

    # ---------------------------------------------------------------
    # CP07 — Imagen muy pesada (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_imagen_muy_pesada(self):
        """El sistema rechaza imágenes que exceden el tamaño permitido (5MB)."""
        client = self._client_for(self.supervisor_user)
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"
        data = {
            "imagenes": _uploaded(
                "grande.jpg",
                "image/jpeg",
                size_bytes=ImagenFormulario.MAX_FILE_SIZE + 1,
            )
        }

        response = client.post(url, data, format="multipart")

        assert response.status_code == 400
        assert "detail" in response.data
        assert "excede el tamaño" in str(response.data["detail"])

    # ---------------------------------------------------------------
    # CP07 — Eliminar imagen (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP07_eliminar_imagen(self):
        """El sistema permite eliminar una imagen asociada a una instancia."""
        client = self._client_for(self.supervisor_user)
        url_upload = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"
        response = client.post(
            url_upload, {"imagenes": _uploaded("foto.jpg", "image/jpeg")}, format="multipart"
        )
        assert response.status_code == 201
        imagen_id = response.data[0]["id"]

        url_delete = (
            f"/formats/submissions/{self.instancia_supervisor.pk}/images/{imagen_id}/"
        )
        response = client.delete(url_delete)

        assert response.status_code == 204
        assert ImagenFormulario.objects.filter(
            instancia=self.instancia_supervisor
        ).count() == 0

    # ---------------------------------------------------------------
    # CP07 — No autenticado (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_no_autenticado_rechazado(self):
        """El sistema rechaza la subida si el usuario no está autenticado."""
        client = APIClient()
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"

        response = client.post(
            url, {"imagenes": _uploaded("foto.jpg", "image/jpeg")}, format="multipart"
        )

        assert response.status_code == 401

    # ---------------------------------------------------------------
    #   Rol incorrecto (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_rol_incorrecto_rechazado(self):
        """Un usuario SOCIOS autenticado no puede gestionar imágenes (403)."""
        client = self._client_for(self.socio_user)
        url = f"/formats/submissions/{self.instancia_socio.pk}/images/"

        response = client.post(
            url, {"imagenes": _uploaded("foto.jpg", "image/jpeg")}, format="multipart"
        )

        assert response.status_code == 403
        assert "detail" in response.data

    # ---------------------------------------------------------------
    # CP7 — Límite máximo de imágenes (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_CP7_limite_maximo_imagenes(self):
        """No permite superar el máximo de 5 imágenes por instancia."""
        client = self._client_for(self.supervisor_user)
        url = f"/formats/submissions/{self.instancia_supervisor.pk}/images/"

        for i in range(ImagenFormulario.MAX_IMAGES_PER_INSTANCE):
            response = client.post(
                url,
                {"imagenes": _uploaded(f"foto{i}.jpg", "image/jpeg")},
                format="multipart",
            )
            assert response.status_code == 201

        response = client.post(
            url, {"imagenes": _uploaded("extra.jpg", "image/jpeg")}, format="multipart"
        )

        assert response.status_code == 400
        assert "detail" in response.data
