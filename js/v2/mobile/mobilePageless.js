// JavaScript Document

define("mobile.mobilePageless", 'widge.pageless', function(require, exports, module){

	var $ = module['mobile'],
		Class = require('base.class').Class,
		util = require('base.util'),
		pageless = module['widge.pageless'],
		win = window,
		doc = document;
	
	var mobilePageless = Class(function(o){
			mobilePageless.parent().call(this, util.merge({
				emptyHTML: '没有数据了',
				closeTimeout: 5000
			}, o));
		}).extend(pageless);
		
	mobilePageless.implement({
		_initEvents: function(){
			//element.addTouchListener('touchstart', util.bind(this._handleEvents, this));
			//$(doc).addTouchListener('touchmove', util.bind(this._handleEvents, this)).
			//addTouchListener('touchend, touchcancel', util.bind(this._handleEvents, this));
			$(win).on("scroll.pageless", util.bind(this.scroll, this));
			this.get('loader').show();
		},
		
		/*
		_handleEvents: function (e) {
			switch ( e.type ) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._touchStart(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._touchMove(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._touchEnd(e);
					break;
			}
		},
		_touchStart: function(e){
			e.preventDefault();
			this.startTime = $.mobile.getTime();
			var point = e.touches[0];
			this.pointY = point.pageY;
		},
		_touchMove: function(e){
			e.preventDefault();
			var timestamp = $.mobile.getTime(),
				point = e.touches[0],
				deltaY = point.pageY - this.pointY;
				
			if(deltaY > 10){
				return;
			}
			this.moved = true;
		},
		_touchEnd: function(e){
			e.preventDefault();
			if(this.moved && this._isTap){
				this.loadMsg();
			}
			delete this.moved;
		},
		*/
		scroll:function () {
			var loader = this.get('loader');
			if(this.get('enabled')){
				if(this.hasNext()){
					var c = $(doc).scrollTop() + $(win).height() >= $(doc).height() - this.get('distance');
					/*
					if(c){
						loader.show().html(this.get('tapHTML'));
					}
					*/
					if(c && !this.isLoading){
						var self = this;
						this.timeout && clearTimeout(this.timeout);
						this.loading(true);
						this.timeout = setTimeout(function(){
							self.loadMsg();
							self.timeout = null;
						}, 500);
						//this._isTap = true;
					}
				} else {
					//this._isTap = false;
					this.stop();
					this.trigger('stop');
				}
			}
		},
		stopListener:function(){
			/*
			this.get('element').removeTouchListener('touchstart', this._touchStart);
			$(doc).removeTouchListener('touchmove', this._touchMove).
			removeTouchListener('touchend, touchcancel', this._touchEnd);
			*/
			$(win).off(".pageless", this.scroll);
		},
		loading:function (c) {
			var loader = this.get('loader');
			if(c === true){
				this.showStatus();
			} else {
				loader.html(this.defaultMsg);
			}
			this.isLoading = c;
		},
		_success: function(e){
			if(this.data(e, true)){
				this.render(this.data(e), true);
				this.trigger('success', e);
				if(!this.hasNext()){
					this.stop();
				}
			} else {
				this.stop();
			}
			this.loading(false);
			if(!this.hasNext()){
				var loader = this.get('loader');
				loader.html(this.get('emptyHTML'));
				setTimeout(function(){
					loader.fadeOut("normal");
				}, this.get('closeTimeout'));
			}
			this.trigger('flush');
		}
	});
		
	return mobilePageless;
});