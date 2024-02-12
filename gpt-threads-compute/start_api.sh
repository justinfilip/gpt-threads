#!/bin/sh
cd /home/user/gpt-threads/gpt-threads-compute/ && gunicorn -b 0.0.0.0:8000 gpt-threads-api:application > /dev/null