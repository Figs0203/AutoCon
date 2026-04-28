import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestVisualizacionFormatosTecnicos:
    """
    HU-06 — Visualización de formatos técnicos.

    Backend real:
    - Listar plantillas: GET /formats/ (solo activo=True)
    - Ver detalle: GET /formats/<pk>/ (si activo=True)
    """

    def setup_method(self):
        # No requiere auth en backend para listar/detalle, pero creamos usuario por contexto.
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.formato_activo = FormatoTecnico.objects.create(
            nombre="Formato Activo",
            codigo="FOR-ACT-001",
            schema={"secciones": []},
            activo=True,
        )
        self.formato_inactivo = FormatoTecnico.objects.create(
            nombre="Formato Inactivo",
            codigo="FOR-INA-001",
            schema={"secciones": []},
            activo=False,
        )

    # ---------------------------------------------------------------
    # CP-10 — Visualización de plantillas disponibles (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP10_lista_muestra_formatos_activos(self):
        response = self.client.get("/formats/")

        assert response.status_code == 200
        ids = [item["id"] for item in response.data]
        assert self.formato_activo.id in ids
        assert self.formato_inactivo.id not in ids

    # ---------------------------------------------------------------
    # CP-15 — Visualización e interacción básica (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP15_ver_detalle_de_un_formato(self):
        response = self.client.get(f"/formats/{self.formato_activo.id}/")

        assert response.status_code == 200
        assert response.data["id"] == self.formato_activo.id
        assert "schema" in response.data

    # ---------------------------------------------------------------
    # Flujo alternativo — seleccionar un formato no disponible
    # ---------------------------------------------------------------
    def test_detalle_formato_inactivo_retorna_404(self):
        response = self.client.get(f"/formats/{self.formato_inactivo.id}/")

        assert response.status_code == 404
        assert "error" in response.data
