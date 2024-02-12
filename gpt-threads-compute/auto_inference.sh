#!/bin/bash

# This will loop through the tasks file once until it finds an available inference task, starts it, and exits leaving the inference task alive within its own process, 

# This code spawns a sub-shell with serialized variable names to ensure isolation from other inference tasks. There was a version of this that attempted to parallelize tasks within the same shell context and variables were clashing, resulting in garbled output from the LLM because the output was being piped from several processes to the output files. It shouldn't be necessary anymore as only one task is launched at a time and this script is ran in a loop by a parent script. However, it's cool and it may be useful later.
counter=0

while IFS= read -r json_object
do # counter is how many inference tasks can run (starting at 0) 
  if [ $counter -gt 2 ]; then
    counter=0
    break
  fi

  counter=$((counter+1))

  # Genrate unique variables for all tasks, plug them into start_inference.sh
  string=$json_object
  IFS=',' read -ra ADDR <<< "$string"

  prompt_id=${ADDR[0]}

  # A '.' in the 0 index of a task line's key indicates that the task is being processed by another instance
  if [[ ${prompt_id:1:1} != '.' ]]; then

    # Saving the prompt_id as extracted from the tasks
    search_string=$prompt_id
    prompt_id="${prompt_id:0:1}.${prompt_id:1:${#prompt_id}}"
    prompt="""${ADDR[@]:1}"""
    new_line="$prompt_id,$prompt"
    sed -i "/${search_string}/s!.*!${new_line}!" /home/user/gpt-threads/gpt-threads-compute/logs/tasks

    prompt_id="""${search_string#\"}"""
    prompt_id="""${prompt_id%\"}"""
    prompt="""${prompt//,/ }"""

    var_name="prompt"
    serialized_prompt_var="prompt$prompt_id"
    declare "$serialized_prompt_var=$prompt"

    # I don't know if this is a hacky way to parallelize an application and turn it into a service, but it works reliably. See also: ./start_service.sh

    # Generate the output using the provided prompt, then add a '-' to the first line in the output file, serialized by the prompt_id.
    (source /home/user/gpt-threads/gpt-threads-compute/start_inference.sh "${!serialized_prompt_var}") | tee -a "/home/user/gpt-threads/gpt-threads-compute/output/"${serialized_prompt_var:6}"" & echo $! > /home/user/gpt-threads/gpt-threads-compute/logs/${serialized_prompt_var:6} & wait && sleep 1

  else
    continue

  fi


done < <(cat /home/user/gpt-threads/gpt-threads-compute/logs/tasks)







