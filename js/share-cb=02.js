(function(){

	var html = "<style>#share_cont{position:absolute;z-index:19;left:15px;bottom:15px;overflow-x:hidden;height:130px;width:330px;transition-property: *;transition-duration: 0.6s;transition-timing-function: ease-in;}#share_msg{position:absolute;top:25px;width:calc(100% - 30px);height:90px;background:rgba(0,0,0,0.8);border-radius:8px;transition-property: *;transition-duration: 0.4s;transition-timing-function: ease-in;}#share_cont.share_off #share_msg{left:-330px;opacity:0;}#share_cont.share_on #share_msg{left:30px;opacity:1;transition-delay:0.66s;}#share_mascot{position:relative;left:0;bottom:-20px;}#share_txt{padding:10px 10px 10px 90px;color:#fff;}#share_title{white-space:nowrap;font-size:16px;}#share_txt img{width:36px;height:36px;padding:5px;padding-top:10px;cursor:pointer;}.share_off{opacity:0;pointer-events: none;}.share_on{opacity:1;}<\/style><div id=\"share_cont\" class=\"share_off\"><div style=\"width:100%;height:100%;position:relative;\"><div id=\"share_msg\"><div id=\"share_txt\"><div id=\"share_title\">Help Our Project Grow!<\/div><div>&nbsp;<img src=\"/images\/share_fb.png\" onclick=\"_share('fb')\"><img src=\"/images\/share_twitter.png\" onclick=\"_share('tw')\"><img src=\"/images\/share_google.png\" onclick=\"_share('goo')\"><\/div><\/div><\/div><img style=\"position:relative;\" src=\"/images\/share_mascot.png\"><\/div><\/div>";
	$('body').append(html);
	
	window._share = function(e){
	
		switch(e){
			default: case 'fb':
				var winWidth = 520; var winHeight = 350;
				var winTop = (screen.height / 2) - (winHeight / 2);
				var winLeft = (screen.width / 2) - (winWidth / 2);
				window.open('https://www.facebook.com/sharer.php?s=100&p[url]=' + encodeURIComponent(location.href) , 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
			break;
			
			case 'tw':
						var width  = 575,
						height = 400,
						left   = ($(window).width()  - width)  / 2,
						top    = ($(window).height() - height) / 2,
						url    = 'https://twitter.com/share?text=' + encodeURIComponent(location.href),
						opts   = 'status=1' +
								 ',width='  + width  +
								 ',height=' + height +
								 ',top='    + top    +
								 ',left='   + left;
					
					window.open(url, 'twitter', opts);
			break;
			
			case 'goo':
				window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href),'gplusshare','width=600,height=400,left='+(screen.availWidth/2-225)+',top='+(screen.availHeight/2-150)+'');
			break;
		
		}
	
	}
	
	ui.movies.handlers.imdb.share = function(){
		setTimeout(function(){
         if(!window.deviceNotSupport)
          document.getElementById('share_cont').className='share_on';},1000);
		var oldfunc = ui.sliders.slider.movie.destruct;
		ui.sliders.slider.movie.destruct = function(){
			if(typeof oldfunc == 'function') oldfunc();
			document.getElementById('share_cont').className='share_off';
			
		}
	}
	
	ui.tv.handlers.imdb.share = function(){
		setTimeout(function(){
            document.getElementById('share_cont').className='share_off';
      },500);
		var oldfunc = ui.sliders.slider.tvshow.destruct;
		ui.sliders.slider.tvshow.destruct = function(){
			if(typeof oldfunc == 'function') oldfunc();
			setTimeout(function(){

            if(!window.deviceNotSupport)
               document.getElementById('share_cont').className='share_on';
         },1000)
			
		}
	}
	
})()

