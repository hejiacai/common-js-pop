// JavaScript Document
define('widge.calendar.dateColumn', 'widge.calendar.baseColumn, tools.dateFormat', function(require, exports, module){

	var $ = module['jquery'],
		Class = require('base.class').Class,
		baseColumn = require('widge.calendar.baseColumn').baseColumn,
		dateFormat = module['tools.dateFormat'],
		util = require('base.util');
	
	var dateColumn = Class(function(o){
		dateColumn.parent().call(this, util.merge({
			startDay: 'Sun',
			template: template,
			process: null
		}, o));
		this.init();
	}).extend(baseColumn);
	
	dateColumn.implement({
		init: function(){
			this.setRange(this.get('range'));
			this._renderElement();
			this.initEvent();
		},
		initEvent: function(){
			var self = this;
			this.element.on('click', '[data-name=date]', function(e){
				var el = $(e.currentTarget),
					value = el.attr('data-value');
				self.select(value, el);
			});
		},
		setRange: function(val){
			if(util.type.isArray(val)){
				var format = this.get('format'),
					range = [],
					self = this;
				$.each(val,  function(i, date){
					date = date === null ? null : util.type.isString(date) || util.type.isDate(date) ? new dateFormat(date) : date;
					range.push(date);
				});
				return this._range = range;
			}
			return this._range = val;
		},
		prev: function(){
			var prev = this._focus.toString(this.get('format')),
				focus = this._focus.minusDate(1);
			return this._sync(focus, prev);
		},
		next: function(){
			var prev = this._focus.toString(this.get('format')),
				focus = this._focus.plusDate(1);
			return this._sync(focus, prev);
		},
		select: function(value, el, type){
			if(el && el.hasClass('disabled-element')){
				this.trigger('selectDisable', {data: value, target: el});
				return value;
			}
			var prev = this._focus.toString(this.get('format'));
			this.setFocus(value);
			//fix bug
			return this._sync(value, prev, el);
		},
		focus: function(focus){
			focus = focus || this._focus;
			var selector = '[data-value=' + focus.toString(this.get('format')) + ']';
			
			this.element.find('.focused-element').removeClass('focused-element');
			this.element.find(selector).addClass('focused-element');
		},
		getModel: function(){
			var date = createDateModel(
				this._focus,
				this.get('startDay'),
				this._range,
				this.get('process'),
				this.get('format')
			);
			var day = createDayModel(this.get('startDay'));
			return {date: date, day: day};
		},
		inRange: function(date){
			if(!dateFormat.isDate(date)){
				date = new dateFormat(date);
			}
			return baseColumn.isInRange(date, this._range);
		},
		_sync: function(focus, prev, el){
			this.setFocus(focus);
			if(focus.toString('yyyy-MM') !== prev){
				this.refresh();
			}
			this.focus(focus);
			if(el !== null){
				this.trigger('select', {data: focus, target: el, date: focus});
			}
			return focus;
		}
	});
	
	var DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		DAYS = [
			'sunday', 'monday', 'tuesday', 'wednesday',
			'thursday', 'friday', 'saturday'
		];
	
	function parseStartDay(startDay) {
		startDay = (startDay || 0).toString().toLowerCase();
		if ($.isNumeric(startDay)) {
			startDay = parseInt(startDay, 10);
			return startDay;
		}
		
		for (var i = 0; i < DAYS.length; i++) {
			if (DAYS[i].indexOf(startDay) === 0) {
				startDay = i;
				break;
			}
		}
		return startDay;
	}
	function createDayModel(startDay){
		startDay = parseStartDay(startDay);
		var items = [];
		for (var i = startDay; i < 7; i++) {
			items.push({label: DAY_LABELS[i], value: i});
		}
		for (i = 0; i < startDay; i++) {
			items.push({label: DAY_LABELS[i], value: i});
		}
		
		var current = {
			value: startDay,
			label: DAY_LABELS[startDay]
		};
		return {current: current, items: items};
	}
	function createDateModel(current, startDay, range, fn, format){
		var items = [], delta, d, daysInMonth;
		startDay = parseStartDay(startDay);
		
		var pushData = function(d, className){
			var item = {
				value: d.toString(format),
				label: d.getDate(),
				day: d.getDay(),
				className: className,
				available: baseColumn.isInRange(d, range, true)
			};
			if(fn){
				item.type = 'date';
				item = fn(item);
			}
			items.push(item);
		}
		
		var currentMonth = current.clone().setDate(1),
			previousMonth = currentMonth.minusMonth(1),
			nextMonth = currentMonth.plusMonth(1);
		
		delta = currentMonth.getDay() - startDay;
		
		if(delta < 0) delta += 7;
		if(delta != 0){
			daysInMonth = previousMonth.plusMonth(1).setDate(0).getDate();
			for (var i = delta - 1; i >= 0; i--) {
				d = previousMonth.setDate(daysInMonth - i);
				pushData(d, 'previous-month');
			}
		}
		daysInMonth = currentMonth.plusMonth(1).setDate(0).getDate();
		for(var i = 1; i <= daysInMonth; i++){
			d = currentMonth.setDate(i);
			pushData(d, 'current-month');
		}
		
		delta = 35 - items.length;
		if(delta != 0){
			if(delta < 0) delta += 7;
			for(i = 1; i <= delta; i++){
				d = nextMonth.setDate(i);
				pushData(d, 'next-month');
			}
		}
		var list = [];
		for(var i = 0; i < items.length / 7; i++){
			list.push(items.slice(i * 7, i * 7 + 7));
		}
		
		var _current = {
			value: current.toString(format),
			label: current.getDate()
		};
		
		return {current: _current, items: list};
	}
	
	function template(model, options){
		var lang = options.helpers.lang,
			html = '<table class="ui-calendar-date" data-name="column">';
			
		html += '<tr class="ui-calendar-day-column">';
		$.each(model.day.items, function(i, item) {
			html += '<th class="ui-calendar-day ui-calendar-day-' + item.value + '" ';
			html += 'data-name="day" data-value="' + item.value + '">';
			html += lang(item.label);
			html += '</th>';
		});
		html += '</tr>';
		
		$.each(model.date.items, function(i, items){
			
			html += '<tr class="ui-calendar-date-column">';
			$.each(items, function(i, item){
				var className = [
					'ui-calendar-day-' + item.day,
					item.className || ''
				];
				if(!item.available){
					className.push('disabled-element');
				}
				html += '<td data-name="date" class="' + className.join(' ') + ' "';
				html += 'data-value = "' + item.value + '">';
				html += item.label + '</td>';
			});
			html += '</tr>';
			
		});
		
		html += '</table>';
		return html;
		
	}
	
	exports.dateColumn = dateColumn;
});
	