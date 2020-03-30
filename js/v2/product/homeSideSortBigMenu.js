// JavaScript Document 

define('product.homeSideSortBigMenu',
function(require, exports, module){
	
	var $ = module['jquery'];
		Class = require('base.class').Class,
		shape = module['base.shape'],
		util = require('base.util'),
		doc = document;
	
	var homeSideSortBigMenu = shape(function(o){
			homeSideSortBigMenu.parent().call(this, util.merge({
				trigger: $('#inPageListLf'),
				elementItem: '.inPageListrt',
				triggerItem: 'li',
				className: 'hover',
				delay: 120,
				delayHoverTime: 300,
				noAllows: null
			}, o));
			this.init();
		});
		
	homeSideSortBigMenu.implement({
		init: function(){
			this._triggerItem = this.get('trigger').find(this.get('triggerItem'));
			this._createAllows();
			this._initEvents();
		},
		_createAllows: function(){
			var noAllows = this.get('noAllows'),
				result = [];
			
			if(util.type.isArray(noAllows)){
				result = noAllows;	
			} else if(util.type.isNumber(noAllows)){
				result = [noAllows];
			}
			this._allowsCache = {};
			this._noAllows = result;
		},
		_checkAllowed: function(e){
			var target = $(e.currentTarget),
				index = this._triggerItem.index(target),
				noAllows = this._noAllows;
				
			if(this._allowsCache[index] != undefined){
				return false;
			}
			
			for(var i = 0, len = noAllows.length; i < len; i++){
				if(noAllows[i] === index){
					this._allowsCache[index] = false;
					return false;
				}
			}
			return true;
		},
		_resetPosition: function(target){
			
			var trigger = this.get('trigger'),
				triggerHeight = trigger.outerHeight(),
				triggerTop = trigger.offset().top,
				targetHeight = target.outerHeight(),
				menu = target.find(this.get('elementItem')),
				menuHeight = menu.outerHeight(),
				pos = (targetHeight - menuHeight) / 2,
				menuTop = menu.offset().top,
				css;
				
			if(menuTop <= triggerTop){
				css = {
					'bottom': 'auto',
					'top': 0
				};
			} else if(menuTop + menuHeight >= triggerTop + triggerHeight){
				css = {
					'top': 'auto',
					'bottom': 0
				};
			} else {
				css = {
					'bottom': 'auto',
					'top': pos
				};
			}
				
			menu.css(css);
		},
		_initEvents: function(){
			var self = this,
				trigger = this.get('trigger'),
				itemName = this.get('triggerItem'),
				hideTimer, switchTimer,
				switchTimeout = this.get('delayHoverTime'),
				limit = 3,
				resultPos = null;
			this.pos = [];
				
			$(doc).on('mousemove', function(e){
				self.pos.push({
					x: e.pageX, y: e.pageY		
				});
				if(self.pos.length > limit){
					self.pos.shift();
				}
			});
			trigger.on('mouseenter', itemName, function(e){	
				switchTimer && clearTimeout(switchTimer);
				hideTimer && clearTimeout(hideTimer);
				
				switchTimer = setTimeout(function(){
					overHandle(e);
				}, timeout());
			}).on('mouseleave', leaveHandle);
			
			function overHandle(e){
				var target = $(e.currentTarget);
				
				self._triggerItem.removeClass(self.get('className'));
				if(!self._checkAllowed(e)){
					return;
				}
				
				target.addClass(self.get('className'));
				self._resetPosition(target);
			}
			function leaveHandle(e){
				hideTimer && clearTimeout(hideTimer);
				switchTimer && clearTimeout(switchTimer);
				hideTimer = setTimeout(function(){
					self._triggerItem.removeClass(self.get('className'));
				}, self.get('delay'));
			}
			
			function timeout(){
				var offset = trigger.offset(),
					dimStart = {
						x: offset.left + trigger.width(),
						y: offset.top
					},
					dimEnd = {
						x: offset.left + trigger.width(),
						y: offset.top + trigger.height()
					},
					endPos = self.pos[self.pos.length - 1],
					startPos = self.pos[0];
				
				if(!endPos){
					return 0;
				}
				if(!startPos){
					startPos = endPos;
				}
				if(startPos.x < offset.left || startPos.x > dimEnd.x || startPos.y < offset.top || startPos.y > dimEnd.y){
					return 0;
				}
				if(resultPos && endPos.x == resultPos.x && endPos.y == resultPos.y){
					return 0;
				}
				var cloneStart = dimStart,
					cloneEnd = dimEnd,
					L = J(endPos, cloneStart),
					H = J(endPos, cloneEnd),
					D = J(startPos, cloneStart),
					A = J(startPos, cloneEnd);
				
				
				
				if(L < D && H > A){
					k = endPos;
					return self.get('delayHoverTime');
				}
				
				k = null;
				return 0;
			}
		}
	});
	function J(o, n){
		return (n.y - o.y) / (n.x - o.x);
	}
	
	return homeSideSortBigMenu;
});