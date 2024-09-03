#!/bin/bash
while [ ! -f "/is_ready/yes" ]; do
    sleep 1
done
rm -f /is_ready/yes
python manage.py makemigrations
python manage.py migrate
echo "RUN SERVER"
watchfiles --target-type command "hypercorn  project.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key"
