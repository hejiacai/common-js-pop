// JavaScript Document

define('widge.switchable.basePage', 'module.css3', function(require, exports, module){

	var shape = module['base.shape'],
		$ = module['jquery'],
		util = require('base.util'),
		css3 = require('module.css3'),
		doc = document,
		win = window,
		isBadAndroid = /Android /.test(win.navigator.appVersion) && !(/Chrome\/\d/.test(win.navigator.appVersion));
	
	var basePath = shape(function(o){
		basePath.parent().call(this, util.merge({
			element: null,
			scroller: null,
			mouseWheelSpeed: 20,
			isMouseWheelScroll: true,
			momentum: true,
			bounce: true,
			bounceTime: 600,
			bounceEasing: '',
			startX: 0,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			HWCompositing: true,
			useTransition: true,
			useTransform: true,
			preventDefault: true,
			preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ }
		}, o));
		this.init();
	});
	
	basePath.implement({
		init: function(){
			var element = this.get('element');
			if(util.type.isString(element) || !element.length){
				return;
			}
			this._isBasePath = true;
			this._initConfig();
			this._initData();
			this._initEvents();
			this._init();
		},
		_init: function(){
			this.enable();
			this._refreshSize();
			this.updateSize();
			this.refresh();
			this.scrollTo(this.get('startX'), this.get('startY'));
		},
		_refreshSize: function(){
			var element = this.get('element')[0],
				scroller = this.scroller[0],
				rf = element.offsetHeight;
	
			this.wrapperWidth	= element.clientWidth;
			this.wrapperHeight	= element.clientHeight;
	
			this.scrollerWidth	= scroller.offsetWidth;
			this.scrollerHeight	= scroller.offsetHeight;
			
			this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
			this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;
	
			this.hasHorizontalScroll	= this.get('scrollX') && this.maxScrollX < 0;
			this.hasVerticalScroll		= this.get('scrollY') && this.maxScrollY < 0;
		},
		updateSize: function(){
			if(!this.hasVerticalScroll){
				var itemWidth = this.scrollItem.outerWidth(),
					totalSize = itemWidth * this.scrollItem.length;
				
				this.scroller.width(totalSize);
				this.scrollerWidth	= this.scroller[0].offsetWidth;
				this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
			}
		},
		enable: function () {
			this.enabled = true;
		},
		disable: function () {
			this.enabled = false;
		},
		getScrollItem: function(){
			return this.scroller.children();
		},
		_initConfig: function(){
			this.scroller = this.get('scroller') ? this.get('element').find(this.get('scroller')) : this.get('element').children();
			this.scrollItem = this.getScrollItem();
			this.translateZ = this.get('HWCompositing') && css3.style.hasPerspective ? ' translateZ(0)' : '';
			this.set('useTransition', css3.style.hasTransition && this.get('useTransition'));
			this.set('useTransform', css3.style.hasTransform && this.get('useTransform'));
			
			this.set('eventPassthrough', this.get('eventPassthrough') === true ? 'vertical' : this.get('eventPassthrough'));
			this.set('preventDefault', !this.get('eventPassthrough') && this.get('preventDefault'));
			
			this.set('scrollY', this.get('eventPassthrough') === 'vertical' ? false : this.get('scrollY'));
			this.set('scrollX', this.get('eventPassthrough') === 'horizontal' ? false : this.get('scrollX'));
			
			this.set('freeScroll', this.get('freeScroll') && !this.get('eventPassthrough'));
			this.set('directionLockThreshold', this.get('eventPassthrough') && this.get('directionLockThreshold'));
			
			this.set('bounceEasing', util.type.isString(this.get('bounceEasing')) ? css3.ease[this.get('bounceEasing')] || css3.ease.circular : this.get('bounceEasing'));
			
			this.set('resizePolling', this.get('resizePolling') === undefined ? 60 : this.get('resizePolling'));
			this.set('invertWheelDirection', this.get('invertWheelDirection') ? -1 : 1);
		},
		_initData: function(){
			this.x = 0;
			this.y = 0;
			this.directionX = 0;
			this.directionY = 0;
		},
		_initTransition: function(){
			this.scroller.on('transitionend', util.bind(this._handleEvents, this));
			this.scroller.on('webkitTransitionEnd', util.bind(this._handleEvents, this));
			this.scroller.on('oTransitionEnd', util.bind(this._handleEvents, this));
			this.scroller.on('MSTransitionEnd', util.bind(this._handleEvents, this));
		},
		_initEvents: function(){
			var $win = $(win),
				element = this.get('element'),
				target = this.get('bindToWrapper') ? element : $win;
			
			$win.on('orientationchange resize', util.bind(this._handleEvents, this));
			this._initTransition();
			
			if ( this.get('mouseWheel') ) {
				this._initWheel();
			}
		},
		_initWheel: function () {
			this._isWheel = true;
			var element = this.get('element');
			
			element.on('wheel', util.bind(this._handleEvents, this));
			element.on('mousewheel', util.bind(this._handleEvents, this));
			element.on('DOMMouseScroll', util.bind(this._handleEvents, this));
		},
		_handleEvents: function (e) {
			switch ( e.type ) {
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'wheel':
				case 'DOMMouseScroll':
				case 'mousewheel':
					this._wheel(e);
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
			}
		},
		_wheel: function (e) {
			if(!this.enabled || !this._isWheel || (!this.get('useTransition') && this.isAnimated)){
				return;
			}
			
			e.preventDefault();
			e.stopPropagation();
	
			var wheelDeltaX, wheelDeltaY,
				self = this;
	
			if ( this.wheelTimeout === undefined ) {
				this.trigger('scrollStart');
			}
	
			// Execute the scrollEnd event after 400ms the wheel stopped scrolling
			clearTimeout(this.wheelTimeout);
			this.wheelTimeout = setTimeout(function () {
				self.wheelTimeout = undefined;
			}, 400);
	
			var originalEvent = e.originalEvent;
			
			if ( 'deltaX' in originalEvent ) {
				if (originalEvent.deltaMode === 1) {
					wheelDeltaX = -originalEvent.deltaX * this.get('mouseWheelSpeed');
					wheelDeltaY = -originalEvent.deltaY * this.get('mouseWheelSpeed');
				} else {
					wheelDeltaX = -originalEvent.deltaX;
					wheelDeltaY = -originalEvent.deltaY;
				}
			} else if ( 'wheelDeltaX' in originalEvent ) {
				wheelDeltaX = originalEvent.wheelDeltaX / 120 * this.get('mouseWheelSpeed');
				wheelDeltaY = originalEvent.wheelDeltaY / 120 * this.get('mouseWheelSpeed');
			} else if ( 'wheelDelta' in originalEvent ) {
				wheelDeltaX = wheelDeltaY = originalEvent.wheelDelta / 120 * this.get('mouseWheelSpeed');
			} else if ( 'detail' in originalEvent ) {
				wheelDeltaX = wheelDeltaY = -originalEvent.detail / 3 * this.get('mouseWheelSpeed');
			} else {
				return;
			}
	
			wheelDeltaX *= this.get('invertWheelDirection');
			wheelDeltaY *= this.get('invertWheelDirection');
	
			if ( !this.hasVerticalScroll ) {
				wheelDeltaX = wheelDeltaY;
				wheelDeltaY = 0;
			}
			
			this._executeWheel(wheelDeltaX, wheelDeltaY);
		},
		_executeWheel: function(wheelDeltaX, wheelDeltaY){
			if(this.get('isMouseWheelScroll')){
				this._isWheel = false;
				var wheelDelta = this.hasVerticalScroll ? wheelDeltaY : wheelDeltaX;
				
				if(wheelDelta < 0){
					this.next && this.next(this.get('snapSpeed'));
				} else {
					this.prev && this.prev(this.get('snapSpeed'));
				}
				var self = this;
				setTimeout(function(){
					self._isWheel = true;
				}, 500);
			} else {
				var newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0),
					newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);
		
				if ( newX > 0 ) {
					newX = 0;
				} else if ( newX < this.maxScrollX ) {
					newX = this.maxScrollX;
				}
		
				if ( newY > 0 ) {
					newY = 0;
				} else if ( newY < this.maxScrollY ) {
					newY = this.maxScrollY;
				}
	
				this.scrollTo(newX, newY, 0);
			}
		},
		_resize: function () {
			var self = this;
			clearTimeout(this.resizeTimeout);
	
			this.resizeTimeout = setTimeout(function () {
				self.updateSize();
				self.refresh();
			}, this.get('resizePolling'));
		},
		refresh: function () {
			this._refreshSize();
	
			if ( !this.hasHorizontalScroll ) {
				this.maxScrollX = 0;
				this.scrollerWidth = this.wrapperWidth;
			}
	
			if ( !this.hasVerticalScroll ) {
				this.maxScrollY = 0;
				this.scrollerHeight = this.wrapperHeight;
			}
	
			this.endTime = 0;
			this.directionX = 0;
			this.directionY = 0;
	
			this.wrapperOffset = this.get('element').offset();
			this.trigger('refresh');
			this.resetPosition();
		},
		resetPosition: function (time) {
			var x = this.x,
				y = this.y;
	
			time = time || 0;
			
			if ( !this.hasHorizontalScroll || this.x > 0 ) {
				x = 0;
			} else if ( this.x < this.maxScrollX ) {
				x = this.maxScrollX;
			}
	
			if ( !this.hasVerticalScroll || this.y > 0 ) {
				y = 0;
			} else if ( this.y < this.maxScrollY ) {
				y = this.maxScrollY;
			}

			if ( x == this.x && y == this.y ) {
				return false;
			}
			this.scrollTo(x, y, time, this.get('bounceEasing'));
			return true;
		},
		destory: function(){
			if(this.get('mouseWheel')){
				var element = this.get('element');
				element.off('wheel');
				element.off('mousewheel');
				element.off('DOMMouseScroll');
			}
			$(window).off('orientationchange resize');
			
			basePath.parent('destory').call(this);
		},
		_transitionTimingFunction: function (easing) {			
			if(!this.get('useTransform')) return;
			
			this.scroller.css(css3.style.transitionTimingFunction, easing);
		},
		_transitionTime: function(time){
			if(!this.get('useTransform')) return;
			time = time || 0;
			
			this.scroller.css(css3.style.transitionDuration, time + 'ms');

			if ( !time && isBadAndroid ) {
				this.scroller.css(css3.style.transitionDuration, '0.001s');
			}
		},
		_translate: function (x, y, f) {
			if ( this.get('useTransform') ) {
				if(f){
					this._transitionTime();
				}
				
				this.scroller.css(css3.style.transform, 'translate(' + x + 'px,' + y + 'px)' + this.translateZ);
			} else {
				x = Math.round(x);
				y = Math.round(y);
				this.scroller.css({'left': x + 'px', 'top': y + 'px'});
			}
			this.x = x;
			this.y = y;
		},
		scrollTo: function(x, y, time, easing, eventObj){
			easing = easing || css3.ease.circular;
			this.isInTransition = this.get('useTransition') && time > 0;
			eventObj && (this._eventObj = eventObj);
			if ( !time || (this.get('useTransition') && easing.style) ) {
				this._transitionTimingFunction(easing.style);
				this._transitionTime(time);
				this._translate(x, y);
			} else {
				this._animate(x, y, time, easing.fn);
			}
		},
		_isTransitionTarget: function(e){
			if(e.currentTarget != this.scroller[0] || !this.isInTransition){
				return false;
			}
			return true;
		},
		_transitionEnd: function (e) {
			if ( !this._isTransitionTarget(e) ) {
				return;
			}
			var eventObj = this._eventObj;
			
			this._transitionTime();
			if ( !this.resetPosition(this.get('bounceTime')) ) {
				this.isInTransition = false;
				if(eventObj && eventObj.currentPage.fn){
					eventObj.currentPage.fn.call(this, eventObj);
					delete this._eventObj.currentPage.fn;
				}
				this._goToEnd && this._goToEnd(eventObj);
				
				this.trigger('scrollEnd', eventObj);
				delete this._eventObj;
			}
		},
		_animate: function (destX, destY, duration, easingFn) {
				
			if(this.isAnimated){
				return;
			}
			this.isAnimated = true;	
			
			var self = this,
				startX = this.x,
				startY = this.y,
				startTime = util.getTime(),
				destTime = startTime + duration;
			
			function step () {
				var now = util.getTime(),
					newX, newY,
					easing;

				if ( now >= destTime ) {
					self.isAnimating = false;
					self.isAnimated = false;
					self._translate(destX, destY);
					if ( !self.resetPosition(self.get('bounceTime')) ) {
						var eventObj = self._eventObj;
						if(eventObj && eventObj.currentPage.fn){
							eventObj.currentPage.fn.call(self, eventObj);
							delete self._eventObj.currentPage.fn;
						}
						self._goToEnd && self._goToEnd(eventObj);
						self.trigger('scrollEnd', eventObj);
						delete self._eventObj;
					}
					return;
				}
				
				now = ( now - startTime ) / duration;
				easing = easingFn(now);
				newX = ( destX - startX ) * easing + startX;
				newY = ( destY - startY ) * easing + startY;
				self._translate(newX, newY);
	
				if ( self.isAnimating ) {
					css3.raf.call(win, step);
				}
			}
			
			this.isAnimating = true;
			step();
		}
	});
	
	return basePath;
	
});