// JavaScript Document
define('mobile.picker.mobilePicker', 'mobile.mobilePopup, module.dataSource, module.css3', function(require, exports, module){

	var $ = module['jquery'],
		popup = module['mobile.mobilePopup'],
		css3 = require('module.css3'),
		dataSource = require('module.dataSource').dataSource,
		util = require('base.util'),
		Class = require('base.class').Class,
		template = {
			container: [
				'<div class="mobile_picker_items">',
				'<div class="mobile_picker_center_highlight"></div>',
				'</div>'
			].join(''),
			cols: '<div class="mobile_picker_items_col"></div>',
			divider: '<div class="mobile_picker_items_col mobile_picker_items_col_divider">{content}</div>',
			list: '<div class="mobile_picker_items_col_wrapper"></div>',
			item: '<div class="mobile_picker_item" data-value="{value}" data-label="{label}">{label}</div>'
		},
		cid = 0;
	
	function uid(){
		return ++cid;
	}	
	var mobilePicker = Class(function(o){
		mobilePicker.parent().call(this, util.merge({
			idName: 'mobilePicker',
			className: 'mobilePopup',
			colsClassName: null,
			trigger: $('#station'),
			target: 'span',
			title: '请选择',
			close: '取消',
			yesBtn: '确定',
			itemName: 'div',
			dataSource: null,
			isDataModal: true,
			pickerIndex: -1,
			pickerValue: null,
			pickerName: 'station',
			background: '#fff',
			direction: 2,
			hasMask: true,
			height: 300,
			valueSperater: ' ',
			isChangeUpdate: false,
			updateValuesOnTouchmove: true,
			momentumRatio: 7
		}, o));
	}).extend(popup);
	
	mobilePicker.implement({
		init: function(){
			this._isInitPickerCol = true;
			var trigger = this.get('trigger');
			if(!isDom(trigger)){
				throw new Error('widge.selecter: 找不到目标');
			}

			this.setEnabled(true);
			
			mobilePicker.parent('init').call(this);
			this._initElement();
			this._initCols();
			this._initInput();
			this._initData();
		},
		setEnabled: function(b){
			this.set('enabled', b);
		},
		_initElement: function(){
			var trigger = this.get('trigger');
			if(this.get('target')){
				this.set('target', trigger.find(this.get('target')));
			}
			this._container = $(template.container).appendTo(this._body);
		},
		_initCols: function(){
			this._cols = [];
			var colsClassName = this.get('colsClassName');
			if(util.type.isString(colsClassName)){
				this._colsClass = [colsClassName];
			} else if(util.type.isArray(colsClassName)){
				this._colsClass = colsClassName;
			}
		},
		_initData: function(){
			this.dataSource = new dataSource({
				source: this.get('dataSource')
			});
			this.dataSource.on('data', util.bind(this._renderData, this));
			this.updateData();
		},
		_initInput: function(){
			var trigger = this.get('trigger'),
				name = this.get('pickerName') || 'mobilePickerName_' + cid();

			var input = $(
				'<input type="text" id="mobilePicker_' + name +
				'" name="' + name + '" />'
			).css({
				position: 'absolute',
				left: '-99999px',
				zIndex: -100
			}).insertAfter(trigger);
			
			this.set('pickerName', input);
		},
		_initEvents: function(){
			mobilePicker.parent('_initEvents').call(this);
			this.on('resize', util.bind(this._resize, this));
		},
		_resize: function(){
			if(('' + this.get('height')).lastIndexOf('%') === -1){
				return;
			}
			for (var i = 0; i < this._cols.length; i++) {
				if(!this._cols[i].divider){
                	this._cols[i].calcSize();
                	this._cols[i].setValue(this._cols[i].value, 0, false);
				}
            }
		},
		_closeX: function(e){
			this.get('isChangeUpdate') && this.setValue(this.get('displayValue'), 0);
			var self = this;
			setTimeout(function(){
				mobilePicker.parent('_closeX').call(self, e);
			}, 0);
		},
		_submit: function(e){
			if(!this.get('isChangeUpdate')){
				this.hide();
				this.updateValue(true);
				this._updateValueToInput();
			}
			this.set('displayValue', this.get('selectedValue'));
			mobilePicker.parent('_submit').call(this, e);
		},
		show: function(){
			if(!this.get('enabled')) return;
			mobilePicker.parent('show').call(this);
		},
		updateData: function(){
			if(this.dataSource.get('source')){
				this.dataSource.abort();
				this.dataSource.getData(this.get('value'));
				//this._updateValueToInput();
			}
		},
		setData: function(data){
			if(util.type.isArray(data) || util.type.isObject(data)){
				this.dataSource.set('source', data);
				this.dataSource.setData(data);
			}
		},
		_renderData: function(data){
			this.set('dataSource', data);
			this._renderTemplate();
		},
		_renderTemplate: function(){
			var dataSource = this.get('dataSource'),
				isDataModal = this.get('isDataModal'),
				html = '',
				self = this,
				i = 0;
			
			if(dataSource){
				if(util.type.isObject(dataSource)){
					throw new Error('mobilePicker: 数据类型必须是array');
				}
				this._colsData = [];
				$.each(dataSource, function(index, val){
					if(util.type.isObject(val)){
						self._colsData[i] = self._colsData[i] || [];
						self._colsData[i].push(val);
						if(isDataModal){
							if(val.divider){
								html = util.string.replace(template.divider, {content: val.content || ''});
							} else {
								html = self._normalizeValue(val);
							}
							self._addList(i, html, val.divider);
							i++;
						} else {
							html += self._normalizeValue(val);
						}
					} else if(util.type.isArray(val)){
						html = '';
						$.each(val, function(index, val){
							html += self._normalizeValue(val);
							self._colsData[i] = self._colsData[i] || [];
							self._colsData[i].push(val);
						});
						self._addList(i, html);
						i++;
					}
				});
				
				if(!isDataModal){
					this._addList(i, html);
				}
			} else {
				throw new Error('mobilePicker: 没有数据');
			}
		},
		_normalizeValue: function(val){
			return normalizeValue(val, template.item);
		},
		_addList: function(i, html, f){
			this._cols[i] || (this._cols[i] = {});
			var isDivider = this._cols[i].divider = f;
			if(!this._cols[i].container){
				this._cols[i].container = $(isDivider ? html : template.cols).appendTo(this._container);
			}

			if(this._colsClass){
				this._cols[i].container.addClass(this._colsClass[i]);
			}
			
			if(isDivider) return;
			this._cols[i].menu || (this._cols[i].menu = $(template.list).appendTo(this._cols[i].container));
			this._cols[i].menu.html(html);
			this._cols[i].items = this._cols[i].menu.children();
			this._cols[i].values = this._colsData[i];
		},
		_initPickerCol: function(colElement, updateItems){
			var colIndex = this._container.find('.mobile_picker_items_col').index(colElement);
			if(colIndex == -1){
				return;
			}
			
			var col = this._cols[colIndex];
			if (col.divider) return;
			
			var wrapper = col.menu;
			var items = col.items;
			var self = this;
			
			var i, j;
            var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
			
			col.replaceValues = function(values){
				col.destroyEvents();
				var html = '';

				$.each(values, function(index, val){
					html += self._normalizeValue(val);
				});
				self._addList(colIndex, html);
				col.calcSize();
				col.setValue(undefined, 0, true);
				col.initEvents();
			}
			col.calcSize = function(){
				var colWidth, colHeight;
                colWidth = col.container.outerWidth();
				colHeight = col.container.outerHeight();
                wrapperHeight = col.menu.outerHeight();
				itemHeight = col.items.outerHeight();
                itemsHeight = itemHeight * col.items.length;
				
				minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                maxTranslate = colHeight / 2 - itemHeight / 2;
			}
			
			col.calcSize();
			col.menu.css(css3.style.transform, 'translate3d(0, ' + maxTranslate + 'px, 0)');
			col.menu.css(css3.style.transitionDuration, '0ms');
			
			var activeIndex = 0;
            var animationFrameId;
			
			col.getValue = function (label){
				var item = wrapper.children('.mobile_picker_item[data-label="' + label + '"]');
				return item.attr('data-value') || '';
			}
			col.setValue = function (newValue, transition, valueCallbacks) {
				if (typeof transition === 'undefined') transition = '';
				var newActiveIndex = newValue ? wrapper.children('.mobile_picker_item[data-value="' + newValue + '"]').index() : 0;
				if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                    newActiveIndex = 0;
                }
				
				var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
				col.menu.css(css3.style.transitionDuration, transition + 'ms');
				col.menu.css(css3.style.transform, 'translate3d(0, ' + (newTranslate) + 'px, 0)');
				
				col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
			};
			col.updateItems = function(activeIndex, translate, transition, valueCallbacks){
				if (typeof translate === 'undefined') {
                    translate = css3.style.getTranslate(col.wrapper[0], 'y');
                }
				if (typeof activeIndex === 'undefined') {
					activeIndex = -Math.round((translate - maxTranslate) / itemHeight);
				}
				if (activeIndex < 0) {
					activeIndex = 0;
				}
				if (activeIndex >= col.items.length) {
					activeIndex = col.items.length - 1;
				}
				var previousActiveIndex = col.activeIndex;
				col.activeIndex = activeIndex;
				
				col.menu.children('.mobile_picker_selected').removeClass('mobile_picker_selected');
				var selectedItem = col.items.eq(activeIndex).addClass('mobile_picker_selected').css(css3.style.transform, '');
				
				col.value = selectedItem.attr('data-value');
				col.label = selectedItem.text();
				self.set('selectedColIndex', colIndex);
				self.set('selectedIndex', activeIndex);
				
				if (valueCallbacks || typeof valueCallbacks === 'undefined') {
					if(previousActiveIndex != activeIndex){
						self.trigger('selected', {
							colIndex: colIndex,
							index: activeIndex,
							value: col.value,
							label: col.label
						});
						
						self.updateValue();
					}
				}
			}
			
			if(!updateItems){
				col.updateItems(0, maxTranslate, 0);
			}
			
			var allowItemClick = true;
            var isTouched, isMoved, touchStartY, touchCurrentY, 
				touchStartTime, touchEndTime, startTranslate, 
				returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;
				
			function handleTouchStart(e){
				if (isMoved || isTouched) return;
				//e.preventDefault();
				e = e.originalEvent;
				isTouched = true;
				touchStartY = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
				touchStartTime = (new Date()).getTime();
				
				allowItemClick = true;
                startTranslate = currentTranslate = css3.style.getTranslate(col.menu[0], 'y');
			}
			function handleTouchMove(e){
				if (!isTouched) {
					return;
				}
                e.preventDefault();
				e = e.originalEvent;
				allowItemClick = false;
                touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
				
				if(!isMoved){
					animationFrameId && css3.caf(animationFrameId);
					isMoved = true;
					startTranslate = currentTranslate = css3.style.getTranslate(col.menu[0], 'y');
					col.menu.css(css3.style.transitionDuration, '0ms');
				}
				var diff = touchCurrentY - touchStartY;
				currentTranslate = startTranslate + diff;
				returnTo = undefined;
				
				if(currentTranslate < minTranslate) {
					currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
					returnTo = 'min';
				}
				if(currentTranslate > maxTranslate) {
					currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
					returnTo = 'max';
				}
				col.menu.css(css3.style.transform, 'translate3d(0,' + currentTranslate + 'px,0)');
				col.updateItems(undefined, currentTranslate, 0, self.get('updateValuesOnTouchmove'));
				
				
				velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                velocityTime = (new Date()).getTime();
                prevTranslate = currentTranslate;
			}
			function handleTouchEnd(e){
				if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
				e = e.originalEvent;
				isTouched = isMoved = false;
				
				col.menu.css(css3.style.transitionDuration, '');
				if (returnTo) {
					if (returnTo === 'min') {
                        col.menu.css(css3.style.transform, 'translate3d(0,' + minTranslate + 'px,0)');
					} else {
						col.menu.css(css3.style.transform, 'translate3d(0,' + maxTranslate + 'px,0)');
					}
				}
				touchEndTime = new Date().getTime();
				var velocity, newTranslate;
                if (touchEndTime - touchStartTime > 300) {
                    newTranslate = currentTranslate;
                } else {
					velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                    newTranslate = currentTranslate + velocityTranslate * self.get('momentumRatio');
				}
				
				newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);
                var activeIndex = -Math.floor((newTranslate - maxTranslate) / itemHeight);
				
				newTranslate = -activeIndex * itemHeight + maxTranslate;
				
				col.menu.css(css3.style.transform, 'translate3d(0,' + (parseInt(newTranslate, 10)) + 'px,0)');
				
				col.updateItems(activeIndex, newTranslate, '', true);
				
				setTimeout(function(){
					allowItemClick = true;
				}, 100);
			}
			function handleClick(e) {
                if (!allowItemClick) return;
                animationFrameId && css3.caf(animationFrameId);
				var target = $(e.currentTarget);
                var value = target.attr('data-value');
                col.setValue(value, 300);
            }
			
			col.initEvents = function(detach){
				var method = detach ? 'off' : 'on';
				var events = css3.touchEvents;
				col.container[method](events.start, handleTouchStart);
				col.container[method](events.move, handleTouchMove);
				col.container[method](events.end, handleTouchEnd);
				col.container[method](events.start + ' ' + events.move + ' ' + events.end, function(e){
					e.preventDefault();
				});
				if(events.cancel){
					col.container[method](events.cancel, handleTouchEnd);
				}
				col.menu[method]('click', '.mobile_picker_item', handleClick);
			}
			col.destroyEvents = function(){
				col.initEvents(true);
			}
			
			col.initEvents();
		},
		setValue: function(arrValues, transition, valueCallbacks){
			if(!arrValues) return;
			if(util.type.isString(arrValues)){
				arrValues = arrValues.split(this.get('valueSperater'));
			} else if(util.type.isNumber(arrValues)){
				arrValues = [arrValues];
			}
			
			var valueIndex = 0;
            for (var i = 0; i < this._cols.length; i++) {
                if (this._cols[i] && !this._cols[i].divider) {
                    this._cols[i].setValue(arrValues[valueIndex], transition, valueCallbacks);
                    valueIndex++;
                }
            }
		},
		updateValue: function(f){
			var newValue = [];
			var newLabel = [];
            for (var i = 0; i < this._cols.length; i++) {
				if(!this._cols[i].divider){
					newValue.push(this._cols[i].value);
					newLabel.push(this._cols[i].label);
				}
            }
			
			if (newValue.indexOf(undefined) >= 0 || newLabel.indexOf(undefined) >= 0) {
                return;
            }
			
			this.set('selectedValue', newValue);
			this.set('selectedLabel', newLabel);
			var value = this.get('selectedValue');
			var label = this.get('selectedLabel');

			if(!f){
				this.trigger('change', {
					value: value,
					label: label
				});
			}
			
			if(this.get('isChangeUpdate')){
				this._updateValueToInput();
			}
		},
		_updateValueToInput: function(){
			var input = this.get('pickerName');
			var value = this.get('selectedValue');
			var label = this.get('selectedLabel');
			
			if(input && input.length){
				var formatValue = this.get('formatValue');
				input.val(formatValue ? formatValue.call(this, value, true) : value.join(this.get('valueSperater')));
			}
			var trigger = this.get('target')[0] ? this.get('target') : this.get('trigger');
			if(trigger[0].nodeName.toLowerCase() != 'input'){
				trigger.html(formatValue ? formatValue.call(this, label) : label.join(this.get('valueSperater')));
			} else {
				trigger.val(formatValue ? formatValue.call(this, label) : label.join(this.get('valueSperater')));
			}
		},
		show: function(){
			mobilePicker.parent('show').call(this);
			if(this._isInitPickerCol){
				
				var self = this;
				var labels = this.get('selectedLabel'),
					selectedValues = [];
				if(util.type.isString(labels)){
					labels = labels.split(this.get('valueSperater'));
				} else if(util.type.isNumber(labels)){
					labels = [labels];
				}
				$.each(this._cols, function(index, val){
					self._initPickerCol(val.container, !!self.get('selectedValue'));
					if(labels && labels[index]){
						selectedValues.push(val.getValue(labels[index]));
					}
				});
				if(selectedValues.length){
					this.set('selectedValue', selectedValues);
				}
				
				this.set('displayValue', this.get('selectedValue'));
				this._initPicker();
				delete this._isInitPickerCol;
			} else {
				this._afterPicker();
			}
		},
		_initPicker: function(){
			this.setValue(this.get('selectedValue'), 0, this.get('isChangeUpdate'));
		},
		_afterPicker: function(){
			this.get('isChangeUpdate') && this.setValue(this.get('displayValue'), 0);
		},
		destory: function(){
			$.each(this._cols, function(index, val){
				val && val.destroyEvents();
			});
			mobilePicker.parent('destory').call(this);
		}
	});
	
	function normalizeValue(val, template){
		var f;
		if(util.type.isString(val) || util.type.isNumber(val)){
			f = true;
		} else if(util.type.isObject(val)) {
			f = false;
		} else {
			throw new Error('mobile.mobilePicker: 数据格式不正确');
		}
		return util.string.replace(template, normalizeItem(val, f));
	}
	function normalizeItem(val, f){
		if(f !== undefined){
			var id = uid();
			return {
				value: f ? val : val.value != undefined ? val.value : id,
				label: f ? val : val.label || id
			}
		}
		throw new Error('widge.select: 找不到数据源');
	}
	function isDom(menu){
		return menu && menu.jquery && menu[0];
	}
	
	return mobilePicker;

});