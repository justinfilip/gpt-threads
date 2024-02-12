#!/bin/bash

sudo apt-get install -y postgresql

# Set the variables for the database
DB_NAME="gpt_threads_users"
DB_USER="gpt_threads"
DB_PASS="f789ds7fs8d7f9sd87f9sd8f798fj39s"

# Create the new database
echo "Creating the new database '$DB_NAME'..."
sudo -u postgres createdb $DB_NAME

# Create the new user
echo "Creating the new user '$DB_USER'..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"

# Grant privileges to the new user
echo "Granting privileges to the new user on the new database..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# create a full databse dump
# pg_dump -h 127.0.0.1 -U gpt_threads -W -F c -d gpt_threads_users > gpt_threads_users.dump

# restore it
export PGPASSWORD="$DB_PASS"
pg_restore -h 127.0.0.1 -U gpt_threads -Fc -j 8 gpt_threads_users.dump -d gpt_threads_users -c

# it is asking for a password, so pipe in the password
echo "Database setup complete."

# Enable firewall
echo 'y' | sudo ufw enable
# Allow UI access
sudo ufw allow 9090
# Allow API access
sudo ufw allow 80
# Allow remote VSCode
sudo ufw allow 22

sudo reboot