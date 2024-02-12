# gpt-threads

open-source AI app | running mixtral 8x7B / llama.cpp | single-layer threads interface | multi-user | private | offline capable

Install:

Install Ubuntu Server 22.04 on a machine with 64GB+ RAM

Direct Download:
https://releases.ubuntu.com/23.10/ubuntu-23.10-live-server-amd64.iso

Torrent:
https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso.torrent

During setup, choose "user" as the user / username, all other options default except:

  Install OpenSSH server - enable that during setup if you are remotely accessing the machine

cd /home/user/
git clone https://github.com/justinfilip/gpt-threads.git
cd gpt-threads/gpt-threads-compute
sudo bash init.sh

Enter your password and the automated server setup script will run

Depending on your CPU and internet bandwidth, setup time may vary from a few minutes to a few hours

The machine will reboot when setup is complete

Navigate to http://www.gpt-threads.local in your browser to access the application

Tap the share button on the webpage to "Add to Home Screen", this will install the PWA and make it available as an app icon on your iOS/Android device