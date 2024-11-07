#!/bin/bash
while [ true ]; do
    curl -k https://$DB_HOST/ > /dev/null 2>&1
    if [ $? -eq 0 ];then
        break
    fi
    sleep 1
done

echo "start user_management service"
hypercorn  project.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key