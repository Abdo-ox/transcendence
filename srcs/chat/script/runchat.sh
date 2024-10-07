#!/bin/bash
echo in runchat
while [ ! -f "/is_ready/chat" ]; do
    sleep 1
done
rm -f /is_ready/chat

python manage.py migrate
touch /is_ready/user_management
service redis-server start && python manage.py runserver 0.0.0.0:8000