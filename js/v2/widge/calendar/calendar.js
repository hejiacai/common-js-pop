// JavaScript Document
define('widge.calendar.calendar', 
'widge.calendar.baseCalendar, widge.calendar.dateColumn, widge.calendar.monthColumn, widge.calendar.yearColumn, tools.dateFormat', 
function(require, exports, module){
	var $ = module['jquery'],
		dateFormat = module['tools.dateFormat'],
		baseCalendar = require('widge.calendar.baseCalendar').baseCalendar,
		dateColumn = require('widge.calendar.dateColumn').dateColumn,
		monthColumn = require('widge.calendar.monthColumn').monthColumn,
		yearColumn = require('widge.calendar.yearColumn').yearColumn,
		Class = require('base.class').Class,
		util = require('base.util'),
		template = [
			'<div class="ui-calendar">',
			'<div class="ui-calendar-pannel">',
			'<span class="ui-calendar-control" data-name="prev-year">&lt;&lt;</span>',
			'<span class="ui-calendar-control" data-name="prev-month">&lt;</span>',
			'<span class="ui-calendar-control ui-calendar-control-month" data-name="current-month"></span>',
			'<span class="ui-calendar-control ui-calendar-control-year" data-name="current-year"></span>',
			'<span class="ui-calendar-control ui-calendar-control-right" data-name="next-month">&gt;</span>',
			'<span class="ui-calendar-control ui-calendar-control-right" data-name="next-year">&gt;&gt;</span>',
			'</div>',
			'<div class="ui-calendar-container" data-name="container">',
			'</div>',
			'</div>'
		].join(''),
		controlTemplate = [
			'<div class="ui-calendar-footer">',
			'<span class="ui-calendar-button current" data-name="current-date">{currentDateName}</span>',
			'<span class="ui-calendar-button" data-name="clear-date">{clearDateName}</span>',
			'</div>'
		].join(''),
		targetName = [
			'[data-name=current-month]',
			'[data-name=current-year]',
			'[data-name=prev-year]',
			'[data-name=next-year]',
			'[data-name=prev-month]',
			'[data-name=next-month]'
		].join(','),
		controlName = [
			'[data-name=current-date]',
			'[data-name=clear-date]'
		].join(',');
	
	var calendar = Class(function(o){
		calendar.parent().call(this, util.merge({
			mode: 'dates',
			template: template,
			isFooter: true
		}, o));
	}).extend(baseCalendar);
	
	calendar.implement({
		init: function(){
			calendar.parent('init').call(this);
			this._renderPanel();
			this._initEvents();
			
			var attrs = {
				lang: this.get('lang'),
				focus: this._focus,
				range: this.setRange(this.get('range')),
				format: this.get('format'),
				startDay: this.get('startDay'),
				process: this.get('process')
			}
			
			this.dates = new dateColumn(attrs);
			this.months = new monthColumn(attrs);
			this.years = new yearColumn(attrs);
			
			var self = this;
			this.dates.on('select', function(e){
				var value = e.data;
				self.setFocus(value);
				var focus = self._focus;
				self.months.select(focus);
				self.years.select(focus);
				if(e.target){
					if(dateFormat.isDate(value)){
						value = value.toString(this.get('format'));
					}
					self.output(value);
					e.value = value;
					self.trigger('selectDate', e);
				}
			});
			
			this.months.on('select', function(e){
				var focus = self._focus,
					value = e.data;

				focus = focus.setMonth(value);
				self.setFocus(focus);
				
				self._renderPanel();
				if (e.target) {
					self.renderContainer('dates', focus);
					self.trigger('selectMonth', e);
				}
			});
			
			this.years.on('select', function(e){
				var focus = self._focus,
					value = e.data;
				
				focus = focus.setYear(value);
				self.setFocus(focus);
				
				self._renderPanel();
				if(e.target && e.target.attr('data-name') === 'year'){
					self.renderContainer('dates', focus);
					self.trigger('selectYear', e);
				}
			});
			
			var container = this.element.find('[data-name=container]');
			container.append(this.dates.element);
			container.append(this.months.element);
			container.append(this.years.element);
			if(this.get('isFooter')){
				this._timeElement = $(util.string.replace(controlTemplate, this.get('lang'))).appendTo(this.element);
			}
			
			this.renderContainer('dates');
		},
		_initEvents: function(){
			var element = this.element,
				self = this;
			
			if(this.get('isFooter')){
				targetName += ',' + controlName;
			}
			
			element.on('click', targetName, function(e){
				
				var target = $(e.target),
					mode = self.get('mode'),
					dataName = target.attr('data-name');
				e.data = this._focus;
					
				switch(dataName){
					case 'current-month':
						if(!self.trigger(dataName, e)){
							if(mode === 'months'){
								self.renderContainer('dates');
							} else {
								self.renderContainer('months');
							}
						}
						break;
					case 'current-year':
						if(!self.trigger(dataName, e)){
							if(mode === 'years'){
								self.renderContainer('dates');
							} else {
								self.renderContainer('years');
							}
						}
						break;
					case 'prev-year':
							var focus = self.years.prev();
							self.dates.select(focus);
							self.months.select(focus);
						break;
					case 'next-year':
						var focus = self.years.next();
						self.dates.select(focus);
						self.months.select(focus);
						break;
					case 'prev-month':
						var focus = self.months.prev();
						self.dates.select(focus);
						self.years.select(focus);
						break;
					case 'next-month':
						var focus = self.months.next();
						self.dates.select(focus);
						self.years.select(focus);
						break;
					case 'current-date':
						self.resetFocus();
						self.output();
						self.trigger('selectCurrentDate', e);
						break;
					case 'clear-date':
						self.resetFocus();
						self.output('');
						self.trigger('clearDate', e);
						break;
				}
			});
		},
		resetFocus: function(){
			var focus = this.setFocus();
			this._renderPanel();
			this.renderContainer('dates', focus);
		},
		renderContainer: function(mode, focus){
			this.set('mode', mode);
			
			focus = focus || this._focus;
			this.dates.hide();
			this.months.hide();
			this.years.hide();
			this.dates.select(focus, null);
			this.months.select(focus, null);
			this.years.select(focus, null);
			
			if(mode === 'dates'){
				this.dates.element.show();
			} else if(mode === 'months'){
				this.months.element.show();
			} else if(mode === 'years'){
				this.years.element.show();
			}
			
			return this;
		},
		_renderPanel: function(){
			var focus = this._focus,
				element = this.element,
				monthPanel = element.find('[data-name=current-month]'),
				yearPanel = element.find('[data-name=current-year]');
			
			var MONTHS = [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
				'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			];
			
			var month = MONTHS[focus.getMonth()];
			month = this.get('lang')[month] || month;
			
			monthPanel.text(month);
			yearPanel.text(focus.getYear());
		},
		focus: function(date){
			date = dateFormat.isDate(date) ? date : new dateFormat(date);
			this.dates.focus(date);
			this.months.focus(date);
			this.years.focus(date);
		},
		range: function(range){
			this.setRange(range);
			this.dates.setRange(range);
			this.months.setRange(range);
			this.years.setRange(range);
			this.renderContainer(this.get('mode'));
			this._renderPanel();
		},
		show: function(){
			var value = this._outputTime();
			if(value){
				this.dates.select(value);
			}
			calendar.parent('show').call(this);
		},
		destory: function(){
			this.dates.destory();
			this.months.destory();
			this.years.destory();

			this.element.remove();
			calendar.parent('destory').call(this);
		}
	});
	
	calendar.baseCalendar = baseCalendar;
	calendar.dateColumn = dateColumn;
	calendar.monthColumn = monthColumn;
	calendar.yearColumn = yearColumn;
	
	return calendar;
});
	