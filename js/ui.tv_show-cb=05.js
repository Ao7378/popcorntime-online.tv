ui.tv = {
	session:{},
	checkOS : true,
	show:function(movie_id){

		var data = ui.home.catalog.items[movie_id];
		if(!data){
			logger.log('error_missing_movie_catalog_id_' + movie_id)
			return;
		}

		var
			slider 		= this.slider(data),
			handlers 	= this.handlers[app.config.fetcher.mode];

		for(var func in handlers)
			handlers[func](data);

		slider.show();
		setTimeout(function(){app.state = 'tvshow';},100);

	},

	slider: function(data){

		if($('.tvshow_' + data.id).length)
			return;

		ui.sliders.close_all();

		var
		slider_html = utils.tokenizer(data, $('#tvshow_slider_html').html());
		slider		= new ui.slider('tvshow', 'fadein');

		slider.destruct = function(){
			app.state = 'mainWindow';
		}
		slider.el.append(slider_html).addClass('tvshow_' + data.id);


		return slider;

	},

	set_season:function(season_id){

		var
		imdb			= ui.tv.items[1],
		episodes 		= ui.tv.items[0][season_id],
		episodes_cont 	= $('#slider_tvshow.tvshow_' + imdb + ' .episodes');

		$('#slider_tvshow .row.season.activated').removeClass('activated');
		$('#slider_tvshow .row.season[data-season="' + season_id + '"]').addClass('activated')

		episodes_cont.html('<div class="scroller_cont"></div>');

		for(var i=0;i<episodes.length;i++){

			var watched = app.history.tv[imdb + '_' + season_id + '_' + i];
			var episodeUrl = app.initParams.seasons && app.initParams.seasons[season_id] && app.initParams.seasons[season_id][episodes[i].episode]? app.initParams.seasons[season_id][episodes[i].episode]: 'javascript:void(0)';
			$('<div onclickcc="ui.tv.events.episode_click(event,this)" data-episode_id="'+i+'" data-episode_num="' + episodes[i].episode + '" class="row episode ' + (watched ? 'watched':'') + '"><a style="display:block;" href="'+episodeUrl+'"><span class="episode_num">' + (episodes[i].episode) + '</span> &nbsp; &nbsp; <span class="episode_title">' + episodes[i].title + '</span><div class="pseudo_click_listener"></div></a></div>').appendTo('#slider_tvshow.tvshow_' + imdb + ' .episodes .scroller_cont')
			.click(function(e){

				var el=this;

				if($(e.target).hasClass('pseudo_click_listener')){

					if(el.className.indexOf('watched')>-1){
						el.className = el.className.replace('watched','')
					}
					else{
						el.className += ' watched';
					}

					app.history.tv_episode(ui.tv.session.id + '_' + ui.tv.session.season_id + '_' + $(el).data('episode_id'));


					return;
				}

				$('#slider_tvshow .row.episode.activated').removeClass('activated')
				$(el).addClass('activated')
				ui.tv.show_episode($('#slider_tvshow .season.activated').data('season'), $(el).data('episode_id'), $(el).data('episode_num'))
			})
		}


		if(ui.tv.episodes_scroller)
			ui.tv.episodes_scroller.destroy();

		ui.tv.episodes_scroller = new IScroll(episodes_cont[0],{
			mouseWheel: 	true,
			mouseWheelSpeed: 30,
			scrollbars:		true,
			hScrollbar:		false,
			vScrollbar:		true,
			click:			true,
			fadeScrollbars:	true,
			interactiveScrollbars:	true,
			resizeScrollbars:		true,
			shrinkScrollbars:		'scale'

		});

		var unwatchedEpisode = app.initParams.season == season_id && app.initParams.episode > -1? $('#slider_tvshow .episode[data-episode_num="' + app.initParams.episode + '"]').last() :$('#slider_tvshow .episode.watched').last().next();
		if(unwatchedEpisode.length){
			unwatchedEpisode.click();
			ui.tv.episodes_scroller.scrollToElement(unwatchedEpisode[0],null,null,true)
		}
		else{
			$('#slider_tvshow .episode').first().click();
		}


	},

	show_episode:function(season_id, episode_id, episode_number) {

		var
		imdb				= ui.tv.items[1],
		episode				= ui.tv.items[0][season_id][episode_id],
		torrent_selector 	= $('#slider_tvshow.tvshow_' + imdb + ' .torrent_selector .selector_cont');


		ui.tv.session = {
			id:				imdb,
			imdb:			imdb,
			episode_id: 	episode_id,
			season_id:		season_id,
			episode_number: episode_number,
			title: 			ui.home.catalog.items[imdb].title,
			info:			locale.translate('season') + ' ' + season_id + ', ' + locale.translate('episode') + ' ' + episode_number,
			section:		'tv',
			image:			$('#slider_tvshow .backdrop .img').last().length && $('#slider_tvshow .backdrop .img').last()[0].style.backgroundImage.replace('url(','').replace(/\)$/,'') || ui.home.catalog.items[imdb].poster_big,
			time:			(new Date).getTime()

		}
		/*$.get("//www.omdbapi.com/?i="+imdb+"&y=&plot=short&r=json&season="+season_id+"&episode="+episode_number+"",function(response) {
			if(response && response.imdbID) {
				ui.tv.session.imdb = response.imdbID;
			}
		},'json');*/
		$('#slider_tvshow .episode_name').html(episode.title);
		$('#slider_tvshow .episode_number').html( locale.translate('episode') + ' ' + episode_number);
		$('#slider_tvshow .episode_overview').html(episode.synopsis);

      var title = (ui.tv.session.title.replace(/\s\(\d{4}\)$/,'') + ' season' + ' ' + season_id + ' episode' + ' ' + episode_number + ' ' + episode.title);
      utils.setMetas({
         title : utils.titles.itemTitle.replace('{{item_name}}',  ui.tv.session.title),
         url : '/' + slugify(title)  +'.html?imdb=' + (imdb.replace('tt',"")) + '-' + season_id + '-' + episode_number
      });
		torrent_selector.html('');

		if(episode.items instanceof Array && episode.items.length){
			$('#slider_tvshow.tvshow_' + imdb + ' .watch-btn').show();
			episode.items.forEach(function(torrent, i){
                torrent.file = location.href.indexOf('os=mac') > -1 && torrent.file ?torrent.file:torrent.file.replace('/','\\');
				if(i==0)
					ui.tv.session.torrent = {
						url: 	torrent.torrent_url,
                  magnet: torrent.torrent_magnet,
						file:	torrent.file,
						quality: torrent.quality
					}



				$('<div class="item torrent ' + (i==0 ? 'activated':'') + '" data-idx="' + i + '"><div class="icon2 baterry ' + utils.calculateTorrentHealth(torrent.torrent_seeds, torrent.torrent_peers) + '"></div><div class="caption"><b style="color:#fff">' + torrent.quality + '</b> &nbsp; ' + torrent.torrent_seeds + '/' + torrent.torrent_peers + ' Peers</div></div>').appendTo(torrent_selector)
				.click(function(){
					$('.item.torrent.activated').removeClass('activated')
					$(this).addClass('activated');

					var torrent = episode.items[ parseInt($(this).data('idx')) ];

					ui.tv.session.torrent = {
						url: 	torrent.torrent_url,
                  magnet: torrent.torrent_magnet,
						file:	torrent.file,
						quality: torrent.quality
					}
				});

			})
		}
		else{
			torrent_selector.html('<div class="item"><div class="caption">No torrents</div></div>');
			$('#slider_tvshow.tvshow_' + imdb + ' .watch-btn').hide();
		}



		ui.tv.session.subtitles = [];
		ui.tv.session.eimdb = null;



	},

	watch:function(e){

		if(window.deviceNotSupport) {
			$('#deviceNotSupported').show();
			return;
		}
		Mousetrap.pause();
		torrentsTime.pt.setup.vpnShowed = false;
		app.torrent.get(this.session);

		app.history.add([this.session]);
		app.history.tv_episode([[this.session.id, this.session.season_id, this.session.episode_id].join('_')]);

		switch(app.config.fetcher.mode){
			case 'imdb':

				if(ui.tv.bdwXHR && typeof ui.tv.bdwXHR.abort == 'function')
					ui.tv.bdwXHR.abort();

				ui.tv.bdwXHR = $.get(app.config.api_keys.tmdb_url + 'tv/' + ui.tv.tmdbid + '/season/' + ui.tv.session.season_id + '/episode/' + ui.tv.session.episode_number + '/images?api_key=' + app.config.api_keys.tmdb, function(json){
					if(json && json.stills instanceof Array)
						if(app.history.order[0] && app.history.order[0][0] && app.history.order[0][0] == ui.tv.session.id){
							app.history.order[0][2] = app.config.api_keys.tmdb_src + 'w185' + json.stills[0].file_path;
							app.history.save();
						}


				},'json')

			break;
		}
	},

	handlers:{

		imdb:{

			get_structure:function(data){

				fetcher.fetch.tv_show(data.imdb, function(err, items){

					if(err){

						slider.hide();
						utils.msgbox('Error fetching the TV Show');
						logger.log(err);

					}
					else{

						ui.tv.items = [items, data.imdb,{}];

						var
						seasons_counter	= 0,
						seasons_cont 	= $('#slider_tvshow.tvshow_' + data.imdb + ' .seasons');

						ui.tv.last_episode = 0;
						if(app.history.list[data.imdb]){
							ui.tv.last_episode = [app.history.list[data.imdb].season_id, app.history.list[data.imdb].episode_id];
						}

						seasons_cont.html('<div class="scroller_cont"></div>');

						for(var i in items){
							var seasonUrl = app.initParams.seasons && app.initParams.seasons[i]? app.initParams.seasons[i].url: 'javascript:void(0)';
							seasons_cont.children('.scroller_cont').append('<div class="row season" data-season="'+i+'" onclick="ui.tv.set_season(' + i + ')"><a style="display:block;" href="'+seasonUrl+'">' + locale.translate('season') + ' ' + i + '</a></div>');

							if(app.initParams.season == i || (app.initParams.season == -1 && !seasons_counter && !ui.tv.last_episode))
								ui.tv.set_season(i)

							seasons_counter++;
						}

						if(app.initParams.season == -1 && ui.tv.last_episode)
							ui.tv.set_season(ui.tv.last_episode[0])


					if(ui.tv.seasons_scroller)
						ui.tv.seasons_scroller.destroy();

						ui.tv.seasons_scroller = new IScroll(seasons_cont[0],{
							mouseWheel: 	true,
							mouseWheelSpeed: 30,
							scrollbars:		true,
							hScrollbar:		false,
							vScrollbar:		true,
							click:			true,
							fadeScrollbars:	true,
							interactiveScrollbars:	true,
							resizeScrollbars:		true,
							shrinkScrollbars:		'scale'

						});




					}

				});
			},

			get_show_info:function(data){

				if(ui.tv.infoXHR && typeof ui.tv.infoXHR.abort == 'function')
					ui.tv.infoXHR.abort();

				var handlers = {

					get_tmdb_id:function(callback){
						if(data.tmdbid)
							callback()
						else{
                            var title_clean = "";
                            if(data.title.match(/\(\d{4}\)$/)) {
                                title_clean = data.title.replace(/\s\(\d{4}\)$/,'');
                            } else {
                                title_clean = data.title;
                            }
							ui.tv.infoXHR = $.get(app.config.api_keys.tmdb_url + 'search/tv?query=' + encodeURIComponent(data.title) + '&api_key=' + app.config.api_keys.tmdb,function(json){

								if(json && json.results instanceof Array && json.results.length){
                                    var suggestedName = false;
                                    for(var i = 0; i < json.results.length;i++) {
                                        if(title_clean == json.results[i].name) {
                                            suggestedName = true;
                                            data.tmdbid = json.results[i].id;
                                            ui.tv.tmdbid = json.results[i].id;
                                            break;
                                        }
                                    }
                                    if(!suggestedName) {
                                        data.tmdbid = json.results[0].id;
                                        ui.tv.tmdbid = json.results[0].id;
                                    }
                                    callback();
								}else {
                                    //fallback data;

                                    callback();
                                }


							}, 'json');
						}
					},

					load_info:function(callback){
                        if(typeof data.tmdbid == 'undefined') {
                            callback();
                            return;
                        }
						ui.tv.infoXHR = $.get(app.config.api_keys.tmdb_url + 'tv/' + data.tmdbid + '?api_key=' + app.config.api_keys.tmdb,function(json){
							if(json){
								data.year = json.first_air_date.substr(0,4) + '-' + json.last_air_date.substr(0,4);
								data.synopsis = json.overview;
								data.runtime =  json.episode_run_time && json.episode_run_time[0] ? json.episode_run_time[0] + ' ' + locale.translate('durationUnit') : '';
								data.genre = json.genres instanceof Array ? (json.genres[0] && json.genres[0].name || '') : '';
								data.poster_big = app.config.api_keys.tmdb_src + 'w154' + json.poster_path;
								data.backdrop = app.config.api_keys.tmdb_src + 'w1280' + json.backdrop_path;
							}
							callback();

						}, 'json');
					},

					display_info:function(){

						$('.slider.tvshow_' + data.imdb + ' .synopsis').html(data.synopsis).addClass('fadein');
						$('.slider.tvshow_' + data.imdb + ' .title_info.genre').html(data.genre);
						$('.slider.tvshow_' + data.imdb + ' .title_info .year').html(data.year);

						if(data.runtime)
							$('.slider.tvshow_' + data.imdb + ' .title_info .runtime').html(data.runtime).parent('.runtime_cont').show();


						var img = new Image
						img.onload = function(){
							$('#slider_tvshow.tvshow_' + data.id + ' .poster').css('background-image', 'url(' + data.poster_big + ')').addClass('fadein')

						}
						img.src = data.poster_big;


						var img2 = new Image
						img2.onload = function(){
							$('<div class="backdrop_img"><div class="img" style="background-image:url(' + data.backdrop + ')">').appendTo('#slider_tvshow.tvshow_' + data.id + ' .backdrop');
							setTimeout(function(){ $('#slider_tvshow .backdrop_img').addClass('fadein') }, 50)

						}
						img2.src = data.backdrop;


					}

				}


				if(data.synopsis && data.runtime && data.genre)
					setTimeout(handlers.display_info,100);

				else{


					var
					sequence = [
						'get_tmdb_id',
						'load_info',
						'display_info'

					],
					handler = function(i){
						i = i || 0;

						if( sequence.length <= i )
							return;

						handlers[ sequence[i] ](function(){

							handler(++i)

						})
					};
					handler();


				}

			},

			load_images:function(data){

				return;

				if(ui.movies.imgsXHR && typeof ui.movies.imgsXHR.abort == 'function')
					ui.movies.imgsXHR.abort();

				ui.movies.imgsXHR = $.get(app.config.api_keys.tmdb_url + 'tv/' + data.tmdbid + '/images?api_key=' + app.config.api_keys.tmdb,function(json){

					var poster_img = data.poster_big;

					if(typeof json == 'object'){

						if(json.posters){

							var gotFirstEnPoster = false;

							for(var i=0;i<json.posters.length;i++){

								if(json.posters[i].height>1080)

									if(json.posters[i].iso_639_1==locale.language){
										poster_img = '//image.tmdb.org/t/p/w780/' + json.posters[i].file_path;
										break;
									}
									else if(!gotFirstEnPoster && json.posters[i].iso_639_1=='en'){
										poster_img = '//image.tmdb.org/t/p/w780/' + json.posters[i].file_path;
										gotFirstEnPoster=true;
									}

							}

						}


						var img = new Image
						img.onload = function(){
							clearTimeout(posterNotLoaded);
							$('#slider_movie.movie_' + data.id + ' .poster_img').attr('src',poster_img).addClass('fadein')
							setTimeout(load_backdrops,3750)

						}
						img.src = poster_img;

						var posterNotLoaded = setTimeout(function(){
							load_backdrops();
						},5000)



						var load_backdrops = function(){
							var backdrops = [];
							if(json.backdrops instanceof Array){

								var bd_handler = function(i){

									if(!$('.movie_' + data.id).length)
										return;

									if(i>=json.backdrops.length){
										i=0;
										if(!$('#slider_movie .backdrop_img').length)
											return;
									}

									var bd = json.backdrops[i];
									if(bd.width >= 1920){
										var
										src = '//image.tmdb.org/t/p/w' + bd.width + bd.file_path,
										img = new Image;
										img.onload = function(){


											$('<div class="backdrop_img"><div class="img" style="background-image:url(' + src + ')">').appendTo('#slider_movie .backdrop');
											$('#slider_movie .backdrop_img.fadein').fadeOut('slow',function(){$(this).remove()});
											setTimeout(function(){
												$('#slider_movie .backdrop_img').last().addClass('fadein');
												setTimeout(function(){bd_handler(++i)},6750);
											},10)

										}
										img.onerror = function() {
											setTimeout(function(){bd_handler(++i)},100);
										}
										img.src=src


									}
									else
										setTimeout(function(){bd_handler(++i)},500);

								}

								bd_handler(0);
							}
						}
					}

				},'json')

			},

			load_actors:function(data){

				return;


				if(ui.movies.actorsXHR && typeof ui.movies.actorsXHR.abort == 'function')
					ui.movies.actorsXHR.abort();


				var displayInfo = function(){

					for(var i=0; i<(data.actors.length<5 ? data.actors.length : 5); i++){
						$('#slider_movie.movie_' + data.id + ' .actors').append('<div class="actor"><img src="' + data.actors[i].img + '" onload="$(this).parent().fadeIn()"></div>')
					}


				}

				if(data.actors)
					setTimeout(displayInfo,100);
				else{

					ui.movies.actorsXHR = $.get(app.config.api_keys.tmdb_url + 'movie/' + data.imdb + '/credits?api_key=' + app.config.api_keys.tmdb,function(json){

						if(json && json.cast instanceof Array){
							var actors = [];
							for(var i=0; i<json.cast.length; i++){
								actors.push({name: json.cast[i].name, img: app.config.api_keys.tmdb_src + 'w185' + json.cast[i].profile_path});
							}

							data.actors = actors;
							displayInfo();
						}

					})

				}

			}

		},

		anime:{
			get_structure:function(data){

				fetcher.fetch.tv_show(data.imdb, function(err, items){

					if(err){

						slider.hide();
						utils.msgbox('Error fetching the TV Show');
						logger.log(err);

					}
					else{

						ui.tv.items = [items, data.imdb,{}];

						var
						seasons_counter	= 0,
						seasons_cont 	= $('#slider_tvshow.tvshow_' + data.imdb + ' .seasons');

						ui.tv.last_episode = 0;
						if(app.history.list[data.imdb]){
							ui.tv.last_episode = [app.history.list[data.imdb].season_id, app.history.list[data.imdb].episode_id];
						}

						seasons_cont.html('<div class="scroller_cont"></div>');

						for(var i in items){
							seasons_cont.children('.scroller_cont').append('<div class="row season" data-season="'+i+'" onclick="ui.tv.set_season(' + i + ')">' + locale.translate('season') + ' ' + i + '</div>');


							if(!seasons_counter && !ui.tv.last_episode)
								ui.tv.set_season(i)

							seasons_counter++;
						}

						if(ui.tv.last_episode)
							ui.tv.set_season(ui.tv.last_episode[0])


					if(ui.tv.seasons_scroller)
						ui.tv.seasons_scroller.destroy();

						ui.tv.seasons_scroller = new IScroll(seasons_cont[0],{
							mouseWheel: 	true,
							mouseWheelSpeed: 30,
							scrollbars:		true,
							hScrollbar:		false,
							vScrollbar:		true,
							click:			true,
							fadeScrollbars:	true,
							interactiveScrollbars:	true,
							resizeScrollbars:		true,
							shrinkScrollbars:		'scale'

						});




					}

				});
			},

			get_show_info:function(data){

						$('.slider.tvshow_' + data.id + ' .synopsis').html(data.synopsis).addClass('fadein');
						$('.slider.tvshow_' + data.id + ' .title_info.genre').html(data.genre);
						$('.slider.tvshow_' + data.id + ' .title_info .year').html((data.year || '2014'))

						if(data.runtime)
							$('.slider.tvshow_' + data.id + ' .title_info .runtime').html(data.runtime).parent('.runtime_cont').show();


						var img = new Image
						img.onload = function(){
							$('#slider_tvshow.tvshow_' + data.id + ' .poster').css('background-image', 'url(' + data.poster_big + ')').addClass('fadein')

						}
						img.src = data.poster_big;

			},
		},

		cartoons:{

		}

	}

}
