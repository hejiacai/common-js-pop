// JavaScript Document
define('mobile', 'jquery, base.util', function(require, exports, module){

	var time = new Date().getTime(),
		$ = module['jquery'],
		util = require('base.util'),
		doc = document,
		win = window,
		ua = navigator.userAgent,
		isAndroid = ua.indexOf('Android') > 0,
		isIOS = /iP(ad|hone|od)/.test(ua),
		IE11touch = navigator.pointerEnabled,
		IE9_10touch = navigator.msPointerEnabled,
		touchSupported = "ontouchstart" in win || IE9_10touch || IE11touch,
		actionNames = 'touchstart,touchmove,touchend,touchcancel'.split(','),
		touchNames = actionNames;

	if (IE11touch) { //IE11 与 W3C
		touchNames = ["pointerdown", "pointermove", "pointerup", "pointercancel"];
	} else if (IE9_10touch) { //IE9-10
		touchNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
	}
	
	function isPrimaryTouch(event) { //是否纯净的触摸事件，非mousemove等模拟的事件，也不是手势事件
		return (event.pointerType === "touch" || event.pointerType === event.MSPOINTER_TYPE_TOUCH) && event.isPrimary;
	}
	function isPointerEventType(e, type) { //是否最新发布的PointerEvent
		if(util.type.isBoolean(type)){
			return e.type.indexOf('pointer') != -1 || e.type.toLowerCase().indexOf('mspointer') != -1;
		}
		return (e.type === "pointer" + type || e.type.toLowerCase() === "mspointer" + type);
	}
	function W3CFire(el, name, detail) {
        var event = doc.createEvent("Events");
        event.initEvent(name, true, true);
        event.isTrusted = false;
        if (detail) {
            event.detail = detail;
        }
        el.dispatchEvent(event);
    }
	
	var eventExpendo = 'mobile_' + time,
		eventId = 0,
		eventData = {};
	
	function MEvent(el, event){
		this.originalEvent = event;
		this.touches = event.touches && event.touches.length ? event.touches : [event];
		this.changedTouches = event.changedTouches ? event.changedTouches : [event];
		var firstTouch = this.touches[0],
			target = firstTouch.target;
		
		this.currentTarget = el;
		this.type = event.type;
		this.target = "tagName" in target ? target : target.parentNode;
		this.pageX = firstTouch.pageX;
		this.pageY = firstTouch.pageY;
		this.clientX = firstTouch.clientX;
		this.clientY = firstTouch.clientY;
	}
	MEvent.prototype = {
		preventDefault: function(){
			fixPreventDefault(this.originalEvent);
		},
		stopPropagation: function(){
			fixStopPropagation(this.originalEvent);
		}
	};
	function fixPreventDefault(event){
		if (event.preventDefault) {
			event.preventDefault();
		}
		event.returnValue = false;
	}
	function fixStopPropagation(event){
		if (event.stopPropagation) {
			event.stopPropagation();
		}
		event.cancelBubble = true;
	}
	
	function getId(el) {
		return el[eventExpendo] || null;
	}
	function setId(el) {
		el[eventExpendo] = ++eventId;
		return eventId;
	}
	function removeId(el) {
		try {
			delete el[eventExpendo];
		} catch(e) {
			el.removeAttribute(eventExpendo);
		}
	}
	function bind(el, type, fn){
		if (type.indexOf(',') >= 0) {
			$.each(type.split(','), function( index, val ) {
				bind(el, val, fn);
			});
			return;
		}
		var id = getId(el);
		if (!id) {
			id = setId(el);
		}
		if (eventData[id] === undefined) {
			eventData[id] = {};
		}
		var events = eventData[id][type];
		if (events && events.length > 0) {
			unbind(el, type, events[0]);
		}
		else {
			eventData[id][type] = [];
			eventData[id].el = el;
		}
		events = eventData[id][type];
		if (events.length === 0) {
			events[0] = function(e) {
				var myEvent = e ? new MEvent(el, e) : undefined;
				$.each(events, function(i, fn) {
					if (i > 0 && fn) {
						fn.call(el, myEvent);
					}
				});
			};
		}
		if ($.inArray(fn, events) < 0) {
			events.push(fn);
		}
		el.addEventListener(type, events[0] || false);
	}
	
	function unbind(el, type, fn) {
		if (type && type.indexOf(',') >= 0) {
			$.each(type.split(','), function(index, val) {
				unbind(el, val , fn);
			});
			return;
		}
		var id = getId(el);
		if (!id) {
			return;
		}
		if (type === undefined) {
			if (id in eventData) {
				$.each(eventData[id], function(key, events) {
					if (key != 'el' && events.length > 0) {
						el.removeEventListener(key , events[0]);
					}
				});
				delete eventData[id];
				removeId(el);
			}
			return;
		}
		if (!eventData[id]) {
			return;
		}
		var events = eventData[id][type];
		if (events && events.length > 0) {
			if (fn === undefined) {
				el.removeEventListener(type , events[0]);
				delete eventData[id][type];
			} else {
				$.each(events, function(i, event) {
					if (i > 0 && event === fn) {
						events.splice(i, 1);
					}
				});
				if (events.length == 1) {
					el.removeEventListener(type , events[0]);
					delete eventData[id][type];
				}
			}
			var count = 0;
			$.each(eventData[id], function() {
				count++;
			});
			if (count < 2) {
				delete eventData[id];
				removeId(el);
			}
		}
	}
	
	var fastclick = {
			activeClass: "ms-click-active",
			clickDuration: 750, //小于750ms是点击，长于它是长按或拖动
			dragDistance: 14, //最大移动的距离
			preventTime: 2500, //2500ms还原ghostPrevent
			fireEvent: function(element, type, event) {
				var clickEvent = doc.createEvent('MouseEvents');
				clickEvent.initMouseEvent(type, true, true, win, 1, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 0, null);
				clickEvent.markFastClick = "boychina_20oo@qq.com";
				element.dispatchEvent(clickEvent);
			},
			focus: function(target) {
				if (this.canFocus(target)) {
					var value = target.value;
					target.value = value;
					if (isIOS && target.setSelectionRange && target.type.indexOf("date") !== 0 && target.type !== 'time') {
						// iOS 7, date datetime等控件直接对selectionStart,selectionEnd赋值会抛错
						var n = value.length;
						target.setSelectionRange(n, n);
					} else {
						target.focus();
					}
				}
			},
			canClick: function(target) {
				switch (target.nodeName.toLowerCase()) {
					case 'textarea':
					case 'select':
					case 'input':
						return !target.disabled;
					default:
						return true;
				}
			},
			canFocus: function(target) {
				switch (target.nodeName.toLowerCase()) {
					case 'textarea':
						return true;
					case 'select':
						return !isAndroid;
					case 'input':
						switch (target.type) {
							case 'button':
							case 'checkbox':
							case 'file':
							case 'image':
							case 'radio':
							case 'submit':
								return false;
						}
						return !target.disabled && !target.readOnly;
					default:
						return false;
				}
			},
			canFix: function(element) {
				// 如果设备不支持触摸就不需要修复了
				if (!touchSupported) {
					return false;
				}
				//在Android 平台的chrome 32，为了避免点击延迟，允许用户设置如下代码
				// <meta name="viewport" content="user-scalable=no">
				// <meta name="viewport" content="initial-scale=1,maximum-scale=1">
				// 可禁用双击缩放
				// 此外，iPhone 诞生时就有的另一个约定是，在渲染桌面端站点的时候，
				// 使用 980 像素的视口宽度，而非设备本身的宽度（iPhone 是 320 像素宽）时，
				// 即用户定义了<meta name="viewport" content="width=device-width">时
				// 也禁用双击缩放
				// 另外，如果页面宽度少于viewport宽度（document.documentElement.scrollWidth <= window.outerWidth）
				// 也禁用双击缩放
				var chromeVersion = +(/Chrome\/([0-9]+)/.exec(ua) || [0, 0])[1];
				if (chromeVersion) {//chrome 安卓版如果指定了特定的meta也不需要修复
					if (isAndroid) {
						var metaViewport = doc.querySelector('meta[name=viewport]');
						if (metaViewport) {
							if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
								return false;
							}
							if (chromeVersion > 31 && doc.documentElement.scrollWidth <= win.outerWidth) {
								return false;
							}
						}
					}
				}
				//IE10-11中为元素节点添加了一个touch-action属性决定能否进行双指缩放或者双击缩放
				//  a[href], button {
				//    -ms-touch-action: none; /* IE10 */
				//    touch-action: none;     /* IE11 */
				//}
				if (element.style.msTouchAction === 'none') {
					return false;
				}
				return true;
			}
		},
		clickHook = function(el, fn, f){
			var tapping = false,
                doubleIndex = 0, //用于决定何时重置doubleStartTime
                doubleStartTime, //双击开始时间,
                startTime, // 单击开始时间
                touchStartX,
                touchStartY;
			
			function resetState() {
				tapping = false;
				$(el).removeClass(fastclick.activeClass);
			}
			function touchstart(event) {
				doubleIndex++;
				if (doubleIndex === 1) {
					doubleStartTime = Date.now();
				}
				tapping = true;
				if (fastclick.canClick(element)) {
					$(el).addClass(fastclick.activeClass);
				}
				startTime = Date.now();
				var touches = event.touches && event.touches.length ? event.touches : [event];
				var e = touches[0];
				touchStartX = e.clientX;
				touchStartY = e.clientY;
			}
			function touchend(event) {
				var touches = (event.changedTouches && event.changedTouches.length) ? event.changedTouches :
						((event.touches && event.touches.length) ? event.touches : [event]);
				var e = touches[0];
				var x = e.clientX;
				var y = e.clientY;
				var diff = Date.now() - startTime; //经过时间
				var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2)); //移动距离
				var canDoubleClick = false;
				if (doubleIndex === 2) {
					doubleIndex = 0;
					canDoubleClick = true;
				}
				if (tapping && diff < fastclick.clickDuration && dist < fastclick.dragDistance) {
					ghostPrevent = true; //在这里阻止浏览器的默认事件
					setTimeout(function(){
						ghostPrevent = false;
					}, fastclick.preventTime);
					// 失去焦点的处理
					if (doc.activeElement && doc.activeElement !== el) {
						doc.activeElement.blur();
					}
					if (fastclick.canClick(el)) {
						var forElement;
						if (el.tagName.toLowerCase() === "label") {
							forElement = el.htmlFor ? doc.getElementById(el.htmlFor) : null;
						}
						if (forElement) {
							fastclick.focus(forElement);
						} else {
							fastclick.focus(el);
						}
						
						fastclick.fireEvent(el, "click", event);
						if (forElement) {
							fastclick.fireEvent(forElement, "click", event);
						}
						if (canDoubleClick) {
							if (new Date - doubleStartTime < 500) {
								fastclick.fireEvent(el, "dblclick", event);
							}
							doubleIndex = 0;
						}
					}
				}
				resetState();
			}
			if (fastclick.canFix(element)) {
				if(f){
					el.addEventListener("touchstart", touchstart);
					el.addEventListener("touchmove", resetState);
					el.addEventListener("touchcancel", resetState);
					el.addEventListener("touchend", touchend);
					el.addEventListener("click", fn);
				} else {
					el.removeEventListener("touchstart", touchstart);
					el.removeEventListener("touchmove", resetState);
					el.removeEventListener("touchcancel", resetState);
					el.removeEventListener("touchend", touchend);
					el.removeEventListener("click", fn);
				}
			}
		};
	var ghostPrevent = false;
	doc.addEventListener('click', function(e) {
        if (ghostPrevent) {
            if (!event.markFastClick) {//阻止浏览器自己触发的点击事件
                event.stopPropagation();
                event.preventDefault();
            }
        }
        var target = e.target;

        if (target.href && target.href.match(/#(\w+)/)) {
            var id = RegExp.$1;
            if (id) {
                var el = doc.getElementById(id);
                //这里做锚点的滚动处理,或做在scroll插件中
            }
        }
    }, true);
	
	function fixEventListener(type, el, fn, f, useCapture){
		f = type === 'clickHolder' ? !!f : f ? bind : unbind;
		if (type && type.indexOf(',') >= 0) {
			$.each(type.split(','), function(index, val) {
				fixEventListener(val, el, fn, f);
			});
			return;
		}
		switch(type){
			case "touchstart":
				f(el, touchNames[0], fn, useCapture);
				break;
			case "touchmove":
				f(el, touchNames[1], fn, useCapture);
				break;
			case "touchend":
				f(el, touchNames[2], fn, useCapture);
				break;
			case "touchcancel":
				f(el, touchNames[3], fn, useCapture);
				break;
			case "clickHolder":
				clickHook(el, fn, f);
				break;
			default:
				f(el, type, fn, useCapture);
				break;
		}
	}
	
	$.fn.addTouchListener = function(type ,fn, useCapture){
		return this.each(function(){
			fixEventListener(type, this, fn, true, useCapture);
		});
	}
	$.fn.removeTouchListener = function(type, fn){
		return this.each(function(){
			fixEventListener(type, this, fn, false);
		});
	}
	$.each(actionNames, function(type){
		$.fn[type] = function(fn){
			return this.each(function(){
				fixEventListener(type, this, fn, true);
			});
		}
	});
	//针对移动端的区
	$.mobile = (function(doc, win){
		var me = {
				raf: win.requestAnimationFrame || 
					 win.webkitRequestAnimationFrame || 
					 win.mozRequestAnimationFrame ||
					 win.oRequestAnimationFrame ||
					 win.msRequestAnimationFrame ||
					 function (callback) { win.setTimeout(callback, 1000 / 60); 
				}
			},
			_elementStyle = doc.createElement('div').style,
				_vendor = (function () {
					var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
						transform,
						i = 0,
						l = vendors.length;
	
					for ( ; i < l; i++ ) {
						transform = vendors[i] + 'ransform';
						if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
					}
					return false;
			})();
		function _prefixStyle (style) {
			if ( _vendor === false ) return false;
			if ( _vendor === '' ) return style;
			return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
		}
		me.getTime = Date.now || function getTime () { return new Date().getTime(); };
		me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
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
			};
		};
		
		var _transform = _prefixStyle('transform');
		me.hasTransform = _transform !== false;
		me.hasPerspective = _prefixStyle('perspective') in _elementStyle;
		me.hasTouch = 'ontouchstart' in win;
		me.hasPointer = win.PointerEvent || win.MSPointerEvent; // IE10 is prefixed
		me.hasTransition = _prefixStyle('transition') in _elementStyle;
		// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
		me.isBadAndroid = /Android /.test(win.navigator.appVersion) && !(/Chrome\/\d/.test(win.navigator.appVersion));
		me.preventDefaultException = function (el, exceptions) {
			for ( var i in exceptions ) {
				if ( exceptions[i].test(el[i]) ) {
					return true;
				}
			}
	
			return false;
		};
		me.prefixPointerEvent = function (pointerEvent) {
			return window.MSPointerEvent ? 
				'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
				pointerEvent;
		};
		
		me.style = {
			transform: _transform,
			transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
			transitionDuration: _prefixStyle('transitionDuration'),
			transitionDelay: _prefixStyle('transitionDelay'),
			transformOrigin:_prefixStyle('transformOrigin')
		};
		me.ease = {
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
		me.eventType = {
			touchstart: 1,
			touchmove: 1,
			touchend: 1,
	
			mousedown: 2,
			mousemove: 2,
			mouseup: 2,
	
			pointerdown: 3,
			pointermove: 3,
			pointerup: 3,
	
			MSPointerDown: 3,
			MSPointerMove: 3,
			MSPointerUp: 3
		};
		
		return me;
		
	})(doc, win);
	
	if(touchSupported){
		(function(doc){
			var touchProxy = {}, touchTimeout, tapTimeout, swipeTimeout, holdTimeout,
				now, firstTouch, _isPointerType, delta, 
				deltaX = 0,
				deltaY = 0;
			
			function swipeDirection(x1, x2, y1, y2) {
                return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? "left" : "right") : (y1 - y2 > 0 ? "up" : "down");
            }
			function longTap() {
                if (touchProxy.last) {
                    touchProxy.fire("hold");
                    touchProxy = {};
                }
            }
			function cancelHold() {
                clearTimeout(holdTimeout);
            }
			function cancelAll() {
                clearTimeout(touchTimeout);
                clearTimeout(tapTimeout);
                clearTimeout(swipeTimeout);
                clearTimeout(holdTimeout);
                touchProxy = {};
            }
			doc.addEventListener(touchNames[0], function(e) {
				if ((_isPointerType = isPointerEventType(e, "down")) && !isPrimaryTouch(e))
                    return;
                firstTouch = _isPointerType ? e : e.touches[0];

                if (e.touches && e.touches.length === 1 && touchProxy.x2) {
                    touchProxy.x2 = touchProxy.y2 = void 0;
                }
                now = Date.now();
                delta = now - (touchProxy.last || now);
                var el = firstTouch.target;
                touchProxy.el = "tagName" in el ? el : el.parentNode;
                clearTimeout(touchTimeout);
                touchProxy.x1 = firstTouch.pageX;
                touchProxy.y1 = firstTouch.pageY;
                touchProxy.fire = function(name) {
                    W3CFire(this.el, name);
                }
                if (delta > 0 && delta <= 250) { //双击
                    touchProxy.isDoubleTap = true;
                }
                touchProxy.last = now;
                holdTimeout = setTimeout(longTap, 750);
			});
			doc.addEventListener(touchNames[1], function(e) {
                if ((_isPointerType = isPointerEventType(e, "move")) && !isPrimaryTouch(e))
                    return;
                firstTouch = _isPointerType ? e : e.touches[0];
                cancelHold();
                touchProxy.x2 = firstTouch.pageX;
                touchProxy.y2 = firstTouch.pageY;
                deltaX += Math.abs(touchProxy.x1 - touchProxy.x2);
                deltaY += Math.abs(touchProxy.y1 - touchProxy.y2);
            });
			doc.addEventListener(touchNames[2], function(e) {
                if ((_isPointerType = isPointerEventType(e, "up")) && !isPrimaryTouch(e))
                    return;
                cancelHold();
                // swipe
                if ((touchProxy.x2 && Math.abs(touchProxy.x1 - touchProxy.x2) > 30) ||
                        (touchProxy.y2 && Math.abs(touchProxy.y1 - touchProxy.y2) > 30)) {
                    //如果是滑动，根据最初与最后的位置判定其滑动方向
                    swipeTimeout = setTimeout(function() {
                        touchProxy.fire("swipe");
                        touchProxy.fire("swipe" + (swipeDirection(touchProxy.x1, touchProxy.x2, touchProxy.y1, touchProxy.y2)));
                        touchProxy = {};
                    }, 0)
                    // normal tap 
                } else if ("last" in touchProxy) {
                    if (deltaX < 30 && deltaY < 30) { //如果移动的距离太小
                        tapTimeout = setTimeout(function() {
                            touchProxy.fire("tap");
                            if (touchProxy.isDoubleTap) {
                                touchProxy.fire('doubletap');
                                touchProxy = {};
                            } else {
                                touchTimeout = setTimeout(function() {
                                    touchProxy.fire('singletap');
                                    touchProxy = {};
                                }, 250);
                            }
                        }, 0);
                    } else {
                        touchProxy = {};
                    }
                }
                deltaX = deltaY = 0;
            });
			doc.addEventListener(touchNames[3], cancelAll);
		})(doc);
	}
	return $;
	
});