from django.urls import path

from .views import (
    listar_productos,
    listar_productos_disponibles,
    obtener_producto,
    crear_producto,
    actualizar_producto,
    eliminar_producto,
    listar_categorias,
    obtener_categoria
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

   path(
    "productos/disponibles/",
    listar_productos_disponibles,
    name="listar_productos_disponibles"
   ),

   path(
    "categorias/",
    listar_categorias,
    name="listar_categorias"
   ),

   path(
    "categorias/<int:id_categoria>/",
    obtener_categoria,
    name="obtener_categoria"
   ),
]