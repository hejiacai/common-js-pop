// JavaScript Document

define('widge.validator.handler', 
	'widge.validator.item, module.verifier', 
function(require, exports, module){
	
	var util = require('base.util'),
		item = require('widge.validator.item'),
		verifier = module['module.verifier'],
		$ = module['jquery'], timer; 
	
	exports.checkPreviousValue = function(element){
		if(this._keepKey === true || (this.keepKey[element.name])){
			return false;
		}
		return verifier.required(element) && this._previousValue[element.name] === element.value;
	}
	exports.onfocusin = function(element, event){
		item.unhighlight.call(this, element, this.get('errorClass'));
		this.trigger('focus', normalizeObj(this, element, event));
	}
	exports.onfocusout = function(element, event){
		if(exports.checkPreviousValue.call(this, element)){
			return;
		}
		if(this.formSubmitted || this._keepBlur === true ||
		(this._keepBlur && this._keepBlur[element.name])){
			return;
		}
		this.trigger('beforeBlur', normalizeObj(this, element, event));
		if (!verifier.checkable(element)){
			this._previousValue[element.name] = element.value;
			this.checkElement(element);
		}
		this.trigger('blur', normalizeObj(this, element, event));
	}
	exports.onkeyup = function(element, event){
		if(exports.checkPreviousValue.call(this, element)){
			return;
		}
		if((this.formSubmitted || this._keepKey === true || 
		(this._keepKey && this._keepKey[element.name]))){
			return;
		}
		var self = this;
		timer && clearTimeout(timer);
		timer = setTimeout(function(){
			self._previousValue[element.name] = element.value;
			self.trigger('beforeKeyup', normalizeObj(self, element, event));
			self.checkElement(element);
			self.trigger('keyup', normalizeObj(self, element, event));
		}, 1);
	}
	exports.onchange = function(element, event){
		if(this.formSubmitted) return;
		this.trigger('beforeChange', normalizeObj(this, element, event));
		this.checkElement(element);
		this.trigger('change', normalizeObj(this, element, event));
	}
	function normalizeObj(context, element, event){
		var target = item.getTargetCache.call(context, element),
			label = item.getLabelCache.call(context, element);
		return {
			type: event.type,
			target: target,
			label: label,
			name: element.name,
			errorClass: context.get('errorClass'),
			validClass: context.get('validClass')
		}
	}
	
});