// JavaScript Document

define('product.areaDrop', ['widge.popup'], function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		popup = module['widge.popup'],
		doc = document;
	
	var template = {
		input: [
			'<input type="hidden" name="{areaInputName}" />'
		].join(''),
		element: [
			'<div class="ui_hb_areaDrop_drop {areaClassName}">',
			'<b class="hbFntWes dropIco">&#xf0d7;</b>',
			'<input type="text" class="areaCity" value="{name}" readonly />',
			'</div>'
		].join(''),
		provinceList: [
			'<div class="dir"><ul></ul></div>',
			'<div class="lst"><ul></ul></div>'
		].join(''),
		list: ['<ul></ul>'].join(''),
		item: [
			'<li><a href="javascript:" value="{id}">{name}</a></li>'
		].join('')
	};
	
	var groupFlags = [{
		element: '_provinceElement',
		input: '_provinceInput',
		popup: '_provincePopup',
		className: 'provinceDrop'
	}, {
		element: '_cityElement',
		input: '_cityInput',
		popup: '_cityPopup',
		className: 'cityDrop'
	}, {
		element: '_areaElement',
		input: '_areaInput',
		popup: '_areaPopup',
		className: 'areaDrop'
	}, {
		element: '_tradingareaElement',
		input: '_tradingareaInput',
		popup: '_tradingareaPopup',
		className: 'tradingareaDrop'
	}];

	var areaDrop = shape(function(o){
			areaDrop.parent().call(this, util.merge({
				className: 'ui_hb_areaDrop',
				inputClassName: 'inputText',
				focusClassName: 'ui_hb_areaDrop_drop_focus',
				hidName: 'area',
				container: $('#ui_hb_areaDrop'),
				municipality: ['0100','0200','0300','0400'],
				selectedValue: null,
				popupWidth: 300,
				textDesc:['省/直辖市','市','区/县','商圈/乡镇'],
				provinceUrl: '//www.huibo.com/area/getarea/callback-callback',
				areaUrl: '//www.huibo.com/area/GetTopArea/callback-callback-areaid-',
				subAreaUrl: '//www.huibo.com/area/getarea/callback-callback-areaid-',
				showLevel: 4,
				zIndex: 99
			}, o));
			
			this.init();
			
		});
		
	areaDrop.implement({
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
				popupWidth = this.get('popupWidth'),
				zIndex = this.get('zIndex'),
				element, width;

			for(var i = 0, len = groupFlags.length; i < len; i++){
				
				this[groupFlags[i].element] = $(util.string.replace(template.element, {	
					name: util.type.isArray(textDesc) ? textDesc[i] : '请选择',
					areaClassName: groupFlags[i].className
				})).appendTo(container);
				
				if(i > 0){
					this[groupFlags[i].element].hide();
				}
				
				this[groupFlags[i].input] = this[groupFlags[i].element].children('input');
				
				width = util.type.isArray(popupWidth) ? (popupWidth[i] || 300) : (popupWidth || 300);
				
				this[groupFlags[i].popup] = new popup({
					idName: 'hb_ui_area_popup',
					width: width,
					height: 'auto',
					align: {
						baseXY: [0, '100%-1px'],
						baseElement: this[groupFlags[i].element]
					},
					zIndex: util.type.isArray(zIndex) ? (zIndex[i] || 99) : (zIndex || 99)
				});
				
				element = this[groupFlags[i].popup].get('element');
				if(i == 0){
					$(template.provinceList).appendTo(element);
				} else {
					$(template.list).appendTo(element);
				}
				this[groupFlags[i].popup]._blurHide(this[groupFlags[i].element]);
			}		
			
			this._loadArea(this.get('provinceUrl'));
			if(this.get('selectedValue')){
				this.setArea(this.get('selectedValue'));
			}
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
			
			var dropInput = container.find('.areaCity');
			var elements = container.find('.ui_hb_areaDrop_drop');
			var focusClassName = this.get('focusClassName');
			
			container.on('focus', '.areaCity', function(e){
				var target = $(e.currentTarget);
				var index = dropInput.index(target);
				var dropTarget = target.closest('.ui_hb_areaDrop_drop');

				if(index >= 1){
					if(index == 1 && !self._cityLen){
						return;
					} else if(index == 2 && !self._areaLen){
						return;
					} else if(index == 3 && !self._tradingareaLen){
						return;
					}
				}
				
				popupShow(dropTarget);
			});
			
			this._provincePopup.after('show', function(){
				self._provinceElement.addClass(focusClassName);
			});
			this._provincePopup.after('hide', function(){
				self._provinceElement.removeClass(focusClassName);
			});
			this._cityPopup.after('show', function(){
				self._cityElement.addClass(focusClassName);
			});
			this._cityPopup.after('hide', function(){
				self._cityElement.removeClass(focusClassName);
			});
			this._areaPopup.after('show', function(){
				self._areaElement.addClass(focusClassName);
			});
			this._areaPopup.after('hide', function(){
				self._areaElement.removeClass(focusClassName);
			});
			this._tradingareaPopup.after('show', function(){
				self._tradingareaElement.addClass(focusClassName);
			});
			this._tradingareaPopup.after('hide', function(){
				self._tradingareaElement.removeClass(focusClassName);
			});
			
			this._provincePopup.get('element').on('click', 'li a', function(e){
				e.level = 2;
				self._provincePopup.hide();
				popupListClick(e);
			});
			this._cityPopup.get('element').on('click', 'li a', function(e){
				e.level = 3;
				self._cityPopup.hide();
				popupListClick(e);
			});
			this._areaPopup.get('element').on('click', 'li a', function(e){
				e.level = 4;
				self._areaPopup.hide();
				popupListClick(e);
			});
			this._tradingareaPopup.get('element').on('click', 'li a', function(e){
				e.level = 5;
				self._tradingareaPopup.hide();
				popupListClick(e);
			});
			
			
			function popupShow(target){
				if(target.hasClass('provinceDrop')){
					self._provincePopup.show();
				} else if(target.hasClass('cityDrop')){
					self._cityPopup.show();
				} else if(target.hasClass('areaDrop')){
					self._areaPopup.show();
				} else if(target.hasClass('tradingareaDrop')){
					self._tradingareaPopup.show();
				}
			}
			
			function popupListClick(e){
				var target = $(e.currentTarget);
				var areaId = target.attr('value');
				var areaName = target.text();

				self._selectArea({
					level: e.level,
					id: areaId, 
					name: areaName,
					isShow: true
				});
			}
			
		},
		_isProvince: function(id){
			var showLevel = this._getShowLevel();
			
			if(util.array.contains(this.get('municipality'), id)){
				this._cityElement.hide();
				this.set('isProvince', true);
				return true;
			} else {
				if(showLevel >= 2){
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
				
				var className = this.get('inputClassName');
				var textDesc = this.get('textDesc');
				
				if(util.array.contains(this._selectedAreas, e.id)){
					return;
				}
				
				this._hiddenElement.val(e.id);
				
				if(curLevel == 1){
					this._provinceInput.val(e.name).addClass(className);
					
					this._selectedAreas[0] = e.id;
					this._cityInput.val(textDesc[1]).removeClass(className);
					this._selectedAreas[1] = 0;
					this._cityLen = 0;
					this._cityPopup.get('element').find('ul').empty();
					
					this._areaInput.val(textDesc[2]).removeClass(className);
					this._selectedAreas[2] = 0;
					this._areaLen = 0;
					this._areaPopup.get('element').find('ul').empty();
					this._areaElement.hide();
					
					this._tradingareaInput.val(textDesc[3]).removeClass(className);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaPopup.get('element').find('ul').empty();
					this._tradingareaElement.hide();
					
				} else if(curLevel == 2){
					
					this._cityInput.val(e.name).addClass(className);
					this._selectedAreas[1] = e.id;
					
					this._areaInput.val(textDesc[2]).removeClass(className);
					this._selectedAreas[2] = 0;
					this._areaLen = 0;
					this._areaPopup.get('element').find('ul').empty();
					
					this._tradingareaInput.val(textDesc[3]).removeClass(className);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaPopup.get('element').find('ul').empty();
					this._tradingareaElement.hide();
					
				} else if(curLevel == 3){
					
					this._areaInput.val(e.name).addClass(className);
					this._selectedAreas[2] = e.id;
					
					this._tradingareaInput.val(textDesc[3]).removeClass(className);
					this._selectedAreas[3] = 0;
					this._tradingareaLen = 0;
					this._tradingareaPopup.get('element').find('ul').empty();
					
				} else if(curLevel == 4){
					this._tradingareaInput.val(e.name).addClass(className);
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
			var element = this._provincePopup.get('element'),
				html;
			
			$.each(e.data,function(i, n){
				html = util.string.replace(template.item, {
					id: n.area_id, 
					name: n.area_name
				});
				if(util.array.contains(self.get('municipality'), n.area_id)){
					element.find('.dir ul').append(html);
				} else {
					element.find('.lst ul').append(html);
				}
			});
			
			this.trigger('updateData', e);
		},
		_updateData: function(e){

			var level = e.level || 2;
			var self = this,
				html = '';

			var dataName, element, list;
			
			if(level == 2){
				dataName = '_cityLen';
				element = this._cityPopup.get('element');
				list = this._cityElement;
			} else if(level == 3){
				dataName = '_areaLen';
				element = this._areaPopup.get('element');
				list = this._areaElement;
			} else if(level == 4){
				dataName = '_tradingareaLen';
				element = this._tradingareaPopup.get('element');
				list = this._tradingareaElement;
			}
			
			if(!element){
				return;
			}
			
			var c = [];
			$.each(e.data,function(i, n){
				c.push(util.string.replace(template.item, {
					id: n.area_id,
					name: n.area_name
				}));
			});
			
			this[dataName] = c.length;
			element.find('ul').html(c.join(''));
			
			if(c.length){
				list.show();
				
				var eventObj = {};
				if(level == 2){
					eventName = '';
				} else if(level == 3){
				
				} else if(level == 4){
					
				}
				
				if(e.isShow){
					if(level == 2 && this._cityLen){
						this._cityPopup.show();
					} else if(level == 3 && this._areaLen){
						this._areaPopup.show();
					} else if(level == 4 && this._tradingareaLen){
						this._tradingareaPopup.show();
					}
				}
				
				this.trigger('updateData', e);
			} else {
				list.hide();
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
				error: function(){
					self.trigger('loadError');
					self.destory();
				}
			});
		},
		setArea: function(id){
			var url = this.get('areaUrl') + id;
			this._loadArea(url, 'set');
		},
		getValue: function(){
			return this._hiddenElement.val();
		},
		getLabel: function(){
			var provinceInput = this._provinceInput.val();
			var cityInput = this._cityInput.val();
			var areaInput = this._areaInput.val();
			var tradingareaInput = this._tradingareaInput.val();
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
			this[groupFlags[0].popup].destory();
			this[groupFlags[1].popup].destory();
			this[groupFlags[2].popup].destory();
			this[groupFlags[3].popup].destory();
			this.get('container').off();
			
			areaDrop.parent('destory').call(this);
		}
	});
	
	return areaDrop;
	
});