from django.urls import path

from . import views

urlpatterns = [
    path("test/", views.test_users),
    path("register/", views.register_user),
    path("login/", views.login_user),
    path("logout/", views.logout_user),
    path("me/", views.current_user),
    path("socios/dashboard/", views.socios_dashboard),
]
