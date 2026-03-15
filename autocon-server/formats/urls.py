from django.urls import path
from . import views

urlpatterns = [
    path("formats/", views.lista_formatos),
    path("formats/<int:pk>/", views.detalle_formato),
    path("formats/submit/", views.guardar_formulario),
]