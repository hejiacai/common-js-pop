// JavaScript Document
define('widge.calendar.baseCalendar', 'widge.calendar.lang, tools.position, tools.iframe, tools.dateFormat', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		dateFormat = module['tools.dateFormat'],
		position = module['tools.position'],
		util = require('base.util'),
		shim = require('tools.iframe').shim,
		currentDate = new dateFormat(),
		langs = module['widge.calendar.lang'],
		template = '<div></div>',
		doc = document,
		body = doc.body;
	
	var ua = (window.navigator.userAgent || "").toLowerCase(),
		match = ua.match(/msie\s+(\d+)/),
		insaneIE = false;
	if(match && match[1]){
		insaneIE = parseInt(match[1], 10) < 9;
	}
	if(doc.documentMode && doc.documentMode < 9){
		insaneIE = true;
	}
	
	var baseCalendar = shape(function(o){
		baseCalendar.parent().call(this, util.merge({
			lang: 'zh-cn',
			trigger: null,
			output: null,
			focus: null,
			triggerType: 'click',
			template: template,
			hideOnSelect: true,
			format: 'yyyy-MM-dd',
			startDay: 'Sun',
			range: null,
			process: null,
			align: {
				selfXY: [0, 0],
				baseXY: [0, '100%-1px']
			},
			zIndex: 999
		}, o));
		this.init();
	});
	
	baseCalendar.implement({
		setRange: function(val){
			if(util.type.isArray(val)){
				var format = this.get('format'),
					range = [];
				$.each(val, function(i, date){
					date = date === null ? null : util.type.isString(date) || util.type.isDate(date) ? new dateFormat(date) : date;
					range.push(date);
				});
				return this._range = range;
			}
			return this._range = val;
		},
		_render: function(){
			var target,
				className = normalizeClassName(this.get('className')),
				element = $(this.get('template'));
			
			element.addClass(className);
			if(this.get('idName')){
				if(util.type.isArray(this.get('idName'))){
					$(this.get('idName')).each(function(index, val){
						element.addClass(val);
					});
				} else {
					element.addClass(this.get('idName'));
				}
			}
			this.element = element.appendTo(body).hide();
		},
		init: function(){
			this.setFocus(this.get('focus'));
			this._render();
			this._initOutput();
			this.setZIndex(this.get('zIndex'));
			this._bindBaseElement();
			this.enable();
			
			if(typeof this.get('lang') === 'string'){
				this.set('lang', langs[this.get('lang')]);
			}
			this._shim = new shim(this.element);
			var self = this;
			
			this.element.on('mousedown', function(e){
				if(insaneIE){
					var trigger = $(self.get('trigger'))[0];
					trigger.onbeforedeactivate = function(){
						window.event.returnValue = false;
						trigger.onbeforedeactivate = null;
					}
				}
				e.preventDefault();
			});
		},
		setZIndex: function(zIndex){
			zIndex && this.set('zIndex', zIndex);
			this.element.css('zIndex', this.get('zIndex'));
		},
		setFocus: function(val){
			if(!val){
				return this._focus = currentDate;
			}
			if(dateFormat.isDate(val)){
				return this._focus = val;
			}
			return this._focus = new dateFormat(val);
		},
		_initOutput: function(){
			var output = this.get('output');
			this.set('output', output || this.get('trigger'));
		},
		_bindBaseElement: function(){
			var align = this.get('align');
			align.baseElement = this.get('trigger');
			this.set('align', align);
		},
		show: function(){
			this._pin();
			this.element.show();
			this.trigger('show');
		},
		hide: function(){
			this.element.hide();
			this.trigger('hide');
		},
		_pin: function(align){
			align = align || this.get('align');
			position.pin({
				element: this.element,
				x: align.selfXY[0],
				y: align.selfXY[1]
			}, {
				element: align.baseElement,
				x: align.baseXY[0],
				y: align.baseXY[1]
			});
		},
		output: function(value, f){
			var output = this.get('output');
			if(!output.length){
				return;
			}
			
			value = value != undefined ? value : this._focus.toString(this.get('format'));
			var tagName = output[0].tagName.toLowerCase();
			if(tagName === 'input' || tagName === 'textarea'){
				output.val(value);
			} else {
				output.text(value);
			}
			!f && this.get('trigger').trigger('blur');
			if(!f && this.get('hideOnSelect')){
				this.hide();
			}
		},
		_outputTime: function(){
			var output = this.get('output'),
				value = output.val() || output.text();
				
			if(value){
				try {
					value = new dateFormat(value);
					return value;
				} catch (ex) {}
			}
		},
		enable: function(){
			var trigger = this.get('trigger');
			if(!trigger){
				return;
			}
			var self = this,
				$trigger = $(trigger);
			if($trigger.attr('type') === 'date'){
				try {
					$trigger.attr('type', 'text');
				} catch (e) {}
			}
			var eventName = this.get('triggerType') + '.calendar';
			$trigger.on(eventName, function(){
				self.show();
				self._shim.shim();
			}).on('blur.calendar', function(e){
				self.hide();
				self._shim.shim();
				self.trigger('noSelect', e);
			});
			if ($trigger[0].tagName.toLowerCase() !== 'input') {
				self.autohide();
			}
		},
		disable: function(){
			var trigger = this.get('trigger'),
				self = this;
			if(trigger){
				var $trigger = $(trigger),
					event = this.get('triggerType') + '.calendar';
				$trigger.off(event);
				$trigger.off('blur.calendar');
			}
		},
		autohide: function(){
			var self = this,
				trigger = $(this.get('trigger'))[0],
				element = this.element;
			
			$(body).on('mousedown.calendar', function(e){
				if(element.find(e.target).length || element[0] === e.target){
					return;
				}
				if(trigger !== e.target){
					self.hide();
				}
			});
		},
		destory: function(){
			if(this._shim){
				this._shim.destory();
			}
			$(body).off('mousedown.calendar');
			baseCalendar.parent('destory').call(this);
		}
		
	});
	function normalizeClassName(name){
		if(name){
			name = defaultName + '_' + name;
		}
		return name;
	}
	
	exports.baseCalendar = baseCalendar;
});
	