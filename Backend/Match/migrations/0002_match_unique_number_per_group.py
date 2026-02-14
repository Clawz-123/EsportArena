from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Match", "0001_initial"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="match",
            constraint=models.UniqueConstraint(
                fields=["tournament", "group", "match_number"],
                name="unique_match_number_per_group",
            ),
        ),
    ]
