from django.apps import AppConfig

# from django.apps import AppConfig

# class NotificationsConfig(AppConfig):


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    verbose_name = "COMMUNICATION"

    def ready(self):
        import firebase_config

    # name = 'notifications'
