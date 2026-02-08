from django.apps import AppConfig


class ContactMessageConfig(AppConfig):
    # Configuration for the contactMessage app
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'contactMessage'
    verbose_name = 'Contact Messages'
