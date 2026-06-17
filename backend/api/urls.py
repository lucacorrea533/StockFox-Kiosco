from django.urls import path

from .views import listar_productos

urlpatterns = [
    path(
        "productos/",
        listar_productos,
        name="listar_productos"
    ),
]