from django.apps import AppConfig

class GameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game'

    def ready(self):
        from . models import Tournament
        tournaments = Tournament.objects.filter(isOver=False).delete()