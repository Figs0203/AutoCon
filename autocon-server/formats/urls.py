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
]