// JavaScript Document

define('widge.validator.form', 
	'widge.validator.rule, widge.validator.handler, widge.validator.item, module.verifier, module.dataSource'
, function(require, exports, module) {

	var util = require('base.util'),
		rules = require('widge.validator.rule').rules,
		item = require('widge.validator.item'),
		handler = require('widge.validator.handler'),
		dataSource = require('module.dataSource').dataSource,
		$ = module['jquery'],
		shape = module['base.shape'],
		verifier = module['module.verifier'],
		doc = document,
		template = {
			"element": [
				":text, :password, :file, select, textarea",
				"focusin focusout keyup"
			],
			"select": [
				":radio, :checkbox, select",
				"change"
			]
		};

	var form = shape(function(o){
		form.parent().call(this, util.merge({
			element: $('form'),
			rules: {},
			groups: {},
			keepGroupEvent: true,
			errorMessages: null,
			validMessages: null,
			errorClass: null,
			validClass: null,
			errorElement: "label",
			isFocus: true,
			isFind: false,
			keepBlur: null,
			keepKey: null,
			keepErrorFocus: null,
			isCache: true
		}, o));
		if(!this.get('element')[0]){
			throw new Error('无法找到指定的表单');
		}
		this.init();
	});
	
	form.implement({
		_reset: function(){
			this.successList = [];
			this.errorList = [];
			this.emptyList = [];
			this.errorCache = {};
			this.errorMap = {};
			this.currentElements = $([]);
			this.toShow = $([]);
			this.toHide = $([]);
			this.pendingRequest = 0;
		},
		addDomCache: function(f){
			this.set('isCache', f);
			if(!this.get('isCache')){
				return;
			}
			var e = this._rule._rules;
			for(var key in e){
				if(this._labelCache[key] || this._targetCache[key]){
					continue;
				}
				
				item.getTargetCache.call(this, key);
				item.getLabelCache.call(this, key);
			}
		},
		removeDomCache: function(e){
			if(!e) return;
			delete this._labelCache[e];
			delete this._targetCache[e];
		},
		init: function(){
			this._previousValue = {};
			this._targetCache = {};
			this._labelCache = {};
			this._reset();
			this.keepBlur();
			this.keepKey();
			this.keepErrorFocus();
			this.after('addRules', function(e){
				if(this.get('isCache')){
					this.addDomCache(true);
				}
			});
			this.after('removeRules', util.bind(this.removeDomCache, this));
			this._initRules();
			var self = this;
			function delegate(event) {
				var eventType = "on" + event.type;
				handler[eventType].call(self, this[0], event);
			}
			$.each(template, function(key, val){
				self._delegate(val[0], val[1], delegate);
			});
		},
		_initRules: function(){
			this._rule = new rules(this);
			this.addRules(this.get('rules'));
			this.keepGroupEvent();
			this.addGroup(this.get('groups'));
			this._initMethod();
			this._addCustomMethod();
			this.addErrorMessages(this.get('errorMessages'));
			this.addValidMessages(this.get('validMessages'));
		},
		_addCustomMethod: function(){
			this._remoteTime = {};
			this._remoteDataSource = {};
			this.addMethod('remote', function(element, param){
				element = element[0];
				var result = 'pending',
					options = {},
					callback = null,
					url, status;
					
				if(util.type.isString(param)){
					url = param;
					timeout = 100;
				} else if(util.type.isObject(param)){
					options = $.extend({}, param);
					url = param.url;
					timeout = options.timeout || 0;
					callback = options.callback;
					status = options.status;
					delete options.timeout;
					delete options.status;
					delete options.url;
					delete options.callback;
				} else {
					throw new Error('widge.validator.form: remote参数不正确');
				}
				options['isCache'] = true;
				try {
					var self = this,
						value = verifier.elementValue(element),
						remoteDataSource = this._remoteDataSource[element.name] || new dataSource(),
						dataCache = remoteDataSource.getCache(value);

					function passed(element, f){
						self.errorCache && delete self.errorCache[element.name];
						if(!f){
							self.successList.push({
								element: element,
								message: self._rule._validMsgs[element.name] || ''
							});
							item.showErrors.call(self);
						}
						return true;
					}
					function errored(element, f){
						self.errorCache && (self.errorCache[element.name] = true);
						var message = status || item.defaultMessage.call(self, element, 'remote' );
							if(!f){
								var errors = {};
								errors[element.name] = {
									message: util.type.isFunction(message) ? message(value) : message,
									element: element,
									ruleType: 'remote'
								};
								item.showErrors.call(self, errors);
							}
						return false;
					}
					function execture(e){
						if(util.type.isFunction(callback)){
							result = callback.call(this, e);
						} else if(util.type.isBoolean(callback)){
							result = callback;
						} else {
							status = status && e[status];
							result = status || !e;
						}
						return result;
					}
					
					if(dataCache !== undefined){
						result = execture.call(this, dataCache);
						return result ? passed(element, true) : errored(element, true);
					} else {
						remoteDataSource.setOptions(options);
						remoteDataSource.setData(url);
						remoteDataSource.clearAllCache();
						remoteDataSource.getData(value);
						this.formSubmitted && this.pendingRequest++;
					}
					
					if(!this._remoteDataSource[element.name]){
						this._remoteDataSource[element.name] = remoteDataSource;
						remoteDataSource.on('data', function(e){
							self._remoteTime[element.name] && clearTimeout(self._remoteTime[element.name]);
							self._remoteTime[element.name] = setTimeout(function(){
								result = execture.call(self, e);
								result ? passed(element) : errored(element);
								if(self.formSubmitted){
									self.pendingRequest--;
									if(self.pendingRequest <= 0){
										self.pendingRequest = 0;
									}
									if(!self.pendingRequest){
										if(util.type.isEmptyObject(self.errorCache)){
											self._submitResult.call(self, true);
										}
										self.formSubmitted = false;
										delete self._submitResult;
									}
								}
								
							}, timeout);
						});
					}
				} catch (ex) {
					throw new Error('widge.validator.form:' + ex);
				}
				return result;
			});
		},
		clearRemoteCache: function(element){
			var name;
			if(element.nodeType){
				name = element.name;
			} else if(util.type.isString(element)){
				name = element;
			} else {
				name = element[0].name;
			}
			this._remoteDataSource[name] && this._remoteDataSource[name].clearAllCache();
		},
		keepGroupEvent: function(){
			var isEvent = this.get('keepGroupEvent'),
				self = this;
			if(util.type.isBoolean(isEvent) || util.type.isObject(isEvent)){
				this._rule._keepGroupEvent = isEvent;
			} else if(util.type.isString(isEvent)){
				this._rule._keepGroupEvent = {};
				$.each(isEvent.split(/\s/), function(index, val){
					self._rule._keepGroupEvent[val] = true;
				});
			}
		},
		keepBlur: function(blur){
			this._keepEvent('keepBlur', blur);
		},
		keepKey: function(key){
			this._keepEvent('keepKey', key);
		},
		keepErrorFocus: function(focus){
			this._keepEvent('keepErrorFocus', focus);
		},
		_keepEvent: function(type, value){
			value != undefined && this.set(type, value);
			var result = this.get(type);
			if(util.type.isBoolean(result)){
				this['_' + type] = result;
			} else if(util.type.isString(result)){
				this['_' + type] = {};
				var self = this;
				$.each(result.split(/\s/), function(key, val){
					self['_' + type][val] = true;
				});
			}
		},
		_initMethod: function(){
			var self = this, methods = {};
			$.each(verifier, function(key, value){
				if(/getLength|checkable|selectable|elementValue/.test(key)){
					return;
				}
				methods[key] = value;
			});
			if(!util.type.isEmptyObject(methods)){
				this._rule.setMethod(methods);
			}
		},
		_delegate: function(delegate, type, handler){
			return this.get('element').on(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		},
		addMethod: function(name, method, message){
			if(util.type.isFunction(method)){
				var m = {}
				m[name] = method;
				this._rule.setMethod(m);
				
				if(message){
					var e = {};
					e[name] = message;
					this._rule.setCustomErrorMessages(e);
				}
			}
		},
		removeMethod: function(name){
			this._rule.removeMethod(name);
			this._rule.removeCustomErrorMessages(name);
		},
		addRules: function(rule, value, cover){
			if(!rule) return;
			if(util.type.isObject(rule)){
				this._rule.setRules(rule, value);
			} else if(util.type.isString(rule)){
				var e = {};
				e[rule] = value;
				this._rule.setRules(e, cover);
			}
		},
		removeRules: function(rule, value){
			if(!rule) return;
			var f = this._rule.removeRules(rule, value);
			if(f){
				if((!value || value === "remote") && this._remoteDataSource[rule]){
					if(this._remoteDataSource[rule]){
						this._remoteDataSource[rule].destory(true);
						delete this._remoteDataSource[rule];
					}
				}
			}
		},
		getRules: function(){
			return this._rule._rules;
		},
		addErrorMessages: function(message, value){
			if(util.type.isObject(message)){
				this._rule.setErrorMessages(message);
			} else if(util.type.isString(message)){
				var e = {};
				e[message] = value;
				this._rule.setErrorMessages(e);
			}
		},
		removeErrorMessages: function(message, value){
			this._rule.removeErrorMessages(message, value);
		},
		addValidMessages: function(message, value){
			if(util.type.isObject(message)){
				this._rule.setValidMessages(message);
			} else if(util.type.isString(message)){
				var e = {};
				e[message] = value;
				this._rule.setValidMessages(e);
			}
		},
		removeValidMessages: function(message, value){
			this._rule.removeValidMessages(message, value);
		},
		addGroup: function(group){
			if(util.type.isObject(group)){
				this._rule.setGroup(group);
			} else if(util.type.isString(group)){
				var e = {};
				e[group] = value;
				this._rule.setGroup(e);
			}
		},
		removeGroup: function(group){
			this._rule.removeGroup(group);
		},
		checkForm: function(isFind){
			isFind && this.set('isFind', isFind);
			var f = this.isValid();
			this.errorCache = $.extend({}, this.errorMap);
			item.showErrors.call(this);
			return f;
		},
		isValid: function(){
			var result, f = true;
			item.prepareForm.call(this);
			for ( var i = 0, elements = (this.currentElements = item.allElements.call(this)); elements[i]; i++ ) {
				result = item.check.call(this, elements[i]);
				if(/pending/.test(result)){
					f = false;
					this._isRemote = true;
				}
			}
			
			item.focusInvalid.call(this);
			return f && this.errorList.length === 0;
		},
		resetFormSubmitted: function(){
			this.formSubmitted = false;
		},
		isFormSubmitted: function(){
			return this.formSubmitted;
		},
		submit: function(callback, errorback){
			if(this.formSubmitted){
				return;
			}
			delete this._isRemote;
			this.formSubmitted = true;
			var isFind = this.get('isFind'),
				result;
			
			if(util.type.isObject(callback)){
				var opts = callback;
				callback = opts.callback;
				errorback = opts.errorback;
				isFind = opts.isFind || isFind;
			}
			
			this._submitResult = callback || (this.getElement() && this.getElement().submit);
			if(result = this.checkForm(isFind)){
				callback ? callback.call(this, result) : this.getElement().submit();
			} else {
				errorback && errorback.call(this, result);
			}
			if(!this._isRemote){
				this.formSubmitted = false;
			}
		},
		getElement: function(){
			var element = this.get('element');
			if(element && element[0].nodeName.toLowerCase === "form"){
				return element;
			} else if(element.closest('form').length) {
				return element.closest('form');
			} else if(element.find('form').length){
				return element.find('form');
			}
			return null;
		},
		checkElement: function(element){
			element = element.nodeName ? element : element[0];
			element = item.targetFor.call(this, element);
			item.prepareElement.call(this, element);
			this.currentElements = item.getTargetCache.call(this, element) || $([]);
			var result = item.check.call(this, element);
			if(/pending/.test(result)){
				return false;
			}
			item.showErrors.call(this);
			return result;
		},
		resetElement: function(element, f){
			var allClass = this.get('errorClass') + ' ' + this.get('validClass');
			element = element.nodeName ? element : element[0];
			item.prepareElement.call(this, element);
			this.currentElements = item.getTargetCache.call(this, element);
			var label = item.getLabelCache.call(this, element);
			label.removeClass(allClass).html('');
			this.currentElements.removeClass(allClass);
			if(!f){
				if(verifier.checkable(element)){
					this.currentElements.prop('checked', false);
				} else if(verifier.selectable(element)){
					this.currentElements.prop('selectedIndex', 0);
				} else {
					this.currentElements.val('');
				}
			}
			this.trigger('clearItem', {
				label: label,
				element: this.currentElements
			});
		},
		resetForm: function(f){
			var allClass = this.get('errorClass') + ' ' + this.get('validClass');
			item.prepareForm.call(this);
			this.formSubmitted = false;
			this.toHide.removeClass(allClass).html('');
			this.toShow.removeClass(allClass).html('');
			var allElements = item.allElements.call(this);
			allElements.removeClass(allClass);
			f && this.getElement() && this.getElement()[0].reset();
			this.trigger('clear', {
				hideElements: this.toHide,
				showElements: this.toShow,
				allElements: allElements
			});
		}
	});
	
	if (!$.event.special.focusin && !$.event.special.focusout && doc.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	
	return form;
});