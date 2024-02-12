<!DOCTYPE html>

<head>

    <meta property="og:image" content="media/satsGPT_128.png" />
    <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" charset="UTF-8"/>
    <link rel="icon" type="image/png" href="media/favicon.png"/> 
    <link rel="manifest" href="manifest.json" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta id="pwa-theme" name="theme-color" content="#fffff" style="transition: 1s ease-in-out;">
    <meta name="view-transition" content="same-origin">

</head>

<html lang="en">

    <meta charset="utf-8">
    <meta name="description" content="">
    <link href="styles/style_light.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_dark.css" rel="stylesheet" type="text/css"/>
    <title style="display: none;">gpt-threads</title>

    <body id="main_body" class="light_body">
        <div id="loading-screen" class="loading-screen">
            <center>
                <img class="logo" src="data:image/png;base64,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"></img>
            </center>
        </div>
        
        
        <center>
            <div class="user-interaction-area">
                <div id=text_input_container" class="light_text-input shadow">
                    <span id="text_input" class="light_text-input-field" tabindex="0" role="textbox" placeholder="What?" contenteditable>
                    </span>
                    <div id="text_input_send_button" class="text-input-send-button"></div>
                    <div id="sign_out_button" class="sign-out-button"></div>
                    <div id="motd" class="motd"></div>
                </div>
            </div>
        </center>
        
        <div id="promptpage" class="hidden">

            <div id="history_window" class="history-window">
                <!-- User, agent thread history -->
            </div>
            
        </div>

        <div id="accountpage" class="hidden">
            <div id="account-details" class="account_details">

            </div>
            <div id="account-auth" class="hidden">
                <center>
                
                    <form class="light_form" autocomplete="on">
                        <div id="auth-text" class="auth-text">Log in or Create Account</div>
                        <div id="error-div" class="auth-error-text"></div>
                        <div id="auth-container" class="auth-container">
                            
                            <div tabindex="1" id="sign-in-button" class="light_auth-mode-button-selected">Log in</div>
                            <div tabindex="2" id="sign-up-button" class="light_auth-mode-button">Create Account</div>
                        </div>
                        
                        <input tabindex="3" id="username-field" type="text" name="username" maxlength="20" title="Your username" autocomplete="username" placeholder="Username" value="" autocapitalize="off" autocorrect="off" class="light_username-input">


                        <input tabindex="4" id="password-field" type="password" name="password" maxlength="32" title="Your password" placeholder="Password" autocomplete="current-password" class="light_password-input">

                        <input tabindex="5" id="confirm-password-field" type="password" name="conf_password" maxlength="32" title="Password Confirmation" placeholder="Confirm password" autocomplete="new-password" class="hidden">

                        <div class="auth-container">

                            <div tabindex="7" id="recover-account-button" class="light_auth-mode-button">Account Recovery</div>
                            <div tabindex="6" id="auth-submit-button" class="light_auth-mode-button">Send</div>

                        </div>
                    </form>

                </center>
            </div>
        </div>

        <div id="aboutpage" class="hidden">
            
        </div>

        <script src="scripts/main.js"></script>
        
    </body>

</html>