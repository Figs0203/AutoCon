from django.urls import path

from . import views

urlpatterns = [
    path("formats/", views.lista_formatos),
    path("formats/<int:pk>/", views.detalle_formato),
    path("formats/submit/", views.guardar_formulario),
    path("formats/dashboard/", views.dashboard_stats),
    path("formats/recent/", views.recent_submissions),
    path("formats/submissions/", views.user_submissions),
    path("formats/submissions/<int:pk>/", views.detalle_instancia),
    # Imágenes
    path(
        "formats/submissions/<int:instancia_pk>/images/",
        views.subir_imagenes,
    ),
    path(
        "formats/submissions/<int:instancia_pk>/images/<int:imagen_pk>/",
        views.eliminar_imagen,
    ),
    path("formats/download/<int:pk>/", views.descargar_formulario),
]
