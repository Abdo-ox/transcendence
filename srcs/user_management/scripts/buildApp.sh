#!/bin/bash
while [ ! -f "/is_ready/user_management" ]; do
    sleep 1
done
rm -f /is_ready/user_management
python manage.py makemigrations
python manage.py migrate user 
python manage.py migrate  friendship
echo "RUN SERVER"
touch /is_ready/chat
watchfiles --target-type command "hypercorn  project.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key"
