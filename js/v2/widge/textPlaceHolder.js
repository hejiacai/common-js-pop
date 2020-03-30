// JavaScript Document
define('widge.textPlaceHolder', 'widge.input', function(require, exports, module){

	var $ = module['jquery'],
		input = module['widge.input'],
		util = require('base.util'),
		Class = require('base.class').Class,
		doc = document,
		isPlaceHolder = "placeholder" in doc.createElement('input');
		
	var textPlaceHolder = Class(function(o){
		textPlaceHolder.parent().call(this, util.merge({
			element: $('input').eq(0),
			defaultValue: '请输入关键字',
			defaultColor: '#999'
		}, o));
	}).extend(input);
	
	textPlaceHolder.implement({
		init: function(){
			if(!this.get('element')[0]){
				this.destory();
				return;
			}
			!isPlaceHolder && this.set('color', this.get('element').css('color'));
			this._render();
			textPlaceHolder.parent('init').call(this);
		},
		setDefaultValue: function(text){
			this.set('defaultValue', text);
			this._render();
		},
		_render: function(){
			var element = this.get('element');
			if(isPlaceHolder){
				element.attr('placeholder', this.get('defaultValue'));
			} else {
				if(!$.trim(element.val()) && !this._isInputed){
					this._isInputed = false;
					element.val(this.get('defaultValue')).css('color', this.get('defaultColor'));
				} else {
					this._isInputed = true;
				}
			}
		},
		_handleFocus: function(e){
			var element = this.get('element');
			if(isPlaceHolder){
				e.isInputed = !$.trim(element.val()) ? true : false;
			} else {
				if($.trim(element.val()) == this.get('defaultValue') && this._isInputed == false){
					element.val('');
					this._isInputed = true;
				}
				e.isInputed = this._isInputed;
			}
			this.trigger('focus', e);
		},
		_handleBlur: function(e) {
			var element = this.get('element');
			if(isPlaceHolder){
				e.isInputed = !$.trim(element.val()) ? false : true;
			} else {
				if(!$.trim(element.val())){
					this._isInputed = false;
					element.val(this.get('defaultValue')).css('color', this.get('defaultColor'));
				}
				e.isInputed = this._isInputed;
			}
			this.trigger('blur', e);
		},
		_change: function(){
			var element = this.get('element');
			if(!isPlaceHolder){
				if($.trim(element.val()) != this.get('defaultValue')){
					this._isInputed = true;
				}
				element.css('color', this.get('color'));
			}
			textPlaceHolder.parent('_change').call(this);
		},
		getValue: function() {
			var element = this.get('element');
			if(isPlaceHolder){
				return element.val();
			} else {
				return this._isInputed ? element.val() : '';
			}
		},
		setValue: function(val) {
			textPlaceHolder.parent('setValue').call(this, val);
			if(!isPlaceHolder && !val){
				this._isInputed = false;
				this.get('element').val(this.get('defaultValue')).css('color', this.get('defaultColor'));
			}
		}
	});
	return textPlaceHolder;
	
});
	