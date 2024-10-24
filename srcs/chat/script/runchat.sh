#!/bin/bash
while [ true ]; do
    curl -k -H "Host: localhost" https://$US_HOST:8000/ > /dev/null 2>&1
    if [ $? -eq 0 ];then
        break
    fi
    sleep 1
done

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

echo "start the chat service"

python manage.py runserver 0.0.0.0:8000
# hypercorn  justChat.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key