import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestDiligenciamientoFormularios:
    """
    HU-13 — Diligenciar formularios de inspección (backend).

    Nota: El backend expone la lógica principal:
    - Seleccionar formato técnico: GET /formats/ y GET /formats/<id>/
    - Crear/guardar instancia: POST /formats/submit/ (requiere SUPERVISOR_TECNICO)
    - Validación de obligatorios al enviar: estado=ENVIADO
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato Inspección",
            codigo="FOR-DIL-001",
            schema={
                "secciones": [
                    {
                        "id": "general",
                        "titulo": "General",
                        "campos": [
                            {
                                "id": "contrato",
                                "tipo": "texto",
                                "label": "Contrato",
                                "requerido": True,
                            }
                        ],
                    }
                ]
            },
            activo=True,
        )

    # ---------------------------------------------------------------
    # CP-11 — Selección de Formato Técnico (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP11_seleccion_formato_tecnico(self):
        response = self.client.get("/formats/")
        assert response.status_code == 200

        response = self.client.get(f"/formats/{self.formato.id}/")
        assert response.status_code == 200
        assert response.data["id"] == self.formato.id

    # ---------------------------------------------------------------
    # CP-7 — Diligenciar y guardar como borrador (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP07_guardar_respuestas_en_borrador(self):
        payload = {
            "formato": self.formato.id,
            "estado": FormularioInstancia.BORRADOR,
            "datos": {"contrato": "CT-001"},
        }

        response = self.client.post("/formats/submit/", payload, format="json")

        assert response.status_code == 201
        instancia_id = response.data["id"]
        instancia = FormularioInstancia.objects.get(pk=instancia_id)
        assert instancia.estado == FormularioInstancia.BORRADOR
        assert instancia.datos["contrato"] == "CT-001"

    # ---------------------------------------------------------------
    # CP-8 — Envío sin completar obligatorios (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_CP08_envio_sin_campos_obligatorios_bloqueado(self):
        payload = {
            "formato": self.formato.id,
            "estado": FormularioInstancia.ENVIADO,
            "datos": {},  # falta contrato requerido
        }

        response = self.client.post("/formats/submit/", payload, format="json")

        assert response.status_code == 400
        assert "detail" in response.data
        assert "errors" in response.data
