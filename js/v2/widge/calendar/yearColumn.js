// JavaScript Document
define('widge.calendar.yearColumn', 'widge.calendar.baseColumn, tools.dateFormat', function(require, exports, module){

	var $ = module['jquery'],
		Class = require('base.class').Class,
		baseColumn = require('widge.calendar.baseColumn').baseColumn,
		dateFormat = module['tools.dateFormat'],
		util = require('base.util');
	
	var yearColumn = Class(function(o){
			yearColumn.parent().call(this, util.merge({
				template: template,
				process: null
			}, o));
			this.init();
		}).extend(baseColumn),
		targetName = [
			'[data-name=year]',
			'[data-name=previous-10-year]',
			'[data-name=next-10-year]'
		].join(',');
	
	yearColumn.implement({
		init: function(){
			this._renderElement();
			this.initEvent();
		},
		initEvent: function(){
			var self = this;
			this.element.on('click', targetName, function(e){
				var el = $(e.currentTarget),
					value = el.attr('data-value');
				self.select(value, el);
			});
			this.after('setRange', function(){
				this.element.html($(this._compileTemplate()).html());
			});
		},
		prev: function(){
			var focus = this._focus.minusYear(1);
			return this._sync(focus);
		},
		next: function(){
			var focus = this._focus.plusYear(1);
			return this._sync(focus);
		},
		select: function(value, el){
			if(el && el.hasClass('disabled-element')){
				this.trigger('selectDisable', {data: value, target: el});
				return value;
			}
			var focus;
			if(value.getYear){
				focus = value;
			} else {
				focus = this._focus.setYear(value);
			}
			return this._sync(focus, el); 
		},
		focus: function(focus){
			focus = focus || this._focus;
			var selector = '[data-value=' + focus.getYear() + ']';
			this.element.find('.focused-element').removeClass('focused-element');
			this.element.find(selector).addClass('focused-element');
		},
		refresh: function(){
			var focus = this._focus.getYear(),
				years = this.element.find('[data-name=year]');
			
			if(focus < years.first().attr('data-value') || focus > years.last().attr('data-value')){
				this.element.html($(this._compileTemplate()).html());
			}
		},
		getModel: function(){
			return createYearModel(this._focus, this._range, this.get('process'));
		},
		inRange: function(date){
			return isInRange(date, this._range);
		},
		_sync: function(focus, el){
			this.setFocus(focus);
			this.refresh();
			this.focus(focus);
			if(el !== null){
				this.trigger('select', {data: focus.getYear(), target: el, date: focus});
			}
			return focus;
		}
	});
	
	function createYearModel(time, range, fn){
		var year = time.getYear(),
			items = [process({
				value: year - 10,
				label: '. . .',
				available: true,
				name: 'previous-10-year'
			}, fn)];
		
		for(var i = year - 6; i < year + 4; i++){
			items.push(process({
				value: i,
				label: i,
				available: isInRange(i, range),
				name: 'year'
			}, fn));
		}
		
		items.push(process({
			value: year + 10,
			label: '. . .',
			available: true,
			name: 'next-10-year'
		}, fn));
		
		var list = [];
		for(var i = 0; i < items.length / 3; i++){
			list.push(items.slice(i * 3, i * 3 + 3));
		}
		
		var current = {value: year, label: year};
		return {current: current, items: list}
	}
	
	function process(item, fn){
		if(!fn){
			return item;
		}
		item.type = 'year';
		return fn(item);
	}
	
	function isInRange(date, range){
		if(range == null){
			return true;
		}
		if(util.type.isArray(range)){
			var start = range[0];
			if(start && start.getYear){
				start = start.getYear();
			}
			var end = range[1];
			if(end && end.getYear){
				end = end.getYear();
			}
			
			var result = true;
			if(start){
				result = result && date >= start;
			}
			if(end){
				result = result && date <= end;
			}
			return result;
		} else if(util.type.isFunction(range)){
			return range(date);
		}
		
		return true;
	}
	
	function template(model, options){
		
		var lang = options.helpers.lang,
			html = '<table class="ui-calendar-year" data-name="year-column">';
			
		$.each(model.items, function(i, items) {
			html += '<tr class="ui-calendar-year-column">';
			$.each(items, function(i, item){
				html += '<td data-name="' + item.name + '"';
				if(!item.available){
					html += 'class="disabled-element"';
				}
				html += 'data-value="' + item.value + '">';
				html += lang(item.label) + '</td>';
			});
			html += '</tr>';
		});
		html += '</table>';
		return html;
	}
	
	exports.yearColumn = yearColumn;
});
	