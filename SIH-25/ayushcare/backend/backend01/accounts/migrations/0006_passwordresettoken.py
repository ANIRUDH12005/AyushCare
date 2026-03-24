from django.db import migrations, models
import uuid
import datetime
from django.utils import timezone


def default_expiry():
    return timezone.now() + datetime.timedelta(minutes=15)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_usersettings"),
    ]

    operations = [
        migrations.CreateModel(
            name="PasswordResetToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(max_length=254)),
                ("otp", models.CharField(max_length=6)),
                ("token", models.CharField(default=uuid.uuid4, unique=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField()),
                ("verified", models.BooleanField(default=False)),
                ("used", models.BooleanField(default=False)),
                ("attempts", models.PositiveIntegerField(default=0)),
                ("max_attempts", models.PositiveIntegerField(default=5)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["email"], name="accounts_pas_email_idx"),
                    models.Index(fields=["token"], name="accounts_pas_token_idx"),
                ],
            },
        ),
    ]

