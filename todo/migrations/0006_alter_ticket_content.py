# Generated by Django 5.0.7 on 2024-08-06 11:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0005_ticketsubject_tickettype_alter_ticket_subject_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='content',
            field=models.TextField(blank=True, null=True),
        ),
    ]