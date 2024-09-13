#!/bin/bash
while [ ! -f "/is_ready/game" ]; do
    sleep 1
done
rm -f /is_ready/game