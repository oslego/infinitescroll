(function($){
	$.fn.infiniteScroll = function(settings){					
		var a = function(el, options){
			var currIndex = null;
						
			//reference to the selected element
			var $container = $(el);	
			
			//extend default options with user-defined options		
			var $opt = $.extend({}, $.fn.infiniteScroll.defaults, options);
				
			/*
			Check required parameters
			@exception {TypeError} incrementIndex is not defined or not in the "urlParams" object
			
			@return{void}
			*/
			function checkRequirements(){
				if ($opt.urlParams[$opt.incrementIndex] == undefined){
					throw new TypeError("Missing parameter 'incrementIndex'")
				}	
			}
			
			/*
			Check if an element with a loading message was declared in the settings object
			If it exists it will be used in between requests for content as an activity indicator
			
			@return {Boolean}
			*/ 
			function hasLoadingMessage(){
				return (typeof $opt.loadingMessage == 'object' && $opt.loadingMessage !== null) ? true:false;
			}
			
			/*
			Setup instance variables and add listeners
			*/
			function init(){
				currIndex = parseInt($opt.urlParams[$opt.incrementIndex], 10);
				
				if (hasLoadingMessage()){
					$opt.hideLoading($opt.loadingMessage)
				}
				
				//bind scroll listener
				$container.bind('scroll', function(e){
					var	t = e.originalTarget										
					if (t.scrollHeight - t.scrollTop === t.clientHeight){
						requestContent();
						currIndex++
					}
				})
			}		
			
			/*
			Request more content from the server according to the index increment parameter
			If available, how and hide the progress indicator on request start and end phases
			
			@return {void}	
			*/		
			function requestContent(){
				//increment the index parameter
				$opt.urlParams[$opt.incrementIndex] = currIndex + parseInt($opt.incrementBy, 10)
																	
				//show the progress indicator, if available
				hasLoadingMessage() ? $opt.showLoading($opt.loadingMessage) : false;
				
				//request more content from the sever
				$.get($opt.url, $opt.urlParams, function(data){
										
					//Handle the received content
					$opt.responseHandler(data, $container);
					
					//hide the progress indicator, if available
					hasLoadingMessage() ? $opt.hideLoading($opt.loadingMessage) : false;
				}, $opt.format)
			}
			
			//
			checkRequirements()
			
			// set instance variables and listeneres
			init();
			
		}(this, settings)
			
		//return the currently selected element; allow jQuery chanining
		return this
	};
	
	$.fn.infiniteScroll.defaults = {
		// @param {String} url - url from which to request content
		url: null,
		
		// @param {Object} urlParams - key/value pairs to append to the "url" parameter and send to the server with each request
		urlParams: null,
		
		// @param {String} incrementIndex - The parameter which describes the index by which to get more content (ex: page)
		// This parameter needs to be one from the "urlParams" object
		incrementIndex: null,
		
		// @param {Number} incrementBy - The amount by which to increment the index parameter used to get more content
		incrementBy: 1,
		
		// @param {String} format - Format of the server response. Can be "xml", "json", "html" or "text"
		format: "xml",
		
		// @param {Object} loadingMessage - DOM / jQuery object identifying the progress indicator (loading messae)
		loadingMessage: null,
		
		/*
		Function called before triggering the server request for content.
		Used to initiate the progress indicator state.
		
		@param {Object} loadingMessage jQuery object indentifying the progress indicator DOM element.
		@return {void} 
		*/		
		showLoading: function(loadingMessage){
			$(loadingMessage).fadeIn('slow')
		},
		
		/*
		Function called after when the response comes back from the server.
		Used to end the progress indicator state.
		
		@param {Object} loadingMessage jQuery object indentifying the progress indicator DOM element.
		@return {void} 
		*/
		hideLoading: function(loadingMessage){
			$(loadingMessage).fadeOut('slow')
		},
		
		/*	
		Function called automatically with the server response that handles the response data.
		
		@param {Object} data response from the server
		@param {Object} container jQuery object identifying the element that the plugin was set on
		@return {void}
		*/
		responseHandler: function(data, container){
			$(container).append(data.toString());		
		}
	};
	
})(jQuery)