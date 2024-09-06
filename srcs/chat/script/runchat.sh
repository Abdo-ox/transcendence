#!/bin/bash
echo in runchat
while [ ! -f "/is_ready/chat" ]; do
    sleep 1
done
rm -f /is_ready/chat
python manage.py makemigrations
# python manage.py migrate --fake chat 0001

python manage.py migrate
# python manage.py migrate admin --fake
# touch /is_ready/user_management
service redis-server start && python manage.py runserver 0.0.0.0:8000