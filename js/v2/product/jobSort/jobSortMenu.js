// JavaScript Document

define('product.jobSort.jobSortMenu', 
function(require, exports, module){
	
	var $ = module['jquery'];
		shape = module['base.shape'],
		//data = module['product.sideMenu.sideSortMenuData'],
		util = require('base.util'),
		doc = document,
		template = {
			triggerItem: '<li class="{class}"><a class="sub_item" href="javascript:"><!--<i class="hbFntWes">&#xf105;</i>-->{name}</a></li>',
			firstItem: '<li class="first_item"><a data-id="0" class="sub_item" href="javascript:">不限</a></li>',
			elementGroup: '<table class="child_item" cellpadding="0"></table>',
			elementCols: '<div></div>',
			elementRows: '<tr></tr>',
			elementTitle: '<th class="{class}"><{tag} href="javascript:" data-id="{id}">{name}</{tag}></th>',
			elementList: '<td><div></div></td>',
			elementItem: '<a href="javascript:" data-id="{id}">{name}</a>'
		}
		
	var jobSortMenu = shape(function(o){
			jobSortMenu.parent().call(this, util.merge({
				element: null,
				trigger: null,
				elementItem: '.child_item',
				triggerMenu: 'ul',
				triggerItem: 'li',
				className: 'hover',
				selectedClassName: 'item_selected',
				delayHoverTime: 300,
				selectedIndex: 0,
				maxLength: 5,
				remenSwitch:'hide',
				selectedId: null,
				model: false,
				level: true,
				isAll: false
			}, o));
			this._initSelectedItem();
		});
	jobSortMenu.implement({
		init: function(){
			this._index = 0;
			this._renders = {};
			var self = this;
			hbjs.loadJS(this.get('url'), function(moduleName){
				moduleName = moduleName.substring(moduleName.lastIndexOf('/') + 1, moduleName.lastIndexOf('.js'));
				//判断是否显示热门职位
				if(self.get('remenSwitch') != "show") {
					// hbjs[moduleName].splice(0, 1);
				}
				self.set('data', hbjs[moduleName]);
				if(!self.get('data')){
					self.trigger('initError');
					return;
				}
				self._triggerMenu = self.get('trigger').find(self.get('triggerMenu'));
				self._renderTemplate();
				self._triggerItem = self._triggerMenu.find(self.get('triggerItem'));
				self._items = self.get('element').find('.child_item');
				self.selectMenu(self.get('selectedIndex'));
				self._initEvents();
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
				trigger = this.get('trigger'),
				itemName = this.get('triggerItem'),
				switchTimer,
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
				var target = $(e.currentTarget);
				switchTimer && clearTimeout(switchTimer);
				if(!target.hasClass('first_item')){
					switchTimer = setTimeout(function(){
						overHandle(e);
					}, timeout());
				} else {
					overHandle(e, true);
				}
			}).on('mouseleave', leaveHandle).on('click', '.first_item a', function(e){
				selectedItem(e);
				self.trigger('clickAll', e);
			});
			
			var element = this.get('element');
			element.on('mouseleave', leaveHandle).on('click', 'a', selectedItem);
			
			function selectedItem(e){
				var target = $(e.currentTarget),
					value = target.attr('data-id'),
					eventObj = {
						target: target,
						label: target.text(),
						value: value,
						result: self._handleResult(value)
					};
				
				if(self.addSelectedItem(value, eventObj.label) === true){
					self.trigger('selectItem', eventObj);
				} else if(self.addSelectedItem(value, eventObj.label) === 'limit'){
					self.trigger('limit', eventObj);
				} else {
					self.trigger('notSelectItem', eventObj);
				}
			}
			
			function overHandle(e, f){
				var target = $(e.currentTarget),
					index = self._triggerItem.index(target);
				
				self.selectMenu(index, f);
			}
			function leaveHandle(e){
				switchTimer && clearTimeout(switchTimer);
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
		},
		_handleResult: function(val){
			
			var lastReg = /^(\d+)00$/gi,
				isSort = lastReg.test(val),
				firstId = val.substring(0, val.length - 2),
				selectedId = [].concat(this._selectedId),
				selId, ret = [];
						
			if(!isSort) {
				firstId = firstId + '00';
			}
			
			for(var i = 0, len = selectedId.length; i < len; i++){
				if(val != 0){
					selId = isSort ? selectedId[i].substring(0, selectedId[i].length - 2) : selectedId[i];
					
					if(selectedId[i] == 0){
						delete this._selectedObj[this._selectedId[i]];
						this._selectedId.splice(i - ret.length, 1);
						ret.push(selectedId[i]);
						continue;
					}
					if(firstId === selId){
						if(!(isSort && this._selectedObj[val])) {
							delete this._selectedObj[this._selectedId[i - ret.length]];
							this._selectedId.splice(i - ret.length, 1);
						}
						
						ret.push(selectedId[i]);
						if(!isSort){ break; }
					}
				} else {
					delete this._selectedObj[this._selectedId[i - ret.length]];
					this._selectedId.splice(i - ret.length, 1);
					ret.push(selectedId[i]);
				}
			}
			return ret;
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
			this._selectedObj = {};
			this._selectedId = [];
		},
		addSelectedItem: function(val, label){
			if(!this.isSelected(val)){
				if(this.get('maxLength') == 1){
					this.trigger('one');
				}
				if(this.isLimit()){
					return 'limit';
				}
				
				this._selectedObj[val] = label || true;
				this._selectedId.push(val);
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
					return;
				}
			}
		},
		selectMenu: function(index, f){
			this._triggerItem.removeClass(this.get('className'));
			this._triggerItem.eq(index).addClass(this.get('className'));
			this._index = index;
			if(!f){
				this._items.hide();
				this._items.eq(index).show();
			}
		},
		_renderItem: function(target, val, obj, index){
			var self = this,
				model = this.get('model'),
				el;
			
			if(this.get('level')){
				
				target = $(template.elementRows).appendTo(target);
				$(val).each(function(i, val){
					
					val.tag = model ? 'span' : 'a';
					el = $(util.string.replace(template.elementTitle, val)).appendTo(target);
					
					if(obj && obj.renders){
						self._renderSelectedClass(obj.renders, el, obj.index, val);
					}
	
					if(self._selectedObj[val.id]){
						self._selectedObj[val.id] = val.name;
						self.trigger('initItem', {
							label: val.name,
							value: val.id
						});
					}
					
					target = $(template.elementList).appendTo(target).children();
					if(val.sub && util.type.isArray(val.sub)){
						$(val.sub).each(_renderItems);
					}
				});
			} else {
				target = $('<div></div>').appendTo(target);
				if(obj && obj.renders){
					this._renderSelectedClass(obj.renders, target, obj.index, val);
				}
				
				_renderItems(index, val);
			}
			
			function _renderItems(index, value){
				if(self._selectedObj[value.id]){
					self._selectedObj[value.id] = value.name;
					self.trigger('initItem', {
						label: value.name,
						value: value.id
					});
				}
				
				el = $(util.string.replace(template.elementItem, value)).appendTo(target);
				if(obj && obj.renders){
					self._renderSelectedClass(obj.renders, el, obj.index + 1, value);
				}
			}
		},
		_renderItems: function(target, val, obj){
			var self = this,
				id = obj.length;
				
			if(!this.get('level')){
				target = $(template.elementRows).appendTo(target);
				target = $(template.elementList).appendTo(target).children().addClass('simple');
			}
			$(val).each(function(key, val){
				self._renderItem(target, val, {
					renders: obj,
					index: id
				}, key);
			});
		},
		_renderTemplate: function(){
			if(this.get('isAll')){
				this._triggerMenu.append(template.firstItem);
				this.get('element').append(template.elementGroup);
			}
			$(this.get('data')).each(util.bind(this._eachList, this));
			this.trigger('loadComplete');
		},
		_eachList: function(index, val){
			
			var el = $(util.string.replace(template.triggerItem, val)).appendTo(this._triggerMenu);
			this._renderSelectedClass(this._renders[index] = [], el, 0, val);
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
	
	function J(o, n){
		return (n.y - o.y) / (n.x - o.x);
	}
	
	return jobSortMenu;
	
});