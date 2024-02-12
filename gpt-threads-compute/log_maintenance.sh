#!/bin/sh
logs=()

while true
do  
    sudo find /var/lib/docker/containers/ -name *-json.log -exec bash -c 'jq '.' {} > /dev/null 2>&1 || sudo rm -r {}' \; & journalctl --vacuum-time=15m
done