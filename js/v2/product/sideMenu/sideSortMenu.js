// JavaScript Document

define('product.sideMenu.sideSortMenu',
'widge.popup', 
function(require, exports, module){
	
	var $ = module['jquery'],
		popup = module['widge.popup'],
		util = require('base.util'),
		Class = require('base.class').Class,
		win = $(window);
		
	
	var sideSortMenu = Class(function(o){
			sideSortMenu.parent().call(this, util.merge({
				element: $('#side_menu_items'),
				trigger: $('#side_menu li'),
				items: '.child_item',
				arrow: '.side_menu_items_arrow',
				width: 630,
				height: 'auto',
				timeout: 200,
				posY: null
			}, o));
		}).extend(popup);
	sideSortMenu.implement({
		init: function(){
			this._isInit = true;
			this._initElements();
			this._bindBaseElement();
			sideSortMenu.parent('init').call(this);
		},
		_initElements: function(){
			this._items = this.get('element').find(this.get('items'));
			this._arrow = this.get('element').find(this.get('arrow'));
			this._trigger = this.get('trigger').eq(0);
		},
		_bindBaseElement: function(){
			this.set('align', {
				selfXY: [0, 0],
				baseElement: this._trigger,		
                baseXY: ['100%' , 0]
			}, {override: true});
		},
		setPosition: function(){
			var self = this,
				align = this.get('align'),
				trigger = this.get('trigger'),
				firstTop = trigger.first().offset().top,
				tH = trigger.outerHeight(),
				curTriggerTop = this._trigger.offset().top,
				wT = win.scrollTop(),
				wH = win.height(),
				eH = this.get('element').outerHeight(),
				avaiH = 0,
				top;
			if(curTriggerTop > wT){
				if(wH < eH){
					if(firstTop < wT){
						for(var i = this._index; i >= 0; i--){
							top = trigger.eq(i).offset().top;
							if(top < wT) {
								avaiH = curTriggerTop - top;
								break;
							}
						}
					} else {
						avaiH = curTriggerTop - firstTop;
					}
				} else {
					var b = i = len = trigger.length-1;
					for(; i >= 0; i--){
						top = trigger.eq(i).offset().top;
						if(top <= wT){break;}
						if(top + tH > wT + wH){
							b = i;
						}
						if(i && i <= this._index){
							avaiH += trigger.eq(i).outerHeight();
						}
					}
					
					i = i <= 0 ? 0 : i;
					
					b = trigger.eq(b).offset().top;
					i = trigger.eq(i).offset().top;
					
					if(b + tH - i > eH){
						if(curTriggerTop - i >= b - curTriggerTop){
							avaiH = curTriggerTop - b + eH - tH;
						} else {
							if(curTriggerTop - i >= eH / 2){
								avaiH = '50%-'+(tH/2);
							}
						}
					} else {
						avaiH = curTriggerTop - i;
					}
				}
			}
			
			align.baseElement = this._trigger;
			align.selfXY[1] = avaiH;
			sideSortMenu.parent('setPosition').call(this, null, showMenu);
			
			function showMenu(e){
				var pos = {left: e.left - 1},
					top = self.get('posY') || e.top;
				if(self._isInit){
					pos = $.extend({top: top}, pos);
				} else {
					if(this._arrow && this._arrow.is(':visible')){
						this._arrow.hide();
					}
					e.target.stop(true, false).animate({top: top}, self.get('timeout'));
					//e.target.stop(true,false).animate({top: 174}, self.get('timeout'));
				}
				e.target.css(pos);
				self._posY = top;
				self._resetArrowPos();
			}
			delete this._isInit;
		},
		_resetArrowPos: function(){
			var trigger = this.get('trigger').eq(this._index),
				triggerY = trigger.offset().top,
				posY = (triggerY - this._posY) || 0;
			this._arrow.css('top', posY).show();
		},
		show: function(index){
			this._trigger = this.get('trigger').eq(index);
			this._index = index;
			this._items.hide();
			this._items.eq(index).show();
			sideSortMenu.parent('show').call(this);
		},
		hide: function(){
			this._items.hide();
			this._arrow.hide();
			sideSortMenu.parent('hide').call(this);
		},
		destory: function(){
			sideSortMenu.parent('destory').call(this);
		}
	});
	return sideSortMenu;
	
});