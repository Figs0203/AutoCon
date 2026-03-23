from django.contrib.auth.models import User
from django.db import models


class FormatoTecnico(models.Model):
    # Plantilla del formulario técnico (la define el developer).
    nombre = models.CharField(max_length=200)  # "Inspección de Soldadura"
    codigo = models.CharField(max_length=50)  # "FOR-001"
    schema = models.JSONField()  # Definición de campos
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class FormularioInstancia(models.Model):
    # Cada vez que un usuario llena un formato.
    BORRADOR = "BORRADOR"
    ENVIADO = "ENVIADO"

    ESTADO_CHOICES = [
        (BORRADOR, "BORRADOR"),
        (ENVIADO, "ENVIADO"),
    ]

    formato = models.ForeignKey(FormatoTecnico, on_delete=models.PROTECT)
    usuario = models.ForeignKey(User, on_delete=models.PROTECT)
    datos = models.JSONField()  # Respuestas del formulario
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=BORRADOR,
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # return f"{self.formato.codigo} — {self.usuario.username} — {self.estado}"
        return f"{self.formato.codigo} — {self.estado}"
