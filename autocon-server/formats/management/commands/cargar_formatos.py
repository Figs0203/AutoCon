"""
Management command para cargar los formatos técnicos de ejemplo.

Uso:
    python manage.py cargar_formatos

Lee los archivos JSON de la carpeta formats/sample_schemas/ y crea
un FormatoTecnico por cada uno. Si el código ya existe, lo omite
para evitar duplicados.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand

from formats.models import FormatoTecnico

# Mapeo de archivo JSON → (código, nombre descriptivo)
FORMATOS = {
    "FR_E1.json": (
        "FR-E1",
        "Inspección de Concreto — Columnas y Muros",
    ),
    "FR_SE1.json": (
        "FR-SE1",
        "Inspección de Excavación de Pilas de Cimentación",
    ),
    "FR_SE2.json": (
        "FR-SE2",
        "Inspección de Refuerzo y Vaciado de Pilas",
    ),
    "FR_SE3.json": (
        "FR-SE3",
        "Inspección de Cimentación Superficial — Zapatas",
    ),
}


class Command(BaseCommand):
    help = "Carga los formatos técnicos de ejemplo desde sample_schemas/"

    def handle(self, *args, **options):
        schemas_dir = Path(__file__).resolve().parent.parent.parent / "sample_schemas"

        if not schemas_dir.exists():
            self.stderr.write(
                self.style.ERROR(f"No se encontró la carpeta: {schemas_dir}")
            )
            return

        creados = 0
        omitidos = 0

        for archivo, (codigo, nombre) in FORMATOS.items():
            ruta = schemas_dir / archivo

            if not ruta.exists():
                self.stderr.write(
                    self.style.WARNING(
                        f"  ⚠ Archivo no encontrado: {archivo} — omitido"
                    )
                )
                continue

            # Evitar duplicados por código
            if FormatoTecnico.objects.filter(codigo=codigo).exists():
                self.stdout.write(
                    self.style.WARNING(f"  ⏭ {codigo} ya existe — omitido")
                )
                omitidos += 1
                continue

            with open(ruta, "r", encoding="utf-8") as f:
                schema = json.load(f)

            FormatoTecnico.objects.create(
                nombre=nombre,
                codigo=codigo,
                schema=schema,
                activo=True,
            )
            self.stdout.write(self.style.SUCCESS(f"{codigo} — {nombre}"))
            creados += 1

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Resultado: {creados} creados, {omitidos} omitidos (ya existían)"
            )
        )
