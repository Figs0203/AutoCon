from django.db import models

# Create your models here.
from django.contrib.auth.models import User


class FormatoTecnico(models.Model):
    #Plantilla del formulario técnico (la define el developer).
    nombre  = models.CharField(max_length=200)     # "Inspección de Soldadura"
    codigo  = models.CharField(max_length=50)       # "FOR-001"
    schema  = models.JSONField()                    # Definición de campos
    activo  = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class Diligenciamiento(models.Model):
    #Cada vez que un usuario llena un formato.
    BORRADOR  = "borrador"
    ENVIADO   = "enviado"

    ESTADO_CHOICES = [
        (BORRADOR, "Borrador"),
        (ENVIADO,  "Enviado"),
    ]

    formato   = models.ForeignKey(FormatoTecnico, on_delete=models.PROTECT)
    usuario   = models.ForeignKey(User, on_delete=models.PROTECT)
    datos     = models.JSONField()                  # Respuestas del formulario
    estado    = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=BORRADOR)
    fecha     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.formato.codigo} — {self.usuario.username} — {self.estado}"


'''class Adjunto(models.Model):
    #Fotos y firmas de un diligenciamiento.
    diligenciamiento = models.ForeignKey(Diligenciamiento, on_delete=models.CASCADE, related_name="adjuntos")
    campo_id         = models.CharField(max_length=100)   # a qué campo pertenece
    archivo          = models.ImageField(upload_to="adjuntos/")

    def __str__(self):
        return f"Adjunto campo={self.campo_id}"
        
        
        # PARA FUTURA IMPLEMENTACIÓN: Si queremos guardar archivos PDF u otro tipo, podríamos usar FileField en lugar de ImageField.'''