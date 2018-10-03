fetcher.scrappers.yts = function(genre, keywords, page, callback){



		var url = 'https://yts.ag/api/v2/list_movies.jsonp?genre=' + genre + '&sort=seeds&limit=50&set=' + ui.home.catalog.page;

        if (keywords) {
            url += '&keywords=' + keywords;
        }

        if (genre) {
            url += '&genre=' + genre;
        }

        if (page && page.toString().match(/\d+/)) {
           url += '&set=' + page;
        }



		url = "https://json2jsonp.com/?url="+encodeURIComponent(url)+"";


		$.ajax({
			url: url,
			dataType:'jsonp',
			jsonp: "callback",
			timeout:8000,
			error:function(){callback(false)},
			success:function(data){
				var movies = [],
					memory = {};

				if (!data || data.status != 'ok' || typeof data.data.movies === 'undefined') {
					callback(false);
					return;
				}

				data.data.movies.forEach(function (movie){
					// No imdb, no movie.
					if( typeof movie.imdb_code != 'string' || movie.imdb_code.replace('tt', '') == '' ){ return;}


					var torrents = [];
					for(var i = 0; i<movie.torrents.length; i++) {

						torrents.push({
							"type": 0,
							"torrent_url": movie.torrents[i].url,
							"torrent_seeds": movie.torrents[i].seeds,
							"torrent_peers": movie.torrents[i].peers,
							"file": false,
							"quality": movie.torrents[i].quality,
							"language": "",
							"subtitles": "",
							"size_bytes": movie.torrents[i].size_bytes,
							"id": movie.torrents[i].hash
						});
					}



						memory[ movie.imdb_code ] = {


								id:       	movie.imdb_code,
								imdb:       movie.imdb_code,
								title:      movie.title_english,
								year:       movie.year ? movie.year : '&nbsp;',
								runtime:    "",
								synopsis:   "",
								voteAverage:parseFloat(movie.rating),

								poster_small:	movie.medium_cover_image,
								poster_big:   	movie.large_cover_image,
								image: 	 	    movie.background_image,
								bigImage:   	movie.background_image_original,

								quality:    torrents[0].quality,
								torrent:    torrents[0].torrent_url,
								magnet :    "",
								torrents:   torrents,

								seeders:    torrents[0].torrent_seeds,
								leechers:   torrents[0].torrent_peers,
								trailer:	false,
								stars:		utils.movie.rateToStars(parseFloat(movie.rating)),

						}




				});

				for(var i in memory)
					movies.push(memory[i])

				callback(movies)
			},
		});

}
