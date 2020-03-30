// JavaScript Document

define('widge.input', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		lteIE9 = /\bMSIE [6789]\.0\b/.test(navigator.userAgent);
		keyMap = {
			9: 'tab',
			27: 'esc',
			37: 'left',
			39: 'right',
			13: 'enter',
			38: 'up',
			40: 'down'
		}
	
	var input = shape(function(o){
		this.readOnlyAttrs = {
			type: true,
			keyMap: true,
			delay: true
		};
		input.parent().call(this, util.merge({
			element: $('#searchInput'),
			query: null,
			delay: 100,
			eventType: 'autocomplete',
			keyMap: keyMap
		}, o));
		this.init();
	});
	
	input.implement({
		init: function(){
			this._initEvents();
			this.set('query', this.getValue());
		},
		_initEvents: function(){
			var input = this.get('element'),
				type = this.get('eventType'),
				timer;
			
			if(type === 'autocomplete'){
				input.attr(type, 'off');
			}
			
			input.on('focus.' + type, util.bind(this._handleFocus, this))
			.on('blur.' + type, util.bind(this._handleBlur, this))
			.on('keydown.' + type, util.bind(this._handleKeydown, this));
			
			if(!lteIE9){
				input.on('input.' + type, util.bind(this._change, this));
			} else {
				var events = [
						'keydown.' + type,
						'keypress.' + type,
						'cut.' + type,
						'paste.' + type
					].join(' '),
					self = this;
				input.on(events, function(e){
					if(keyMap[e.which]) return;
					timer && clearTimeout(timer);
					timer = setTimeout(function(){
						self._change.call(self, e);
					}, self.get('delay'));
				});
			}
		},
		_handleFocus: function(e) {
			this.trigger('focus', e);
		},
		_handleBlur: function(e) {
			this.trigger('blur', e);
		},
		_handleKeydown: function(e) {
			var keyName = keyMap[e.which];
			if (keyName) {
				var eventKey = 'key' + ucFirst(keyName);
				this.trigger(e.type = eventKey, e);
			}
		},
		_change: function(){
			var newVal = this.getValue(),
				oldVal = this.get('query'),
				isSame = compare(oldVal, newVal),
				isSameExpectWhitespace = isSame ? (newVal.length !== oldVal.length) : false;

      		if (isSameExpectWhitespace) {
        		this.trigger('whitespaceChanged', oldVal);
      		}
      		if (!isSame) {
        		this.set('query', newVal);
        		this.trigger('queryChanged', newVal, oldVal);
      		}
		},
		getValue: function() {
			return this.get('element').val();
		},
		setValue: function(val) {
			this.get('element').val(val);
			this._change();
		},
		destory: function() {
      		input.parent('destory').call(this);
    	}
	});
	
	function compare(a, b) {
		a = (a || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
		b = (b || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
		return a === b;
	}
	function ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}
	
	return input;
});