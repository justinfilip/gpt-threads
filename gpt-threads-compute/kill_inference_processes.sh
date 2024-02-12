#!/bin/sh
while true
do  
    # This will terminate all inference tasks by command name. This is necessary as they are their own unique processes and are not dependent on their parent script to continue execution.
    pkill -f 'llamacppmain' > /dev/null & continue
done