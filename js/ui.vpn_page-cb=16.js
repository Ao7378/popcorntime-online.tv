ui.vpn_page = {

    show: function () {
        if (!torrentsTime.setup.isInstalled) {
            $('#downloadTorrentsTime').show();
            ui.torrentsTime.isInstalledFromVPN = true;
            return;
        }

        if (ui.sliders.slider.vpn) {
            ui.sliders.slider.vpn.hide()
            return;
        }

        ui.vpn_page.alert.hide();
        ui.loading_wrapper.hide();

        var slider = new ui.slider('vpn', 'left');
        $('#slider_vpn *').not('.close').remove();

        app.state = 'vpn_page';
        slider.destruct = function () {
            app.state = 'mainWindow';
        }

        slider.el.append($('#vpn_page_html').html())

        ui.vpn_page.updateDisplay();


        slider.show();


    },

    updateDisplay: function () {

        //var hostApp = {vpn_isConnected:function(){return 0},vpn_connect:function(){},vpn_disconnect:function(){}}
        $('#slider_vpn .vpn_icon span.icon').removeClass('spinner').parent().removeClass('rotation');

        if (app.config.hostApp.isVpnConnected) {

            $('#slider_vpn .awaiting_msg').remove();
            $('#slider_vpn .vpn_icon span.icon').removeClass('unlocked').addClass('locked');
            $('#slider_vpn .vpn_button').html('Disconnect').unbind('click').click(function () {
                app.config.hostApp.vpn_disconnect();
            });

        }
        else {

            $('#slider_vpn .vpn_icon span.icon').removeClass('locked').addClass('unlocked');

            if (!app.config.hostApp.isVpnInstalled) {

                $('#slider_vpn .vpn_button').html('&nbsp; Create VPN Account &nbsp;').unbind('click').click(function () {

                    $('#slider_vpn .vpn_icon span.icon').removeClass('unlocked').addClass('spinner');
                    $('#slider_vpn .vpn_icon div').addClass('rotation');
                    if (!$('.awaiting_msg').length)
                        $('#slider_vpn .vpn_button').parent().prepend('<div class="awaiting_msg" style="padding-bottom:50px;">Waiting for registration completion...</div>').unbind('click');

                    ui.vpn_page.createAccountWindow();

                });

            }
            else {

                $('#slider_vpn .awaiting_msg').remove();
                $('#slider_vpn .vpn_button').html('Connect').unbind('click').click(function () {

                    app.config.hostApp.vpn_connect();
                    $('#slider_vpn .vpn_icon span.icon').removeClass('unlocked');
                    $('#slider_vpn .vpn_icon span.icon').addClass('spinner');
                    $('#slider_vpn .vpn_icon div').addClass('rotation');
                    $('#slider_vpn .vpn_button').html('Connecting...').unbind('click');

                    setTimeout(function () {
                        if (ui.sliders.slider.vpn)
                            ui.vpn_page.updateDisplay();
                    }, 33000)

                });
            }

        }
    },

    alert: {
        check: function (callback) {
            if (app.config.hostApp.isVPN && app.config.hostApp.vpnAlert != 'off' && !app.config.hostApp.isVpnConnected) {
                ui.vpn_page.alert.show();
                $('#vpn_alert .continue').attr('onclick', callback + '(1)');
                app.state = 'vpn_alert';
                return true;
            }
        },
        show: function () {
            if (app.config.hostApp.isVpnConnected) {
                torrentsTime.pt.start();
            } else {

                $('#vpn_alert').show()
                $('#vpn_alert .continue').attr('onclick', "ui.vpn_page.alert.hide();torrentsTime.pt.start()");
            }
        },

        hide: function () {
            $('#vpn_alert').hide();
        },
        init: function () {
            $.ajax({
                url: "/alert/alert.php",
                dataType: 'json',
                type: 'GET',
                success: function (json) {
                    $("#vpn_alert .title").html(json.title);
                    $("#vpn_alert .text").html(json.text);
                    console.log($("#vpn_alert .title"), json);
                }
            });
            $.ajax({
                url: "/alert/player_alert.html",
                dataType: 'html',
                type: 'GET',
                success: function (json) {

                    json = json.replace(new RegExp('../css/', 'g'), window.location.protocol + '//' + window.location.host + '/css/');
                    ui.vpn_page.alert.showPlayerAlertConfig.contents = json;
                    console.log('/alertlert/player_alert. recivies');
                }
            });
            ui.vpn_page.alert.showPlayerAlertConfig.contents = ui.vpn_page.alert.showPlayerAlertConfig.contents.replace(new RegExp('../css/', 'g'), window.location.protocol + '//' + window.location.host + '/css/');

            var isPlayerOpened = false;
            app.events.subscribe('all', function (ev) {
                console.log('event recivied:', ev);
                isPlayerOpened = ev == 'playerOpened' || (isPlayerOpened && (ev != 'playerClosed'));
                if (ev == 'playerOpened' || ( isPlayerOpened && (ev == 'pause' || ev == 'stop' ))) {
                    ui.vpn_page.alert.checkPlayerAlert();
                } else {
                    ui.vpn_page.alert.hidePlayerAlert();
                }
            });
        },
        showVpnPage: function () {
            ui.vpn_page.show();
            if (typeof _paq != 'undefined')
                _paq.push(['trackEvent', 'alert', 'click', ui.vpn_page.alert.alertVersion]);
        },
        alertVersion: null,
        checkPlayerAlert: function (callback) {
            console.log('checkPlayerAlert called');
            if (app.config.hostApp.isVPN && app.config.hostApp.vpnAlert != 'off' && !app.config.hostApp.isVpnConnected) {
                ui.vpn_page.alert.showPlayerAlert();
                app.state = 'vpn_alert';
                return true;
            }
        },
        showPlayerAlertConfig: {
            x: 100,
            y: 200,
            width: 492,
            height: 125,
            contents: "<!doctype html><html><head> <meta charset=\"UTF-8\"> <title>Warning</title> <style>@font-face{font-family: 'opensans'; src: url('../fonts/opensans-regular-webfont.eot'); src: url('../fonts/opensans-regular-webfont.eot?#iefix') format('embedded-opentype'), url('../fonts/opensans-regular-webfont.woff2') format('woff2'), url('../fonts/opensans-regular-webfont.woff') format('woff'), url('../fonts/opensans-regular-webfont.ttf') format('truetype'), url('../fonts/opensans-regular-webfont.svg#open_sansregular') format('svg'); font-weight: normal; font-style: normal;}@font-face{font-family: 'opensansbold'; src: url('../fonts/OpenSans-Extrabold.eot'); src: url('../fonts/OpenSans-Extrabold.eot?#iefix') format('embedded-opentype'), url('../fonts/OpenSans-Extrabold.woff2') format('woff2'), url('../fonts/OpenSans-Extrabold.woff') format('woff'), url('../fonts/OpenSans-Extrabold.ttf') format('truetype'), url('../fonts/OpenSans-Extrabold.svg#open_sansregular') format('svg'); font-weight: normal; font-style: normal;}body{font-family:' Sans', sans-serif; margin:0; line-height:18px;background-color: white;}#wrng{float:left; margin-bottom:30px; margin-right:15px; -webkit-animation:alert 1.2s ease-out infinite; animation:alert 1.2s ease-out infinite;}b{line-height:22px;}button{margin-top:10px; border:0; background:#F69F23; color:#fff; padding:2px 9px; border-radius:5px; cursor:pointer; outline:0; font-family:'opensansbold',sans-serif;}button:hover{background:#F8B822;}@-webkit-keyframes alert{0%{opacity: 1}50%{opacity:0}100%{opacity:1}}</style></head><body><div style=\"padding:13px;font-size:13px;\"> <img src=\"../images/warning.png\" id=\"wrng\"> <b style=\"font-size:15px\">Security Warning</b><br>Streaming torrents exposes your location and identity<br><b>Popcorn Time</b> users can protect their identity with a built-in VPN<br><button onclick=\"hostApp.jsWindowCallback({'action':'vpn_page_show'})\">ACTIVATE VPN &nbsp;<b>></b></button></div></body></html>",
            callback: "ui.vpn_page.alert.playerAlertCallback",
            visible: false
        },
        showPlayerAlert: function () {
            var config = ui.vpn_page.alert.showPlayerAlertConfig;
            config.contentsDef = !config.contentsDef ? config.contents : config.contentsDef;
            config.x = Math.floor(($('body').width() - config.width) / 2);
            config.y = Math.floor(($('body').height() - config.height) / 3);
            console.log('showPlayerAlert called');
            // config.contents = config.contentsDef.replace("VPN DISABLED!","body.width: "+$('body').width()+", body.height: "+$('body').height()+ ", width: 492,height: 319, x: "+config.x+", y: "+config.y);
            hostApp.openWindow(config);
            config.visible = true;
            utils.sendGA("Application", "VPNAlertPlayerPopup_Showed");
        },
        hidePlayerAlert: function () {
            console.log('hidePlayerAlert called');
            // hostApp.closeWindow();
            ui.vpn_page.alert.showPlayerAlertConfig.visible = false;
        },
        playerAlertCallback: function (action) {
            console.log('playerAlertCallback called, action:', action);
            if (action && action.action) {
                if (action.action == "vpn_page_show") {
                    ui.vpn_page.alert.hidePlayerAlert();
                    hostApp.closePlayer();
                    ui.vpn_page.show();
                    utils.sendGA("Application", "VPNAlertPlayerPopup_TurnOn");
                }
                if (action.action == "close") {
                    ui.vpn_page.alert.hidePlayerAlert();
                    utils.sendGA("Application", "VPNAlertPlayerPopup_Continue");
                }
            }
        },
        window_resized: function (event) {
            if (ui.vpn_page.alert.showPlayerAlertConfig.visible) {
                ui.vpn_page.alert.checkPlayerAlert();
            } else {
                ui.vpn_page.alert.hidePlayerAlert();
            }
        }
    },

    createAccountWindow: function (e) {
        if (typeof vpnPageUrl == 'undefined' || !vpnPageUrl)
            vpnPageUrl = 'https://www.anonymousvpn.org/platform/affiliate_gateway/?pid=7';
        utils.popupwindow(vpnPageUrl, 'vpn', 571, 680);

        //if there is a bug we don't want to
        torrentsTime.setup.isVpnConnected = true;
    }
}
