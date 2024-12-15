from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('project_api', '0002_add_project_dates'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='type',
            field=models.CharField(
                choices=[('project', 'Project'), ('task', 'Task')],
                default='task',
                max_length=10
            ),
        ),
    ] 