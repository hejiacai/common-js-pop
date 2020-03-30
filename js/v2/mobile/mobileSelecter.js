// JavaScript Document

define('mobile.mobileSelecter', 'mobile.mobilePopup, module.dataSource', function(require, exports, module){

	var $ = module['jquery'],
		popup = module['mobile.mobilePopup'],
		dataSource = require('module.dataSource').dataSource,
		util = require('base.util'),
		Class = require('base.class').Class,
		template = {
			list: '<ul></ul>',
			item: '<li data-value="{value}"><a href="javascript:void(0)" title="{label}"><i {itemIconClass}></i>{label}</a></li>'
		},
		cid = 0;
	
	function uid(){
		return ++cid;
	}	
	var mobileSelecter = Class(function(o){
		mobileSelecter.parent().call(this, util.merge({
			idName: 'mobilePopupSelect',
			className: 'mobilePopup',
			trigger: $('#station'),
			target: 'span',
			close: true,
			yesBtn: false,
			isMultiple: false,
			itemName: 'li',
			itemIconClass: 'icon-uniE602',
			dataSource: null,
			selectedIndex: -1,
			selectedValue: null,
			selectClassName: 'cur',
			template: null,
			selectName: 'station',
			background: '#fff'
		}, o));
	}).extend(popup);
	
	mobileSelecter.implement({
		init: function(){
			var trigger = this.get('trigger');
			if(!isDom(trigger)){
				throw new Error('widge.selecter: 找不到目标');
			}
			if(!this.get('template')){
				this.set('template', template.item);
			}
			this.setEnabled(true);
			
			mobileSelecter.parent('init').call(this);
			this._initElement();
			this._initData();
			this._initInput();
			
			if(this.get('selectedValue')){
				this.setSelectedValue(this.get('selectedValue'));
			} else {
				this.setSelectedIndex(this.get('selectedIndex'));
			}
		},
		setEnabled: function(b){
			if(!b){
				this.setSelectedIndex(0);
			}
			this.set('enabled', b);
		},
		_initElement: function(){
			var trigger = this.get('trigger');
			if(this.get('target')){
				this.set('target', trigger.find(this.get('target')));
			}
			
		},
		updateHeader: function(){
			this.set('yesBtn', this.get('isMultiple'));
			mobileSelecter.parent('updateHeader').call(this);
		},
		_initData: function(){
			this.dataSource = new dataSource({
				source: this.get('dataSource')
			});
			this.dataSource.on('data', util.bind(this._renderData, this));
			this.updateData();
		},
		_initInput: function(){
			var trigger = this.get('trigger'),
				name = this.get('selectName') || 'mobileSelectName_' + cid();

			var input = $(
				'<input type="text" id="mobileSelect_' + name +
				'" name="' + name + '" />'
			).css({
				position: 'absolute',
				left: '-99999px',
				zIndex: -100
			}).insertAfter(trigger);
			
			this.set('selectName', input);
		},
		_initEvents: function(){
			var self = this,
				element = this.get('element'),
				itemName = this.get('itemName');
			
			element.on('click', itemName, function(e){
				if(!self.get('enabled')) return;
				var target = $(e.currentTarget);
				var index = self.get('items').index(target);
				self.setSelectedIndex(index, true);
				if(!self.get('isMultiple')){
					self.hide();
				}
			});
			
			this.on('submit', function(e){
				var trigger = self.get('target')[0] ? self.get('target') : self.get('trigger');
				var input = self.get('selectName');
				
				if(e.status){
					e.value = this.get('value') || '';
					e.label = this.get('label') || '';
					e.index = this.get('selectedIndex') || -1;
				}
				
				if(trigger[0].nodeName.toLowerCase() != 'input'){
					trigger.html(e.label);
				} else {
					trigger.val(e.label);
				}
				input.val(e.value);
				
				if(!e.isMultiple){
					this.hide();
					this.trigger('selectSubmit', e);
				}
			});
			
			mobileSelecter.parent('_initEvents').call(this);
		},
		_renderItemClass: function(index){
			var items = this.get('items'),
				isMultiple = this.get('isMultiple'),
				selClass = this.get('selectClassName');
			
			if(!isMultiple){
				items.removeClass(selClass);
			} 
			
			items = items.eq(index);
			if(isMultiple){
				if(items.hasClass(selClass)){
					items.removeClass(selClass);
				} else {
					items.addClass(selClass);
				}
			} else {
				items.addClass(selClass);
			}
			
		},
		setSelectedIndex: function(index, f){
			var items = this.get('items'),
				isMultiple = this.get('isMultiple'),
				len;
				
			if(!items) return;
			if(len = items.length){
				if(index < 0) return;
				var value, label,
					index = range(index, len),
					e = {};
				
				this._renderItemClass(index);
				
				var data = this.getSelectedData();
				
				value = e.value = data.value;
				label = e.label = data.label;
				index = e.index = data.index;
				
				this.set('value', value);
				this.set('label', label);
				this.set('selectedIndex', index);
				
				e.isMultiple = isMultiple;
				this.trigger('submit', e);
				
				f && this.trigger('selected', e);
			}
		},
		setSelectedValue: function(value, f){
			if(!value){ return; }
			var items = this.get('items'),
				i = 0;
			
			for(var len = items.length; i < len; i++){
				if(value == items.eq(i).attr(attr)){
					this.setSelectedIndex(i, f);
					return i;
				} 
			}
			return -1;
		},
		getSelectedData: function(f){
			var items = this.get('items');
			var labels = [];
			var values = [];
			var indexs = [];
			var self = this;
			
			items.filter(function(){
				if($(this).hasClass(self.get('selectClassName'))){
					indexs.push(items.index($(this)));
					labels.push($(this).text());
					values.push($(this).attr('data-value'));
					return true;
				}
				return false;
			});
			return {
				index: indexs.join(','),
				label: labels.join(','),
				value: values.join(',')
			};
		},
		show: function(){
			if(!this.get('enabled')) return;
			mobileSelecter.parent('show').call(this);
		},
		_renderData: function(data){
			this.set('dataSource', data);
			this._renderTemplate();
		},
		updateData: function(){
			if(this.dataSource.get('source')){
				this.dataSource.abort();
				this.dataSource.getData(this.get('value'));
			}
		},
		setData: function(data){
			if(util.type.isArray(data) || util.type.isObject(data)){
				this.dataSource.set('source', data);
				this.dataSource.setData(data);
			}
		},
		_renderTemplate: function(){
			var dataSource = this.get('dataSource'),
				html = '',
				self = this;
			
			if(dataSource){
				$.each(dataSource, function(index, val){
					html += normalizeValue(val, self.get('template'));
				});
			}
			
			this.set('menu', $(template['list']));
			this.get('menu').appendTo(this._body);
			html && this.get('menu').html(html);
			this.set('items', this.get('menu').children());
		},
		updateAllElements: function(){
			var menu = this.get('menu'),
				items = menu.children(this.get('items'));
			
			this.set('items', items);
			this.setSelectedIndex(this.get('selectedIndex'));
		},
		addElement: function( data ){
			var menu = this.get('menu'), html;
				
			html = util.string.replace(this.get('template'), data);
			menu.append(html);
			this.updateAllElements();
		},
		removeElement: function(index){
			var items = this.get('items'),
				selectedIndex = this.get('selectedIndex'),
				len;
				
			if(len = items.length){
				index = range(index, len);
				items = items.eq(index);
				items.remove();
				selectedIndex = selectedIndex <= 0 ? -1 : selectedIndex - 1;
				
				this.set('selectedIndex', selectedIndex);
				this.updateAllElements();
			}
		},
		removeAllElements: function(){
			this.get('menu').empty();
			this.set('selectedIndex', -1);
			this.updateAllElements();
		}
	});
	
	function range(index, length){
		return index <= 0 ? 0 : index >= length ? length - 1 : index;
	}
	function normalizeValue(val, template){
		var f;
		if(util.type.isString(val)){
			f = true;
		} else if(util.type.isObject(val)) {
			f = false;
		} else {
			throw new Error('mobile.mobileSelecter: 数据格式不正确');
		}
		return util.string.replace(template, normalizeItem(val, f));
	}
	function normalizeItem(val, f){
		if(f !== undefined){
			var id = uid();
			return {
				value: f ? val : val.value != undefined ? val.value : id,
				label: f ? val : val.label || id,
				itemIconClass: val ? val.itemIconClass ? ('class=' + val.itemIconClass) : '' : ''
			}
		}
		throw new Error('widge.select: 找不到数据源');
	}
	function isDom(menu){
		return menu && menu.jquery && menu[0];
	}
	
	return mobileSelecter;

});