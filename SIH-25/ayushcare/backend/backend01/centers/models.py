# centers/models.py
# Note: Center model is defined in clinic/models.py
# This file is kept for potential future use or utilities

from django.db import models

def center_image_upload(instance, filename):
    """Utility function for center image uploads"""
    return f"centers/{instance.name}/{filename}"
