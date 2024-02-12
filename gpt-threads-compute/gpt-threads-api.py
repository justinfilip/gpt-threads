import psycopg2
from hashlib import sha256
import os, re, sys, subprocess, json, time
from flask import Flask, request, jsonify
import requests, math, random
from requests.exceptions import HTTPError

app_dir = os.getcwd()
application = Flask(__name__, static_folder= app_dir + '/public/')
application.config['SESSION_TYPE'] = 'filesystem'
application.config.from_object(__name__)


# username validation
def usernameValidation(username):
    # Check username length is at least 6
    if len(username) > 6:
        # Check that username doesn't have special characters other than "_"
        if not any(c in "`!@#$%^&*()+-=\[\]{};:'\"\\|,.<>\/?~" for c in username if c != '_'):
            return 1

        else:
            return 0
    else:
        return 0

def getUserInfo(username):

    conn = psycopg2.connect(
        host="127.0.0.1",
        database="gpt_threads_users",
        user="gpt_threads",
        password="f789ds7fs8d7f9sd87f9sd8f798fj39s"
    )

    # Create a cursor object
    cur = conn.cursor()

    cur.execute("select * from gpt_threads_users where username = '" + username + "';")

    # Commit the changes
    conn.commit()

    rows = cur.fetchall()
    user_id = rows[0][2]

    return user_id



@application.route('/sgptgetuser', methods=['POST'])
def sub_mod():
    if request.method == 'POST':
        message = request.get_json()
        user_id = message.get('user_id')

        # Connect to the PostgreSQL database
        conn = psycopg2.connect(
            host="127.0.0.1",
            database="gpt_threads_users",
            user="gpt_threads",
            password="f789ds7fs8d7f9sd87f9sd8f798fj39s"
        )

        # Create a cursor object
        cur = conn.cursor()

        # Lookup user by id
        cur.execute("select * from gpt_threads_ids where user_id = '" + user_id + "';")

        # Commit the changes
        conn.commit()

        rows = cur.fetchall()

        user_id = rows[0][0]
        username = rows[0][1]

        return jsonify({'user_id': user_id}), 200
        


@application.route('/sgptusermod', methods=['POST'])
def user_mod():

        if request.method == 'POST':

            conn = psycopg2.connect(
            host="127.0.0.1",
            database="gpt_threads_users",
            user="gpt_threads",
            password="f789ds7fs8d7f9sd87f9sd8f798fj39s"
        )

        # Create a cursor object
        cur = conn.cursor()

        message = request.get_json()
        username = message.get('username')
        pass_hash = message.get('pass_hash')
        mode = message.get('mode')

# User sign in / get user
# // arg[0] = username, arg[1] = password, arg[2]: 0 = sign in, 1 = create user, 2 = delete user, 3 = modify user

        if mode == 0:

            try:

                user_id = getUserInfo(username)

                return jsonify({'id': user_id}), 200
         
            except:

                return jsonify({'id': 0}), 200


# Create user
        elif (mode == 1):

            recovery_string = message.get('recovery_string')

            # Check username length is at least 6
            if usernameValidation(username) == 1:

                pass

            else:

                # return that the username was invalid
                return jsonify({'id': -3}), 200


            # Generate user_id
            user_id = sha256(str(username + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random)).encode('utf-8')).hexdigest()

            try:
                # Create user record
                cur.execute("INSERT INTO gpt_threads_users (username, pass_hash, id) VALUES ('" + username + "', '" + pass_hash + "', '" + user_id + "');")

            except:
                # username taken
                return jsonify({'id': -1}), 200


            # Commit the changes
            conn.commit()

            # Create user id table
            cur.execute("INSERT INTO gpt_threads_ids (user_id, username) VALUES ('" + user_id + "', '" + username + "');")

            # Commit the changes
            conn.commit()

            # Create user recovery table
            cur.execute("INSERT INTO gpt_threads_recovery_keys (recovery_string, username) VALUES ('" + recovery_string + "', '" + username + "');")

            # Commit the changes
            conn.commit()

            return jsonify({'id': user_id}), 200

# Recover user
        elif (mode == 2):

            recovery_string = message.get('recovery_string')

            # Create a cursor object
            cur = conn.cursor()

            # Lookup user by id
            cur.execute("select * from gpt_threads_recovery_keys where recovery_string = '" + recovery_string + "';")

            # Commit the changes
            conn.commit()

            rows = cur.fetchall()
            check_username = rows[0][1]

            if (check_username == username):

                # Generate new user_id
                user_id = sha256(str(username + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random) + str(random.random)).encode('utf-8')).hexdigest()

                # Update user record with payment address
                cur.execute("update gpt_threads_users set pass_hash = '" + pass_hash + "', id = '" + user_id + "' where username = '" + username + "';")

                # Commit the changes
                conn.commit()

                return jsonify({'id': user_id}), 200

            else:
                # username invalid
                return jsonify({'id': 1}), 200

# Modify user
        elif mdoe == 3:
            print("modify user")


        else:

            return jsonify({'id': 0}), 200



# Kill inference task
@application.route('/sgptkilltask', methods=['POST'])
def kill_inference_task():
    if request.method == 'POST':

        message = request.get_json()
        prompt_id = message.get('prompt_id')

        # to verify the last token delivered, but ultimately it could be tampered with. If a bunch of misalignments started happening at once, that could be an indicator of an application problem
        last_token = message.get('last_token') 

        # kill running task
        try:
            with open(app_dir + "/logs/" + prompt_id, "r") as task_manifest:
                manifest = task_manifest.read()
                manifest = manifest.split("\n")

            counter = 0
            for parameter in manifest:

                if (parameter == ''):
                    continue
                
                match counter:
                    case 0: 
                        subprocess.run(["sudo", "kill", "-9", str(int(parameter) + 2)])
                        # pkill -f "Process name"

                        # delete log file
                        subprocess.run(["sudo", "rm", app_dir + "/logs/" + prompt_id])
                        # delete output file 
                        subprocess.run(["sudo", "rm", app_dir + "/output/" + prompt_id])



            # active task was interrupted and deleted successfully
            task_deleted = 1
            return jsonify({prompt_id: [task_deleted]}), 200

        # task is not being processed yet, delete the record
        except:

            try:
                with open(app_dir + "/logs/cancelled_tasks", "a") as cancelled_tasks_file:
                    cancelled_tasks_file.write(prompt_id)
                    cancelled_tasks_file.write(os.linesep)

                # scheduling task for deletion succeeded
                task_deleted = 1
                return jsonify({prompt_id: [task_deleted]}), 200
            except:

                # scheduling task for deletion failed
                task_deleted = 0
                return jsonify({prompt_id: [task_deleted]}), 200





@application.route('/sgptprompt', methods=['POST'])
def prompt_handler():

    message = request.get_json()
    user_id = message.get('user_id')
    mode = message.get('server_mode')

    # The user just initiated a new inference task
    if mode == 0:

        prompt_id = message.get('prompt_id')
        prompt = str(message.get('prompt'))
        prompt = prompt.replace('\n', '')
        prompt = prompt.replace('\r', '')
        prompt = prompt.replace("'", "\'")
        prompt = prompt.replace(u'\u00a0', '')
        prompt = re.sub(' +', ' ', prompt)

        # Store the task in the tasks file
        # The task will be processed by the auto inference service and the output made available as it is generated. The user will make GET requests on a few second interval to retrieve tokens until it is reported back to the client that the task has been completed, indicated by the prescence of a '-' in the first row of the output. The prompt_id is used as a key to locate files and task records. 
        with open(app_dir + "/logs/tasks", "a") as tasks_file:
            tasks_file.write('"' + prompt_id  + '"' + ',"""' + prompt.replace('\n', ''))
            tasks_file.write('"""')
            tasks_file.write(os.linesep)

        return jsonify({'prompt_id': prompt_id, 'next_token': 1}), 200
        # return "wtf"

    # The user is requesting generated tokens for their prompt
    elif mode == 1:
        prompt_id = message.get('prompt_id')
        next_token = 1

        # If the client's prompt has been removed from the tasks file, the processing has been completed, retrieve any remaining tokens and let the client know the request chain is complete



        # IF OUTPUT FILE EXISTS
            # IF IT DOESN'T EXIST, THE INFERENCE TASK MAY NOT YET HAVE BEEN SELECTED TO BE PROCESSED. 
       
        output_path = app_dir + "/output/" + prompt_id
        
        if os.path.isfile(output_path):


            with open(output_path, "r") as inference_output_file:
                inference_output = inference_output_file.read()

                # 7-bit C1 ANSI sequences
                ansi_escape = re.compile(r'''
                    \x1B  # ESC
                    (?:   # 7-bit C1 Fe (except CSI)
                        [@-Z\\-_]
                    |     # or [ for CSI, followed by a control sequence
                        \[
                        [0-?]*  # Parameter bytes
                        [ -/]*  # Intermediate bytes
                        [@-~]   # Final byte
                    )
                ''', re.VERBOSE)
                inference_output = ansi_escape.sub('', inference_output)

            # '-' indicates that inference is complete and there will not be a next set of tokes to collect
            # If reading the 0th character fails, there is no output yet, return a blank response to the user with next_token = 1
            try:
                if inference_output[0] == '-':
                    next_token = 0

                    with open(app_dir + "/output/" + prompt_id, "w") as inference_output_file_edited:
                        inference_output = inference_output.replace("-\n", "~\n")
                        inference_output_file_edited.write(inference_output)

                if '[INST]"""' in inference_output[6:]:
                    print("")
                    print("KILLING CORRUPT TASK")
                    print("")
                    # Sometimes input that is too simple in context with the prompt and tokens you're replying to will cause llama.cpp to freak out and launch a bunch of processes under the same task. Weird. This fixes that.

                    # timeout 5 ./kill_inference_processes.sh

                    try:
                        with open(app_dir + "/logs/cancelled_tasks", "a") as cancelled_tasks_file:
                            cancelled_tasks_file.write(prompt_id)
                            cancelled_tasks_file.write(os.linesep)

                        # scheduling task for deletion succeeded
                        task_deleted = 1
                        # return jsonify({prompt_id: [task_deleted]}), 200

                    except:

                        print("")
                        print("FAILED TO SCHEDULE TASK DELETION")
                        print("")

                    # delete log files
                    subprocess.run(["sudo", "rm", app_dir + "/logs/" + prompt_id])
                    # delete output file 
                    subprocess.run(["sudo", "rm", app_dir + "/output/" + prompt_id])

                    subprocess.run(["sudo", "bash", app_dir + "/reset_inference.sh"])

                    return jsonify({prompt_id: [0, 0, "I don't know how to respond to that, try asking a different way."]}), 200

            except:

                print("")
                print("TASK RUNNING")
                print("")
                # system busy
                # return jsonify({prompt_id: [next_token, last_token, tokens_string]}), 200
                return jsonify({prompt_id: [1, 0, ""]}), 200
                
            # get the last token index from the user and use it to determine which tokens to send next, then format and send tokens back to user
            last_token = int(message['last_token'])

            try:
                inference_output = inference_output[inference_output.index("[\INST]") + 7:]
            # In the split microsecond it took for the inference service to put a '-' in the output, this function passed the initial check for it above and then tried to access a substring index that didn't exist, because the output returned nothing and placed an '-' in the top of the file.

            # This catches that.
            except:
                return jsonify({prompt_id: [0, 0, "I don't know how to respond to that."]}), 200
            
            inference_output.replace("", "  ")
            tokens = inference_output.split(" ")

            # If the last character of the output is not a space, the token isn't complete, split the inference output and drop the last token
            if inference_output.rfind(" ") != len(inference_output) - 1:

                # extra layer of 'no'
                if next_token != 0:
                    del tokens[-1]

            # slice the list by last_token to get the new tokens to send
            tokens_to_send = tokens[last_token:]
            tokens_string = " ".join(map(str, tokens_to_send))

            # update last_token to send back to user
            last_token = len(tokens)

            return jsonify({prompt_id: [next_token, last_token, tokens_string]}), 200

        else:
            # system busy
            # return jsonify({prompt_id: [next_token, last_token, tokens_string]}), 200
            return jsonify({prompt_id: [1, 0, ""]}), 200
    else:
        prompt_id = message.get('prompt_id')
        return jsonify({prompt_id: [1, 0, "Whatever you just said was a fantastic question, very creative, or clear directions on what to do, I'm sure, but I have no idea what you said. Can you say that again?"]}), 200

if __name__ == '__main__':
    application.run(port=8000)