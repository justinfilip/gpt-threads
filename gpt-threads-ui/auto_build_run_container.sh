#!/bin/sh
sudo docker build -t gpt-threads-ui /home/user/gpt-threads/gpt-threads-ui/. > /dev/null
sudo docker run -h gpt-threads.local -p 80:80 gpt-threads-ui > /dev/null && wait