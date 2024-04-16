from django.apps import AppConfig


class DjangoApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'django_api'

    # Importing the models
    def ready(self):
       Game = self.get_model('Game')