#!/bin/bash

echo "Starting User Management Service"

# Wait until chat service is ready (healthcheck ensures it's healthy)
echo "Starting the server..."

# Use watchfiles to monitor changes and restart hypercorn automatically
watchfiles --target-type command "hypercorn project.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key"
