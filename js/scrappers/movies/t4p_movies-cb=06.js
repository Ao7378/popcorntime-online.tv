// dont change name, used from static
fetcher.scrappers.t4p_movie = function(movie, movies, fastMode, memory){
	if( typeof movie.imdb != 'string' || movie.imdb.replace('tt', '') == '' ){ return;}

	try{
		var torrents = {};
		if(!fastMode) {
			movie.items.forEach(function(torrent){
				if(torrent.type===0 && !torrents[torrent.quality]){
					torrents[torrent.quality] = torrent.torrent_url
				}
			});
		}



		var movieModel = {
			id:       	movie.imdb,
			imdb:       movie.imdb,
			title:      movie.title,
			year:       movie.year ? movie.year : '&nbsp;',
			runtime:    movie.runtime,
			synopsis:   movie.description,
			genre:   movie.genres instanceof Array ? (movie.genres[0] || '') : '',
			voteAverage:parseFloat(movie.rating),

			poster_small:	movie.poster_med? movie.poster_med.replace('http:',''):movie.poster_med,
			poster_big:   	movie.poster_big? movie.poster_big.replace('http:',''):movie.poster_big,

			quality:    "",
			torrent:    "",
			magnet :    "",
			torrents:   movie.items,
			videos:     {},
			seeders:    movie.torrent_seeds,
			leechers:   movie.torrent_peers,
			trailer:	movie.trailer ? 'https://www.youtube.com/embed/' + movie.trailer + '?autoplay=1': false,
			stars:		utils.movie.rateToStars(parseFloat(movie.rating)),

			hasMetadata:false,
			hasSubtitle:false
		};
		if(!fastMode) {

			movieModel['quality'] = movie.items[0].quality;
			movieModel['torrent'] = movie.items[0].torrent_url;
			movieModel['magnet'] = movie.items[0].torrent_magnet;
		}

		if(!fastMode && movie.items_lang && movie.items_lang.length){
			movieModel.dubbing = {};
			movie.items_lang.forEach(function(torrent){
				if(!movieModel.dubbing[torrent.language])
					movieModel.dubbing[torrent.language] = [];

				movieModel.dubbing[torrent.language].push(torrent);

			});

		}

		var stored = memory[movie.imdb];

		// Create it on memory map if it doesn't exist.
		if (typeof stored === 'undefined') {
			stored = memory[movie.imdb] = movieModel;
		}

		if (stored.quality !== movieModel.quality && movieModel.quality === '720p') {
			stored.torrent = movieModel.torrent;
			stored.quality = '720p';
		}

		if(!fastMode) {
			// Set it's correspondent quality torrent URL.
			stored.torrents[movie.Quality] = movie.TorrentUrl;
		}
		// Push it if not currently on array.
		if (movies.indexOf(stored) === -1) {
			movies.push(stored);
		}
	}catch(e){
		console.error('error on movies parse:',e);
	}

}
fetcher.scrappers.t4p_movies = function(genre, keywords, page, callback,fallback){

		if(genre=='all')
			genre = !1;

		var fastMode = true;
		var url = '//api.apiumando.info/list?sort=' + app.config.fetcher.sortBy + (fastMode ? '&short=1' : '') + '&cb='+''+'&quality=720p,1080p,3d&page=' + ui.home.catalog.page + (!!fallback ? '&nc=1' : '');


        if (keywords) {
            url += '&keywords=' + keywords;
        }

        if (genre) {
            url += '&genre=' + genre;
        }

        if (page && page.toString().match(/\d+/)) {
           url += '&set=' + page;
        }

		$.ajax({
			url: url,
			dataType:'json',
			timeout:9000,
			error:function(){
				if(!fallback) {
					fetcher.scrappers.t4p_movies(genre, keywords, page, callback, true);
				} else {
					callback(false)
				}
			},
			success:function(data){

				var movies = [],
					memory = {};

            if (data.error || typeof data.MovieList === 'undefined' || data.MovieList.length == 0) {
               if(!fallback) {
                  fetcher.scrappers.t4p_movies(genre, keywords, page, callback, true);
               } else {
                  callback(false)
               }
               return;
            }

				data.MovieList.forEach( function(movie){ fetcher.scrappers.t4p_movie(movie, movies, fastMode, memory)});

				if(keywords && !movies.length){
					console.log(movies.length)
					fetcher.scrappers.yts(genre, encodeURIComponent($('#search_input').val()), page, callback);
				}
				else{
					callback(movies)
				}
			},
		});

};
fetcher.scrappers.t4p_movie_torrents = function(imdb,callback,fallback) {
	console.log(imdb);
    var url = '//api.apiumando.info/movie?cb='+''+'&quality=720p,1080p,3d&page=' + ui.home.catalog.page + (!!fallback ? '&nc=1' : '') + '&imdb=' + imdb;

    $.ajax({
        url: url,
        dataType:'json',
        timeout:16000,
        error:function(){
            if(!fallback) {
                fetcher.scrappers.t4p_movie_torrents(imdb, callback, true);
            } else {
                callback(false)
            }

        },
        success:function(movie){
			console.log('success t4p torrents');
            var memory = {};

            if (Object.keys(movie).length == 0) {
                if(!fallback) {
                    fetcher.scrappers.t4p_movie_torrents(imdb, callback, true);
                } else {
                    callback(false)
                }
                return;
            }

			if( typeof movie.imdb != 'string' || movie.imdb.replace('tt', '') == '' ){ return;}

			try{
				var torrents = {};
					movie.items.forEach(function(torrent){
						if(torrent.type===0 && !torrents[torrent.quality]){
							torrents[torrent.quality] = torrent.torrent_url
						}
					});



				// id:       	movie.imdb,
				var movieModel = {
					quality:    "",
					torrent:    "",
					magnet :    "",
					torrents:   movie.items
				};
				if(typeof movie.items[0] !== 'undefined') {

					movieModel['quality'] = movie.items[0].quality;
					movieModel['torrent'] = movie.items[0].torrent_url;
					movieModel['magnet'] = movie.items[0].torrent_magnet;
				}

				if(movie.items_lang && movie.items_lang.length) {
					movieModel.dubbing = {};
					movie.items_lang.forEach(function(torrent){
						if(!movieModel.dubbing[torrent.language])
							movieModel.dubbing[torrent.language] = [];

						movieModel.dubbing[torrent.language].push(torrent);

					});

				}



				var stored = memory[movie.imdb];

				// Create it on memory map if it doesn't exist.
				if (typeof stored === 'undefined') {
					stored = memory[movie.imdb] = movieModel;
				}

				if (stored.quality !== movieModel.quality && movieModel.quality === '720p') {
					stored.torrent = movieModel.torrent;
					stored.quality = '720p';
				}

				// Set it's correspondent quality torrent URL.
				stored.torrents[movie.Quality] = movie.TorrentUrl;
			}catch(e){
				console.error('error on movies parse:',e);
			}



            callback(stored)
        }
    });

};