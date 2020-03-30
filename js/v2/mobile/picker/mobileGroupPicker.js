// JavaScript Document

define('mobile.picker.mobileGroupPicker', 'mobile.picker.mobilePicker', function(require, exports, module){

	var $ = module['jquery'],
		mobilePicker = module['mobile.picker.mobilePicker'],
		util = require('base.util'),
		Class = require('base.class').Class;
		
	var mobileGroupPicker = Class(function(o){
		mobileGroupPicker.parent().call(this, util.merge({
			showLevel: 3,
			defaultValue: null
		}, o));
	}).extend(mobilePicker);
	
	mobileGroupPicker.implement({
		_renderTemplate: function(){
			this._isLoadComplete = true;
			this._data = this.get('dataSource');
			if(!this._data){
				throw new Error('mobileGroupPicker: 没有数据源');
			}
			
			var provinces = $.map(this._data, function(value){
				return {
					label: value.label ? value.label : value, 
					value: value.value ? value.value : value
				};
			});
			
			var showLevel = this.get('showLevel'),
				initCities, initDistricts,
				groups = [provinces];
			
			if(showLevel >= 2){
				initCities = this._next(this._data[0]);
				groups.push(initCities);
			}
			if(showLevel >= 3){
				initDistricts = [''];
				groups.push(initDistricts);
			}
			
			this._currentProvince = provinces[0].value ? provinces[0].value : provinces[0];
			this._currentCity = initCities ? (initCities[0].value ? initCities[0].value : initCities[0]) : null;
			this._currentDistrict = initDistricts ? (initDistricts[0].value ? initDistricts[0].value : initDistricts[0]) : null;
			
			this.set('dataSource', groups);
			mobileGroupPicker.parent('_renderTemplate').call(this);
		},
		_initEvents: function(){
			mobileGroupPicker.parent('_initEvents').call(this);
			var self = this;
			var t;
			this.on('change', function(e){
				var newProvince = self._cols[0].value;
				var newCity;

				if(newProvince !== self._currentProvince){
					clearTimeout(t);
					t = setTimeout(function(){
						var newCities = self._getSubData(newProvince);
						
						newCity = newCities[0].value || newCities[0];
						var newDistricts = self._getChildData(newProvince, newCity);
						
						self._cols[1] && self._cols[1].replaceValues(newCities);
						self._cols[2] && self._cols[2].replaceValues(newDistricts);
						self._currentProvince = newProvince;
                    	self._currentCity && (self._currentCity = newCity);
						
						self.updateValue();
					}, 200);
					return;
				}
				
				if(!self._cols[2]) return;
				
				newCity = self._cols[1].value;
				if(newCity !== self._currentCity){
					self._cols[2].replaceValues(self._getChildData(newProvince, newCity));
					self._currentCity = newCity;
					self.updateValue();
				}
			});
			
		},
		_format:function(data) {
        	var result = [];
			for(var i = 0;i < data.length;i++) {
				var d = data[i];
				if(d.label === this.get('defaultValue')) continue;
				result.push(d);
			}
			if(result.length) return result;
			return [''];
		},
		_next: function(data){
			if(!data.next) return [''];
			return this.get('defaultValue') ? this._format(data.next) : data.next;
		},
		_getSubData: function(d, f){
			var data = this._data;
			if(!data || !util.type.isArray(data)){
				throw new Error('mobileGroupPicker:没有数据源');
			}
			for(var i = 0; i < data.length; i++) {
				if(data[i].value === d) return this._next(data[i]);
			}
			return f ? null : [''];
		},
		_getChildData: function(p, c, f){
			var data = this._data;
			if(!data || !util.type.isArray(data)){
				throw new Error('mobileGroupPicker:没有数据源');
			}
			for(var i = 0; i < data.length; i++){
				if(data[i].value === p){
					for(var j = 0; j < data[i].next.length; j++){
						if(data[i].next[j].value === c){
							return this._next(data[i].next[j]);
						}
					}
				}
			}
			return f ? null : [''];
		},
		_initPicker: function(){
			var selectedValue = this.get('selectedValue');
			if(util.type.isString(selectedValue) || util.type.isNumber(selectedValue)){
				selectedValue = [selectedValue];
			}
			var newCities, newDistrict,
				showLevel = this.get('showLevel');
				
			if(selectedValue){
				if(selectedValue[0]){
					this._currentProvince = selectedValue[0];
					newCities = this._getSubData(this._currentProvince, true);
					if(!newCities){
						this._currentProvince = this._cols[0].values[0].value;
						newCities = this._getSubData(this._currentProvince);
					}
				}
				
				if(showLevel >= 2){
					if(selectedValue[1]){
						this._currentCity = selectedValue[1];
						newDistrict = this._getChildData(this._currentProvince, selectedValue[1], true);
					}
					if(!newDistrict){
						this._currentCity = newCities[0].value;
						newDistrict = this._getChildData(this._currentProvince, this._currentCity);
					}
					
					this._cols[1].replaceValues(newCities);
				}
				
				if(showLevel >= 3){
					!selectedValue[2] && (selectedValue[2] = '');
					this._currentDistrict = selectedValue[2] || newDistrict;
					
					this._cols[2].replaceValues(newDistrict);
				}
				
				this.setValue(this.get('selectedValue'), 0, this.get('isChangeUpdate'));
			}
		},
		show: function(){
			if(this._isLoadComplete){
				mobileGroupPicker.parent('show').call(this);
			} else {
				this.trigger('loaded');
			}
		}
	});
	
	return mobileGroupPicker;
});