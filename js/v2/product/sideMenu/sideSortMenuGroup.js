// JavaScript Document 

define('product.sideMenu.sideSortMenuGroup', 
['product.sideMenu.sideSortMenu','product.sideMenu.sideSortMenuData'],
function(require, exports, module){
	
	var $ = module['jquery'];
		shape = module['base.shape'],
		sideSortMenu = module['product.sideMenu.sideSortMenu'],
		data = module['product.sideMenu.sideSortMenuData'],
		util = require('base.util'),
		template = {
			triggerItem: '<li><a class="sub_item" href="{url}"><!--<i class="hbFntWes">&#xf105;</i>-->{name}</a></li>',
			elementGroup: '<div class="child_item"></div>',
			elementCols: '<div></div>',
			elementRows: '<dl></dl>',
			elementTitle: '<dt><a href="{url}" target="{target}">{name}</a></dt>',
			elementList: '<dd></dd>',
			elementItem: '<a href="{url}" target="{target}">{name}</a>'
		}
	
	var sideSortMenuGroup = shape(function(o){
			sideSortMenuGroup.parent().call(this, util.merge({
				element: $('#side_menu_items'),
				trigger: $('#side_menu .side_menu_list'),
				elementItem: '.child_item',
				triggerMenu: 'ul',
				triggerItem: 'li',
				className: 'hover',
				selectedClassName: 'item_selected',
				delay: 120,
				url: {
					host: 'http://119.84.79.102',
					path: '/jobsearch/index/',
					param: null,
					alias: 'alias',
					selectId: null
				},
				isSpacer: '|',
				isLinkTarget: false
			}, o));
		});
	sideSortMenuGroup.implement({
		init: function(){
			this._renders = {};
			this._triggerMenu = this.get('trigger').find(this.get('triggerMenu'));
			this._renderTemplate();
			this._triggerItem = this._triggerMenu.find(this.get('triggerItem'));
			this._initMenu();
			this._initEvents();	
		},
		_initMenu: function(){
			this._menu = new sideSortMenu({
				element: this.get('element'),
				trigger: this._triggerItem,
				items: this.get('elementItem')
			});
		},
		_initEvents: function(){
			var self = this,
				itemName = this.get('triggerItem'),
				hideTimer;
				
			this.get('trigger').on('mouseenter', itemName, function(e){
				
				hideTimer && clearTimeout(hideTimer);
				self._triggerItem.removeClass(self.get('className'));
				var index = self._triggerItem.index($(this).addClass(self.get('className')));
				self._menu.show(index);
				
			}).on('mouseleave', itemName, leaveHandle);
			this.get('element').on('mouseenter', function(e){
				hideTimer && clearTimeout(hideTimer);
			}).on('mouseleave', leaveHandle);
			
			function leaveHandle(){
				hideTimer && clearTimeout(hideTimer);
				hideTimer = setTimeout(function(){
					self._triggerItem.removeClass(self.get('className'));
					self._menu.hide();
				}, self.get('delay'));
			}
		},
		_renderItem: function(target, val, obj){
			var self = this,
				isLinkTarget = this.get('isLinkTarget') ? '_blank' : '_self';
				
			target = $(template.elementRows).appendTo(target);
			$(val).each(function(i, val){
				val.url = self.getURL(val);
				val.target = isLinkTarget;
				var el = $(util.string.replace(template.elementTitle, val)).appendTo(target);
				
				if(obj && obj.renders){
					self._renderSelectedClass(obj.renders, el, obj.index, val);
				}
				
				target = $(template.elementList).appendTo(target);
				if(val.sub && util.type.isArray(val.sub)){
					$(val.sub).each(function(index, value){
						
						value.url = self.getURL(value);
						value.target = isLinkTarget;
						el = $(util.string.replace(template.elementItem, value)).appendTo(target);
						if(obj && obj.renders){
							self._renderSelectedClass(obj.renders, el, obj.index + 1, value);
						}
						if(util.type.isString(self.get('isSpacer')) && (index < val.sub.length - 1)){
							el.after(self.get('isSpacer'));
						}
					});
				}
			});
		},
		_renderItems: function(target, val, obj){
			var self = this,
				id = obj.length;
				
			target = [
				$(template.elementCols).appendTo(target),
				$(template.elementCols).appendTo(target)
			];
			$(val).each(function(key, val){
				var index = val.order ? val.order % target.length == 0 ? 1 : 0 : checkItemsHeight(target);
				self._renderItem(target[index], val, {
					renders: obj,
					index: id
				});
			});
		},
		_renderTemplate: function(){
			$(data).each(util.bind(this._eachList, this));
		},
		_eachList: function(index, val){
			val.url = this.getURL(val);
			var el = $(util.string.replace(template.triggerItem, val)).appendTo(this._triggerMenu);
			this._renderSelectedClass(this._renders[index] = [], el, 0, val);
			if(val.sub && util.type.isArray(val.sub)){
				childItem = $(template.elementGroup).appendTo(this.get('element'));
				this._renderItems(childItem, val.sub, this._renders[index]);
				childItem.css({
					'visibility': '',
					'display': 'none'
				});
				delete this._renders[index];
			}
		},
		getURL: function(val){
			var url = this.get('url');
			if(url && url.host){
				var result = url.host,
					alias = val[url.alias];
				
				if(alias){
					result += '/' + val[url.alias] + '/';
				} else {
					result += url.path ? url.path : '/';
				}
				
				if(val.id && !alias){
					result += getParam(result) + 'params=a' + val.id;
				}
				if(url.param){
					result += getParam(result) + url.param;
				}
				return result;
			}
			return 'javascript:';
		},
		isSelected: function(val){
			var url = this.get('url');
			if(val && this.get('selectedClassName') && url && url.selectId){
				if(util.type.isString(url.selectId)){
					url.selectId = url.selectId.split(',');
				}
				for(var i=0, len = url.selectId.length; i < len; i++){
					if(val.id === url.selectId[i]){
						url.selectId.splice(i, 1);
						return true;
					}
				}
			}
			return false;
		},
		_renderSelectedClass: function(render, el, index, val){
			el = el.children().length ? el.children() : el;
			if(index === 1 && render.length >= 3){
				 render.splice(render.length - 1, 1);
			}
			render[index] = el;
			if(this.isSelected(val)){
				for(var i = render.length - 1; i >= 0; i--){
					if(!render[i]){
						render.splice(render.length - 1, 1);
						continue;
					}
					render[i].addClass(this.get('selectedClassName'));
				}
				render.splice(index, 1);
			}
			this._renders[index] = render;
		}
	});
	
	function getParam(url){
		return url.indexOf('?') > -1 ? '&':'?';
	}
	function checkItemsHeight(target){
		if(target[0].outerHeight() > target[1].outerHeight()){
			return 1;
		}
		return 0;
	}
	
	return sideSortMenuGroup;
});