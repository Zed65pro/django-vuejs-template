# Generated by Django 4.2.14 on 2024-08-07 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0008_alter_ticket_content'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticket',
            options={'ordering': ['-created_on']},
        ),
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.BooleanField(default=True),
        ),
    ]