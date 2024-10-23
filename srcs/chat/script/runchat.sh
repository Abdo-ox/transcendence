#!/bin/bash
echo in runchat
while [ ! -f "/is_ready/chat" ]; do
    sleep 1
done
rm -f /is_ready/chat

python manage.py makemigrations
cat << EOF > chat/migrations/00002_create_coalitions.py
from django.db import migrations
from chat.models import Coalition

def create_initial_instances(apps, schema_editor):
    Coalition.objects.get_or_create(name='NightSpin',image='https://localhost/images/whitwill/coalition5.png')
    Coalition.objects.get_or_create(name='EclipsePong',image='https://localhost/images/whitwill/coalition4.png')
    Coalition.objects.get_or_create(name='GhostPaddle',image='https://localhost/images/whitwill/coalition3.png')

class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_instances),
    ]
EOF

python manage.py migrate

touch /is_ready/user_management
python manage.py runserver 0.0.0.0:8000
# hypercorn  justChat.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key