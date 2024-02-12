#!/bin/bash

# open logs/cancelled_tasks, remove task ids that are present from the logs/tasks file if they are present there
while IFS= read -r json_object
do

  string=$json_object
  IFS=',' read -ra ADDR <<< "$string"

  prompt_id=${ADDR[0]}

  # A '"' in the 0 index of a the line indicates the presence of a scheduled task deletion
  if [[ ${prompt_id:1:1} != '"' ]]; then

    search_string=$prompt_id
    prompt_id="""${search_string#\"}"""
    prompt_id="""${prompt_id%\"}"""

    sed -i "/"\.$prompt_id"/d" /home/user/gpt-threads/gpt-threads-compute/logs/tasks && \
    sed -i "/"$prompt_id"/d" /home/user/gpt-threads/gpt-threads-compute/logs/cancelled_tasks
    
    break

  fi
done < <(cat /home/user/gpt-threads/gpt-threads-compute/logs/cancelled_tasks)



