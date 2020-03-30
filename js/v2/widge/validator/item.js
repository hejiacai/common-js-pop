+// JavaScript Document

define('widge.validator.item', 'module.verifier', function(require, exports, module){
	
	var util = require('base.util'),
		verifier = module['module.verifier'],
		$ = module['jquery'],
		elementsList = {
			element: "input, select, textarea",
			notElement: ":submit, :reset, :image, [disabled]"
		}; 
	
	exports.clean = function(element){
		if(!element) return;
		if(element.getAttribute && element.getAttribute('data-for')) {
			return $("[data-for='" + element.getAttribute('data-for') + "']", this.get('element'));	
		} else if(util.type.isString(element) || util.type.isString(element.name)){
			return $("[name='" + (element.name || element) + "']", this.get('element'));
		} else {
			return $(element, this.get('element'));
		}
	};
	exports.targetFor = function(element){
		if (verifier.checkable(element)) {
			this._targetCache[element.name] = element = exports.clean.call(this, element)[0];
		}
		return element;
	};
	exports.getTargetCache = function(element){
		
		if(!element || util.type.isFunction(element)){ return; }
		
		if(!util.type.isString(element) && !element.nodeName){
			element = element[0];
		}
		
		var name = util.type.isString(element) ? element : element.name;
		var cache = this._targetCache[name];
		if(!cache || (cache && !cache.length)){
			this._targetCache[name] = exports.clean.call(this, name);
		}
		
		return this._targetCache[name];
	}
	exports.getLabelCache = function(element){
		if(!util.type.isString(element) && !element.nodeName){
			element = element[0];
		}
		var name = util.type.isString(element) ? element : element.name,
			cache = this._labelCache[name];

		if(!cache || (cache && !cache.length)){
			this._labelCache[name] = exports.errorsFor.call(this, name);
		}
		return this._labelCache[name];
	}
	exports.idOrName = function(element) {
		
		if(!element){ return; }
		
		var name = util.type.isString(element) ? element : element.name;
		return this._rule._groups[name] || name;
	};
	exports.errors = function(){
		return $( this.get('errorElement') + "[data-for]", this.get('element') );
	};
	exports.errorsFor = function(element) {
		element = exports.idOrName.call(this, element);
		return exports.errors.call(this).filter("[data-for='" + element + "']");
	};
	exports.prepareElement = function(element){
		this._reset();
		this.toHide = exports.errorsFor.call(this, element);
	}
	exports.prepareForm = function(){
		this._reset();
		this.toHide = exports.errors.call(this);
	}
	exports.validElements = function(){
		return this.currentElements.not(exports.invalidElements.call(this)).not(exports.emptyElements.call(this));
	};
	exports.emptyElements = function(){
		return $(this.emptyList).map(function(){
			return this;
		});
	},
	exports.invalidElements = function(){
		return $(this.errorList).map(function(){
			return this.element;
		});
	};
	exports.defaultMessage = function(element, method){
		var rule = this._rule,
			m = rule._errorMsgs[element.name];
		if(m){
			if(util.type.isString(m)){
				return m;
			} else if(m[method]){
				return m[method] || '';
			} else {
				return rule._customErrorMsgs[method] || '';
			}
		} else {
			return rule._customErrorMsgs[method] || '';
		}
		return '';
	};
	exports.objectLength = function(obj){
		var count = 0;
		for (var i in obj){
			count++;
		}
		return count;
	};
	exports.highlight = function(element, errorClass, validClass){
		element = exports.getTargetCache.call(this, element);
		element && element.addClass(errorClass).removeClass(validClass);
		return element;
	};
	exports.unhighlight = function(element, errorClass, validClass) {
		element = exports.getTargetCache.call(this, element);
		element && element.addClass(validClass).removeClass(errorClass);
		return element;
	};
	exports.showErrors = function(errors){
		if (errors){
			for (var name in errors){
				this.errorList.push({
					message: errors[name].message,
					element: errors[name].element,
					errorClass: this.get('errorClass'),
					ruleType: errors[name].ruleType
				});
			}
			$.extend(this.errorMap, errors);
			this.successList = $.grep(this.successList, function(element){
				return !(element.name in errors);
			});
		}
		
		exports.defaultShowErrors.call(this);
	};
	exports.defaultShowErrors = function(){
		var errorClass = this.get('errorClass'),
			validClass = this.get('validClass'),
			ruleGroups = this._rule._groups,
			groups = {}, 
			record = {},
			i, group, error, target, label;
		for (i = 0; this.errorList[i]; i++){
			error = this.errorList[i];
			group = ruleGroups[error.element.name];
			if(record[group]){
				continue;
			}
			target = exports.highlight.call(this, error.element, errorClass, validClass);
			label = exports.showLabel.call(this, false, error.element, error.message, error.errorClass);
			this.trigger('invalid', {
				type: 'invalid',
				ruleType: error.ruleType,
				target: target,
				name: error.element.name,
				label: label,
				errorClass: errorClass,
				validClass: validClass,
				message: error.message
			});
			if(group){
				record[group] = 1;
				groups[group] = true;
			}
			if(this.get('isFind')) return;
		}
		for (i = 0; this.successList[i]; i++){
			var success = this.successList[i],
				group = this._rule._groups[success.element.name];
			if(group && groups[group]){
				continue;
			}
			label = exports.showLabel.call(this, true, success.element, success.message);
			this.trigger('pass', {
				type: 'pass',
				target: exports.getTargetCache.call(this, success.element),
				name: success.element.name,
				label: label,
				errorClass: errorClass,
				validClass: validClass,
				message:success.message
			});
		}
		for (i = 0, elements = exports.validElements.call(this); elements[i]; i++){
			exports.unhighlight.call(this, elements[i], errorClass, validClass);
		}
		this.toHide = this.toHide.not(this.toShow);
	};
	exports.showLabel = function(b, element, message, errorClass){
		var label = exports.getLabelCache.call(this, element),
			errorClass = errorClass || this.get('errorClass'),
			validClass = this.get('validClass');
		if(!label.length) return;
		label.html(message);
		if(validClass || errorClass){
			if(b){
				exports.unhighlight.call(this, label[0], errorClass, validClass);
			} else {
				exports.unhighlight.call(this, label[0], validClass, errorClass);
			}
		}
		this.toShow = this.toShow.add(label);
		return label;
	};
	exports.check = function(element, isGroup){
		element = exports.targetFor.call(this, element);
		
		if(!element) return;
		
		var el = exports.getTargetCache.call(this, element),
			rules = this._rule._rules[element.name],
			method;
		
		if(rules == undefined) {
			this.emptyList.push(element);
			return;
		} else {
			$.grep(this.emptyList, function(index, val){
				return val != element;
			});
		}
		for (method in rules){
			if(!this._rule._methods[method]) continue;
			var rule = {method: method, value: rules[method]};
			var result = this._rule._methods[method].call(
					this, el, rule.value
				);
			if ( /pending/.test(result) ){
				this.toHide = this.toHide.not( exports.errorsFor.call(this, element) );
				var type = result === "pending" ? 'remote' : result;
				this.trigger(type, {
					type: type,
					target: exports.getTargetCache.call(this, element),
					name: element.name,
					label: exports.getLabelCache.call(this, element),
					errorClass: this.get('errorClass')
				});
				return result;
			}
			if (!result){
				if(isGroup){
					this.errorList = util.array.filter(this.errorList, function(n){
						return name !== n.element.name;
					});
				}
				exports.formatAndAdd.call(this, element, rule);
				exports.addGroupCache.call(this, element);
				return false;
			}
		}
		if (exports.objectLength(rules)){
			this.successList.push({
				message: this._rule._validMsgs[element.name] || '',
				element: element
			});
		} 
		return exports.getResult.call(this, element);
	}
	exports.getResult = function(element){
		var name = element.name,
			rule = this._rule,
			val;

		if(val = rule._errorGroups[rule._groups[name]]){
			var i = 0, g,
				group = val,
				cache = rule._errorGroupsCache[rule._groups[name]];

			cache.push(name);
			cache = util.array.unique(cache);
			
			$.each(cache, function(index, val){
				group = util.array.filter(group, function(value){
					return val !== value;
				});
			});
			rule._errorGroupsCache[rule._groups[name]] = cache;
			if(group.length){
				for(; group[i]; i++){
					g = exports.getTargetCache.call(this, group[i]);
					if(!exports.check.call(this, g[0], true)){
						this.successList = util.array.filter(this.successList, function(n){
							return n.element.name !== name;
						});
						return false;
					}
				}
			}
		}
		return true;
	}
	exports.formatAndAdd = function(element, rule){
		var errorClass = this.get('errorClass'),
			message = exports.defaultMessage.call(this, element, rule.method);
		if (util.type.isFunction(message)){
			message = message.call(this, element, rule.result);
		}		
		this.errorList.push({
			message: message,
			element: element,
			errorClass: errorClass,
			ruleType: rule.method
		});
		this.errorMap[element.name] = message;
	}
	exports.addGroupCache = function(element){
		var name = element.name,
			rule = this._rule;
		
		if(rule._errorGroups[rule._groups[name]]){
			rule._errorGroupsCache[rule._groups[name]] = util.array.filter(rule._errorGroupsCache[rule._groups[name]], function(n){
				return n !== name;
			});
		}
	}
	exports.allElements = function(){
		var rulesCache = {}, 
			rule = this._rule;
		return this.get('element').find(elementsList.element).not(elementsList.notElement).filter(function() {
			if ( this.name in rulesCache || !exports.objectLength(rule._rules[this.name]) )
				return false;
			return rulesCache[this.name] = true;
		});
	}
	exports.focusInvalid = function() {
		if( this.get('isFocus')) {
			var i = 0;
			if(this._keepErrorFocus === true){return;}
			for(len = this.errorList.length; i < len; i++){
				var element = this.errorList[i].element,
					name = element && element.name;
				if(!name || (this._keepErrorFocus && this._keepErrorFocus[name])){
					break;
				}
				$(element || []).filter(":visible").focus();
				break;
			}
		}
	}
});