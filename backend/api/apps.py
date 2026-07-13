# Este archivo sirve para registrar e identificar una aplicación dentro del proyecto Django. 

from django.apps import AppConfig # Se imoporta la clase AppConfig
# AppConfig: clase base utilizada por Django para representar la configuración de una aplicación


class ApiConfig(AppConfig): # Se crea la configuración de la aplicación llamada api 
    name = 'api'
