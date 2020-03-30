// JavaScript Document
define('widge.calendar.monthColumn', 'widge.calendar.baseColumn, tools.dateFormat', function(require, exports, module){

	var $ = module['jquery'],
		Class = require('base.class').Class,
		baseColumn = require('widge.calendar.baseColumn').baseColumn,
		dateFormat = module['tools.dateFormat'],
		util = require('base.util');
	
	var monthColumn = Class(function(o){
		monthColumn.parent().call(this, util.merge({
			template: template,
			process: null
		}, o));
		this.init();
	}).extend(baseColumn);
	
	monthColumn.implement({
		init: function(){
			this._renderElement();
			this.initEvent();
		},
		initEvent: function(){
			var self = this;
			this.element.on('click', '[data-name=month]', function(e){
				var el = $(e.currentTarget),
					value = el.attr('data-value');
				self.select(value, el);
			});
			this.after('setRange', function(){
				this.element.html($(this._compileTemplate()).html());
			});
		},
		prev: function(){
			var focus = this._focus.minusMonth(1);
			return this._sync(focus);
		},
		next: function(){
			var focus = this._focus.plusMonth(1);
			return this._sync(focus);
		},
		select: function(value, el){
			
			if(el && el.hasClass('disabled-element')){
				this.trigger('selectDisable', {data: value, target: el});
				return value;
			}

			var focus;
			if(value.getMonth){
				focus = value;
			} else {
				focus = this._focus.setMonth(value);
			}
			return this._sync(focus, el); 
		},
		focus: function(focus){
			focus = focus || this._focus;
			var selector = '[data-value=' + focus.getMonth() + ']';
			this.element.find('.focused-element').removeClass('focused-element');
			this.element.find(selector).addClass('focused-element');
		},
		refresh: function(){
			var focus = this._focus.getYear(),
				year = this.element.find('[data-year]').attr('data-year');

			if(parseInt(year, 10) !== focus){
				this.element.html($(this._compileTemplate()).html());
			}
		},
		getModel: function(){
			return createMonthModel(this._focus, this.get('process'), this);
		},
		inRange: function(date){
			var range = this._range;
			if(date.getMonth){
				return isInRange(date, range);
			}
			
			if(date.toString().length < 3){
				var time = this._focus;
				return isInRange(time.clone().setMonth(date), range);
			}
			return isInRange(new dateFormat(date), range);
		},
		_sync: function(focus, el){
			this.setFocus(focus);
			this.refresh();
			this.focus(focus);
			if(el !== null){
				this.trigger('select', {data: focus.getMonth(), target: el, date: focus});
			}
			return focus;
		}
	});
	
	var MONTHS = [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
			'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
		];
	function createMonthModel(time, fn, ctx){
		var month = time.getMonth(),
			items = [];
		
		for(var i = 0; i < MONTHS.length; i++){
			var item = {
				value: i,
				available: ctx.inRange.call(ctx, i),
				label: MONTHS[i]
			};
			if(fn){
				item.type = 'month';
				item = fn(item);
			}
			items.push(item);
		}
		
		var current = {
			year: time.getYear(),
			value: month,
			label: MONTHS[month]
		}
		
		var list = [];
		for(var i = 0; i < items.length / 3; i++){
			list.push(items.slice(i * 3, i * 3 + 3));
		}
		return {current: current, items: list}
	}
	function isInRange(d, range){
		if(range == null){
			return true;
		}
		if(util.type.isArray(range)){
			var start = range[0],
				end = range[1],
				result = true;
			
			if(start && start.getMonth){
				var lastDate = d.clone().setDate(d.plusMonth(1).setDate(0).getDate());
				lastDate = lastDate.getEnd('dd');
				result = result && lastDate >= start;
			}/*else if(start){
				result = result && (d.getMonth() + 1) >= start;
			}*/
			if(end && end.getMonth){
				var firstDate = d.clone().setDate(1);
				firstDate = firstDate.getBegin('dd');
				result = result && firstDate <= end;
			}/* else if(end){
				result = result && (d.getMonth() + 1) <= end;
			}*/
			return result;
		} else if(util.type.isFunction(range)){
			return range(d);
		}
		return true;
	}
	
	function template(model, options){
		
		var lang = options.helpers.lang,
			html = '<table class="ui-calendar-month" data-name="month-column">';
			
		$.each(model.items, function(i, items) {
			html += '<tr class="ui-calendar-month-column" data-year="' + model.current.year + '">';
			$.each(items, function(i, item){
				html += '<td data-name="month"';
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
	
	exports.monthColumn = monthColumn;
});
	