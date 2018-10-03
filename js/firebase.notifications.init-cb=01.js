var enable_push_notifications = true;

function firebase_init(topics, countryCode){
    window.firebase_init_setting = {
        firebaseConfig: {
            apiKey: "AIzaSyA7KSSMTRv0NwEvLWWBXyULeA6w2YebVA4",
            authDomain: "timeonline-c39c4.firebaseapp.com",
            databaseURL: "https://timeonline-c39c4.firebaseio.com",
            storageBucket: "timeonline-c39c4.appspot.com",
            messagingSenderId: "679403155341"
        },
        notificationConfig: {
            siteName: "pt-online",
            topics: topics,
            regUrl: "https://reg.popcorntime-online.io/subscribe",
            countryCode:countryCode,
            notificationCallback: function (p) {
                console.info('notificationCallback called:', p)
            },
            permissionGrantedCallback: function () {
                console.info('permissionGrantedCallback called');
                if (window._gaq) {
                    topics.forEach(function (topic) {
                        _gaq.push(['_trackEvent', 'notification', 'granted', topic]);
                    });
                }else {
                    if (window.ga) {
                        topics.forEach(function (topic) {
                            ga('send', 'event', 'notification', 'granted', topic);
                        });
                    }
                }
            }
        }
    };
    (function () {
        var ns = document.createElement('script');
        ns.type = 'text/javascript';
        ns.async = true;
        ns.src = '/js/firebase.notifications.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ns, s);
    })();
}
if(enable_push_notifications) {
    firebase_init(["/topics/all_users"], null);
}