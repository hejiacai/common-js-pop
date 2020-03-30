// JavaScript Document

define('widge.combobox.comboBoxActions', 
function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		dataValue = "data-value",
		domLabel = "label",
		dataAll = 'data-all',
		dataLabel = 'data-label';
		
	exports.setSelectedIndex = function(index){
		var items = this.get('items'),
			item, len, itemsAll;
		if(!items) return;
		if(len = items.length){
			var selClass = this.get('selectClassName'),
				value, label, oldValue, oldLabel;
				e = {};
				
			if(index < 0) return;

			index = range(index, len);
			itemsAll = e.group = items;
			items = e.target = items.eq(index);
			
			oldValue = e.oldValue = this.get('value') || '';
			oldLabel = e.oldLabel = this.get('label') || '';
			
			e.oldIndex = this.get('selectedIndex');
			
			if(items.children(domLabel).length){
				label = e.label = items.text() || '';
				items = items.children(domLabel);
				e.isAll = items.attr(dataAll) === "true";
				e.isMutil = true;
			} else {
				itemsAll.removeClass(selClass);
				items.addClass(selClass);
				e.isMutil = false;
				label = e.label = items.text() || '';
				item = items;
			}
			this.set('label', label);
			
			value = e.value = items.attr(dataValue) || '';
			this.set('value', value);
			e.oldIndex = this.get('selectedIndex');
			this.set('selectedIndex', e.index = index);
			this.trigger('change', e);
		}
	}
	exports.removeAllElements = function(){
		this.get('menu').empty();
		this.set('selectedIndex', -1);
	}
	exports.mouseenter = function(e){
		$(e.currentTarget).addClass(this.get('hoverClassName'));
	}
	exports.mouseleave = function(e){
		$(e.currentTarget).removeClass(this.get('hoverClassName'));
	}
	exports.updateHandler = function(){
		var self = this,
			menu = this.get('menu'),
			itemName = this.get('itemName');

		menu.off().on('click', itemName, function(e){
			e.preventDefault();
			var index = self.get('items').index($(this));
			self.setSelectedIndex(index);
		}).on('mouseenter mouseleave', itemName, util.bind(function(e){
			e.status = e.type === "mouseenter";
			this[e.type](e);
		}, this));
	}
	function range(index, length){
		return index <= 0 ? 0 : index >= length ? length - 1 : index;
	}
	
});