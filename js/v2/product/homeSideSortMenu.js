//更新1000
define('product.homeSideSortMenu', 'product.sideMenu.sideSortMenuGroup',
function(require, exports, module){
	var $ = module['jquery'];
		Class = require('base.class').Class,
		sideSortMenuGroup = module['product.sideMenu.sideSortMenuGroup'],
		util = require('base.util'),
		doc = document,
		template = {
			triggerItem: '<li><a class="lstLnk" href="javascript:" target="blank"><em class="hbFntWes">&#xf105;</em>{icons}<p class="lnk">{name}</p></a></li>',
			elementGroup: '<div class="child_item posJobSort"></div>',
			elementCols: '<div class="row"></div>',
			//elementLeftCols: '<div class="l"></div>',
			//elementRightCols: '<div class="r"></div>',
			elementRows: '<dl></dl>',
			elementTitle: '<dt><a href="{url}" target="{target}">{name}</a></dt>',
			elementList: '<dd></dd>',
			elementItem: '<a href="{url}" target="{target}">{name}</a>',
			banner: '<div class="sideBanner"><a href="{link}" target="blank">{value}</a></div>'
		}
	
	var homeSideSortMenu = Class(function(o){
			homeSideSortMenu.parent().call(this, util.merge({
				element: $('#side_menu_items'),
				trigger: $('#side_menu_list'),
				className: 'show',
				delayHoverTime: 300,
				isRenderTriggerMenu: true,
				posY: 164,
				width:740,
				banner: null
			}, o));
		}).extend(sideSortMenuGroup);
		
	homeSideSortMenu.implement({
            
		_initMenu: function(){
			this._menu = new sideSortMenu({
				element: this.get('element'),
				trigger: this._triggerItem,
				items: this.get('elementItem'),
				width: 740,
				posY: this.get('posY')
			});
			this._menu.set('align', {
				baseXY: [240 , 0]
			});
		},
		_eachList: function(index, val){
			val.url = this.getURL(val);
			var el;
			
			if(this.get('isRenderTriggerMenu')){
			
				var cloneIndex = index - 1;
				val.icons = '<i class="newIcon newIcon' + (cloneIndex <= 1 ? '' : cloneIndex) + '" style="left: 15px;"></i>';
				el = $(util.string.replace(template.triggerItem, val)).appendTo(this._triggerMenu);
			} else {
				if(!index){
					this._triggerItem = this._triggerMenu.find(this.get('triggerItem'));	
				}
				
				el = this._triggerItem.eq(index);
			}
			
			this._renderSelectedClass(this._renders[index] = [], el, 0, val);
			
			
			if(val.sub && util.type.isArray(val.sub)){
				childItem = $(template.elementGroup).appendTo(this.get('element'));
				this._renderItems(childItem, val.sub, this._renders[index], index, el);
				childItem.css({
					'visibility': '',
					'display': 'none'
				});
				delete this._renders[index];
			}
		},
		_renderBanners: function(banner, index, target, el){
			 if(banner.value){
			 	$(util.string.replace(template.banner, banner)).appendTo(target);
			 }
			 var targetChild = $('<div class="clearfix"></div>').appendTo(target);
			 
			 if(this.get('isRenderTriggerMenu')){
				 if(banner.className){
					 el.addClass(banner.className);
				 }

				 var a = el.children('a');
				 if(a.length && banner.isHref && banner.link){
					 a.attr('href', banner.link);
					 a.attr('target', '_blank');
				 }
			 }
			 
			 return targetChild;
		},
		_renderItems: function(target, val, obj, index, el){
			var self = this,
				id = obj.length,
				banner = this.get('banner'),
				targetChild;
			
			if(banner){
				if(util.type.isObject(banner) && (banner.id != undefined && banner.id === index)){
					targetChild = this._renderBanners(banner, index, target, el);
				} else if(util.type.isArray(banner)){
					$.each(banner, function(i, val){
						if(val.id != undefined && val.id === index){
							targetChild = self._renderBanners(val, index, target, el);
							return false;
						} else {
							targetChild = target;
						}
					});
				} else {
					targetChild = target;
				}
			} else {
				targetChild = target;
			}
			
			target = $(template.elementCols).appendTo(targetChild);
			
			$(val).each(function(key, val){
				//var index = val.order ? val.order % target.length == 0 ? 1 : 0 : checkItemsHeight(target);
				self._renderItem(target, val, {
					renders: obj,
					index: id
				});
			});
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
			
			this.get('element').on('mouseenter', function(e){
				hideTimer && clearTimeout(hideTimer);
			}).on('mouseleave', leaveHandle);
			
			function overHandle(e){
				var target = $(e.currentTarget);
				
				self._triggerItem.removeClass(self.get('className'));
				var index = self._triggerItem.index(target.addClass(self.get('className')));
				self._menu.show(index);
			}
			function leaveHandle(e){
				hideTimer && clearTimeout(hideTimer);
				switchTimer && clearTimeout(switchTimer);
				hideTimer = setTimeout(function(){
					self._triggerItem.removeClass(self.get('className'));
					self._menu.hide();
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
	
	return homeSideSortMenu;
});