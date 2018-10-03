var utils = {
      titles : {
         common : 'Popcorn Time Online',
         itemTitle : 'Popcorn Time - Watch {{item_name}} instantly for free!'

      },
   setMetas : function(data) {
      console.log('META\'s',data);
      if(data.title) {
         var title = data.title;
         $('title').html(title);
         $("meta[property='og:title']").attr("content", title);
         $("meta[name='twitter:title']").attr("content", title);
      }
      if(data.url) {
         $("meta[property='og:url']").attr("content", '//popcorntime-online.io' + data.url);
         $("meta[name='twitter:url']").attr("content",'//popcorntime-online.io' + data.url);
      }
      window.history.pushState({"html":JSON.stringify(data),"pageTitle":data.url},"", data.url);
      if(data.image) {

      }
   },
		/*
		 bytes == 1
		 K/bytes == 1024
		 M/bytes == 1048576
		 G/bytes == 1073741824
		 T/bytes == 1099511627776
		 */
        beatifySize : function(bytes) {
            var info = {};
            if(bytes / 1099511627776 > 1) {
                info = {
                    size : bytes / 1099511627776,
                    type : "T/bytes"
                }
            } else if(bytes / 1073741824 > 1) {
                info = {
                    size : bytes / 1073741824,
                    type : "G/bytes"
                }
            } else if(bytes / 1048576 > 1) {
                info = {
                    size : bytes / 1048576,
                    type : "M/bytes"
                }
            } else if(bytes / 1024 > 1) {
                info = {
                    size : bytes / 1024,
                    type : "K/bytes"
                }
            } else {
                info = {
                    size : bytes ,
                    type : "bytes"
                }
            }
            if(typeof info.size =='undefined') {
                info.size = 0;
            }
            info.size = +info.size.toFixed(2);
            return info;
        },
        insertItemToArrayByRating : function(item,array) {
            if(array.length == 0) {
                array.push(item);
            }  else {
                for(var i = 0;i<array.length;i++) {
                    if(array[i].rating <= item.rating) {
                        array.splice(i, 0, item);
                        break;
                    }  else if(i==(array.length - 1) && array[i].rating > item.rating) {
                        array.push(item);
                        break;
                    }
                }
            }


            return array;
        },

        isSubIsset: function (subLangIso, subs) {
            subs.some(function (el) {
                return el[1] == subLangIso
            })
        },
        fillSubsList: function (subs, subsList) {
            var i = 0, j=0;
            if (subs) {

                for(var langCode in subs){
                    if(subs.hasOwnProperty(langCode)) {
                        if(typeof subsList[langCode] == "undefined") {
                            subsList[langCode] = [];
                        }
                        for (j = 0; j < subs[langCode].length; j++) {
                            subsList[langCode].push(subs[langCode][j]);
                        }
                    }
                }
            }
        },
        onceFromTries:function(max){
            var min= 0;
            var target = Math.floor(max / 2);
            return target == (Math.floor(Math.random() * (max - min + 1)) + min);
        },
	load_script:function(src, callback) {

		var script = document.createElement('script'), loaded;

		script.setAttribute('src', src);
		if (callback) {
		  script.onreadystatechange = script.onload = function() {
			if (!loaded) {
			  callback();
			}
			loaded = true;
		  };
		}
		document.getElementsByTagName('head')[0].appendChild(script);

	},

	tokenizer:function(tokens, str){
		return str.replace(/\[##([^#]+)##\]/g, function(){

			var global_tokens = {

				toolbox_html:$('#watch_toolbox').html()
			}

			return tokens[arguments[1]] || global_tokens[arguments[1]] || '';
		});
	},

	movie:{
		rateToStars:function(rate){
			if(!rate)
				return [
				'<span class="icon star_empty"></span>',
				'<span class="icon star_empty"></span>',
				'<span class="icon star_empty"></span>',
				'<span class="icon star_empty"></span>',
				'<span class="icon star_empty"></span>'
				].join("");


			var
			p_rating = Math.round(rate.toFixed(1)) / 2,
			stars = '';

			for (var i = 1; i <= Math.floor(p_rating); i++){
				stars += '<span class="icon star"></span>';
			}
			if(p_rating % 1 > 0){
				stars += '<span class="icon star_half"></span>';
			}

			for (var i = Math.ceil(p_rating); i < 5; i++) {
				stars += '<span class="icon star_empty"></span>';
			}

			return stars;

		}
	},

	msgbox:function(str){
		$('#msg div').html(str);
		$('#msg').show();
		setTimeout(function(){
			$('#msg').hide();
		},5500)
	},

	url_response:{},
	url_request:function(url, callback){

           utils.url_response[url] = function() {
              clearTimeout(utils.url_response_timeout[url]);
              callback(arguments);
           };
            utils.url_response_timeout[url] = setTimeout(function() {
               utils.url_response[url](null);
               utils.url_response[url] = function() {};
           },5000);
            try {
                hostApp.url_request(url);
            } catch (e) {
               utils.url_response[url](null)
            }
        },
        calculateTorrentHealth: function (seeders, peers) {
            // Calculates the "health" of the torrent (how easy it is to stream)
            var leechers = peers - seeders;
            var ratio = leechers > 0 ? (seeders / leechers) : seeders;

			if (seeders < 50){
                return 'bad';
            }
            else if (seeders>=50 && seeders < 100) {
                return 'medium';
            }
            else if (seeders >= 100 && seeders < 200) {
				return 'good';

				//dont calc ratio..
                if (ratio > 5) {
                    return 'good';
                } else if (ratio > 3) {
                    return 'medium';
                } else {
                    return 'bad';
                }
            }
            else if (seeders >= 200) {

				return 'excellent';

				//dont calc ratio

                if (ratio > 5) {
                    return 'excellent';
                } else if (ratio > 3) {
                    return 'good';
                } else if (ratio > 2) {
                    return 'medium';
                } else {
                    return 'bad';
                }
            }
        },

    popupwindow: function(url, name, w, h){
	  var left = (screen.width/2)-(w/2);
	  var top = (screen.height/2)-(h/2);
	  return window.open(url, name, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	},
        sendGA:function (eventCategory, eventAction, eventLabel) {
            if(typeof hostApp !== 'undefined' && hostApp.sendEvent) {
                try{
                    if(!eventAction || !eventCategory)
                        return console.warn("sendGA - eventCategory or eventAction is empty");
                    hostApp.sendEvent(JSON.stringify(
                        {
                            "eventCategory" : eventCategory || "Application",
                            "eventAction" : eventAction,
                            "eventLabel" : eventLabel||''
                        }
                    ));
                }catch (e){
                    console.error("Error sending ga", e);
                }
            }
            console.info("sendGA",eventCategory, eventAction, eventLabel);
        },
      is_mobile: function () { return true;},
      is_mobile2: function () {
         var isMobile = false; //initiate as false
      // device detection
         if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

         return isMobile;
      },
        urlParam :function (name, def) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                .exec(window.location.href);

            return results? results[1] || def:def;
        },
      check_location: function (callback) {

         var requestUrl = "https://api.teletext.io/api/v1/geo-ip";

         $.ajax({
            url: requestUrl,
            type: 'GET',
            success: function (json) {
               if (json && json.alpha2) {
                  callback(json.alpha2);
               }
            },
            error: function (err) {
               console.log("Request failed, error= " + err);
            }
         });
      }

},
resource = {

	genres:[
		"all",
		"action",
		"adventure",
		"animation",
		"biography",
		"comedy",
		"crime",
		"documentary",
		"drama" ,
		"family",
		"fantasy",
		"film-noir",
		"history",
		"horror",
		"music",
		"musical",
		"mystery",
		"romance",
		"sci-fi",
		"short",
		"sport",
		"thriller",
		"war",
		"western"
	],

	lang2code:{
			"af":"za",
			"sq":"al",
			"ar":"sa",
			"hy":"am",
			"cy":"az",
			"lt":"az",
			"eu":"es",
			"be":"by",
			"bg":"bg",
			"bs":"bs",
			"ca":"es",
			"zh":"cn",
			"hr":"hr",
			"cs":"cz",
			"da":"dk",
			"nl":"nl",
			"en":"us",
			"et":"ee",
			"fo":"fo",
			"fa":"ir",
			"fi":"fi",
			"fr":"fr",
			"gl":"es",
			"de":"de",
			"el":"gr",
			"gu":"in",
			"he":"il",
			"hi":"in",
			"hu":"hu",
			"is":"is",
			"id":"id",
			"it":"it",
			"ja":"jp",
			"kn":"in",
			"kk":"kz",
			"kok":"in",
			"ko":"kr",
			"ky":"kz",
			"lv":"lv",
			"lt":"lt",
			"mk":"mk",
			"ms":"my",
			"mr":"in",
			"mn":"mn",
			"nb":"no",
			"nn":"no",
			"no":"no",
			"pl":"pl",
			"pt":"br",
			"pt":"pt",
			"pa":"in",
			"ro":"ro",
			"ru":"ru",
			"sa":"in",
			"cy":"sr",
			"lt":"sr",
			"sk":"sk",
			"sl":"si",
			"es":"es",
			"sw":"ke",
			"sv":"se",
			"sr":"sr",
			"syr":"sy",
			"ta":"in",
			"tt":"ru",
			"te":"in",
			"th":"th",
			"tr":"tr",
			"uk":"ua",
			"ur":"pk",
			"cy":"uz",
			"lt":"uz",
			"vi":"vn",
		}
};


var _svg = {
   "voice_dubb" : '' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 295.928 295.928" style="enable-background:new 0 0 295.928 295.928;" xml:space="preserve">' +
      '   <g>' +
      '      <path d="M193.686,68.762c-3.907,3.902-3.909,10.234-0.005,14.141c26.269,26.287,26.252,69.074-0.037,95.379   c-3.904,3.908-3.902,10.238,0.004,14.143c1.953,1.951,4.511,2.928,7.069,2.928c2.561,0,5.12-0.979,7.073-2.932   c34.079-34.1,34.096-89.57,0.037-123.654C203.925,64.86,197.592,64.856,193.686,68.762z"></path>' +
      '      <path d="M156.301,97.448c-3.907,3.902-3.909,10.234-0.005,14.141c10.472,10.48,10.471,27.533-0.002,38.014   c-3.904,3.906-3.902,10.238,0.005,14.143c1.952,1.951,4.511,2.926,7.068,2.926c2.561,0,5.121-0.976,7.073-2.932   c18.263-18.275,18.264-48.012,0.002-66.287C166.54,93.544,160.207,93.542,156.301,97.448z"></path>' +
      '      <path d="M252.097,24.471c-3.904-3.908-10.235-3.91-14.142-0.006c-3.907,3.904-3.909,10.236-0.005,14.143   c50.671,50.703,50.649,133.225-0.052,183.951c-3.904,3.906-3.902,10.238,0.004,14.143c1.953,1.951,4.511,2.928,7.069,2.928   c2.56,0,5.12-0.979,7.073-2.932C310.536,178.175,310.559,82.97,252.097,24.471z"></path>' +
      '      <path d="M72.751,195.087c25.71-1.771,46.091-23.264,46.091-49.447c0-27.338-22.217-49.578-49.524-49.578   c-27.309,0-49.526,22.24-49.526,49.578c0,26.182,20.381,47.674,46.092,49.447c-19.25,0.74-36.203,7.695-48.019,19.789   C5.726,227.3-0.443,244.501,0.025,264.622c0.126,5.43,4.564,9.768,9.997,9.768h118.582c5.433,0,9.871-4.338,9.997-9.77   c0.467-20.123-5.703-37.326-17.843-49.75C108.945,202.78,91.997,195.827,72.751,195.087z"></path>' +
      '   </g>' +
      '</svg>'
};