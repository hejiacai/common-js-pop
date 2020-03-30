// JavaScript Document

define('widge.multipleSelect', 
'widge.select, widge.checkBoxer', 
function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		select = module['widge.select'],
		checkBoxer = module['widge.checkBoxer'],
		clearBtnName = '.clearBtn',
		template = {
			list: '<ul></ul>',
			item: '<li><a data-name="{name}" data-value="{value}" href="javascript:" ><em></em>{label}</a></li>',
			header: '<div><a class="clearBtn" href="javascript:">清除所选</a></div>'
		},
		delay = 70;
		
	var multipleSelect = Class(function(o){
		multipleSelect.parent().call(this, util.merge({
			trigger: $('#select'),
			target: 'label',
			menu: 'ul',
			selectName: null,
			template: template.item,
			checkedClassName: 'checked',
			defaultText: null,
			maxLength: 3,
			isClear: true
		}, o));
	}).extend(select);
	
	multipleSelect.implement({
		_renderTemplate: function(){
			if(this._checkBoxer){
				this._checkBoxer.destory();
				this._checkBoxer = null;
			}
			if(this.get('isClear')){
				if(this._clearAllBox){
					this._clearAllBox.remove();
				}
				this._clearAllBox = $(template.header).prependTo(this.get('element'));
			}
			if(!this._isInit){
				this.clearText();
			}
			multipleSelect.parent('_renderTemplate').call(this);
			this._checkBoxer = new checkBoxer({
				element: this.get('items'),
				className : this.get('checkedClassName'),
				maxLength: this.get('maxLength')
			});
			this._defaultText = this.get('defaultText') || '请选择';
			var self = this;
			this._checkBoxer.on('select', function(e){
				self.setSelectedIndex(e.index, e.status);
			});
			this._checkBoxer.on('maxLimit', function(e){
				self.trigger('maxLimit', e);
			});
			this._updateScroll();
		},
		getCheckBoxer: function(){
			return this._checkBoxer;
		},
		_createItems: function(){
			this.set('items', this.get('menu').find('a'));
			this.set('itemName', getNodeName(this.get('items')));
		},
		destory: function(){
			if(this._checkBoxer){
				this._checkBoxer.destory();
			}
			multipleSelect.parent('destory').call(this);
		},
		clearText: function(){
			var trigger = this.get('target')[0] ? this.get('target') : this.get('trigger');
			trigger.html(this._defaultText);
			this.get('selectName').val('');
			this._changeColor();
		},
		clearAll: function(){
			var e = {};

			this._checkBoxer.all(false);
			e.label = this._defaultText;
			e.status = false;
			this.get('items').removeClass(this.get('selectClassName'));
			this.clearText();
			this.set('selectedIndex', e.index = -1);
			this.trigger('change', e);
		},
		setSelectedIndex: function(index, status, isEvent){
			var items = this.get('items'),
				input, len;
			if(!items) return;
			if(len = items.length){
				if(index < 0) return;
				var selClass = this.get('selectClassName'),
					trigger = this.get('target')[0] ? this.get('target') : this.get('trigger'),
					index = range(index, len);
					e = {};
				items.removeClass(selClass);
				items = items.eq(index);
				if(input = this.get('selectName')){
					var values = this._checkBoxer.getValue(true),
						joinName = "";
					for(var key in values){
						joinName += values[key] + ',';
					}
					joinName = joinName.substring(0, joinName.length - 1);
					input.val(joinName);
					e.value = joinName;
				}
				e.label = this._checkBoxer.getLabel() || this._defaultText;
				trigger.html(e.label);
				e.status = status;
				this.set('selectedIndex', e.index = index);
				items.addClass(selClass);
				this._changeColor();
				!isEvent && this.trigger('change', e);
			}
		},
		addElement: function( data ){
			if(!this.get('items').length && this.get('isClear')){
				$(template.header).prependTo(this.get('element'));
			}
			multipleSelect.parent('addElement').call(this, data);
		},
		removeElement: function(index){
			var len = this.get('items').length;
			multipleSelect.parent('removeElement').call(this, index);
			if(!len){
				this.removeAllElements();
			}
		},
		removeAllElements: function(){
			var trigger = this.get('target')[0] ? this.get('target') : this.get('trigger');
			this.get('element').empty();
			this.set('menu', null);
			trigger.html(this._defaultText);
			this.get('selectName').val('');
			if(this._checkBoxer){
				this._checkBoxer.destory();
				this._checkBoxer = null;
			}
			this._changeColor();
			this.set('selectedIndex', -1);
		},
		_changeColor: function(){
			var sc = this.get('selectCallback');
			if(util.type.isObject(sc)){
				var target = this.get('target');
				if(this._checkBoxer && this._checkBoxer.getLength()){
					sc.lightColor && target.css('color', sc.lightColor);
				} else {
					sc.defaultColor && target.css('color', sc.defaultColor);
				}
			}
		},
		_initEvents: function(){
			var self = this,
				trigger = this.get('trigger'),
				element = this.get('element'),
				itemName = this.get('itemName');
				
			trigger.on('click', function(){
				if(!self.get('menu') || !self.get('items') || !self.get('items').length)
					return;
				util.bind(self.toggle, self)();
			});
			this.get('element').on('click', clearBtnName, function(){
				self.clearAll();
			});
			this._blurHide(trigger);
			this.on('change:visible', util.bind(this._onChangeVisible, this));
			
			function enterHandler(e){
				self.get('visible') && hideTimer && clearTimeout(hideTimer);
			}
			function leaveHandler(e){
				if(self.get('visible')){
					hideTimer && clearTimeout(hideTimer);
					hideTimer = setTimeout(function(){
						self.hide();
					}, delay);
				}
			}
		}
	});
	
	function range(index, length){
		return index <= 0 ? 0 : index >= length ? length - 1 : index;
	}
	function isClick(type){
		return type === 'click';
	}
	function getNodeName(node){
		return node[0] && node[0].nodeName.toLowerCase();
	}
	
	return multipleSelect;
});