var promptable = 1;
var display_mode = "";
var auth_mode = 0;
var back_pressed = 0;
var reply_active = 0;

const history_container = document.getElementById("history_window");
const text_input = document.getElementById("text_input");
const prompt_page = document.getElementById("promptpage");
const keys_toggle = document.getElementById("keys_toggle");
const send_button = document.getElementById("text_input_send_button");
const sign_out_button = document.getElementById('sign_out_button');
const sign_up_button = document.getElementById("sign-up-button");
const sign_in_button = document.getElementById("sign-in-button");
const username_field = document.getElementById("username-field");
const password_field = document.getElementById("password-field");
const confirm_password_field = document.getElementById("confirm-password-field");
const recover_account_button = document.getElementById('recover-account-button');
const submit_auth_button = document.getElementById("auth-submit-button");
const error_div = document.getElementById("error-div");

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    display_mode = 'dark_';
    dlToggle(1);
} else {
    display_mode = 'light_';
    dlToggle(1);
}

// document.getElementById('promptbutton').className = display_mode + 'navbuttonselected';
document.getElementById('promptpage').className = 'activepage';

text_input.innerHTML = '<p id="placeholder">What can I help with?</p>';

text_input.className = display_mode + "text-input-field";

text_input.addEventListener('focusout', async function(e) {
    if(text_input.innerHTML.length < 1) {
        text_input.innerHTML = '<p id="placeholder">What can I help with?</p>';
    }
});

text_input.addEventListener('blur', async function(e) {
    if(text_input.innerHTML.length < 1) {
        text_input.innerHTML = '<p id="placeholder">What can I help with?</p>';
    }
});

text_input.addEventListener('onfocus', async function(e) {
    if(text_input.innerHTML == '<p id="placeholder">What can I help with?</p>') {
        text_input.innerText = "";
    }
});

text_input.addEventListener('click', async function(e) {

    if(text_input.innerHTML == '<p id="placeholder">What can I help with?</p>') {
        text_input.innerText = "";
    }
});

window.addEventListener('focus', async function(e) {
    if(text_input.innerHTML == '<p id="placeholder">What can I help with?</p>') {
        text_input.innerText = "";
    }
});

// dark mode toggle

const dark_light_toggle = document.getElementById('light-dark-toggle');
const body_element = document.getElementById("main-body");
const pages_num = 3;

function dlToggle(mode) {

    if (mode === 0) {
        // cycling themes
        if (display_mode === 'light_') {
            display_mode = 'dark_';
            
        } else if (display_mode === 'dark_') {
            display_mode = 'light_';
            
        } else {
            // pass
        }
        
        setCookie('display_mode', display_mode, "");
    }

    if (display_mode === 'light_') {

        document.getElementById('pwa-theme').content = "#ffffff";
    } else if (display_mode === 'dark_') {

        document.getElementById('pwa-theme').content = "#000000";
    } else {
        // pass
    }

    var themed_elements = document.querySelectorAll('[class*="_"]');

    for (i=0;i<themed_elements.length;i++) {
        themed_elements[i].className = display_mode + themed_elements[i].className.split("_")[1];
    }

    setTimeout(function(e) {
        toggled = 0
    }, 500)
}

var toggled = 0

// Get token completions from the inference server:

async function getTokens(prompt_id, last_token) {

    // Use fetch to send the text to the PHP function
    fetch('scripts/prompt.php?prompt_id=' + prompt_id + '&last_token=' + last_token.toString(), {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        let reply_to_id = "";

        try {
            reply_to_id = text_input.parentElement.dataset.replyto;

            if (reply_to_id == undefined) {
                reply_to_id = "";
            }
        } catch {
            reply_to_id = "";
        }

        // console.log("THIS IS THE REPLY TO ID WHILE GET TOKENS : " + reply_to_id)
            
        // console.log(data);

        last_token = data[prompt_id][1]

        if (data[prompt_id][0] === 1) {

            // try {
            token_payload = data[prompt_id][2];
        
            if (token_payload == "") {

                setTimeout(function(){
                    getTokens(prompt_id, last_token);
                }, 1000);
            } else {
                document.getElementById("tokens_" + prompt_id).innerText += ' ' + token_payload;
                
                setTimeout(function(){
                    getTokens(prompt_id, last_token);
                }, 350);
            }
            // } catch {
            //     // Element was likely deleted by user canceling inference task
            //     return
            // }
            
        } else if (data[prompt_id][0] === 0) {

            // try {

            let tokens_element = document.getElementById("tokens_" + prompt_id)

            // console.log('appending final tokens')
            tokens_element.innerText += ' ' + data[prompt_id][2];

            
            // console.log('appending final tokens complete')
 
            let reply_button = document.createElement('div');
            
            // console.log("CREATING REPLY BUTTON")
            // console.log("CONTAINER CLASS NAME: " + document.getElementById('container_' + prompt_id).className)
            if (document.getElementById('container_' + prompt_id).className != "history-element-container-closed") {
                reply_button.className = 'reply-button';
            } else {
                reply_button.className = 'reply-button-small';
            }

            reply_button.id = 'reply_' + prompt_id;
            // console.log('created reply button');
      

            let response_actions_container = document.createElement('div');
            response_actions_container.className = "history-prompt-element-actions";
            response_actions_container.id = "actions_" + prompt_id;

            // console.log('attempting to insert')


            if (document.getElementById('prompt_' + prompt_id).className.includes('-reply-')) {
                // do not append a reply button
            } else {

                // console.log("ACTUALLY APPENDING REPLY BUTTON")
                response_actions_container.prepend(reply_button);
            }

            document.getElementById('prompt_' + prompt_id).insertAdjacentElement('beforebegin', response_actions_container);
            
            if (reply_to_id == "") {
                
                document.getElementById('reply_' + prompt_id).addEventListener('click', function(e) {

                    if (reply_active == 0) {

                        // this is the first prompt in the chain, so set the reply_to_id so that when the user hits send, the target prompt container can be located. Leaving the context by clicking any of the back buttons will reset reply_to_id to ""

                        if (reply_to_id == "") {
                            // change prompter box to reply mode
                            // placeholder = Write your reply here
                            let prompt_id = e.target.id.split("_")[1];
                            text_input.parentElement.setAttribute('data-replyto', prompt_id);
                            reply_target = document.getElementById('tokens_' + prompt_id);
                            reply_prompt_target = document.getElementById('prompt_' + prompt_id);
                            reply_target.className = display_mode + "history-tokens-element-selected";
                            reply_prompt_target.className = display_mode + "history-prompt-element-loading-selected";
                            text_input.parentElement.className = display_mode + "text-input-reply" + " shadow";

                            text_input.focus();

                            setTimeout(function() {
                                text_input.innerText = "";
                            }, 300);

                        } else {
                            // console.log("reply already processing, try again later")
                            var current_text_input_class = text_input.parentElement.className;
                            text_input.parentElement.className = display_mode + "text-input-wait shadow";

                            function waitSend(current_text_input_class) {
                                text_input.parentElement.className = current_text_input_class;
                            }

                            setTimeout(waitSend(current_text_input_class), 600);
                                
                        }

                    } else {

                        // console.log("reply is active")
                        // let active_reply_prompt = document.getElementsByClassName(display_mode + 'history-prompt-element-loading-selected');
                        // console.log(active_reply_prompt.id.split("_")[1])
                        // document.getElementById("reply_" + e.target.id.split("_")[1]).className = "reply-button-wait";


                        // setTimeout(function () {
                        //     let wait_elements = document.getElementsByClassName('reply-button-wait');

                        //     for (i = 0; i < wait_elements.length; i++) {
                        //         wait_elements[i].className = "reply-button";
                        //     }

                        // }, 3000);

                        var current_text_input_class = text_input.parentElement.className;
                        text_input.parentElement.className = display_mode + "text-input-wait shadow";

                        function waitSend(current_text_input_class) {
                            text_input.parentElement.className = current_text_input_class;
                        }

                        setTimeout(waitSend(current_text_input_class), 600);
                    }

                });
                // console.log('appending event listener to reply button')
            }

            setTimeout(function (e) {

                

                if (document.getElementById("prompt_" + prompt_id).className.includes('-reply-')) {
                    document.getElementById("prompt_" + prompt_id).className = display_mode + "history-reply-element";
                } else {
                    document.getElementById("prompt_" + prompt_id).className = display_mode + "history-prompt-element";
                }

                let current_cancel_button = document.getElementById("cancel_button_" + prompt_id);

                let replacement_element = current_cancel_button.cloneNode(true);
                replacement_element.className = "history-prompt-element-delete-button";
                replacement_element.id = current_cancel_button.id;

                replacement_element.addEventListener('click', function(e) {

                    e.target.className = "history-prompt-element-cancel-button-selected";
                    var prompt_id = e.target.parentElement.parentElement.id.split("_")[1];
                    setTimeout(function() {
                        document.getElementById("prompt_" + prompt_id).remove();
                        document.getElementById("tokens_" + prompt_id).remove();
                        document.getElementById("container_" + prompt_id).remove();
                        localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                    }, 100);
                });

                document.getElementById("cancel_button_" + prompt_id).parentNode.replaceChild(replacement_element, current_cancel_button);

                reply_target = document.getElementById('tokens_' + reply_to_id);
                reply_prompt_target = document.getElementById('prompt_' + reply_to_id);
                try {
                    reply_target.className = display_mode + "history-tokens-element";
                } catch {
                    // pass
                }
                
                
                try {
                    reply_prompt_target.className = display_mode + "history-prompt-element";
                } catch {
                    // pass
                }


                // if the reply element is the one being processed
                if (document.getElementById("prompt_" + prompt_id).className.includes('-reply-')) {

                    reply_active = 0;
                    text_input.parentElement.className = display_mode + "text-input" + " shadow";
                    text_input.parentElement.setAttribute('data-replyto', "");

                }

                localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                
            }, 1000);

            return;

        } else {
            // pass
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Send the user's prompt to the PHP function that calls the inference server:

async function sendPrompt(prompt) {

    let reply_to_id = "";

    try {
        reply_to_id = text_input.parentElement.dataset.replyto;

        if (reply_to_id == undefined) {
            reply_to_id = "";
        }
    } catch {
        reply_to_id = "";
    }

    // replying to a previous prompt
    if (reply_to_id != "") {
        // send original prompt + tokens + reply input as inference input
        let original_prompt = document.getElementById("prompt_" + reply_to_id).innerHTML;
        let original_tokens = document.getElementById("tokens_" + reply_to_id).innerHTML;
        // append generated tokens to a new tokens element within the tokens element
        console.log("");
        console.log("ORIGINAL PROMPT: " + original_prompt);
        console.log("");
        console.log("");
        console.log("ORIGINAL tokens: " + original_tokens);
        console.log("");

        text_input.innerHTML = "";
        var request_body = {
            user_id: readCookie('id'),
            // prompt: original_prompt + original_tokens + '[INST]' + prompt + '[\\INST]',
            prompt: "Reply to the instruction or question(s) after the Q: in the following text while using the following text as context: " + original_prompt + " " + original_tokens + " Q: " + prompt + "",
            mode: 0
        }

        // Send the text to the PHP GET function
        fetch('scripts/prompt.php', {
            method: 'POST',
            body: JSON.stringify(request_body)
        })
        .then(response => response.json())
        .then(data => {
                
            // console.log(data);

            if (data['next_token'] === 1) {
                var prompt_id = data['prompt_id'];
                var history_element_container = document.createElement('div');
                
                history_element_container.className = display_mode + "history-element-container-expanded";
                
                history_element_container.id = "container_" + prompt_id;
                history_element_container.setAttribute('data-promptposition', '1');
                

                var history_element = document.createElement('div');
                history_element.className = display_mode + "history-reply-element-loading";
                history_element.innerText = prompt;
                history_element.id = "prompt_" + prompt_id

                var history_actions = document.createElement('div');
                history_actions.id = "historyActions_" + prompt_id;
                history_actions.className = "history-reply-element-actions";

                var history_cancel_button = document.createElement('div');
                history_cancel_button.className = "history-prompt-element-cancel-button";
                history_cancel_button.id = "cancel_button_" + prompt_id

                var history_back_button = document.createElement('div');
                history_back_button.id = "back_" + prompt_id;
                history_back_button.className = "history-prompt-element-back-button";

                history_cancel_button.addEventListener('click', function(e) {

                    e.target.className = "history-prompt-element-cancel-button-selected";
                    var prompt_id = e.target.parentElement.parentElement.id.split("_")[1];
                    setTimeout(function killTask() {
                        var prompt_history_element_to_delete = document.getElementById("prompt_" + prompt_id);
                        if (prompt_history_element_to_delete.className === display_mode + "history-reply-element-loading") {
                            // call server to cancel inference task for prompt_id
                            
                            var request_body = {
                                prompt_id: prompt_id,
                                mode: 1,
                            }
        
                            fetch('scripts/prompt.php', {
                                method: 'POST',
                                body: JSON.stringify(request_body)
                            })
                            .then(response => response.json())
                            .then(data => {
                
                                // console.log(data);

                                task_deleted = data[prompt_id][0];
        
                                if (task_deleted === 1) {
                                    prompt_history_element_to_delete.remove();
                                    document.getElementById("tokens_" + prompt_id).remove();
                                    document.getElementById("container_" + prompt_id).remove();
                                    promptable = 1;
                                    send_button.className = "text-input-send-button";

                                } else {
                                    // failed, maybe retry
                                    setTimeout(function() {killTask()}, 500);
                                }
                                
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                        }
                    }, 100);
                });

                if (reply_to_id == "") {

                    history_actions.append(history_back_button);
                    document.getElementById("back_" + prompt_id).addEventListener('click', function(e) {

                        if (back_pressed != 1) {
                            back_pressed = 1;

                            prompt_id = e.target.id.split("_")[1];

                            if(isMobile() || window.innerWidth < 900) {
                                setTimeout(function() {
                                    document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                    try {
                                        document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                    } catch {
                                        // reply button doesn't exist
                                    }
                                    document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-closed-mobile";
                                }, 100);
                            } else {
                                setTimeout(function() {
                                    try {
                                        document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                    } catch {
                                        // reply button doesn't exist
                                    }
                                    document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                    setTimeout(function() {
                                        document.getElementById("container_" + prompt_id).className = "history-element-container-closed";
                                    }, 0);
                                }, 0);
                            }
                            
                            e.target.className = "history-prompt-element-back-button-hidden";

                            let reply_to_id = "";


                            try {
                                reply_to_id = text_input.parentElement.dataset.replyto;

                                if (reply_to_id == undefined) {
                                    reply_to_id = "";
                                }
                            } catch {
                                reply_to_id = "";
                            }

                            reply_target = document.getElementById('tokens_' + reply_to_id);
                            reply_prompt_target = document.getElementById('prompt_' + reply_to_id);
                            reply_target.className = display_mode + "history-tokens-element";
                            reply_prompt_target.className = display_mode + "history-prompt-element";

                            if (text_input.parentElement.className.includes('-reply')) {
                                text_input.parentElement.className = display_mode + "text-input" + " shadow";
                                text_input.parentElement.setAttribute('data-replyto', "");
                            }

                            setTimeout(function() {
                                back_pressed = 0;
                            }, 600);
                        }

                        localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                        
                    });
                }

                history_actions.append(history_cancel_button);
                
                history_element_container.prepend(history_actions);
                
                
                history_element_container.append(history_element);
                document.getElementById('container_' + reply_to_id).appendChild(history_element_container);


                document.getElementById('container_' + prompt_id).addEventListener('click', function(e) {

                    // try {

                    // anywhere except the cancel button was clicked
                    prompt_id = e.target.id.split("_")[1];
                    document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-expanded";
                    try {
                        document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button";
                    } catch {

                    }

                    try {
                        document.getElementById("reply_" + prompt_id).className = "reply-button";
                    } catch {
                        
                    }
                    
                    
                    // setTimeout(function() {
                    //     const y = document.getElementById("container_" + prompt_id).getBoundingClientRect().top + window.scrollY - 100;
    
                    //     window.scrollTo({top: y, behavior: 'smooth'});
                    // }, 0);
                    // } catch {
                    //     // cancel button was likely clicked
                    //     // pass
                    // }
                    
                });

                

                var created_history_prompt_element = document.getElementById("prompt_" + prompt_id);
                const y = created_history_prompt_element.getBoundingClientRect().top + window.scrollY - 100;

                window.scrollTo({top: y, behavior: 'smooth'});

                createNewHistoryElement(prompt_id);

                

                var last_token = 0;
                
                setTimeout(function (e) {
                    // document.getElementById('container_' + prompt_id).click();
                    getTokens(prompt_id, last_token);
                }, 2000);

            } else {
                text_input.innerText = "What do you think?";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


    // sending a new prompt
    } else {

        text_input.innerHTML = "";
        var request_body = {
            user_id: readCookie('id'),
            prompt: prompt,
            mode: 0
        }

        // Send the text to the PHP GET function
        fetch('scripts/prompt.php', {
            method: 'POST',
            body: JSON.stringify(request_body)
        })
        .then(response => response.json())
        .then(data => {
                
                // console.log(data);

            if (data['next_token'] === 1) {
                var prompt_id = data['prompt_id'];
                

                var history_element_container = document.createElement('div');
                

                history_element_container.className = "history-element-container-expanded";
                
                history_element_container.id = "container_" + prompt_id;
                history_element_container.setAttribute('data-promptposition', '0');
                
                var history_element = document.createElement('div');
                history_element.className = display_mode + "history-prompt-element-loading";
                history_element.innerText = prompt;
                history_element.id = "prompt_" + prompt_id

                var history_actions = document.createElement('div');
                history_actions.id = "historyActions_" + prompt_id;
                history_actions.className = "history-prompt-element-actions";

                var history_cancel_button = document.createElement('div');
                history_cancel_button.className = "history-prompt-element-cancel-button";
                history_cancel_button.id = "cancel_button_" + prompt_id

                var history_back_button = document.createElement('div');
                history_back_button.id = "back_" + prompt_id;
                history_back_button.className = "history-prompt-element-back-button";

                history_cancel_button.addEventListener('click', function(e) {

                    e.target.className = "history-prompt-element-cancel-button-selected";
                    var prompt_id = e.target.parentElement.parentElement.id.split("_")[1];
                    setTimeout(function killTask() {
                        var prompt_history_element_to_delete = document.getElementById("prompt_" + prompt_id);
                        if (prompt_history_element_to_delete.className === display_mode + "history-prompt-element-loading") {
                            // call server to cancel inference task for prompt_id
                            
                            var request_body = {
                                prompt_id: prompt_id,
                                mode: 1,
                            }
        
                            fetch('scripts/prompt.php', {
                                method: 'POST',
                                body: JSON.stringify(request_body)
                            })
                            .then(response => response.json())
                            .then(data => {
                
                                // console.log(data);

                                task_deleted = data[prompt_id][0];
        
                                if (task_deleted === 1) {
                                    prompt_history_element_to_delete.remove();
                                    document.getElementById("tokens_" + prompt_id).remove();
                                    document.getElementById("container_" + prompt_id).remove();
                                    promptable = 1;
                                    send_button.className = "text-input-send-button";
                                } else {
                                    // failed, maybe retry
                                    setTimeout(function() {killTask()}, 500);
                                }
                                
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                        }
                    }, 100);
                });

                history_actions.append(history_back_button);
                history_actions.append(history_cancel_button);
                
                
                history_element_container.append(history_element);
                history_element_container.prepend(history_actions);
                history_container.append(history_element_container);

                document.getElementById("container_" + prompt_id).addEventListener('click', function(e) {

                    if (back_pressed != 1) {
                        back_pressed = 1;

                        setTimeout(function() {
                            back_pressed = 0;
                        }, 300);

                        // try {

                        // anywhere except the cancel button was clicked
                        prompt_id = e.target.id.split("_")[1];
                        document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-expanded";
                        try {
                            document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button";
                        } catch {
    
                        }
    
                        try {
                            document.getElementById("reply_" + prompt_id).className = "reply-button";
                        } catch {
                            
                        }

                        // setTimeout(function() {
                        //     const y = document.getElementById("container_" + prompt_id).getBoundingClientRect().top + window.scrollY - 100;
        
                        //     window.scrollTo({top: y, behavior: 'smooth'});
                        // }, 100);
                        // } catch {
                        //     // cancel button was likely clicked
                        //     // pass
                        // }
                    }
                    
                    
                });

                document.getElementById("back_" + prompt_id).addEventListener('click', function(e) {

                    if (back_pressed != 1) {
                        back_pressed = 1;
                        
                        prompt_id = e.target.id.split("_")[1];

                        if(isMobile() || window.innerWidth < 900) {
                            setTimeout(function() {
                                try {
                                    document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                } catch {
                                    // reply button doesn't exist
                                }
                                document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-closed-mobile";
                            }, 100);
                        } else {
                            setTimeout(function() {
                                try {
                                    document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                } catch {
                                    // reply button doesn't exist
                                }
                                document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                setTimeout(function() {
                                    document.getElementById("container_" + prompt_id).className = "history-element-container-closed";
                                }, 0);
                            }, 0);
                            
                        }

                        e.target.className = "history-prompt-element-back-button-hidden";

                        let reply_to_id = "";

                        try {
                            try {
                                reply_to_id = text_input.parentElement.dataset.replyto;

                                if (reply_to_id == undefined) {
                                    reply_to_id = "";
                                }
                            } catch {
                                reply_to_id = "";
                            }

                            reply_target = document.getElementById('tokens_' + reply_to_id);
                            reply_prompt_target = document.getElementById('prompt_' + reply_to_id);
                            reply_target.className = display_mode + "history-tokens-element";
                            reply_prompt_target.className = display_mode + "history-prompt-element";

                            if (text_input.parentElement.className.includes('-reply')) {
                                text_input.parentElement.className = display_mode + "text-input" + " shadow";
                                text_input.parentElement.setAttribute('data-replyto', "");
                            }
                        } catch {
                            // no reply settings to undo
                        }

                        setTimeout(function() {
                            back_pressed = 0;
                        }, 600);
                    }

                    
                    
                    localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                    
                });

                var created_history_prompt_element = document.getElementById("prompt_" + prompt_id);
                const y = created_history_prompt_element.getBoundingClientRect().top + window.scrollY - 100;

                window.scrollTo({top: y, behavior: 'smooth'});

                createNewHistoryElement(prompt_id);

                var last_token = 0;
                
                setTimeout(function (e) {
                    getTokens(prompt_id, last_token);
                }, 2000);

            } else {
                text_input.innerText = "What do you think?";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Sending prompts

// Make sure the user's prompt is formatted properly:
async function validateSendPrompt(send_button, prompt) {

    if (promptable == 1) {
        
        if(readCookie("id") == null) {
            send_button.className = "text-input-send-button-rejected";
            setTimeout(function (e) {
                send_button.className = "text-input-send-button";
            }, 300);
            alert("Please sign in or create an account to use this feature")
            return
    
        } else {
            promptable = 0;
            send_button.className = "text-input-send-button-selected";

            setTimeout(function (e) {
                promptable = 1;
                send_button.className = "text-input-send-button";
            }, 1500);

            sendPrompt(prompt);
        }
    }
    
}

// Send button to send

send_button.addEventListener('pointerdown', async function(e) {

    var prompt = text_input.innerText;
    
    if (prompt.length < 15 || text_input.innerHTML == '<p id="placeholder">What can I help with?</p>') {
        send_button.className = "text-input-send-button-rejected";
        setTimeout(function (e) {
            send_button.className = "text-input-send-button";
        }, 300);
        alert("Your prompt needs to be at least 15 characters")
        return
    }

    
    if (reply_active == 1) {
        // a reply is already processing
        var current_text_input_class = text_input.parentElement.className;
        text_input.parentElement.className = display_mode + "text-input-wait shadow";

        function waitSend(current_text_input_class) {
            text_input.parentElement.className = current_text_input_class;
        }

        setTimeout(waitSend(current_text_input_class), 600);

    } else {

        if (text_input.parentElement.className.includes('-reply')) {
            reply_active = 1;
        }
        
        validateSendPrompt(send_button, prompt);
    }

});

// Shift key & Enter while focused on the span element (text_input) to send prompt:

text_input.addEventListener('keyup', function(e) {
    // Shift key & Enter being pressed

    if (e.shiftKey && e.key === 'Enter') { // && busy === 0

        if (isMobile()) {
            return
        }
        e.preventDefault();

        if (reply_active == 1) {
            // a reply is already processing
            text_input.parentElement.className = display_mode + "text-input-wait shadow";
            setTimeout(function (e) {
                text_input.parentElement.className = display_mode + "text-input-reply shadow";
            }, 300);
            
        } else {

            if (text_input.parentElement.className.includes('-reply')) {
                reply_active = 1;
            }
            var prompt = text_input.innerText;
            validateSendPrompt(send_button, prompt);
        }
    }
});

text_input.addEventListener('keypress', function(e) {

    // Shift key & Enter being pressed
    if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
    }
});

// Auxillary functions:

async function hashWords(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
}

function msToLocalDateTime(millis) {
    // Create a new Date object from the input milliseconds
    const date = new Date(millis);
    
    // Get the user's time zone offset in minutes
    const timeZoneOffset = date.getTimezoneOffset();
    
    // Convert the time zone offset to milliseconds
    const timeZoneOffsetMilliseconds = timeZoneOffset * 60 * 1000;
    
    // Subtract the time zone offset from the input milliseconds
    // to get the local date and time
    const localDateAndTimeMillis = millis - timeZoneOffsetMilliseconds;
    
    // Create a new Date object with the local date and time
    const localDate = new Date(localDateAndTimeMillis);
    
    // Format the local date and time as a string
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const localDateTimeString = localDate.toLocaleString('en-US', options);
    
    // Return the formatted local date and time string
    return localDateTimeString;
}

function readCookie(name) {
        
    return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];

}

function setCookie(name, value, optional_expiry) {
    document.cookie = name + "=" + value + optional_expiry;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}

async function createNewHistoryElement(prompt_id) {
    let reply_to_id = "";


    try {
        reply_to_id = text_input.parentElement.dataset.replyto;

        if (reply_to_id == undefined) {
            reply_to_id = "";
        }
    } catch {
        reply_to_id = "";
    }
    
    // reply
    if (reply_to_id != "") {
        var history_element = document.createElement('div');
        history_element.id = "tokens_" + prompt_id;
        history_element.className = display_mode + "history-tokens-reply-element";
        document.getElementById("prompt_" + prompt_id).insertAdjacentElement('afterend', history_element);

    // sub reply
    } else {

        var history_element = document.createElement('div');
        history_element.id = "tokens_" + prompt_id;
        history_element.className = display_mode + "history-tokens-element";
        document.getElementById("container_" + prompt_id).appendChild(history_element);
    }
}

function isMobile() {
    var match = window.matchMedia || window.msMatchMedia;
    if(match) {
        var mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

//

async function userMod(username, password, mode, error_div) {

    
    var words = [];

    // 0 = create user, 1 = delete user, 2 = recover user
    // create user
    if (mode === 1) {
        // generate recovery words > sha > send to server with request body
        const alphabet = 'ab1cd2ef3gh4ij5kl6mn7op8qr9st0uvwxyz'.split('');

        // generate 12 words
        for (let i = 0; i < 12; i++) {

            let word = '';

            // with 6 characters
            for (let j = 0; j < 6; j++) {
                let index = Math.floor(Math.random() * 26);
                word += alphabet[index];
            }

            words.push(word);

        }
        

        let recovery_string = '';

        for (let i = 0; i < words.length; i++) {
            recovery_string += words[i];
        }

        console.log("RECOVERY STRING IS: " + recovery_string);

        var request_body = {
            username: username,
            password: password,
            mode: mode,
            // 0 = userMod
            // 1 = getUser
            server_mode: 0,
            recovery_string: recovery_string
        }

    }

    // 0 = create user, 1 = delete user, 2 = recover user
    // recover user
    if (mode === 2) {

        let recovery_string = '';

        const word_boxes = document.getElementsByClassName(display_mode + 'word-box');

        for (let i = 0; i < word_boxes.length; i++) {
            recovery_string += word_boxes[i].value;
        }

        var request_body = {
            username: username,
            password: password,
            mode: mode,
            // 0 = userMod
            // 1 = getUser
            recovery_string: recovery_string,
            server_mode: 0
        }

    // 0 = create user, 1 = delete user, 2 = recover user
    // sign in / up 
    }
    
    if (mode === 0) {
        var request_body = {
            username: username,
            password: password,
            // 0 = create user, 1 = delete user
            mode: mode,
            // 0 = userMod
            // 1 = getUser
            server_mode: 0
        }
    }


    // request body is set up, continue with request
    fetch('scripts/user.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.text())
    .then(data => {
            
        // console.log(data);

        // try {

        data = JSON.parse(data);

        // 'id' is a unique key that is to be used for making prompt requests, it is separate from the username and password
        returned_id = data['id'];

        if (returned_id === 0) {

            error_div.innerHTML = "Access denied, check credentials";

        } else if (returned_id === -1) {

            error_div.innerHTML = "User already exists";

        } else {

            auth_mode = 2;

            let authentication_message = "Authentication successful";

            // account creation in progress
            if (mode === 1) {

                authentication_message = "Account created successfully</br></br>It is very important to write down these 12 strings and keep them safe, it is the only way to recover your account!"
                // display recovery words and continue button
                const center_tag = document.createElement('center');
                center_tag.id = 'words-center-tag';
                const recovery_words_container = document.createElement('center');
                recovery_words_container.className = display_mode + 'recovery-phrase-container';
   
                for (let i = 0; i < words.length; i++) {
        
                    const word_box = document.createElement('div');
                    word_box.className = display_mode + 'string-box';
                    word_box.id = 'word' + i;
                    word_box.type = 'text';
                    word_box.maxLength = '20';
                    word_box.innerHTML = '<p style="display: inline-block; float: left;">String ' + i + '</p><b style="display: inline-block; float: right;">' + words[i] + '</b>';
                    word_box.disabled = 'true';
        
                    recovery_words_container.appendChild(word_box);
        
                }
        
                /// get password fields, hide them, show word boxes between submit buttons and auth mode buttons after username
                password_field.className = "hidden";
                confirm_password_field.className = "hidden";
                sign_in_button.className = "hidden";
                sign_up_button.className = "hidden";
                username_field.className = "hidden";
                recover_account_button.className = "hidden";
        
                center_tag.appendChild(recovery_words_container);
                username_field.insertAdjacentElement('afterend', center_tag);


                error_div.innerHTML = authentication_message;
                submit_auth_button.innerHTML = "Continue";
                error_div.focus()

            } else {
                error_div.innerHTML = authentication_message;
                setTimeout(function() {window.location.reload();}, 1500);
            }

            setCookie('id', returned_id, "");
            
        }

        // } catch {
        //     error_div.innerHTML = "An error occurred, please refresh the page and try again";
        // }
    })
    .catch(error => {
        console.log("error");
        console.error('Error:', error);
    });
}

async function getUser(user_id) {
    var request_body = {
        user_id: user_id,
        // 0 = userMod
        // 1 = getUser
        server_mode: 1
    }

    fetch('scripts/user.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.text())
    .then(data => {
            
        // console.log(data);
        
        data = JSON.parse(data);

        let id_cookie = readCookie('id');
        if (localStorage.getItem("gptThreads" + id_cookie) != null) {
            document.getElementById('history_window').innerHTML = localStorage.getItem("gptThreads" + id_cookie);
        } else {
            localStorage.setItem("gptThreads" + id_cookie, "");
        }

        document.getElementById('motd').innerHTML = "Running Mixtral 8x7B Q5, always validate outputs";

    })
    .catch(error => {
        console.error('Error:', error);
    });
}


//

// Validate user

//

const stored_user_id = readCookie("id");

if (stored_user_id == null) {

    promptable = 0;

    // load sign up/in page

    document.getElementById("promptpage").className = "hidden";
    text_input.parentElement.className = "hidden";
    sign_out_button.className = "hidden";
    send_button.className = "hidden";

    document.getElementById("accountpage").className = "activepage";
    document.getElementById("account-details").className = "hidden";
    document.getElementById("account-auth").className = "account-auth";
    
} else {

    // Continue as normal

    // check user information and populate account page
    getUser(stored_user_id);

}


sign_up_button.addEventListener('click', function(e) {
    auth_mode = 0;
    sign_in_button.className = display_mode + "auth-mode-button";
    sign_up_button.className = display_mode + "auth-mode-button-selected";
    confirm_password_field.className = display_mode + "password-input";
    
});

sign_in_button.addEventListener('click', function(e) {
    auth_mode = 0;
    confirm_password_field.className = "hidden";
    confirm_password_field.value = "";
    sign_up_button.className = display_mode + "auth-mode-button";
    sign_in_button.className = display_mode + "auth-mode-button-selected";
});

sign_out_button.addEventListener('click', function(e) {
    deleteCookie('id');
    window.location.reload();
});

recover_account_button.addEventListener('click', function(e) {
    
    
    error_div.innerHTML = "";
    var username_value = username_field.value;
    if (username_value.length >= 6) {

        auth_mode = 1;

        document.getElementById('auth-text').innerHTML = "Account Recovery";
        document.getElementById('error-div').innerHTML = "Enter your 12 recovery strings and a new password";
        
        const center_tag = document.createElement('center');
        center_tag.id = 'recovery-center-tag';
        const recovery_phrase_container = document.createElement('center');
        recovery_phrase_container.className = display_mode + 'recovery-phrase-container';

        for (let i = 0; i < 12; i++) {

            const word_box = document.createElement('input');
            word_box.className = display_mode + 'word-box';
            word_box.id = 'wb' + i;
            word_box.type = 'text';
            word_box.maxLength = '6';
            word_box.placeholder = 'String ' + (i + 1);

            recovery_phrase_container.appendChild(word_box);

        }

        /// get password fields, hide them, show word boxes between submit buttons and auth mode buttons after username
        password_field.placeholder = "New password";
        password_field.value = "";
        confirm_password_field.placeholder = "Confirm new password";
        confirm_password_field.value = "";
        confirm_password_field.className = display_mode + "password-input";
        sign_in_button.className = "hidden";
        sign_up_button.className = "hidden";
        username_field.className = "hidden";
        recover_account_button.className = "hidden";

        // const back_button = document.createElement('div');
        // back_button.id = 'back-button';
        // back_button.className = 'back-button';
        // back_button.innerHTML = "<p><</p>"

        // back_button.addEventListener('click', function(e) {

        //     document.getElementById('recovery-center-tag').className = 'hidden';
        //     document.getElementById('back-button').className = 'hidden';
        //     password_field.className = display_mode + "password-input";
        //     confirm_password_field.className = display_mode + "password-input";
        //     sign_in_button.className = display_mode + "auth-mode-button";
        //     sign_up_button.className = display_mode + "auth-mode-button";
        //     username_field.className =display_mode + "username-input";
        //     recover_account_button.className = display_mode + "auth-mode-button";
        //     password_field.placeholder = "Password";
        //     password_field.value = "";
        //     confirm_password_field.placeholder = "Confirm password";
        //     password_field.value = "";
        //     sign_in_button.click();
        // });

        // document.getElementById('auth-container').prepend(back_button);
        center_tag.appendChild(recovery_phrase_container);
        username_field.insertAdjacentElement('afterend', center_tag);
        
    } else {
        username_field.className = display_mode + 'username-input-highlighted';
        setTimeout(function() {username_field.className = display_mode + 'username-input';}, 500);
    }

});


function credsValidation(username_value, password_value, error_div) {
    // check username length is at least 6
    if(username_value.length >= 6) {
        // pass
    } else {
        error_div.innerHTML = "Username must be at least 6 characters";
        return 0;
    }

    // check that username doesn't have special characters other than "_"
    var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(format.test(username_value) === false) {
        
        // pass

    } else {
        error_div.innerHTML = "Only underscore '_' special character allowed in username";
        return 0;
    }

    // check that password is at least 8 characters
    if(password_value.length >= 8) {
        // pass
    } else {
        error_div.innerHTML = "Password must be at least 8 characters";
        return 0;
    }

    // check that the password contains at least one lowercase letter
    var format = /[a-z]/;
    if(format.test(password_value) === true) {
        // pass
    } else {
        error_div.innerHTML = "Password must contain at least one lowercase letter";
        return 0;
    }

    // check that the password contains at least one uppercase letter
    var format = /[A-Z]/;
    if(format.test(password_value) === true) {
        // pass
    } else {
        error_div.innerHTML = "Password must contain at least one uppercase letter";
        return 0;
    }

    // check that the password contains a number
    var format = /[0-9]/;
    if(format.test(password_value) === true) {
        // pass
    } else {
        error_div.innerHTML = "Password must contain a number";
        return 0;
    }

    // check that the password contains a special character
    var format = /[ `!@#$%^&*()+_\-=\[\]{};':"\\|,.<>\/?~]/;
    if(format.test(password_value) === true) {
        // pass
    } else {
        error_div.innerHTML = "Password must contain a special character";
        return 0;
    }

    return 1;
}


submit_auth_button.addEventListener('click', function(e) {

    setTimeout(function() {
        const y = document.getElementById("auth-text").getBoundingClientRect().top + window.scrollY - 100;

        window.scrollTo({top: y, behavior: 'smooth'});
    }, 100);

    var username_value = username_field.value;
    var password_value = password_field.value;

    // post recovery phrase creation
    if (auth_mode === 2) {
        
        error_div.innerHTML = "Welcome to gpt-threads";
        setTimeout(function(e) {window.location.reload();}, 1500);
    }

    // sign in / up
    if (auth_mode === 0) {

        // 0 = sign in, 1 = create user, 2 = delete user, 3 = modify user
        if (sign_in_button.className === display_mode + "auth-mode-button-selected") {

            // 1 = create user
            var mode = 0;

            if (credsValidation(username_value, password_value, error_div) === 1) {
                userMod(username_value, password_value, mode, error_div);
            }

        } else {
    
            // 1 = create user
            var mode = 1;
    

            var confirm_password_value = confirm_password_field.value;
            // do input validation
            if(password_value === confirm_password_value) {
                if (credsValidation(username_value, password_value, error_div) === 1) {
                    userMod(username_value, password_value, mode, error_div);
                }
            } else {
                error_div.innerHTML = "Passwords do not match";
            }
        }

    // recover account
    } else if (auth_mode === 1) {

        userMod("", password_value, 2, error_div);

        // 2 = recover user
        var mode = 2;

        var confirm_password_value = confirm_password_field.value;
        // do input validation
        if(password_value === confirm_password_value) {
            if (credsValidation(username_value, password_value, error_div) === 1) {

                userMod(username_value, password_value, mode, error_div);
            }
        } else {
            error_div.innerHTML = "Recovery failed";
        }
    }
});

// service worker for PWA

if (window.matchMedia('(display-mode: standalone)').matches) {  

    // PWA is installed

    // do things here  
} 

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('my-cache')
        .then((cache) => cache.addAll([
            '/index.php',
            '/media/gptt_128.png',
            '/media/gptt_96.png',
            '/media/gptt_72.png',
            '/styles/style_light.css',
            '/style/style_dark.css',
            '/scripts/main.js'
        ]))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request);
        }
    ));
});


function resizeHistoryElements(mode) {

    setTimeout(function() {
        var history_elements = document.querySelectorAll('[id *= "container_"]');
        for(i = 0; i < history_elements.length; i++) {

            if (mode == 1) {

                history_elements[i].className = display_mode + "history-element-container-closed-mobile";

            } else {
                
                history_elements[i].className = "history-element-container-closed";
            }

        }
        // console.log("adjusted history element sizing")

    }, 50);
}

if (isMobile()) {
    resizeHistoryElements(1);
}

setTimeout(function() {

    // try {
    var history_elements = document.querySelectorAll('[id *= "container_"]');

    for (j=0;j<history_elements.length;j++) {
            
        if (j < 50) {

            let reply_to_id = "";

            try {
                reply_to_id = text_input.parentElement.dataset.replyto;

                if (reply_to_id == undefined) {
                    reply_to_id = "";
                }
            } catch {
                reply_to_id = "";
            }

            // console.log("starting history restoration")
            prompt_id = history_elements[j].id.split("_")[1];
            
            let current_delete_button = document.getElementById("cancel_button_" + prompt_id);
            let replacement_element = current_delete_button.cloneNode(true);
            replacement_element.id = current_delete_button.id;

            current_delete_button.parentNode.replaceChild(replacement_element, current_delete_button);
            
            // if (history_elements[j].className != "history-element-container-closed") {
            //     history_elements[j].className = "history-element-container-closed"
            // }

            // add event listener to container to open it when clicked
            history_elements[j].addEventListener('click', function(e) {

                prompt_id = e.target.id.split("_")[1];
                document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-expanded";
                document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button";
                document.getElementById("reply_" + prompt_id).className = "reply-button";

                // add event listener for back button
                document.getElementById("back_" + prompt_id).addEventListener('click', function(e) {


                    if (back_pressed != 1) {
                        back_pressed = 1;

                        prompt_id = e.target.id.split("_")[1];
                        

                        if(isMobile() || window.innerWidth < 900) {
                            setTimeout(function() {
                                try {
                                    document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                } catch {
                                    // reply button doesn't exist
                                }
                                document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                document.getElementById("container_" + prompt_id).className = display_mode + "history-element-container-closed-mobile";
                            }, 100);
                        } else {
                            setTimeout(function() {
                                try {
                                    document.getElementById("reply_" + prompt_id).className = "reply-button-hidden";
                                } catch {
                                    // reply button doesn't exist
                                }
                                document.getElementById("back_" + prompt_id).className = "history-prompt-element-back-button-hidden";
                                setTimeout(function() {
                                    document.getElementById("container_" + prompt_id).className = "history-element-container-closed";
                                }, 0);
                            }, 0);
                            
                        }
                        
                        e.target.className = "history-prompt-element-back-button-hidden";

                        let reply_to_id = "";


                        try {
                            reply_to_id = text_input.parentElement.dataset.replyto;

                            if (reply_to_id == undefined) {
                                reply_to_id = "";
                            }
                        } catch {
                            reply_to_id = "";
                        }

                        reply_target = document.getElementById('tokens_' + reply_to_id);
                        reply_prompt_target = document.getElementById('prompt_' + reply_to_id);
                        reply_target.className = display_mode + "history-tokens-element";
                        reply_prompt_target.className = display_mode + "history-prompt-element";

                        if (text_input.parentElement.className.includes('-reply')) {
                            text_input.parentElement.className = display_mode + "text-input" + " shadow";
                            text_input.parentElement.setAttribute('data-replyto', "");
                        }


                        setTimeout(function() {
                            localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                            back_pressed = 0;
                        }, 600);
                    }
                    
                });
            });

            // add event listener for delete button
            document.getElementById("cancel_button_" + prompt_id).addEventListener('click', function(e) {

                let reply_to_id = "";

                try {
                    reply_to_id = text_input.parentElement.dataset.replyto;

                    if (reply_to_id == undefined) {
                        reply_to_id = "";
                    }
                } catch {
                    reply_to_id = "";
                }

                reply_target = document.getElementById('tokens_' + reply_to_id);
                reply_prompt_target = document.getElementById('prompt_' + reply_to_id);
                reply_target.className = display_mode + "history-tokens-element";
                reply_prompt_target.className = display_mode + "history-prompt-element";
                text_input.parentElement.className = display_mode + "text-input" + " shadow";
                text_input.parentElement.setAttribute('data-replyto', "");

                e.target.className = "history-prompt-element-cancel-button-selected";
                var prompt_id = e.target.parentElement.parentElement.id.split("_")[1];
                setTimeout(function killTask() {
                    document.getElementById("prompt_" + prompt_id).remove();
                    document.getElementById("tokens_" + prompt_id).remove();
                    document.getElementById("container_" + prompt_id).remove();
                    localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
                }, 100);
            });

            // add event listener for reply button
            document.getElementById('reply_' + prompt_id).addEventListener('click', function(e) {

                if (reply_active == 0) {

                    if (reply_to_id == "") {
                        // change prompter box to reply mode
                        // placeholder = Write your reply here
                        let prompt_id = e.target.id.split("_")[1];
                        
                        text_input.parentElement.setAttribute('data-replyto', prompt_id);

                        reply_target = document.getElementById('tokens_' + prompt_id);
                        reply_prompt_target = document.getElementById('prompt_' + prompt_id);
                        reply_target.className = display_mode + "history-tokens-element-selected";
                        reply_prompt_target.className = display_mode + "history-prompt-element-loading-selected";
                        text_input.parentElement.className = display_mode + "text-input-reply" + " shadow";
                        text_input.focus();
                        setTimeout(function() {
                            text_input.innerText = "";
                        }, 300);

                    } else {
                        // console.log("reply already processing, try again later")
                        // console.log("reply already processing, try again later")
                        var current_text_input_class = text_input.parentElement.className;
                        text_input.parentElement.className = display_mode + "text-input-wait shadow";

                        function waitSend(current_text_input_class) {
                            text_input.parentElement.className = current_text_input_class;
                        }

                        setTimeout(waitSend(current_text_input_class), 600);
                    }
                    // }


                    
                } else {

                    // console.log("reply is active")
                    // let active_reply_prompt = document.getElementsByClassName(display_mode + 'history-prompt-element-loading-selected');
                    // console.log(active_reply_prompt.id.split("_")[1])
                    // document.getElementById("reply_" + e.target.id.split("_")[1]).className = "reply-button-wait";


                    // setTimeout(function () {
                    //     let wait_elements = document.getElementsByClassName('reply-button-wait');

                    //     for (i = 0; i < wait_elements.length; i++) {
                    //         wait_elements[i].className = "reply-button";
                    //     }

                    // }, 3000);

                    var current_text_input_class = text_input.parentElement.className;
                    text_input.parentElement.className = display_mode + "text-input-wait shadow";

                    function waitSend(current_text_input_class) {
                        text_input.parentElement.className = current_text_input_class;
                    }

                    setTimeout(waitSend(current_text_input_class), 600);
                }
            });
            // console.log('appending event listener to reply button')

        } else {
            history_elements[j].remove();
        }
        
    }
    
    try {
        if (history_elements[0].className.includes(display_mode) ) {
            // pass
        } else {
    
            var themed_elements = document.querySelectorAll('[class*="_"]');
    
            for (i=0;i<themed_elements.length;i++) {
                
                themed_elements[i].className = display_mode + themed_elements[i].className.split("_")[1];
                
            }
    
            localStorage.setItem("gptThreads" + readCookie('id'), document.getElementById("history_window").innerHTML);
    
        }
    } catch {
        // there are no history elements
    }
    
}, 100)


// addEventListener("resize", (e) => {

//     if (window.innerWidth < 900) {
//         resizeHistoryElements(1);
//     } else {
//         resizeHistoryElements(0);
//     }
    
// });

setTimeout(function() {

    let loading_screen = document.getElementById('loading-screen');
    loading_screen.className = 'loading-screen-hidden';
    setTimeout(function(e) {
        loading_screen.remove();
    }, 600);
}, 600);


// just see what I'm clicking
window.addEventListener('click', function(e) {
    // console.log("CLICKED " + e.target.id);
});