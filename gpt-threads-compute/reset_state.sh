#!/bin/sh
timeout 5 ./kill_inference_processes.sh
sudo rm -r ./logs/*
sudo rm -r ./output/*
sudo docker rm -f $(docker ps -a -q --filter "ancestor=gpt-threads-ui")
sudo systemctl restart task_monitor.service
sudo systemctl restart task_cleanup.service
sudo systemctl restart ui_container.service
sudo systemctl restart inference.service
sudo systemctl restart gpt-threads.service
sudo systemctl restart nginx.service