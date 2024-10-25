#!/bin/bash
# curl -k http://$CH_HOST:9000/

while [ true ]; do
    curl -k -H "Host: localhost" https://$CH_HOST:8000/ > /dev/null 2>&1
    if [ $? -eq 0 ];then
        break
    fi
    sleep 1
done

echo "start the game service"

hypercorn  game/pong.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key
# python manage.py runserver 0.0.0.0:8000