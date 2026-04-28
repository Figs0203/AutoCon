import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestFinalizarFormulario:
    """
    HU-16 — Finalizar formulario diligenciado.

    Backend real:
    - Crear: POST /formats/submit/
    - Finalizar: PUT /formats/submissions/<pk>/ con estado="ENVIADO"
    - Validación obligatorios: al poner estado ENVIADO, valida schema + firmas.
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        # Schema con 1 campo requerido y 1 firma requerida (caso crítico)
        self.formato = FormatoTecnico.objects.create(
            nombre="Formato Finalización",
            codigo="FOR-FIN-001",
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
                ],
                "firmas": [{"id": "sup", "label": "Firma Supervisor"}],
            },
            activo=True,
        )

        self.instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

    # ---------------------------------------------------------------
    # CP-20 — Finalización exitosa (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP20_finalizacion_exitosa(self):
        """
        Dado un formulario completamente diligenciado, cuando el usuario lo envía,
        debe registrarse correctamente en el sistema.
        """
        url = f"/formats/submissions/{self.instancia.pk}/"
        datos_completos = {
            "contrato": "CT-123",
            "__firmas": {"sup": "data:image/png;base64,AAAA"},
        }

        response = self.client.put(
            url, {"datos": datos_completos, "estado": FormularioInstancia.ENVIADO}, format="json"
        )

        assert response.status_code == 200
        self.instancia.refresh_from_db()
        assert self.instancia.estado == FormularioInstancia.ENVIADO
        assert self.instancia.datos["contrato"] == "CT-123"

    # ---------------------------------------------------------------
    # CP-21 — Bloqueo por campos incompletos (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_CP21_bloqueo_envio_campos_incompletos(self):
        """
        Dado un formulario incompleto, cuando el usuario intenta enviarlo,
        debe bloquearse el envío y mostrar un mensaje de error.
        """
        url = f"/formats/submissions/{self.instancia.pk}/"
        datos_incompletos = {
            # Falta "contrato" y falta "__firmas.sup"
        }

        response = self.client.put(
            url, {"datos": datos_incompletos, "estado": FormularioInstancia.ENVIADO}, format="json"
        )

        assert response.status_code == 400
        assert "detail" in response.data
        assert "errors" in response.data
        assert len(response.data["errors"]) >= 1

    # ---------------------------------------------------------------
    # Criterio — No editable tras completar (puede evidenciar gap)
    # ---------------------------------------------------------------
    def test_formulario_enviado_no_debe_permitir_edicion(self):
        """
        Dado un formulario completado, cuando el usuario accede nuevamente,
        no debe tener posibilidad de edición.

        Este test valida un criterio crítico del negocio. Si falla, evidencia
        que el backend permite editar instancias ENVIADO.
        """
        # Primero, finalizar correctamente.
        url = f"/formats/submissions/{self.instancia.pk}/"
        response = self.client.put(
            url,
            {
                "datos": {
                    "contrato": "CT-123",
                    "__firmas": {"sup": "data:image/png;base64,AAAA"},
                },
                "estado": FormularioInstancia.ENVIADO,
            },
            format="json",
        )
        assert response.status_code == 200

        # Intentar modificar datos luego de enviado.
        response = self.client.put(
            url,
            {"datos": {"contrato": "CT-EDITADO"}, "estado": FormularioInstancia.ENVIADO},
            format="json",
        )

        # Esperado (criterio): no permitir edición.
        assert response.status_code in (400, 403)
