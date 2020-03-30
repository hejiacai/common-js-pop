// JavaScript Document

define('mobile.mobileSortable.mobileSortMenu', 
function(require, exports, module){
	
	var $ = module['jquery'];
		shape = module['base.shape'],
		//data = module['product.sideMenu.sideSortMenuData'],
		util = require('base.util'),
		doc = document,
		className = "cut"
		curClassName = 'class="' + className + '"';
		template = {
			triggerItem: '<a class="sub_item" href="javascript:">{name}</a>',
			elementGroup: '<div class="group_item"></div>',
			elementItem: '<a {cut} href="javascript:" data-id="{id}">{name}</a>'
		}
		
	var mobileSortMenu = shape(function(o){
			mobileSortMenu.parent().call(this, util.merge({
				element: null,
				trigger: null,
				selectedIndex: 0,
				url: '//assets.huibo.com/js/v2/data/easyJobSortData.js?v=20150226',
			}, o));
			this._initSelectedItem();
		});
	mobileSortMenu.implement({
		init: function(){
			this._index = 0;
			this._renders = {};
			var self = this;
			hbjs.loadJS(this.get('url'), function(moduleName){
				moduleName = moduleName.substring(moduleName.lastIndexOf('/') + 1, moduleName.lastIndexOf('.js'));
				self.set('data', hbjs[moduleName]);
				if(!self.get('data')){
					self.trigger('initError');
					return;
				}
				self._renderTemplate();
				self._triggerItem = self.get('trigger').find('a');
				self._items = self.get('element').find('.group_item');
				self._childrenItems = self._items.find('a');
				self.selectMenu(self.get('selectedIndex'));
				self._initEvents();
				delete hbjs[moduleName];
			});
		},
		_initSelectedItem: function(){
			var selectedId = this.get('selectedId');
			this._selectedId = [];
			this._selectedObj = {};
			if(selectedId && util.type.isString(selectedId)){
				this._selectedId = selectedId.split(',');
			} else if(util.type.isArray(selectedId)){
				this._selectedId = selectedId;
			}
			if(this._selectedId.length){
				for(var i = 0,len = this._selectedId.length; i < len; i++){
					this._selectedObj[this._selectedId[i]] = true;
				}
			}
		},
		getData: function(){
			return {
				array: this._selectedId,
				object:	this._selectedObj
			}
		},
		_initEvents: function(){
			var self = this,
				trigger = this.get('trigger');
				
			trigger.on('click', 'a', function(e){
				var target = $(e.currentTarget);
				var index = self._triggerItem.index(target);
				self.selectMenu(index);
			});
			
			var element = this.get('element');
			element.on('click', 'a', function(e){
				var target = $(e.currentTarget),
					value = target.attr('data-id'),
					isSelected = target.hasClass(className),
					eventObj = {
						target: target,
						label: target.text(),
						value: value,
						isSelected: isSelected
					};
				
				if(isSelected){	
					self.delSelectedItem(value);
				} else {
					if(self.isLimit()){
						self.trigger('limit', e);
						return;
					}
					self.addSelectedItem(value, eventObj.label);
				}
				self.trigger('selected', eventObj);
			});
		},
		isLimit: function(){
			var selectedId = this._selectedId;
			return selectedId.length >= this.get('maxLength');
		},
		isSelected: function(val){
			if(!this._selectedId.length) {
				return false;
			}
			if(this._selectedObj[val]){
				return true;
			}
			return false;
		},
		clearSelectedItem: function(){
			this._childrenItems.removeClass(className);
			this._selectedObj = {};
			this._selectedId = [];
		},
		addSelectedItem: function(val, label){
			if(!this.isSelected(val)){
				this._selectedObj[val] = label || true;
				this._selectedId.push(val);
				if(this._childrenItems){
					var item = this._childrenItems.filter('[data-id=' + val + ']');
					if(item.length){
						item.addClass(className);
					}
				}
				return true;
			}
			return false;
		},
		delSelectedItem: function(val){
			var selectedId = this._selectedId;
			if(!selectedId.length){
				return;
			}
			for(var i = 0,len = selectedId.length; i<len; i++){
				if(val == selectedId[i]){
					delete this._selectedObj[val];
					this._selectedId.splice(i, 1);
					if(this._childrenItems){
						var item = this._childrenItems.filter('[data-id=' + val + ']');
						if(item.length){
							item.removeClass(className);
						}
					}
					return;
				}
			}
		},
		selectMenu: function(index){
			this._triggerItem.removeClass(className);
			this._triggerItem.eq(index).addClass(className);
			this._index = index;

			this._items.hide();
			this._items.eq(index).show();
		},
		_renderTemplate: function(){
			$(this.get('data')).each(util.bind(this._eachList, this));
			this.trigger('loadComplete');
		},
		_eachList: function(index, val){
			var el = $(util.string.replace(template.triggerItem, val)).appendTo(this.get('trigger'));
			this._renderSelectedClass(this._renders[index] = [], el, 0, val);
			var childItem;
			if(val.sub && util.type.isArray(val.sub)){
				childItem = $(template.elementGroup).appendTo(this.get('element'));
				this._renderItems(childItem, val.sub, this._renders[index], index);
				childItem.css({
					'visibility': '',
					'display': 'none'
				});
				delete this._renders[index];
			}
		},
		_renderItems: function(target, val, obj){
			var self = this,
				id = obj.length;
				
			$(val).each(function(key, val){
				self._renderItem(target, val, {
					renders: obj,
					index: id
				}, key);
			});
		},
		_renderItem: function(target, val, obj, index){
			var self = this,
				el;
			
			if(obj && obj.renders){
				this._renderSelectedClass(obj.renders, target, obj.index, val);
			}
			if(self._selectedObj[val.id]){
				self._selectedObj[val.id] = value.name;
				self.trigger('initItem', {
					label: val.name,
					value: val.id
				});
			}
			
			el = $(util.string.replace(template.elementItem, val)).appendTo(target);
			if(obj && obj.renders){
				self._renderSelectedClass(obj.renders, el, obj.index + 1, val);
			}
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
					render[i].addClass(className);
				}
				render.splice(index, 1);
			}
			this._renders[index] = render;
		}
	});
	
	return mobileSortMenu;
	
});