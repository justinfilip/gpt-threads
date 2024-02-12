#!/bin/sh

# Init:
export DEBIAN_FRONTEND=noninteractive
sudo apt-get remove needrestart -y

sudo cp hosts /etc/hosts
sudo cp hostname /etc/hostname
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y python3 python3-pip python3-dev gunicorn nginx cmake avahi-daemon

cd /home/user/gpt-threads/gpt-threads-compute

sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
sudo cp nginx.conf /etc/nginx/nginx.conf

# Install llama.cpp:
git clone --depth 1 -b b2116 https://github.com/ggerganov/llama.cpp.git
# git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp

mkdir build
cd build

sudo cmake ..
sudo cmake --build . --config Release
sudo mv bin/main bin/llamacppmain

# Return to application directory
cd /home/user/gpt-threads/gpt-threads-compute

# Install python dependencies:
sudo pip3 install flask psycopg2-binary
sudo pip3 install -r requirements.txt
# sudo pip3 install -r llama.cpp/requirements.txt

# Set up directories and system daemons for API and inference automations:
sudo mkdir output
sudo mkdir logs
sudo cp gpt-threads.service /etc/systemd/system/gpt-threads.service
sudo chmod 744 /etc/systemd/system/gpt-threads.service
sudo systemctl enable gpt-threads.service

sudo cp inference.service /etc/systemd/system/inference.service
sudo chmod 744 /etc/systemd/system/inference.service
sudo systemctl enable inference.service

sudo cp task_monitor.service /etc/systemd/system/task_monitor.service
sudo chmod 744 /etc/systemd/system/task_monitor.service
sudo systemctl enable task_monitor.service

sudo cp task_cleanup.service /etc/systemd/system/task_cleanup.service
sudo chmod 744 /etc/systemd/system/task_cleanup.service
sudo systemctl enable task_cleanup.service

sudo chmod 744 start_api.sh
sudo chmod 744 start_inference.sh
sudo chmod 744 auto_inference.sh
sudo chmod 744 start_service.sh
sudo chmod 744 reset_state.sh
sudo chmod 744 kill_inference_processes.sh
sudo chmod 744 start_monitor.sh
sudo chmod 744 auto_monitor.sh
sudo chmod 744 start_cleanup.sh
sudo chmod 744 auto_cleanup.sh

# Download models:
cd llama.cpp/models/
sudo wget https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF/resolve/main/mixtral-8x7b-instruct-v0.1.Q5_0.gguf && wait

# Move on to build UI
cd /home/user/gpt-threads/gpt-threads-ui/
sudo bash ./init.sh