# Generated by Django 5.0.7 on 2024-09-09 12:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_alter_user_profile_image'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='chat',
            table='chat_chat',
        ),
        migrations.AlterModelTable(
            name='contact',
            table='chat_contact',
        ),
        migrations.AlterModelTable(
            name='message',
            table='chat_message',
        ),
    ]