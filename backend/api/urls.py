from django.urls import path

from .views import (
    listar_productos,
    obtener_producto,
    crear_producto,
    actualizar_producto,
    eliminar_producto
)


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

    path(
    "productos/crear/",
    crear_producto,
    name="crear_producto"
    ),

    path(
    "productos/editar/<int:id_producto>/",
    actualizar_producto,
    name="actualizar_producto"
    ),

    path(
    "productos/eliminar/<int:id_producto>/",
    eliminar_producto,
    name="eliminar_producto"
   ),
]