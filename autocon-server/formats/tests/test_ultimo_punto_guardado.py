import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from ..models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestUltimoPuntoGuardado:
    """
    En esta clase se agruapan todas las pruebas de "último punto guardado" / reanudar progreso.
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.formato = FormatoTecnico.objects.create(
            nombre="Formulario de inspección",
            codigo="FOR-INS-001",
            schema={"secciones": []},
            activo=True,
        )

        self.form_url = "/formats/submit/"

    # ---------------------------------------------------------------
    # CP-09 — Happy Path: guardar como borrador
    # ---------------------------------------------------------------
    def test_CP09_guardar_formulario_como_borrador_exitoso(self):
        """
        CP-09 - Happy Path:
        El sistema debe guardar el formulario como borrador (estado BORRADOR)
        preservando los datos ingresados parcialmente por el usuario.
        """
        payload = {
            "formato": self.formato.id,
            "estado": FormularioInstancia.BORRADOR,
            "datos": {
                "step_1": {"location": "Zona A", "inspector": "Juan Perez"},
                "step_2": {"notes": "Inspección preliminar en curso"},
            },
            "nombre_personalizado": "Formulario de inspección inicial",
        }

        response = self.client.post(self.form_url, payload, format="json")

        assert response.status_code == 201
        assert response.data["estado"] == FormularioInstancia.BORRADOR
        assert "datos" in response.data
        assert response.data["datos"]["step_1"]["location"] == "Zona A"

    # ---------------------------------------------------------------
    # CP-09 — Flujo alternativo: guardar borrador sin datos mínimos
    # ---------------------------------------------------------------
    def test_CP09_guardar_borrador_sin_datos_minimos(self):
        """
        CP-09 - Flujo Alternativo:
        El sistema debe rechazar el guardado cuando faltan campos mínimos requeridos
        por el serializer/modelo por ejemplo "formato"
        """
        payload = {
            "estado": FormularioInstancia.BORRADOR,
            # Falta `formato` y falta `datos`
            "nombre_personalizado": "",
        }

        response = self.client.post(self.form_url, payload, format="json")

        assert response.status_code == 400
        assert "formato" in response.data or "datos" in response.data

    # ---------------------------------------------------------------
    # CP-17 — Happy Path: reanudar desde último estado guardado
    # ---------------------------------------------------------------
    def test_CP17_reanudar_desde_ultimo_punto_guardado_exitoso(self):
        """
        El sistema debe recuperar el formulario previamente guardado en BORRADOR,
        cargando exactamente los datos almacenados sin pérdida de información.
        """
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            nombre_personalizado="Formulario de inspección inicial",
            datos={
                "step_1": {"location": "Zona A", "inspector": "Juan Perez"},
                "step_2": {"notes": "Inspección preliminar en curso"},
            },
            estado=FormularioInstancia.BORRADOR,
        )

        response = self.client.get(f"/formats/submissions/{instancia.id}/")

        assert response.status_code == 200
        assert response.data["estado"] == FormularioInstancia.BORRADOR
        assert response.data["datos"]["step_1"]["location"] == "Zona A"

    # ---------------------------------------------------------------
    # CP-17 — Reanudar formulario inexistente
    # ---------------------------------------------------------------
    def test_CP17_reanudar_formulario_inexistente(self):
        """
        El sistema debe manejar correctamente el intento de acceso a un formulario
        que no existe o ha sido eliminado.
        """
        invalid_id = 99999

        response = self.client.get(f"/formats/submissions/{invalid_id}/")

        assert response.status_code == 404
        assert "error" in response.data

