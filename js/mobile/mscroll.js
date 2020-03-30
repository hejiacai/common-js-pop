// JavaScript Document
define('mobile.mscroll', function(require, exports, module){

	var shape = module['base.shape'],
		$ = module['mobile'],
		util = require('base.util'),
		doc = document,
		win = window;

	var mscrollEvent = {
		tap: function (e, eventName) {
			var ev = doc.createEvent('Event');
			ev.initEvent(eventName, true, true);
			ev.pageX = e.pageX;
			ev.pageY = e.pageY;
			e.target.dispatchEvent(ev);
		},
		click: function(e){
			var target = e.target,
				ev;
			if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
				ev = doc.createEvent('MouseEvents');
				ev.initMouseEvent('click', true, true, e.view, 1,
					target.screenX, target.screenY, target.clientX, target.clientY,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					0, null);
				
				ev._constructed = true;
			}
			target.dispatchEvent(ev);
		}
	};	
	
	var mscroll = shape(function(o){
		mscroll.parent().call(this, util.merge({
			element: null,
			scroller: null,
			resizeScrollbars: true,
			bindToWrapper: true,
			mouseWheelSpeed: 20,
			startX: 0,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,
			bounce: true,
			bounceTime: 600,
			bounceEasing: '',
			preventDefault: true,
			preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },
			HWCompositing: true,
			useTransition: true,
			useTransform: true
		}, o));
		this.init();
	});
	
	mscroll.implement({
		init: function(){
			if(util.type.isString(this.get('element')) || !this.get('element').length){
				return;
			}
			this.scroller = this.get('scroller') ? this.get('element').children(this.get('scroller')) : this.get('element').children();
			this.translateZ = this.get('HWCompositing') && $.mobile.hasPerspective ? ' translateZ(0)' : '';
			this.set('useTransition', $.mobile.hasTransition && this.get('useTransition'));
			this.set('useTransform', $.mobile.hasTransform && this.get('useTransform'));
			this.set('eventPassthrough', this.get('eventPassthrough') === true ? 'vertical' : this.get('eventPassthrough'));
			this.set('preventDefault', !this.get('eventPassthrough') && this.get('preventDefault'));
			
			// If you want eventPassthrough I have to lock one of the axes
			this.set('scrollY', this.get('eventPassthrough') === 'vertical' ? false : this.get('scrollY'));
			this.set('scrollX', this.get('eventPassthrough') === 'horizontal' ? false : this.get('scrollX'));
			
			// With eventPassthrough we also need lockDirection mechanism
			this.set('freeScroll', this.get('freeScroll') && !this.get('eventPassthrough'));
			this.set('directionLockThreshold', this.get('eventPassthrough') && this.get('directionLockThreshold'));
			
			this.set('bounceEasing', util.type.isString(this.get('bounceEasing')) ? $.mobile.ease[this.get('bounceEasing')] || $.mobile.ease.circular : this.get('bounceEasing'));
			
			this.set('resizePolling', this.get('resizePolling') === undefined ? 60 : this.get('resizePolling'));
			
			if ( this.get('tap') === true ) {
				this.set('tap', 'tap');
			}
			if ( this.get('shrinkScrollbars') == 'scale' ) {
				this.set('useTransition', false);
			}
			
			this.set('invertWheelDirection', this.get('invertWheelDirection') ? -1 : 1);
			
			this.x = 0;
			this.y = 0;
			this.directionX = 0;
			this.directionY = 0;
			
			this._initEvents();
			this.refresh();
			
			this.scrollTo(this.get('startX'), this.get('startY'));
			this.enable();
		},
		_initEvents: function(remove){
			var $win = $(win),
				element = this.get('element'),
				target = this.get('bindToWrapper') ? element : $win;
			
			this._eventType($win, 'orientationchange, resize', remove);
			
			/*
			if(this.get('click')){
				this._eventType(element, 'click', remove);
			}*/
			
			if ( !this.get('disableMouse')) {
				this._eventType(element, 'mousedown', remove);
				this._eventType(target, 'mousemove', remove);
				this._eventType(target, 'mousecancel', remove);
				this._eventType(target, 'mouseup', remove);
			}
			
			if(!this.get('disableTouch')){
				this._eventType(element, 'touchstart', remove);
				this._eventType(target, 'touchmove', remove);
				this._eventType(target, 'touchcancel', remove);
				this._eventType(target, 'touchend', remove);
			}
			
			this._eventType(this.scroller, 'transitionend', remove);
			this._eventType(this.scroller, 'webkitTransitionEnd', remove);
			this._eventType(this.scroller, 'oTransitionEnd', remove);
			this._eventType(this.scroller, 'MSTransitionEnd', remove);
			
			if ( this.get('scrollbars') || this.get('indicators') ) {
				this._initIndicators();
			}
			if ( this.get('mouseWheel') ) {
				this._initWheel();
			}
		},
		_initWheel: function () {
			var element = this.get('element');
			this._eventType(element, 'wheel');
			this._eventType(element, 'mousewheel');
			this._eventType(element, 'DOMMouseScroll');
		},
		_eventType: function(el, type, remove, useCapture){
			remove ? el.removeTouchListener(type, this._handleEvents) : el.addTouchListener(type, util.bind(this._handleEvents, this), useCapture);
		},
		_handleEvents: function (e) {
			switch ( e.type ) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._end(e);
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'wheel':
				case 'DOMMouseScroll':
				case 'mousewheel':
					this._wheel(e);
					break;
				case 'keydown':
					//this._key(e);
					break;
				case 'click':
					if ( !e.originalEvent._constructed ) {
						e.preventDefault();
						e.stopPropagation();
					}
					break;
			}
		},
		_transitionEnd: function (e) {
			this.trigger('transitionEnd');
			if ( e.target != this.scroller || !this.isInTransition ) {
				return;
			}
			
			this._transitionTime();
			if ( !this.resetPosition(this.get('bounceTime')) ) {
				this.isInTransition = false;
				this.trigger('scrollEnd');
			}
			this.trigger('transitionEnd');
		},
		_start: function(e){
			if ( $.mobile.eventType[e.type] != 1 ) {
				if ( e.originalEvent.button !== 0 ) {
					return;
				}
			}
			if ( !this.enabled || (this.initiated && $.mobile.eventType[e.type] !== this.initiated) ) {
				return;
			}
			
			if ( this.get('preventDefault') && !$.mobile.isBadAndroid && !$.mobile.preventDefaultException(e.target, this.get('preventDefaultException')) ) {
				e.preventDefault();
			}
			
			var point = e.touches[0],
				pos;
			
			this.initiated	= $.mobile.eventType[e.type];
			this.moved		= false;
			this.distX		= 0;
			this.distY		= 0;
			this.directionX = 0;
			this.directionY = 0;
			this.directionLocked = 0;
			
			this._transitionTime();
			
			this.startTime = $.mobile.getTime();
			if ( this.get('useTransition') && this.isInTransition ) {
				this.isInTransition = false;
				pos = this.getComputedPosition();
				this._translate(Math.round(pos.x), Math.round(pos.y));
				this.trigger('scrollEnd');
			} else if ( !this.get('useTransition') && this.isAnimating ) {
				this.isAnimating = false;
				this.trigger('scrollEnd');
			}
			
			this.startX    = this.x;
			this.startY    = this.y;
			this.absStartX = this.x;
			this.absStartY = this.y;
			this.pointX    = point.pageX;
			this.pointY    = point.pageY;
			this.trigger('beforeScrollStart');
		},
		_move: function(e){
			if ( !this.enabled || $.mobile.eventType[e.type] !== this.initiated ) {
				return;
			}
			if ( this.get('preventDefault') ) {
				e.preventDefault();
			}
			
			var point		= e.touches[0],
				deltaX		= point.pageX - this.pointX,
				deltaY		= point.pageY - this.pointY,
				timestamp	= $.mobile.getTime(),
				newX, newY,
				absDistX, absDistY;
			
			this.pointX		= point.pageX;
			this.pointY		= point.pageY;
			
			this.distX		+= deltaX;
			this.distY		+= deltaY;
			absDistX		= Math.abs(this.distX);
			absDistY		= Math.abs(this.distY);
			
			if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
				return;
			}
			if ( !this.directionLocked && !this.get('freeScroll') ) {
				if ( absDistX > absDistY + this.get('directionLockThreshold') ) {
					this.directionLocked = 'h';	
				} else if ( absDistY >= absDistX + this.get('directionLockThreshold') ) {
					this.directionLocked = 'v';
				} else {
					this.directionLocked = 'n';
				}
			}
			if ( this.directionLocked == 'h' ) {
				if ( this.get('eventPassthrough') == 'vertical' ) {
					e.preventDefault();
				} else if ( this.get('eventPassthrough') == 'horizontal' ) {
					this.initiated = false;
					return;
				}
	
				deltaY = 0;
			} else if ( this.directionLocked == 'v' ) {
				if ( this.get('eventPassthrough') == 'horizontal' ) {
					e.preventDefault();
				} else if ( this.get('eventPassthrough') == 'vertical' ) {
					this.initiated = false;
					return;
				}
	
				deltaX = 0;
			}
			deltaX = this.hasHorizontalScroll ? deltaX : 0;
			deltaY = this.hasVerticalScroll ? deltaY : 0;
			
			newX = this.x + deltaX;
			newY = this.y + deltaY;

			if ( newX > 0 || newX < this.maxScrollX ) {
				newX = this.get('bounce') ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
			}
			if ( newY > 0 || newY < this.maxScrollY ) {
				newY = this.get('bounce') ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
			}
			this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
			
			if ( !this.moved ) {
				this.trigger('scrollStart');
			}
			this.moved = true;
			this._translate(newX, newY);
			
			if ( timestamp - this.startTime > 300 ) {
				this.startTime = timestamp;
				this.startX = this.x;
				this.startY = this.y;
			}
			
			this.trigger('scrollMove');
		},
		_end: function(e){
			if ( !this.enabled || $.mobile.eventType[e.type] !== this.initiated ) {
				return;
			}
			if ( this.get('preventDefault') && 
			!$.mobile.preventDefaultException(e.target, this.get('preventDefaultException')) ) {
				e.preventDefault();
			}
			
			var point = e.changedTouches[0],
				momentumX, momentumY,
				duration = $.mobile.getTime() - this.startTime,
				newX = Math.round(this.x),
				newY = Math.round(this.y),
				distanceX = Math.abs(newX - this.startX),
				distanceY = Math.abs(newY - this.startY),
				time = 0,
				easing = '';
				
			this.isInTransition = 0;
			this.initiated = 0;
			this.endTime = $.mobile.getTime();
			
			if ( this.resetPosition(this.get('bounceTime')) ) {
				return;
			}
			this.scrollTo(newX, newY);
			
			if ( !this.moved ) {
				if ( this.get('tap') ) {
					mscrollEvent.tap(e.originalEvent, this.get('tap'));
				}
				
				if ( this.get('click') ) {
					
					if ( (/(SELECT|INPUT|TEXTAREA)/i).test(e.target.tagName) ) {
						e.preventDefault();
						e.stopPropagation();
					}
					this.trigger('click', e.originalEvent);
					//mscrollEvent.click(e.originalEvent);
				}
	
				this.trigger('scrollCancel');
				return;
			}
			
			if ( this.trigger('flick') && duration < 200 && distanceX < 100 && distanceY < 100 ) {
				return;
			}
			
			if ( this.get('momentum') && duration < 300 ) {
				momentumX = this.hasHorizontalScroll ? $.mobile.momentum(this.x, this.startX, duration, this.maxScrollX, this.get('bounce') ? this.wrapperWidth : 0, this.get('deceleration')) : { destination: newX, duration: 0 };
				momentumY = this.hasVerticalScroll ? $.mobile.momentum(this.y, this.startY, duration, this.maxScrollY, this.get('bounce') ? this.wrapperHeight : 0, this.get('deceleration')) : { destination: newY, duration: 0 };
				newX = momentumX.destination;
				newY = momentumY.destination;
				time = Math.max(momentumX.duration, momentumY.duration);
				this.isInTransition = 1;
			}
			
			if ( this.get('snap')) {
				var snap = this._nearestSnap(newX, newY);
				this.currentPage = snap;
				time = this.get('snapSpeed') || Math.max(
						Math.max(
							Math.min(Math.abs(newX - snap.x), 1000),
							Math.min(Math.abs(newY - snap.y), 1000)
						), 300);
				newX = snap.x;
				newY = snap.y;
				
				this.directionX = 0;
				this.directionY = 0;
				easing = this.get('bounceEasing');
			}
			
			if ( newX != this.x || newY != this.y ) {
				if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
					easing = $.mobile.ease.quadratic;
				}
				
				this.scrollTo(newX, newY, time, easing);
				return;
			}
			this.trigger('scrollEnd');
		},
		_wheel: function (e) {
			if ( !this.enabled ) {
				return;
			}
			e = e.originalEvent;
			e.preventDefault();
			e.stopPropagation();
	
			var wheelDeltaX, wheelDeltaY,
				newX, newY,
				self = this;
	
			if ( this.wheelTimeout === undefined ) {
				this.trigger('scrollStart');
			}
	
			// Execute the scrollEnd event after 400ms the wheel stopped scrolling
			clearTimeout(this.wheelTimeout);
			this.wheelTimeout = setTimeout(function () {
				self.trigger('scrollEnd');
				self.wheelTimeout = undefined;
			}, 400);
	
			if ( 'deltaX' in e ) {
				if (e.deltaMode === 1) {
					wheelDeltaX = -e.deltaX * this.get('mouseWheelSpeed');
					wheelDeltaY = -e.deltaY * this.get('mouseWheelSpeed');
				} else {
					wheelDeltaX = -e.deltaX;
					wheelDeltaY = -e.deltaY;
				}
			} else if ( 'wheelDeltaX' in e ) {
				wheelDeltaX = e.wheelDeltaX / 120 * this.get('mouseWheelSpeed');
				wheelDeltaY = e.wheelDeltaY / 120 * this.get('mouseWheelSpeed');
			} else if ( 'wheelDelta' in e ) {
				wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.get('mouseWheelSpeed');
			} else if ( 'detail' in e ) {
				wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.get('mouseWheelSpeed');
			} else {
				return;
			}
	
			wheelDeltaX *= this.get('invertWheelDirection');
			wheelDeltaY *= this.get('invertWheelDirection');
	
			if ( !this.hasVerticalScroll ) {
				wheelDeltaX = wheelDeltaY;
				wheelDeltaY = 0;
			}
	
			newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
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
		},
		_resize: function () {
			var self = this;
	
			clearTimeout(this.resizeTimeout);
	
			this.resizeTimeout = setTimeout(function () {
				self.refresh();
			}, this.get('resizePolling'));
		},
		_initIndicators: function () {
			var interactive = this.get('interactiveScrollbars'),
				customStyle = !util.type.isString(this.get('scrollbars')),
				indicators = [],
				indicator,
				self = this;
	
			this.indicators = [];
			if ( this.get('scrollbars') ) {
				if ( this.get('scrollY') ) {
					indicator = {
						el: createDefaultScrollbar('v', interactive, this.get('scrollbars')),
						interactive: interactive,
						defaultScrollbars: true,
						customStyle: customStyle,
						resize: this.get('resizeScrollbars'),
						shrink: this.get('shrinkScrollbars'),
						fade: this.get('fadeScrollbars'),
						listenX: false
					};
					
					this.get('element').append(indicator.el);
					indicators.push(indicator);
				}
				
				// Horizontal scrollbar
				if ( this.get('scrollX') ) {
					indicator = {
						el: createDefaultScrollbar('h', interactive, this.get('scrollbars')),
						interactive: interactive,
						defaultScrollbars: true,
						customStyle: customStyle,
						resize: this.get('resizeScrollbars'),
						shrink: this.get('shrinkScrollbars'),
						fade: this.get('fadeScrollbars'),
						listenY: false
					};
	
					this.get('element').append(indicator.el);
					indicators.push(indicator);
				}
			}

			if ( this.get('indicators') ) {
				// TODO: check concat compatibility
				indicators = indicators.concat(this.get('indicators'));
			}
	
			for ( var i = indicators.length; i--; ) {
				this.indicators.push( new Indicator(this, indicators[i]) );
			}
	
			function _indicatorsMap (fn) {
				for ( var i = self.indicators.length; i--; ) {
					fn.call(self.indicators[i]);
				}
			}
			
			if ( this.get('fadeScrollbars') ) {
				this.on('scrollEnd', function () {
					_indicatorsMap(function () {
						this.fade();
					});
				});
	
				this.on('scrollCancel', function () {
					_indicatorsMap(function () {
						this.fade();
					});
				});
	
				this.on('scrollStart', function () {
					_indicatorsMap(function () {
						this.fade(1);
					});
				});
	
				this.on('beforeScrollStart', function () {
					_indicatorsMap(function () {
						this.fade(1, true);
					});
				});
			}
			this.on('refresh', function () {
				_indicatorsMap(function () {
					this.refresh();
				});
			});
			
		},
		getComputedPosition: function () {
			var matrix = win.getComputedStyle(this.scroller[0], null),
				x, y;
			
			if ( this.get('useTransform') ) {
				matrix = matrix[$.mobile.style.transform].split(')')[0].split(', ');
				x = +( matrix[12] || matrix[4] );
				y = +( matrix[13] || matrix[5] );
			} else {
				x = +matrix.left.replace(/[^-\d.]/g, '');
				y = +matrix.top.replace(/[^-\d.]/g, '');
			}
			
			return { x: x, y: y };
		},
		_translate: function (x, y) {
			if ( this.get('useTransform') ) {
				this.scroller.css($.mobile.style.transform, 'translate(' + x + 'px,' + y + 'px)' + this.translateZ);
			} else {
				x = Math.round(x);
				y = Math.round(y);
				this.scroller.css({'left': x + 'px', 'top': y + 'px'});
			}
			this.x = x;
			this.y = y;
			
			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].updatePosition();
				}
			}
		},
		_transitionTime: function(time){
			time = time || 0;
			
			this.scroller.css($.mobile.style.transitionDuration, time + 'ms');

			if ( !time && $.mobile.isBadAndroid ) {
				this.scroller.css($.mobile.style.transitionDuration, '0.001s');
			}
			
			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].transitionTime(time);
				}
			}
		},
		_transitionTimingFunction: function (easing) {
			this.scroller.css($.mobile.style.transitionTimingFunction, easing);
			
			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].transitionTimingFunction(easing);
				}
			}
		},
		_animate: function (destX, destY, duration, easingFn) {
			var self = this,
				startX = this.x,
				startY = this.y,
				startTime = $.mobile.getTime(),
				destTime = startTime + duration;
	
			function step () {
				var now = $.mobile.getTime(),
					newX, newY,
					easing;
	
				if ( now >= destTime ) {
					self.isAnimating = false;
					self._translate(destX, destY);
	
					if ( !self.resetPosition(self.get('bounceTime')) ) {
						self.trigger('scrollEnd');
					}
					
					return;
				}
	
				now = ( now - startTime ) / duration;
				easing = easingFn(now);
				newX = ( destX - startX ) * easing + startX;
				newY = ( destY - startY ) * easing + startY;
				self._translate(newX, newY);
	
				if ( self.isAnimating ) {
					$.mobile.raf.call(window, step);
				}
			}
			
			this.isAnimating = true;
			step();
		},
		scrollTo: function(x, y, time, easing){
			easing = easing || $.mobile.ease.circular;
			this.isInTransition = this.get('useTransition') && time > 0;
			
			if ( !time || (this.get('useTransition') && easing.style) ) {
				this._transitionTimingFunction(easing.style);
				this._transitionTime(time);
				this._translate(x, y);
			} else {
				this._animate(x, y, time, easing.fn);
			}
		},
		scrollBy: function (x, y, time, easing){
			x = this.x + x;
			y = this.y + y;
			time = time || 0;
			this.scrollTo(x, y, time, easing);
		},
		scrollToElement: function (el, time, offsetX, offsetY, easing) {
			if ( util.type.isString(el) || !el.length ) {
				return;
			}

			var pos = el.offset();
	
			pos.left -= this.wrapperOffset.left;
			pos.top  -= this.wrapperOffset.top;
			
			var element = this.get('element');
			
			// if offsetX/Y are true we center the element to the screen
			if ( offsetX === true ) {
				offsetX = Math.round(el.outerWidth(true) / 2 - element.outerWidth(true) / 2);
			}
			if ( offsetY === true ) {
				offsetY = Math.round(el.outerHeight(true) / 2 - element.outerHeight(true) / 2);
			}
			
			pos.left -= offsetX || 0;
			pos.top  -= offsetY || 0;
	
			pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
			pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;
	
			time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;
	
			this.scrollTo(pos.left, pos.top, time, easing);
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
		disable: function () {
			this.enabled = false;
		},
		enable: function () {
			this.enabled = true;
		},
		refresh: function () {
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
		destory: function(){
			if(this.indicators && this.indicators.length){
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].destroy();
				}
			}
			if(this.get('mouseWheel')){
				var element = this.get('element');
				this._eventType(element, 'wheel', true);
				this._eventType(element, 'mousewheel', true);
				this._eventType(element, 'DOMMouseScroll', true);
			}
			this._initEvents(false);
			mscroll.parent('destory').call(this);
		}
	});
	
	function Indicator (scroller, options) {
		this.element = util.type.isString(options.el) == 'string' ? $(options.el) : options.el;
		this.indicator = this.element.children().eq(0);
		this.scroller = scroller;
		
		this.options = util.merge({
			listenX: true,
			listenY: true,
			interactive: false,
			resize: true,
			defaultScrollbars: false,
			shrink: false,
			fade: false,
			speedRatioX: 0,
			speedRatioY: 0
		}, options);
		
		this.sizeRatioX = 1;
		this.sizeRatioY = 1;
		this.maxPosX = 0;
		this.maxPosY = 0;
		
		if ( this.options.interactive ) {
			if ( !this.options.disableTouch ) {
				this.indicator.addTouchListener('touchstart', util.bind(this._handleEvents, this));
				$(win).addTouchListener('touchend', util.bind(this._handleEvents, this));
			}
		}
	
		if ( this.options.fade ) {
			var style = {};
			style[$.mobile.style.transform] = this.scroller.translateZ;
			style[$.mobile.style.transitionDuration] = $.mobile.isBadAndroid ? '0.001s' : '0ms';
			style['opacity'] = '0';
			
			this.element.css(style);
		}
	}
	
	Indicator.prototype = {
		_handleEvents: function(e){
			switch ( e.type ) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._end(e);
					break;
			}
		},
		_start: function (e) {
			var point = e.touches[0];
	
			e.preventDefault();
			e.stopPropagation();
	
			this.transitionTime();
	
			this.initiated = true;
			this.moved = false;
			this.lastPointX	= point.pageX;
			this.lastPointY	= point.pageY;
	
			this.startTime	= $.mobile.getTime();
	
			if ( !this.options.disableTouch ) {
				$(win).addTouchListener('touchmove', util.bind(this._handleEvents, this));
			}
	
			this.scroller.trigger('beforeScrollStart');
		},
		_move: function(e){
			var point = e.touches[0],
				deltaX, deltaY, newX, newY,
				timestamp = $.mobile.getTime();
				
			if ( !this.moved ) {
				this.scroller.trigger('scrollStart');
			}
			
			this.moved = true;
			
			deltaX = point.pageX - this.lastPointX;
			this.lastPointX = point.pageX;
			
			deltaY = point.pageY - this.lastPointY;
			this.lastPointY = point.pageY;
			
			newX = this.x + deltaX;
			newY = this.y + deltaY;
			
			this._pos(newX, newY);
			
			e.preventDefault();
			e.stopPropagation();
		},
		_end: function (e) {
			if ( !this.initiated ) {
				return;
			}
			
			this.initiated = false;
			e.preventDefault();
			e.stopPropagation();
			
			$(win).removeTouchListener('touchmove', this._handleEvents);
		},
		_pos: function (x, y) {
			if ( x < 0 ) {
				x = 0;
			} else if ( x > this.maxPosX ) {
				x = this.maxPosX;
			}
	
			if ( y < 0 ) {
				y = 0;
			} else if ( y > this.maxPosY ) {
				y = this.maxPosY;
			}
	
			x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
			y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;
	
			this.scroller.scrollTo(x, y);
		},
		transitionTime: function (time) {
			time = time || 0;

			this.indicator.css($.mobile.style.transitionDuration, time + 'ms');
			
			if ( !time && $.mobile.isBadAndroid ) {
				this.indicator.css($.mobile.style.transitionDuration, time + '0.001s');
			}
		},
		transitionTimingFunction: function (easing) {
			this.indicator.css($.mobile.style.transitionTimingFunction, easing);
		},
		refresh: function () {
			this.transitionTime();
			
			if ( this.options.listenX && !this.options.listenY ) {
				this.indicator.css('display', this.scroller.hasHorizontalScroll ? 'block' : 'none');
			} else if ( this.options.listenY && !this.options.listenX ) {
				this.indicator.css('display', this.scroller.hasVerticalScroll ? 'block' : 'none');
			} else {
				this.indicator.css('display', this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none');
			}
			
			var element = this.element; 
			if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
				element.addClass('iScrollBothScrollbars').removeClass('iScrollLoneScrollbar');
	
				if ( this.options.defaultScrollbars && this.options.customStyle ) {
					if ( this.options.listenX ) {
						element.css('right', '8px');
					} else {
						element.css('bottom', '8px');
					}
				}
			} else {
				element.removeClass('iScrollBothScrollbars').addClass('iScrollLoneScrollbar');
	
				if ( this.options.defaultScrollbars && this.options.customStyle ) {
					if ( this.options.listenX ) {
						element.css('right', '2px');
					} else {
						element.css('bottom', '2px');
					}
				}
			}
			
			var r = element[0].offsetHeight;	// force refresh
			
			if ( this.options.listenX ) {
				this.wrapperWidth = element.width();
				if ( this.options.resize ) {
					this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
					this.indicator.css('width', this.indicatorWidth + 'px');
				} else {
					this.indicatorWidth = this.indicator.width();
				}
				this.maxPosX = this.wrapperWidth - this.indicatorWidth;
				if ( this.options.shrink == 'clip' ) {
					this.minBoundaryX = -this.indicatorWidth + 8;
					this.maxBoundaryX = this.wrapperWidth - 8;
				} else {
					this.minBoundaryX = 0;
					this.maxBoundaryX = this.maxPosX;
				}
				this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
			}
			
			if ( this.options.listenY ) {
				this.wrapperHeight = element.height();
				if ( this.options.resize ) {
					this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
					this.indicator.css('height', this.indicatorHeight + 'px');
				} else {
					this.indicatorHeight = this.indicator.height();
				}
				
				this.maxPosY = this.wrapperHeight - this.indicatorHeight;
				if ( this.options.shrink == 'clip' ) {
					this.minBoundaryY = -this.indicatorHeight + 8;
					this.maxBoundaryY = this.wrapperHeight - 8;
				} else {
					this.minBoundaryY = 0;
					this.maxBoundaryY = this.maxPosY;
				}
	
				this.maxPosY = this.wrapperHeight - this.indicatorHeight;
				this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
			}
			this.updatePosition();
		},
		updatePosition: function () {
			var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
				y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;
				
			if ( !this.options.ignoreBoundaries ) {
				if ( x < this.minBoundaryX ) {
					if ( this.options.shrink == 'scale' ) {
						this.width = Math.max(this.indicatorWidth + x, 8);
						this.indicator.css('width', this.width + 'px');
					}
					x = this.minBoundaryX;
				} else if ( x > this.maxBoundaryX ) {
					if ( this.options.shrink == 'scale' ) {
						this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
						this.indicator.css('width', this.width + 'px');
						x = this.maxPosX + this.indicatorWidth - this.width;
					} else {
						x = this.maxBoundaryX;
					}
				} else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
					this.width = this.indicatorWidth;
					this.indicator.css('width', this.width + 'px');
				}
				
				if ( y < this.minBoundaryY ) {
					if ( this.options.shrink == 'scale' ) {
						this.height = Math.max(this.indicatorHeight + y * 3, 8);
						this.indicator.css('height', this.height + 'px');
					}
					y = this.minBoundaryY;
				} else if ( y > this.maxBoundaryY ) {
					if ( this.options.shrink == 'scale' ) {
						this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
						this.indicator.css('height', this.height + 'px');
						y = this.maxPosY + this.indicatorHeight - this.height;
					} else {
						y = this.maxBoundaryY;
					}
				} else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
					this.height = this.indicatorHeight;
					this.indicator.css('height', this.height + 'px');
				}
				
				this.x = x;
				this.y = y;
				
				if ( this.scroller.get('useTransform') ) {
					this.indicator.css($.mobile.style.transform,  'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ);
				} else {
					this.indicator.css({left: x + 'px', top: y + 'px'});
				}
			}
		},
		fade: function (val, hold) {
			if ( hold && !this.visible ) {
				return;
			}
			clearTimeout(this.fadeTimeout);
			this.fadeTimeout = null;
	
			var time = val ? 250 : 500,
				delay = val ? 0 : 300;
	
			val = val ? '1' : '0';
			this.element.css($.mobile.style.transitionDuration, time + 'ms');
			
			var self = this;
			this.fadeTimeout = setTimeout(function(){
				self.element.css({'opacity': val, 'visible': +val});
			}, delay);			
		},
		destroy: function () {
			if ( this.get('interactive') ) {
				this.indicator.removeTouchListener('touchstart', this._handleEvents);
				$(win).removeTouchListener('touchmove', this._handleEvents);
				$(win).removeTouchListener('touchend', this._handleEvents);
			}
	
			if ( this.options.defaultScrollbars ) {
				this.get('element').remove();
			}
		}
	};
	
	
	function createDefaultScrollbar (direction, interactive, type) {
		var scrollbar = $('<div />'),
			indicator = $('<div />');
	
		if ( type === true ) {
			scrollbar.css({'position': 'absolute', 'z-index': 9999});
			indicator.css({
				'-webkit-box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				'box-sizing': 'border-box',
				'position': 'absolute',
				'background': 'rgba(0,0,0,0.5)',
				'border': '1px solid rgba(255,255,255,0.9)',
				'border-radius': '3px'
			});
		}
		indicator.addClass('iScrollIndicator');
		
		if ( direction == 'h' ) {
			if ( type === true ) {
				scrollbar.css({
					'height': '7px',
					'left': '2px',
					'right': '2px',
					'bottom': 0
				});
				indicator.css('height', '100%');
			}
			scrollbar.addClass('iScrollHorizontalScrollbar');
		} else {
			if ( type === true ) {
				scrollbar.css({
					'width': '7px', 'bottom': '2px', 'top': '2px', 'right': '1px'
				});
				indicator.css('width', '100%');
			}
			scrollbar.addClass('iScrollVerticalScrollbar');
		}
		scrollbar.css('overflow', 'hidden');
	
		if ( !interactive ) {
			scrollbar.css('pointerEvents','none');
		}
		scrollbar.append(indicator);
		return scrollbar;
	}
	return mscroll;
	
});