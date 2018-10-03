var
hostApp = {

	openBrowser: function(url){
		window.open(url);
	},

	getTorrent: function(session){
		torrentsTime.setup.vpnAlert = app.config.hostApp.vpnAlert!='off';
		torrentsTime.pt.setup.source = session.torrent.magnet || session.torrent.url;
		torrentsTime.pt.setup.file = session.torrent.file;
		torrentsTime.setup.source = session.torrent.magnet || session.torrent.url;
		torrentsTime.setup.file = session.torrent.file;
		torrentsTime.setup.imdbid = session.imdb;
		if(typeof session.season_id != 'undefined') {
            torrentsTime.setup.season = session.season_id;
		} else {

            torrentsTime.setup.season = null;
		}
		if(typeof session.episode_number != 'undefined') {
            torrentsTime.setup.episode = session.episode_number;
		} else {

            torrentsTime.setup.episode = null;
        }

		if(!torrentsTime.setup.isInstalled){
			$('#downloadTorrentsTime').show();
			hostApp.downloadInitialized = true;
		}
		else{
			ui.loading_wrapper.show();
			torrentsTime.pt.start();
		}
	},


	cancelTorrent: function(){
		torrentsTime.init({id:"pt", source:null});
	}

},
app = {
   messages : {
      "metadata_error" : "Video file can't be downloaded for now. Please try again later"
   },
	currentSession:null,
	subscribeToHostEvents: function () {
		app.events.subscribe('all', function (ev) {
			console.log('event recivied:', ev);
			// download duration log
			if(ev == 'playerOpened' || ev == 'play'){
				var currentSession = app.currentSession;
                if( window._paq!=null && currentSession !=null && (!currentSession.durationReported || !currentSession.playDurationReported)){
					var downloadStart = currentSession.downloadStart;
					if(typeof downloadStart !== 'number')
						return;
					var actionName;
					if(ev == 'playerOpened'){
						currentSession.durationReported = true;
						actionName = 'timeToPlayerOpened';
					}else {
						currentSession.playDurationReported = true;
						actionName = 'timeToPlay';
					}

					var duration = (new Date()).getTime()-downloadStart;
					var isShow = typeof currentSession.episode_number === 'number';
					var imdb =  isShow ? currentSession.id+'-'+currentSession.season_id+'-'+currentSession.episode_number : currentSession.id;
					var action = (isShow? 'tv-': 'mv-') + actionName +( app.config.hostApp.isVpnConnected?'-vpnOn':'');
					window._paq.push(['trackEvent', 'v'+utils.urlParam('version','0.0.0.0'), action, imdb, duration]);
					console.log('trackEvent measure:', 'v'+utils.urlParam('version','0.0.0.0'), action, imdb, duration);
				}
			}
		});
	},
	init:function(){
		try{
			app.events.event("initStarted");
			app.state = 'mainWindow';
			app.readInitParams();
			app.config.init();
         ui.vpn_page.alert.init();
			app.config.init();
			locale.construct(function(){
				app.favs.init();
				ui.construct();
				locale.translate_interface();
				app.keyboardNav.init();
				app.history.init();
			});

			app.setConfig();
            app.subscribeToHostEvents();
			app.applyState();
		}
		catch(e){
			console.error(e);
			//(new Image).src='/err.php?m=' + e.message;
		}finally {
			app.events.event("initFinished");
		}
	},
	readInitParams:function(){
   	try{
		var matches = window.location.href.match(/imdb=(.*?)(&|$)/);
		var imdbKey = app.initParams.imdb? app.initParams.imdb: (matches && matches.length>1?matches[1]:null)
		if(imdbKey){
			var imdbArr = imdbKey.split('-');
			app.initParams.imdb = imdbArr[0];
			if(imdbArr.length == 3){
				app.initParams.season = parseInt(imdbArr[1]);
				app.initParams.episode = parseInt(imdbArr[2]);
			}
		}
	}catch (e) {

	}
	},
	initParams:{ season:-1, episode:-1},
	setConfig:function(){
		//vpn conifigs
		// hostApp.setConfig('hxnvSysyCGmwOJN6dDy1/Q8Eb0NK8dB/O4tROwT9drB0tXS3nWj8Hz61OkhMrcXCR5w3oHkdkKy6lV2i3jTIFkG8NRKS51zItVdbA6X++bkPDNcR5gaXmm4rHHftTR0fKyB6ScXGhnUfjN+9opJrtZpdYRc/Ah8xX79zoaBIfrmyvTzg2qKkUvafwG+bawMXUmRrPXCNP8yafD8suYxWaJEzzNTOZcSj95SddphjJ9uzrJ99TFjXq5BS0DBnYnteDwzXEeYGl5oGLe3b58c8LYCbzwrKwNjNqNMmRaY/jPWMJcxDCwJDXLK/L0gQiZzw9taVxO/tz61lDuvv47Mnew==');
	},

	torrent:{
      checkFailedTorrents : function(itemsList) {
         for(var i = 0; i < itemsList.length ; i++) {
            if(itemsList[i].torrentError && itemsList[i].torrentError < 2) {
               return false;
            }
         }
         return true;
      },
      getClosestNotFailedTorrent : function(itemsList,currentItem) {
         if(currentItem >= (itemsList.length - 1)) {
            currentItem = 0;
         }
         var newItem = currentItem + 1;
         while(!app.torrent.checkFailedTorrents(itemsList)) {
            if(newItem > (itemsList.length - 1)) {
               newItem = 0;
            }
            console.info('error',newItem,app.torrent.checkFailedTorrents(itemsList),!itemsList[newItem].torrentError || itemsList[newItem].torrentError < 2);
            if(!itemsList[newItem].torrentError || itemsList[newItem].torrentError < 2) {
               return newItem;
            }

            newItem += 1;
         }
         return null;
      },

		current_torrent_id: '',

		get: function(session){
			console.info('hostApp.getTorrent(session):',session);
			app.currentSession = session;
			app.currentSession.durationReported = false;
			app.currentSession.playDurationReported = false;
			app.currentSession.downloadStart = (new Date()).getTime();
			hostApp.getTorrent(session);
		},

		cancel:function(){
		    hostApp.cancelTorrent(app.torrent.current_torrent_id);
		},
		updateInfo: function (percents, speed, seeders,peers, msg) {
         ui.loading_wrapper.change_stats(percents, speed, seeders, peers, msg);
         console.log(msg,parseInt($('.item.torrent.activated').data('idx')));
         if(msg.indexOf("Error getting metadata!")>-1) {
            var currentItem, newItem, torrent;
            if(app.state == 'movie') {
               currentItem = parseInt($('.item.torrent.activated').data('idx'));
               ui.movies.session.torrents[currentItem].torrentError = ui.movies.session.torrents[currentItem].torrentError  || 0;
               ui.movies.session.torrents[currentItem].torrentError += 1;
//               console.log('torrentError',ui.movies.session.torrents[currentItem].torrentError);
               newItem = app.torrent.getClosestNotFailedTorrent(ui.movies.session.torrents,currentItem);
//               console.info('newItem param',newItem);
               if(newItem == null) {
                  //TODO show fucking error
                  app.torrent.updateInfo(0,0,0,0,app.messages.metadata_error);
//                  console.log('%c send GA function for metadata error!', 'color: green; font-weight: bold;', ui.movies.session.id);
                  ga('send', 'event', 'metadata_error', ui.movies.session.id, {
                     'metric01':  ui.movies.session.id
                  });
                  return;
               }
               $('.item.torrent.activated').removeClass('activated');
               $('.item.torrent[data-idx='+(newItem)+']').addClass('activated');
               console.log(ui.movies.session.torrents);
               torrent = ui.home.catalog.items[ui.movies.session.id].torrents[ parseInt(newItem) ];
               if(ui.movies.session.dubbing_lang) {
                  torrent = ui.home.catalog.items[ui.movies.session.id].dubbing[ui.movies.session.dubbing_lang][ parseInt(newItem) ];
               }
               ui.movies.session.torrent = {
                  url: 	torrent.torrent_url,
                  magnet: torrent.torrent_magnet,
                  file:	torrent.file,
                  quality: torrent.quality
               };

               app.torrent.cancel();
               app.torrent.get(ui.movies.session);
//               ui.movies.watch();
            } else {
               //TODO get item active. get idx
               currentItem = parseInt($('.item.torrent.activated').data('idx'));

               ui.tv.items[0][ui.tv.session.season_id][ui.tv.session.episode_id].items[currentItem].torrentError = ui.tv.items[0][ui.tv.session.season_id][ui.tv.session.episode_id].items[currentItem].torrentError  || 0;
               ui.tv.items[0][ui.tv.session.season_id][ui.tv.session.episode_id].items[currentItem].torrentError += 1;
               newItem = app.torrent.getClosestNotFailedTorrent(ui.tv.items[0][ui.tv.session.season_id][ui.tv.session.episode_id].items,currentItem);
               if(newItem == null) {
                  //TODO show fucking error
                  app.torrent.updateInfo(0,0,0,0,app.messages.metadata_error);

//                  console.log('%c send GA function for metadata error!', 'color: green; font-weight: bold;', ui.tv.session.imdb + '-' + ui.tv.session.season_id + '-' + ui.tv.session.episode_number);
                  ga('send', 'event', 'metadata_error', ui.tv.session.imdb + '-' + ui.tv.session.season_id + '-' + ui.tv.session.episode_number, {
                     'metric01':  ui.tv.session.imdb + '-' + ui.tv.session.season_id + '-' + ui.tv.session.episode_number
                  });
                  return;
               }

               $('.item.torrent.activated').removeClass('activated');
               $('.item.torrent[data-idx='+(newItem)+']').addClass('activated');
               torrent = ui.tv.items[0][ui.tv.session.season_id][ui.tv.session.episode_id].items[ parseInt(newItem) ];
               ui.tv.session.torrent = {
                  url: 	torrent.torrent_url,
                  magnet: torrent.torrent_magnet,
                  file:	torrent.file,
                  quality: torrent.quality
               };
               app.torrent.cancel();
//               ui.tv.watch();
               app.torrent.get(ui.tv.session);
            }
         }
		},

		hideLoading:function(){
			ui.loading_wrapper.hide();
		},

		error:function(msg) {
			ui.loading_wrapper.hide();
			utils.msgbox(msg);
		}

	},

	vpn:{

		connected:function(){
			app.config.hostApp.isVpnConnected = true;
			$('#menu_panel .icon.vpn').removeClass('unlocked').addClass('locked')

			if(ui.sliders.slider.vpn)
				ui.vpn_page.updateDisplay();

			utils.msgbox('<b>VPN:</b> Connected');
		},

		disconnected:function(){
			app.config.hostApp.isVpnConnected = false;
			$('#menu_panel .icon.vpn').removeClass('locked').addClass('unlocked');

			if(ui.sliders.slider.vpn)
				ui.vpn_page.updateDisplay();
			else
			utils.msgbox('<b>VPN:</b> Disconnected');
		}

	},
    event:function (eventName) {
        app.events.event(eventName);
        console.log('app.events.event', eventName);
    },
    events:{
        eventList:[],
        event:function (eventName) {
            app.events.eventList.forEach(
                function(ev){
                    try{
                        ev(eventName);
                    }catch(e) {console.error('event error:',ev, e);}
                }
            );
        },
        subscribe: function(name, cb){
            // name may be used later
            app.events.eventList.push(cb);
        },
        unsubscribe: function(name, cb){
            // name may be used later
            // not supported
        }
    },
	setState:function (state) {
		var storage = window.localStorage;
		var siteState = {};
		if (storage && storage.getItem){
			try{
				var siteStateStr =  storage.getItem('siteState');
				if (siteStateStr){
					siteState =JSON.parse(siteStateStr);
				}
				siteState  = $.extend(siteState, state);
				storage.setItem('siteState', JSON.stringify(siteState));
			}catch (e) {
			}
		}
		window.location.href = "/"
	},
	applyState:function(){
   	return;
		setTimeout(function () {
			try{
				var storage = window.localStorage;
				if (storage && storage.getItem){
					try{
						var siteStateStr =  storage.getItem('siteState');
						storage.removeItem('siteState');
						if (siteStateStr){
							siteState =JSON.parse(siteStateStr);
							if (siteState.p == 'movies'){
								$('#toolbar .btn.movies').click();
							}
							if (siteState.p == 'tv'){
								$('#toolbar .btn.tv').click();
							}
						}
					}catch (e) {
					}
				}
			}catch (e) {

			}
		},500);
	}

},
logger = {

	log:function(msg){
		console.log(msg);
	}
};


String.prototype.capitalize = function(){
	return this.charAt(0).toUpperCase() + this.substr(1);
}

window.onresize = function(){
	ui.events.window_resize();
    ui.vpn_page.alert.window_resized();
}

window.onload = function(){
	setTimeout(app.init,100);
};
