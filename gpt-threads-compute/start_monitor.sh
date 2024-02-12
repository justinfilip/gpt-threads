#!/bin/bash

# save the PID to the logs/prompt_id task PID file, "Task manifest"

while IFS= read -r json_object
do

  string=$json_object
  IFS=',' read -ra ADDR <<< "$string"

  prompt_id=${ADDR[0]}

  # A '.' in the 0 index of a task line's key indicates that the task is being processed by another instance
  if [[ ${prompt_id:1:1} == '.' ]]; then

    search_string=$prompt_id
    prompt_id="""${search_string#\"}"""
    prompt_id="""${prompt_id%\"}"""
    prompt_id="""${prompt_id#.}"""

    counter=0
    while IFS= read -r inference_task_manifest
    do

        value=$inference_task_manifest

        if counter==1; then

            if ps -p $value > /dev/null; then
                # echo "process "$value" alive"

                # wait n seconds and check again
                sleep 1
            else

                # mark the output with a delimiter indicating token generation is complete
                echo -e "-\n$(cat /home/user/gpt-threads/gpt-threads-compute/output/"$prompt_id")" > /home/user/gpt-threads/gpt-threads-compute/output/"$prompt_id"

                # remove the task's line in the tasks file
                sed -i "/"\.$prompt_id"/d" /home/user/gpt-threads/gpt-threads-compute/logs/tasks

                # log datetime in inference task manifest
            fi
        
        else # if there are other lines in the PID task file, shouldn't ever get here
            echo "not on first counter"
        fi

        counter+=1

    done < <(cat /home/user/gpt-threads/gpt-threads-compute/logs/$prompt_id)

    continue

  fi
done < <(cat /home/user/gpt-threads/gpt-threads-compute/logs/tasks)







