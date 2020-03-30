// JavaScript Document

define('widge.validator.rule', function(require, exports, module){
	
	var util = require('base.util'),
		$ = module['jquery'],
		whiteReg = /\s/;
	
	var rule = function(form){
			this._rules = {};
			this._groups = {};
			this._errorGroups = {};
			this._errorGroupsCache = {};
			this._customErrorMsgs = {};
			this._errorMsgs = {};
			this._validMsgs = {};
			this._methods = {};
			this._setForm(form); 
		};
		
	rule.prototype._setForm = function(form){
		this._form = form || this;
	}
	rule.prototype.setRules = function(rules, cover){
		this._rules = $.extend(this._rules, this._normalizeRules(rules, cover));
	};
	rule.prototype.removeRules = function(rules, value){
		var f = false;
		if(util.type.isString(rules)){
			var self = this;
			$.each(rules.split(whiteReg), function(index, val) {
				if(value){
					if(self._rules[val]){
						self.removeErrorMessages(val, value);
						self.removeValidMessages(val, value);
						self._rules[val][value] = null;
						delete self._rules[val][value];
						f = true;
					}
				} else {
					self.removeErrorMessages(val);
					self.removeValidMessages(val);
					self._rules[val] = null;
					delete self._rules[val];
					f = true;
				}
			});
		}
		return f;
	};
	rule.prototype.setGroup = function(group){
		if(util.type.isPlainObject(group)){
			var self = this,
				isEvent = this._keepGroupEvent;
				
			$.each(group, function(key, val){
				$.each(val.split(whiteReg), function(index, name){
					self._groups[name] = key;
					if((util.type.isBoolean(isEvent) && !isEvent) || 
					util.type.isObject(isEvent) && !!isEvent[key] === false){
						self._errorGroups[key] = self._errorGroups[key] || [];
						self._errorGroups[key].push(name);
						self._errorGroupsCache[key] = [];
					}
				});
			});
		}
	};
	rule.prototype.removeGroup = function(group){
		if(util.type.isString(group)){
			var self = this, value;
			$.each(group.split(whiteReg), function(index, val){
				for(var key in self._groups){
					value = self._groups[key];
					if(value && val === value){
						self._form.removeRules(key);
						delete self._groups[key];
					}
				}

				delete self._errorGroups[val];
				delete self._errorGroupsCache[val];
			});
		}
	};
	rule.prototype._normalizeRules = function(rules, cover){
		var self = this;
		$.each(rules, function(name, val){
			if(cover){
				rules[name] = self._normalizeRule(val);
			} else {
				rules[name] = $.extend(self._rules[name] || {}, self._normalizeRule(val));
			}
			if(util.type.isObject(val)){
				$.each(val, function(key, val){
					if (val === false){
						delete rules[name][key];
						return;
					}
				});
			}
		});
		return rules;
	};
	rule.prototype._normalizeRule = function(rules){
		if(util.type.isString(rules)) {
			var transformed = {};
			$.each(rules.split(whiteReg), function(index, val) {
				transformed[val] = true;
			});
			rules = transformed;
		}
		return rules;
	};
	rule.prototype.setMethod = function(methods){
		if(util.type.isPlainObject(methods)){
			var self = this;
			$.each(methods, function(key, val){
				self._methods[key] = val;
			});
		}
	};
	rule.prototype.removeMethod = function(methods){
		if(util.type.isString(methods)){
			var self = this;
			$.each(methods.split(whiteReg), function(index, val) {
				delete self._methods[val];
			});
		}
	};
	rule.prototype.setCustomErrorMessages = function(message){
		if(util.type.isPlainObject(message)){
			this._customErrorMsgs = $.extend(this._customErrorMsgs, message);
		}
	};
	rule.prototype.removeCustomErrorMessages = function(message){
		if(util.type.isString(message)){
			var self = this;
			$.each(message.split(whiteReg), function(index, val) {
				delete self._customErrorMsgs[val];
			});
		}
	}
	rule.prototype.setErrorMessages = function(message){
		if(util.type.isPlainObject(message)){
			this._errorMsgs = util.merge(this._errorMsgs, message);
		}
	};
	rule.prototype.removeErrorMessages = function(message, value){
		if(util.type.isString(message)){
			var self = this;
			$.each(message.split(whiteReg), function(index, val) {
				if(value){
					if(self._errorMsgs[val]){
						delete self._errorMsgs[val][value];
					}
				} else {
					delete self._errorMsgs[val];
				}
			});
		}
	}
	rule.prototype.setValidMessages = function(message){
		if(util.type.isPlainObject(message)){
			this._validMsgs = util.merge(this._validMsgs, message);
		}
	}
	rule.prototype.removeValidMessages = function(message, value){
		if(util.type.isString(message)){
			var self = this;
			$.each(message.split(whiteReg), function(index, val) {
				if(value){
					if(self._validMsgs[val]){
						delete self._validMsgs[val][value];
					}
				} else {
					delete self._validMsgs[val];
				}
			});
		}
	}
	
	exports.rules = rule;
});