#!/bin/bash
while [ ! -f "/is_ready/game" ]; do
    sleep 1
done
rm -f /is_ready/game
touch /is_ready/chat

# hypercorn  project.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key
python manage.py runserver 0.0.0.0:8000