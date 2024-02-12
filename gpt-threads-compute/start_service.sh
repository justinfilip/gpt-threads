#!/bin/sh
while true
do  
  # I don't know if this is a hacky way to parallelize an application and turn it into a service, but it works reliably. See also: ./auto_inference.sh
    /home/user/gpt-threads/gpt-threads-compute/auto_inference.sh & sleep 1
    # > /dev/null
done