// JavaScript Document

define('tools.imgLoader', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		isIE = $.browser.msie && Number($.browser.version) < 9;
	
	var imgLoader = shape(function(o){
		imgLoader.parent().call(this);
	});
	
	imgLoader.implement({
		stop: function(){
			clearInterval(this.intervalId);
			this.intervalId = null;
		},
		destory: function(){
			clearInterval(this.intervalId);
			delete this.intervalId;
			imgLoader.parent('destory').call(this);
		},
		load: function(){
			var index = 0, 
				total = 0,
				list = [];
			
			return function(src, param){
				
				var onready, error, width, height, newWidth, newHeight,
					img = new Image(), 
					eventObj = {};
				
				eventObj.index = ++index;
				img.src = eventObj.src = src;
				eventObj.img = img;
				this.trigger('loadStart', $.extend(eventObj, param || {}));
				
				if (img.complete && img.width){
					var self = this;
					setTimeout(function(){
						self.trigger('ready', $.extend(eventObj, param || {}));
						self.trigger('load', $.extend(eventObj, param || {}));
					},1);
					return;
				}
				width = img.width;
				height = img.height;
				
				var imgfix = isIE ? $('<img src=' + src + ' />')[0] : img,
					self = this;
				imgfix.onerror = function(){
					onready.end = true;
					img = img.onload = img.onerror = null;
					self.trigger('error', $.extend(eventObj, param || {}));
				}
				
				onready = function() {
					newWidth = img.width;
					newHeight = img.height;
					if(newWidth !== width || newHeight !== height || newWidth * newHeight > 1024){
						self.trigger('ready', $.extend(eventObj, param || {}));
						onready.end = true;
					}
				}
				
				onready();
				img.onload = function () {
					!onready.end && onready();
					img = img.onload = img.onerror = null;
					self.trigger('load', $.extend(eventObj, param || {}));
				}
				
				if (!onready.end){
					list.push(onready);
					if(this.intervalId === null){
						this.intervalId = setInterval(function(){
							var i = 0;
							for (; i < list.length; i++){
								list[i].end ? list.splice(i--, 1) : list[i]();
							}
							!list.length && self.stop();
						}, 40);
					}
				}
			}
		}()
	});
	
	return imgLoader;
});