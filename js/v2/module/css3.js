// JavaScript Document

define('module.css3', function(require, exports, module){

	var util = require('base.util'),
		win = window,
		doc = document,
		elementStyle = doc.createElement('div').style;
	
	exports.style = {
		getStyleName: function(){
			var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
				transform,
				i = 0,
				l = vendors.length;
			
			for ( ; i < l; i++ ) {
				transform = vendors[i] + 'ransform';
				if ( transform in elementStyle ) return vendors[i].substr(0, vendors[i].length - 1);
			}
			return false;
		},
		prefixStyle: function(style){
			var styleName = this.getStyleName();
			if ( styleName === false ) return false;
			if ( styleName === '' ) return style;
			return styleName + style.charAt(0).toUpperCase() + style.substr(1);
		},
		isAnimateSupport: function(){
			return this.transform in elementStyle
		},
		getTranslate: function(el, axis){
			var matrix, curTransform, curStyle, transformMatrix;
			
			if(typeof axis === 'undefined'){
				axis = 'x';
			}
			
			if(el.jquery && el.length){
				el = el[0];
			}
			
			curStyle = win.getComputedStyle(el, null);
			if(win.WebKitCSSMatrix){
				transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
			} else {
				transformMatrix = curStyle.MozTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
				matrix = transformMatrix.toString().split(',');
			}
			
			if(axis === 'x'){
				if (win.WebKitCSSMatrix)
                	curTransform = transformMatrix.m41;
				else if (matrix.length === 16)
					curTransform = parseFloat(matrix[12]);
				else
					curTransform = parseFloat(matrix[4]);
			} else if(axis === 'y'){
				if (window.WebKitCSSMatrix)
					curTransform = transformMatrix.m42;
				else if (matrix.length === 16)
					curTransform = parseFloat(matrix[13]);
				else
					curTransform = parseFloat(matrix[5]);
			}
			
			return curTransform || 0;
		}
	};
	
	exports.isTouchSupport = (function(){
		return !!(('ontouchstart' in win) || win.DocumentTouch && doc instanceof win.DocumentTouch)
	})();
	
	exports.touchEvents = {
		start: exports.isTouchSupport ? 'touchstart' : 'mousedown',
		move: exports.isTouchSupport ? 'touchmove' : 'mousemove',
		end: exports.isTouchSupport ? 'touchend' : 'mouseup',
		cancel: exports.isTouchSupport ? 'touchcancel' : null
	}
	
	exports.style.transform = exports.style.prefixStyle('transform');
	exports.style.transitionProperty = exports.style.prefixStyle('transitionProperty');
	exports.style.transitionTimingFunction = exports.style.prefixStyle('transitionTimingFunction');
	exports.style.transitionDuration = exports.style.prefixStyle('transitionDuration');
	exports.style.transitionDelay = exports.style.prefixStyle('transitionDelay');
	exports.style.transformOrigin = exports.style.prefixStyle('transformOrigin');
	exports.style.hasPerspective = exports.style.prefixStyle('perspective') in elementStyle;
	exports.style.hasTransition = exports.style.prefixStyle('transition') in elementStyle;
	exports.style.hasTransform = exports.style.transform !== false;
	
	var transitionEvent = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
	function _dealCssEvent(dom, events, callback){
		function fireCallBack(e){
			if(e.target !== this) return;
			callback.call(this, e);
			dom.off(transitionEvent, fireCallBack);
		}
		if(callback){
			dom.on(transitionEvent, fireCallBack);
		}
	}
	exports.animationEnd = function(dom, callback){
		if(!dom.jquery){
			dom = $(dom);
		}
		_dealCssEvent.call(dom, callback);
	};
	exports.raf = 
		win.requestAnimationFrame || 
		win.webkitRequestAnimationFrame ||
		win.mozRequestAnimationFrame ||
		win.oRequestAnimationFrame ||
		win.msRequestAnimationFrame ||
		function (callback) { win.setTimeout(callback, 1000 / 60); };
	
	exports.caf = 
		win.cancelAnimationFrame ||
		win.webkitCancelAnimationFrame ||
		win.mozCancelAnimationFrame ||
		win.msCancelAnimationFrame ||
		function (id) { win.clearTimeout(id); }
	
	exports.ease = {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	};
	
	exports.animation = {
		momentum: function (current, start, time, lowerMargin, wrapperSize, deceleration) {
			var distance = current - start,
				speed = Math.abs(distance) / time,
				destination,
				duration;
	
			deceleration = !deceleration ? 0.0006 : deceleration;
	
			destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
			duration = speed / deceleration;
	
			if ( destination < lowerMargin ) {
				destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if ( destination > 0 ) {
				destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}
			
			return {
				destination: Math.round(destination),
				duration: duration
			}
		}
	}
	
	return exports;

});