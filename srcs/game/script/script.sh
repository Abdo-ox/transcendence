#!/bin/bash

hypercorn game/pong.asgi:application --bind 0.0.0.0:8000 --certfile certs/crt.crt --keyfile certs/crt.key
