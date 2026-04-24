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

    nombre_personalizado = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Nombre personalizado que el usuario le da a esta instancia (ej: Torre 4 - Eje B)"
    )

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


class ImagenFormulario(models.Model):
    """Imagen adjunta a una instancia de formulario."""

    MAX_IMAGES_PER_INSTANCE = 5
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_TYPES = ("image/jpeg", "image/png")

    instancia = models.ForeignKey(
        FormularioInstancia,
        on_delete=models.CASCADE,
        related_name="imagenes",
    )
    imagen = models.ImageField(upload_to="formularios/imagenes/%Y/%m/")
    nombre_original = models.CharField(max_length=255)
    tamano = models.PositiveIntegerField(help_text="Tamaño en bytes")
    subida_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-subida_en"]

    def __str__(self):
        return f"Imagen #{self.pk} — {self.nombre_original}"
