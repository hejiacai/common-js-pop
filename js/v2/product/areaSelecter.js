// JavaScript Document

define('product.areaSelecter', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		doc = document;
	
	var template = {
		input: [
			'<input type="hidden" name="{areaInputName}" />'
		].join(''),
		element: [
			'<div class="ui_hb_areaSelecter_drop {areaClassName}">',
			'<select class="areaSelecter"></select>',
			'<div class="ui_hb_areaSelecter_label">{name}</div>',
			'</div>'
		].join(''),
		item: [
			'<option value="{id}">{name}</option>'
		].join('')
	};
	
	var groupFlags = [{
		element: '_provinceElement',
		select: '_provinceSelect',
		label: '_provinceLabel'
	}, {
		element: '_cityElement',
		select: '_citySelect',
		label: '_cityLabel'
	}, {
		element: '_areaElement',
		select: '_areaSelect',
		label: '_areaLabel'
	}, {
		element: '_tradingareaElement',
		select: '_tradingareaSelect',
		label: '_tradingareaLabel'
	}];

	var areaSelecter = shape(function(o){
			areaSelecter.parent().call(this, util.merge({
				className: 'ui_hb_areaSelect',
				hidName: 'area',
				container: $('#ui_hb_areaSelect'),
				municipality: ['0100','0200','0300','0400'],
				selectedValue: null,
				textDesc:['省/直辖市','市','区/县','商圈/乡镇'],
				provinceUrl: '//m.huibo.com/area/getarea/callback-callback',
				areaUrl: '//m.huibo.com/area/GetTopArea/callback-callback-areaid-',
				subAreaUrl: '//m.huibo.com/area/getarea/callback-callback-areaid-',
				showLevel: 4
			}, o));
			
			this.init();
			
		});
		
	areaSelecter.implement({
		init: function(){
			this._selectedAreas = [0, 0, 0, 0];
			this._getShowLevel();
			
			this._initElement();
			this._initEvents();
		},
		_getShowLevel: function(){
			var showLevel = this.get('showLevel');
			var isNumber = util.type.isNumber(showLevel);
			
			if(!isNumber || (isNumber && (showLevel <= 0 || showLevel >= 5))){
				this.set('showLevel', 4);
			} 
			return this.get('showLevel');
		},
		_initElement: function(){
			var container = this.get('container');
			if(container.length && !container[0]){
				throw new Error('product.area.areaDrop: 找不到目标');
			}
			if(!container.hasClass(this.get('className'))){
				container.addClass(this.get('className'));
			}
			
			this._hiddenElement = $(util.string.replace(template.input, {
				areaInputName: this.get('hidName')
			})).appendTo(container);
			
			var textDesc = this.get('textDesc'),
				element;

			for(var i = 0, len = groupFlags.length; i < len; i++){
				
				this[groupFlags[i].element] = $(util.string.replace(template.element, {	
					name: util.type.isArray(textDesc) ? textDesc[i] : '请选择',
					areaClassName: groupFlags[i].select.substr(1)
				})).appendTo(container);
				
				if(i > 0){
					this[groupFlags[i].element].hide();
				}
				
				element = this[groupFlags[i].element];
				
				this[groupFlags[i].select] = element.children('select');
				this[groupFlags[i].label] = element.children('.ui_hb_areaSelecter_label');
			}		
			
			this._loadArea(this.get('provinceUrl'));
			
			if(this.get('selectedValue')){
				this.setArea(this.get('selectedValue'));
			}
		},
		reset: function(){
			
			var textDesc = this.get('textDesc');
			
			this._selectedAreas = [0, 0, 0, 0];
			this._hiddenElement.val('');
			
			this._provinceLabel.html(textDesc[0]);
			var firstOption = this._provinceSelect.children('option');
			if(firstOption.eq(0).text() != (util.type.isArray(textDesc) ? textDesc[0] : '请选择')){
				this._provinceSelect.prepend(
					util.string.replace(template.item, {
						name: util.type.isArray(textDesc) ? textDesc[0] : '请选择'
				}));
			}
			this._provinceSelect.children('option').eq(0).prop('selected', true);
			
			this._cityLabel.html(textDesc[1]);
			this._citySelect.empty();
			this._cityElement.hide();
			this._cityLen = 0;
			
			this._areaLabel.html(textDesc[2]);
			this._areaElement.hide();
			this._areaSelect.empty();
			this._areaLen = 0;
			
			this._tradingareaLabel.html(textDesc[3]);
			this._tradingareaElement.hide();
			this._tradingareaSelect.empty();
			this._tradingareaLen = 0;
		},
		_initEvents: function(){
			this.on('data', function(e){
				if(util.type.isNumber(e.level)){
					if(e.level == 1){
						this._updateProvinces(e);
					} else {
						this._updateData(e);
					}
				} else {
					this._setAreaControl(e);
				}
			});
			
			var container = this.get('container');
			var self = this;
			var dropSelect = container.find('select');
			
			container.on('change', 'select', function(e){
				var target = $(e.currentTarget);
				var curLevel = dropSelect.index(target) + 1;
				
				var items = target.children('option');
				var selectedItem = target.children('option').filter(':selected');
				var index = items.index(selectedItem);
				
				var areaid = target.val();
				var areaName = items.eq(index).text();
				
				var nextLevel = curLevel + 1;
				
				self._selectArea({
					level: nextLevel,
					id: areaid, 
					name: areaName,
					isShow: true
				});
			});
		},
		_isProvince: function(id){
			var showLevel = this._getShowLevel();
			
			if(util.array.contains(this.get('municipality'), id)){
				this._cityElement.hide();
				this.set('isProvince', true);
				return true;
			} else {
				if(!util.array.contains(this.get('municipality'), this._selectedAreas[0]) && showLevel >= 2){
					this._cityElement.show();
				}
				this.set('isProvince', false);
				return false;
			}
		},
		_selectArea: function(e){
			if(!e) return;
			var id = e.id;
			if(e.level != undefined){
				var url = this.get('subAreaUrl') + id;
				var curLevel = e.level - 1;
				var isProvince = this._isProvince(id);
				
				if(curLevel == 1 && isProvince){
					e.level = 3;
				}
				
				var textDesc = this.get('textDesc');
				
				if(util.array.contains(this._selectedAreas, e.id)){
					return;
				}
				this._hiddenElement.val(e.id);

				var firstOption;
				if(curLevel == 1){

					firstOption = this._provinceSelect.children('option');
					if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[0] : '请选择')){
						this._provinceSelect.children('option').eq(0).remove();
					}
					
					this._provinceLabel.html(e.name);
					firstOption.filter("[value='" + e.id + "']").prop('selected', true);
					this._selectedAreas[0] = e.id;
					
					this._cityLabel.html(textDesc[1]);
					this._selectedAreas[1] = 0;
					this._cityLen = 0;
					this._citySelect.empty();
					
					this._areaLabel.html(textDesc[2]);
					this._selectedAreas[2] = 0;
					this._areaLen = 0;
					this._areaSelect.empty();
					this._areaElement.hide();
					
					this._tradingareaLabel.html(textDesc[3]);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaSelect.empty();
					this._tradingareaElement.hide();
					
				} else if(curLevel == 2){
					
					firstOption = this._citySelect.children('option');
					if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[1] : '请选择')){
						this._citySelect.children('option').eq(0).remove();
					}
					
					this._cityLabel.html(e.name);
					firstOption.filter("[value='" + e.id + "']").prop('selected', true);
					this._selectedAreas[1] = e.id;
					
					this._areaLabel.html(textDesc[2]);
					this._selectedAreas[2] = 0;
					this._areaLen = 0;
					this._areaSelect.empty();
					
					this._tradingareaLabel.html(textDesc[3]);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaSelect.empty();
					this._tradingareaElement.hide();
					
				} else if(curLevel == 3){

					firstOption = this._areaSelect.children('option');
					if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[2] : '请选择')){
						this._areaSelect.children('option').eq(0).remove();
					}
					
					this._areaLabel.html(e.name);
					firstOption.filter("[value='" + e.id + "']").prop('selected', true);
					this._selectedAreas[2] = e.id;
					
					this._tradingareaLabel.html(textDesc[3]);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaSelect.empty();
					
				} else if(curLevel == 4){
					firstOption = this._tradingareaSelect.children('option');
					if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[3] : '请选择')){
						this._tradingareaSelect.children('option').eq(0).remove();
					}
					
					this._tradingareaLabel.html(e.name);
					firstOption.filter("[value='" + e.id + "']").prop('selected', true);
					this._selectedAreas[3] = e.id;
				}
				
				if(e.isShow){
					this.trigger('selectedItem', {
						selectedValue: e.id,
						selectedName: e.name,
						level: curLevel
					});
				}
				
				var showLevel = this._getShowLevel();
				if(showLevel >= 2){
					isProvince = this.isProvince();
					if(showLevel < (isProvince ? curLevel : e.level)){
						return;
					}
					
					this._loadArea(url, e.level, e.isShow);
				}
			}
		},
		_setAreaControl: function(e){
			var data = e.data;
			if(data && data.length > 0) {
				var result = data.reverse(),
					len = result.length,
					province = result[0],
					isProvince = this._isProvince(province.area_id),
					showLevel = this._getShowLevel();
				
				if(len >= 1 && showLevel >= 1){
					this._selectArea({
						id: result[0].area_id,
						name: result[0].area_name,
						level: 2
					});
				} 
				if(len >= 2 && showLevel >= 2){
					this._selectArea({
						id: result[1].area_id,
						name: result[1].area_name,
						level: isProvince ? 4 : 3
					});
				}
				if(len >= 3 && showLevel >= 3){
					this._selectArea({
						id: result[2].area_id,
						name: result[2].area_name,
						level: isProvince ? 5 : 4
					});
				}
				if(!isProvince && len >= 4 && showLevel >= 4){
					this._selectArea({
						id: result[3].area_id,
						name: result[3].area_name,
						level: 5
					});
				}
			}
		},
		_updateProvinces: function(e){
			
			var self = this;
			var textDesc = this.get('textDesc');
			
			var element = this._provinceSelect,
				html = util.string.replace(template.item, {	
					name: util.type.isArray(textDesc) ? textDesc[0] : '请选择'
				});
			
			$.each(e.data,function(i, n){
				html += util.string.replace(template.item, {
					id: n.area_id, 
					name: n.area_name
				});
			});
			
			element.html(html);
			
			if(this._selectedAreas[0]){
				var firstOption = this._provinceSelect.children('option');
				if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[0] : '请选择')){
					this._provinceSelect.children('option').eq(0).remove();
				}
				firstOption.filter("[value='" + this._selectedAreas[0] + "']").prop('selected', true);
			}
			
			this.trigger('updateData', e);
		},
		_updateData: function(e){

			var level = e.level || 2;
			var self = this;

			var dataName, element, list;
			
			if(level == 2){
				dataName = '_cityLen';
				element = this._cityElement;
				list = this._citySelect;
			} else if(level == 3){
				dataName = '_areaLen';
				element = this._areaElement;
				list = this._areaSelect;
			} else if(level == 4){
				dataName = '_tradingareaLen';
				element = this._tradingareaElement;
				list = this._tradingareaSelect;
			}
			
			if(!element){
				return;
			}
			
			var textDesc = this.get('textDesc');
			var c = [];
			var html = util.string.replace(
				template.item, {name: util.type.isArray(textDesc) ? textDesc[level - 1] : '请选择'}
			);
			$.each(e.data,function(i, n){
				c.push(util.string.replace(template.item, {
					id: n.area_id,
					name: n.area_name
				}));
			});
			
			this[dataName] = c.length;
			
			if(c.length){
				element.show();
				list.html(html + c.join(''));
				
				var index = level - 1;
				var textDesc = this.get('textDesc');
				
				if(this._selectedAreas[index]){
					var firstOption = list.children('option');
					if(firstOption.eq(0).text() == (util.type.isArray(textDesc) ? textDesc[index] : '请选择')){
						list.children('option').eq(0).remove();
					}
					firstOption.filter("[value='" + this._selectedAreas[index] + "']").prop('selected', true);
				}
				
				this.trigger('updateData', e);
			} else {
				element.hide();
			}
		},
		_loadArea: function(url, level, isShow){
			var self = this;			
			
			$.ajax({
				url: url,
				type: "get",
				dataType: "jsonp",
				success: function(data) {
					var e = {
						data: data,
						level: level || 1,
						isShow: isShow
					}
					
					setTimeout(function(){
						self.trigger('data', e);
					}, 0);
				},
				error: function(e){
					self.trigger('loadError');
					self.destory();
				}
			});
		},
		disabled: function(){
			this._provinceSelect.attr('disabled','disabled');
			this._citySelect.attr('disabled','disabled');
			this._areaSelect.attr('disabled','disabled');
			this._tradingareaSelect.attr('disabled', 'disabled');
		},
		enabled: function(){
			this._provinceSelect.removeAttr('disabled');
			this._citySelect.removeAttr('disabled');
			this._areaSelect.removeAttr('disabled');
			this._tradingareaSelect.removeAttr('disabled');
		},
		setArea: function(id){
			var url = this.get('areaUrl') + id;
			this._loadArea(url, 'set');
		},
		getValue: function(){
			return this._hiddenElement.val();
		},
		getLabel: function(){
			var provinceInput = this._provinceLabel.text();
			var cityInput = this._cityLabel.text();
			var areaInput = this._areaLabel.text();
			var tradingareaInput = this._tradingareaLabel.text();
			var textDesc = this.get('textDesc');

			if(util.type.isArray(textDesc)){
				if(provinceInput == (textDesc[0] || '请选择')){
					provinceInput = '';
				}
				if(cityInput == (textDesc[1] || '请选择')){
					cityInput = '';
				}
				if(areaInput == (textDesc[2] || '请选择')){
					areaInput = '';
				}
				if(tradingareaInput == (textDesc[3] || '请选择')){
					tradingareaInput = '';
				}
			} else {
				
				if(provinceInput == (textDesc || '请选择')){
					provinceInput = '';
				} 
				if(cityInput == (textDesc || '请选择')){
					cityInput = '';
				}
				if(areaInput == (textDesc || '请选择')){
					areaInput = '';
				}
				if(tradingareaInput == (textDesc || '请选择')){
					tradingareaInput = '';
				}
				
				provinceInput + cityInput + areaInput + tradingareaInput;
			}
			return provinceInput + cityInput + areaInput + tradingareaInput;
		},
		getSelectedValues: function(){
			var selectedAreas = this._selectedAreas;
			var result = [];

			for(var i = 0, len = selectedAreas.length; i < len; i++){
				if(selectedAreas[i]){
					result.push(selectedAreas[i]);
				}
			}
			return result;
		},
		isProvince: function(){
			return this._isProvince(this._selectedAreas[0]);
		},
		destory: function(){
			this.get('container').off();
			
			areaSelecter.parent('destory').call(this);
		}
	});
	
	return areaSelecter;
	
});