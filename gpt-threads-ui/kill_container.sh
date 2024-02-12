#!/bin/sh
docker rm -f $(docker ps -a -q --filter "ancestor=gpt-threads-ui") & 