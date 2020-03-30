// JavaScript Document

define('mobile.picker.mobileRangePicker', 'mobile.picker.mobilePicker', function(require, exports, module){

	var $ = module['jquery'],
		mobilePicker = module['mobile.picker.mobilePicker'],
		util = require('base.util'),
		Class = require('base.class').Class;
	
	var today = new Date();
	var initMonthes = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ');
	var initYears = function(startYears, endYears){
		var arr = [];
		for(var i = startYears; i <= endYears; i++){
			arr.push(i);
		}
		return arr;
	}
	var formatNumber = function(n){
		if(!n){
			return '';
		}
		return n < 10 ? '0' + n : n;
	}
	
	var mobileRangePicker = Class(function(o){
		mobileRangePicker.parent().call(this, util.merge({
			modal: 0,
			startYears: 1950,
			endYears: 2030,
			formatValue: function(values, f){
				var modal = this.get('modal');
				switch(modal){
					case 0:
						return values[0] + '-' + values[1] + (f ? ' ' : ' 至 ') + values[2] + '-' + values[3];		
					case 1:
					default:
						return values[0] + ' ~ ' + values[1];
				}
			}
		}, o));
	}).extend(mobilePicker);
	
	mobileRangePicker.implement({
		_isCompareValue: function(){
			var values = this.get('selectedValue');
			var startDates, endDates,
				modal = this.get('modal');
				
			if(modal == 0){
				startDates = new Date(parseInt(values[0]), parseInt(values[1]) - 1, 1);
				endDates = new Date(parseInt(values[2]), parseInt(values[3]) - 1, 1);
			} else if(modal == 1){
				startDates = new Date(parseInt(values[0]), 1, 1);
				endDates = new Date(parseInt(values[1]), 1, 1);
			}
			
			return modal <= 1 ? startDates.getTime() >= endDates.getTime() : values[0] >= values[1];
		},
		_normalizeDateValue: function(){
			var values = this.get('selectedValue'),
				modal = this.get('modal'),
				startNum = parseInt(this.get('startYears')),
				endNum = parseInt(this.get('endYears')),
				startDates, endDates,
				results = [];
			
			if(!values){
				values = modal ? [startNum, endNum] : [startNum, 0, endNum, 0];
			}
			startDates = parseInt(values[0]);
			
			if(!(endDates = parseInt(modal ? values[1] : values[2])) || isNaN(endDates)){
				endDates = endNum;
			}
			if(!startDates || isNaN(startDates)){
				startDates = startNum;
			}
			
			if(startDates < startNum || startDates > endNum){
				startDates = startNum;
			}
			if(endDates > endNum || endDates < startNum){
				endDates = endNum;
			}
			
			if(modal <= 1){
				if(modal == 0){
					startDates = new Date(startDates, (parseInt(values[1]) || 1) - 1, 1);
					endDates = new Date(endDates, (parseInt(values[3]) || 1) - 1, 1);
				} else {
					startDates = new Date(startDates, 0, 1);
					endDates = new Date(endDates, 0, 1);
				}
				
				if(startDates.getTime() == endDates.getTime()){
					if(endDates.getFullYear() <= startNum){
						endDates = new Date(startDates.getFullYear() + 1, endDates.getMonth(), 1);
					} else {
						startDates = new Date(endDates.getFullYear() - 1, startDates.getMonth(), 1);
					}
				} else if(startDates.getTime() > endDates.getTime()){
					startDates = new Date(endDates.getFullYear() - 1, startDates.getMonth(), 1);
				}
			} else {
				if(startDates == endDates){
					if(endDates <= parseInt(startNum)){
						endDates = startDates + 1;
					} else {
						startDates = endDates - 1;
					}
				} else if(startDates > endDates){
					startDates = endDates - 1;
				}
			}
			
			if(modal == 0){
				results = [
					startDates.getFullYear(), formatNumber(startDates.getMonth() + 1), 
					endDates.getFullYear(), formatNumber(endDates.getMonth() + 1)
				];
			} else if(modal == 1){
				results = [startDates.getFullYear(), endDates.getFullYear()];
			} else {
				results = [startDates, endDates];
			}
			
			return results;
		},
		_initData: function(){
			var startYears = this.get('startYears') ;
			var endYears = this.get('endYears');
			
			if(startYears >= endYears){
				throw new Error('mobileDateTimePicker: 开始数字不能大于或等于结束数字');
			}
			
			if(this.get('modal') >= 2){
				this.set('startYears', startYears >= 18 ? 18 : startYears);
				this.set('endYears', endYears >= 60 ? 60 : endYears);
			}
			
			var getYears = initYears(this.get('startYears'), this.get('endYears'));
			
			var modal = this.get('modal');
			var dataSource, dateValue;
			
			if(modal == 0){
				dataSource = [
					getYears, 
					{divider: true, content: '-'}, 
					initMonthes, 
					{divider: true, content: '至'},
					getYears,
					{divider: true, content: '-'},
					initMonthes
				];
			} else if(modal >= 1){
				dataSource = [
					getYears, 
					{divider: true, content: '至'},
					getYears
				];
			}
			
			this.set('dataSource', dataSource);
			this.set('selectedValue', this._normalizeDateValue());
			
			mobileRangePicker.parent('_initData').call(this);
		},
		_initEvents: function(){
			mobileRangePicker.parent('_initEvents').call(this);
			var self = this,
				t;

			this.on('change', function(e){
				var modal = self.get('modal');
				if(self._isCompareValue()){
					var selectedColIndex = self.get('selectedColIndex');
					if(modal == 0){
						if(selectedColIndex == 2 || selectedColIndex == 6){
							self._cols[2].setValue(formatNumber(parseInt(self._cols[6].value) - 1), 300, false);
							if(parseInt(self._cols[2].value) == parseInt(self._cols[6].value)){
								self._cols[6].setValue(formatNumber(parseInt(self._cols[2].value) + 1), 300, false);
							}
						} else if(selectedColIndex == 0 || selectedColIndex == 4){
							self._cols[0].setValue(self._cols[4].value, 300);
							if(parseInt(self._cols[0].value) == self.get('startYears')){
								self._cols[4].setValue(parseInt(self._cols[0].value) + 1, 300, false);
							} else if(self._isCompareValue()){
								self._cols[0].setValue(self._cols[4].value - 1, 300, false);
							}
						}
					} else {
						self._cols[0].setValue(parseInt(self._cols[2].value) - 1, 300, false);
						if(parseInt(self._cols[2].value) <= parseInt(self.get('startYears'))){
							self._cols[2].setValue(parseInt(self._cols[2].value) + 1, 300, false);
						}
					}
				}
			});
		}
	});
	
	return mobileRangePicker;
	
});