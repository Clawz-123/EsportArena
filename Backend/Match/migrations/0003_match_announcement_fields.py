from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Match", "0002_match_unique_number_per_group"),
    ]

    operations = [
        migrations.AddField(
            model_name="match",
            name="room_id",
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name="room id"),
        ),
        migrations.AddField(
            model_name="match",
            name="room_pass",
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name="room pass"),
        ),
        migrations.AddField(
            model_name="match",
            name="announcement",
            field=models.TextField(blank=True, verbose_name="announcement"),
        ),
        migrations.AddField(
            model_name="match",
            name="announcement_sent_at",
            field=models.DateTimeField(blank=True, null=True, verbose_name="announcement sent at"),
        ),
    ]
