from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("Result", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="result",
            name="total_kills",
        ),
    ]
