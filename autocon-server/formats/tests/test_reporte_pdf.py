import time

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestReportePDF:
    """
    HU-19 — Generar reporte PDF.
    """

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="supervisor",
            email="supervisor@tipinterventoria.com",
            password="12345678",
        )
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato PDF",
            codigo="FOR-PDF-001",
            schema={
                "secciones": [
                    {
                        "id": "general",
                        "titulo": "General",
                        "campos": [
                            {
                                "id": "obra",
                                "tipo": "texto",
                                "label": "Obra",
                                "requerido": False,
                            },
                            {
                                "id": "ubicacion",
                                "tipo": "texto",
                                "label": "Ubicación",
                                "requerido": False,
                            },
                        ],
                    }
                ]
            },
            activo=True,
        )

        self.download_base = "/formats/download/"

    # ---------------------------------------------------------------
    # Happy Path 1 — Generación de PDF (formulario ENVIADO)
    # ---------------------------------------------------------------
    def test_generar_pdf_formulario_finalizado(self):
        """
        Dado un formulario finalizado (ENVIADO), el sistema devuelve un PDF
        descargable con headers correctos y lo genera en < 5 segundos.
        """
        # ARRANGE
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={"obra": "Obra Norte", "ubicacion": "Zona A"},
            estado=FormularioInstancia.ENVIADO,
        )

        # ACT
        start = time.monotonic()
        response = self.client.get(f"{self.download_base}{instancia.pk}/")
        elapsed = time.monotonic() - start

        # ASSERT
        assert response.status_code == 200
        assert response["Content-Type"].startswith("application/pdf")
        assert "attachment;" in response["Content-Disposition"]
        assert response.content.startswith(b"%PDF")
        assert elapsed < 5.0

    # ---------------------------------------------------------------
    # Happy Path 2 — Base64 inválido en firmas no rompe el PDF
    # ---------------------------------------------------------------
    def test_pdf_no_falla_con_firmas_base64_invalidas(self):
        """
        Si las firmas vienen con base64 inválido, la función auxiliar retorna None
        y el PDF igualmente debe generarse (sin firma dibujada).
        """
        # ARRANGE
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={
                "obra": "Obra Sur",
                "__firmas": {"constructor": "NO_ES_BASE64", "supervisor": "X"},
            },
            estado=FormularioInstancia.ENVIADO,
        )

        # ACT
        response = self.client.get(f"{self.download_base}{instancia.pk}/")

        # ASSERT
        assert response.status_code == 200
        assert response["Content-Type"].startswith("application/pdf")
        assert response.content.startswith(b"%PDF")

    # ---------------------------------------------------------------
    # Flujo alternativo 1 — Instancia inexistente
    # ---------------------------------------------------------------
    def test_pdf_instancia_inexistente_404(self):
        """
        Si el formulario no existe, debe responder 404.
        """
        # ARRANGE
        invalid_id = 999999

        # ACT
        response = self.client.get(f"{self.download_base}{invalid_id}/")

        # ASSERT
        assert response.status_code == 404

    # ---------------------------------------------------------------
    # Flujo alternativo  — Restringir PDF solo a finalizados (puede fallar)
    # ---------------------------------------------------------------
    def test_pdf_solo_permitido_para_formularios_finalizados(self):
        """
        Criterio de aceptación:
        El sistema permite generar PDF solo de formularios finalizados (ENVIADO).
        """
        # ARRANGE
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={"obra": "Borrador"},
            estado=FormularioInstancia.BORRADOR,
        )

        # ACT
        response = self.client.get(f"{self.download_base}{instancia.pk}/")

        # ASSERT (esperado según HU)
        assert response.status_code in (400, 403)

    # ---------------------------------------------------------------
    # Flujo alternativo 3 — PDF debe incluir nombre/email del usuario (puede fallar)
    # ---------------------------------------------------------------
    def test_pdf_incluye_usuario_responsable(self):
        """
        Criterio de aceptación:
        El PDF incluye el nombre/email del usuario que realizó la inspección.
        """
        # ARRANGE
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={"obra": "Obra Norte"},
            estado=FormularioInstancia.ENVIADO,
        )

        # ACT
        response = self.client.get(f"{self.download_base}{instancia.pk}/")

        # ASSERT
        assert response.status_code == 200
        assert response.content.startswith(b"%PDF")
        assert self.user.email.encode("utf-8") in response.content

