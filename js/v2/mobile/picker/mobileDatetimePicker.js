// JavaScript Document

define('mobile.picker.mobileDatetimePicker', 'mobile.picker.mobilePicker', function(require, exports, module){

	var $ = module['jquery'],
		mobilePicker = module['mobile.picker.mobilePicker'],
		util = require('base.util'),
		Class = require('base.class').Class;
	
	var today = new Date();
	var initDays = function(max){
		var days = [];
		for(var i=1; i<= (max || 31);i++){
			days.push(i < 10 ? '0' + i : i);
		}
		return days;
	};
	
	var getDaysMonthAndYear = function(month, year){
		var int_d = new Date(year, parseInt(month) + 1 - 1, 1);
		var d = new Date(int_d - 1);
		return initDays(d.getDate());
	}
	var formatNumber = function(n){
		if(!n){
			return '';
		}
		return n < 10 ? '0' + n : n;
	}
	var initMonthes = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ');
	var initYears = function(startYears, endYears){
		var arr = [];
		for(var i = startYears; i <= endYears; i++){
			arr.push(i);
		}
		return arr;
	}
	var initHours = function(){
		var arr = [];
		for(var i = 0; i <= 23; i++){
			arr.push(i < 10 ? '0' + i : i);
		}
		return arr;
	}
	var initMinutes = function(){
		var arr = [];
		for(var i = 0; i <= 59; i++){
			arr.push(i < 10 ? '0' + i : i);
		}
		return arr;
	}
	
	var mobileDatetimePicker = Class(function(o){
		mobileDatetimePicker.parent().call(this, util.merge({
			selectedValue: [
				today.getFullYear(), 
				today.getMonth()+1, 
				today.getDate(), 
				today.getHours(), 
				today.getMinutes()
			],
			startYears: 1950,
			endYears: 2030,
			dateModal: 0,
			formatValue: function(values){
				var dateModal = this.get('dateModal');


				switch(dateModal){
					case 0:
						return values[0] + '-' + values[1] + '-' + values[2] + ' ' + values[3] + ':' + values[4];		
					case 1:
						return values[0] + '-' + values[1] + '-' + values[2];
					case 2:
						return values[0] + '-' + values[1];
					case 3:
						return values[0];
					default: 
						return values[0] + ':' + values[1];
				}
			},
			hasMask: true
		}, o));
	}).extend(mobilePicker);
	
	mobileDatetimePicker.implement({
		_initData: function(){
			var startYears = this.get('startYears');
			var endYears = this.get('endYears');
			
			if(startYears >= endYears){
				throw new Error('mobileDatetimePicker: 开始日期不能大于或等于结束日期');
			}
			
			var getYears = initYears(this.get('startYears'), this.get('endYears'));
			var getDays = initDays();
			var getHours = initHours();
			var getMinutes = initMinutes();
			
			var dateModal = this.get('dateModal');
			var value = this.get('selectedValue');
			var dataSource, dateValue;
			
			if(dateModal == 0){
				dataSource = [
					getYears, 
					{divider: true, content: '年'}, 
					initMonthes, 
					{divider: true, content: '月'},
					getDays,
					{divider: true, content: '日'},
					getHours, 
					{divider: true, content: ':'},
					getMinutes
				];
				dateValue = value ? [
					value[0], 
					formatNumber(value[1]), 
					formatNumber(value[2]), 
					formatNumber(value[3]), formatNumber(value[4])
				] : undefined;
			} else if(dateModal == 1){
				dataSource = [
					getYears, 
					{divider: true, content: '年'},
					initMonthes, 
					{divider: true, content: '月'},
					getDays,
					{divider: true, content: '日'},
				];
				dateValue = value ? [value[0], formatNumber(value[1]), formatNumber(value[2])] : undefined;
			} else if(dateModal == 2){
				dataSource = [
					getYears, 
					{divider: true, content: '年'},
					initMonthes,
					{divider: true, content: '月'}
				];
				dateValue = value ? [value[0], formatNumber(value[1])] : undefined;
			} else if(dateModal == 3){
				dataSource = [
					getYears, 
					{divider: true, content: '年'},
					initMonthes,
					{divider: true, content: '月'}
				];
				dateValue = value ? value[0] : undefined;
			} else {
				dataSource = [
					getHours, 
					{divider: true, content: ':'},
					getMinutes
				];
				dateValue = value ? [formatNumber(value[3]), formatNumber(value[4])] : undefined;
			}
			
			this.set('dataSource', dataSource);
			this.set('selectedValue', dateValue);
			
			mobileDatetimePicker.parent('_initData').call(this);
		},
		_initEvents: function(){
			mobileDatetimePicker.parent('_initEvents').call(this);
			var self = this;
			this.on('change', function(e){
				if(self.get('dateModal') >= 2) return;
				
				var days = getDaysMonthAndYear(self._cols[1].value, self._cols[0].value);
				var currentValue = self._cols[2].value;
				if(currentValue > days.length) {
					currentValue = days.length;
				}
				self._cols[2].setValue(currentValue);
			});
		}
	});
	
	return mobileDatetimePicker;
	
});