from django.db import migrations, models
from django.utils import timezone

def set_default_dates(apps, schema_editor):
    Project = apps.get_model('project_api', 'Project')
    default_start = timezone.now().date()
    default_deadline = (timezone.now() + timezone.timedelta(days=30)).date()
    
    for project in Project.objects.all():
        project.start_date = default_start
        project.deadline = default_deadline
        project.save()

class Migration(migrations.Migration):
    dependencies = [
        ('project_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='start_date',
            field=models.DateField(default=timezone.now),
        ),
        migrations.AddField(
            model_name='project',
            name='deadline',
            field=models.DateField(default=timezone.now),
        ),
        migrations.RunPython(set_default_dates),
    ] 