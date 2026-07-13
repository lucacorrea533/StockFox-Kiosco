# Este archivo es el centor de control del proyecto Djang. 
# Su función es permitirnos ejecutar distintos comandos para administrar el proyecto desde la terminal
# Gracias a manage.py podemos inicar el servidor, actualziar la bbdd o crear un usuario admin por ejemplo.

#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os # Módulo de Python que permite trabajar con el sistema operativo 
import sys # Módulo de Python que nos permite acceder a la información del programa


def main(): # Función principal del archivo 
    """Run administrative tasks."""
    # Las configuraciones del proyecto seencuentran en config/settings.py
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
    try:
        from django.core.management import execute_from_command_line # Importa una función interna de Django 
        # Está función es la encargada de ejecutar los comandos escritos por el usuario.
    except ImportError as exc: # Si Django no está instalado aparecer un msj de error indicadno posibles causas
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv) # "sys.argv" contiene todo lo que escribimos en la terminal.
    # Toma los comandos escritos por el usuario y le ordena a Django ejecutarlo


if __name__ == '__main__': # Llamada a la función principal
    main()
