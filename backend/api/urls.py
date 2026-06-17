from django.urls import path

from .views import listar_productos, obtener_producto

urlpatterns = [
    path(
        "productos/",
        listar_productos,
        name="listar_productos"
    ),
    
     path(
        "productos/<int:id_producto>/",
        obtener_producto,
        name="obtener_producto"
    ),
]