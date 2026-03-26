# Generated migration to fix draft status values

from django.db import migrations

def fix_draft_status(apps, schema_editor):
    """Convert all 'Draft' status tournaments to 'Registration Open'"""
    Tournament = apps.get_model('tournament', 'Tournament')
    # Update all tournaments with 'Draft' status to 'Registration Open'
    Tournament.objects.filter(status='Draft').update(status='Registration Open')
    print("✅ Fixed: Converted all 'Draft' tournaments to 'Registration Open'")

def reverse_fix_draft_status(apps, schema_editor):
    """Reverse operation (not recommended but included for completeness)"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0004_remove_tournament_is_draft_alter_tournament_status'),
    ]

    operations = [
        migrations.RunPython(fix_draft_status, reverse_fix_draft_status),
    ]
