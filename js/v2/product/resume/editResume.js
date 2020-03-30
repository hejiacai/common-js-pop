// JavaScript Document

define('product.resume.editResume', 
	'widge.validator.form',
function(require, exports, module) {

	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		validator = module['widge.validator.form'],
		inputElement = "[name={name}]",
		labelElement = "[data-for={name}]",
		nameReg = /\{name\}/;
		
	var editResume = shape(function(o){
			editResume.parent().call(this, util.merge({
				element: $('#baseinfor'),
				trigger: '.edit',
				formName: 'form',
				normalName: '.res-infor',
				editName: '.edit-status-box',
				validators: null,
				classes: {
					successLabel: 'success-msg',
					successText: 'success-text',
					errorLabel: 'error-msg',
					errorText: 'error-text',
					warningLabel: 'warning-msg',
					warningText: 'warning-text'
				},
				remoteInputClass: false,
				submitButton: '.saveBtn',
				cancelButton: '.cancelBtn'
			}, o));
			this.init();
		});
	
	editResume.implement({
		init: function(){
			this._initElements();
			this._isInit = true;
			this._initValidator();
			this._initEvent();
		},
		_initElements: function(){
			this._trigger = this.getDom(this.get('trigger'));
			this._normal = this.getDom(this.get('normalName'));
			this._edit = this.getDom(this.get('editName'));
			this._submitButton = this.getDom(this.get('submitButton')),
			this._cancelButton = this.getDom(this.get('cancelButton'));
		},
		_initValidator: function(){
			var v = this.get('validators');
			if(v){
				if(util.type.isObject(v)){
					this._validator = [new validator($.extend(v, {
						element: this.getDom(this.get('formName'))
					}))];
					check(0, this._validator[0]);
				} else if(util.type.isArray(v)){
					this._validator = [];
					for(var i = 0, len = v.length; i < len; i++){
						this._validator.push(new validator(
							$.extend(v[i], {
								element: this.getDom(this.get('formName')).eq(i)
							}
						)));
						check(i, this._validator[i]);
					}
				}	
			}
			var self = this;
			function check(index, val){
				val.on('focus', function(e){
					e.index = index;
					self.trigger('focus',e);
				});
				val.on('blur', function(e){
					e.index = index;
					self.trigger('blur',e);
				});
				val.on('invalid', function(e){
					e.index = index;
					self._invalid(e);
				});
				val.on('remote', function(e){
					e.index = index;
					self._remote(e);
				});
				val.on('pass', function(e){
					e.index = index;
					self._pass(e);	
				});
				val.on('clear', function(e){
					e.index = index;
					self._clear(e);
				});
				val.on('clearItem', function(e){
					self._clearItem(e);
				});
			}
		},
		_initEvent: function(){
			var element = this.get('element'),
				self = this;
			setTimeout(function(){
				self.trigger('render');
			}, 1);
			this.before('_handler', function(){
				if(this._isInit){
					var self = this;
					setTimeout(function(){
						self.trigger('init');
						delete self._isInit;
					}, 2);
				}
			});
			element.on('click', this.get('trigger'), util.bind(this._handler, this));
			element.on('click', this.get('submitButton'), util.bind(this._submit, this));
			element.on('click', this.get('cancelButton'), util.bind(this._cancel, this));
		},
		_invalid: function(e){
			var classes = this.get('classes'),
				successText = e.successTextClass = classes.successText,
				successLabel = e.successLabelClass = classes.successLabel,
				warningText = e.warningTextClass = classes.warningText,
				warningLabel = e.warningLabelClass = classes.warningLabel,
				errorText = e.errorTextClass = classes.errorText,
				errorLabel = e.errorLabelClass = classes.errorLabel;
			e.target.removeClass(successText + ' ' + warningText).addClass(errorText);
			e.label.removeClass(successLabel + ' ' + warningLabel).addClass(errorLabel);
			e.errorLabelClass = errorLabel;
			e.errorTextClass = errorText;
			
			this.trigger('invalid', e);	
		},
		_pass: function(e){
			e.target.removeClass(this.allClass('text'));
			e.label.removeClass(this.allClass('label'));
			
			var classes = this.get('classes');
			e.successTextClass = classes.successText,
			e.successLabelClass = classes.successLabel,
			e.warningTextClass = classes.warningText,
			e.warningLabelClass = classes.warningLabel,
			e.errorTextClass = classes.errorText,
			e.errorLabelClass = classes.errorLabel;
			
			this.trigger('pass', e);
		},
		_remote: function(e){
			var classes = this.get('classes'),
				successText = e.successTextClass = classes.successText,
				successLabel = e.successLabelClass = classes.successLabel,
				warningText = e.warningTextClass = classes.warningText,
				warningLabel = e.warningLabelClass = classes.warningLabel,
				errorText = e.errorTextClass = classes.errorText,
				errorLabel = e.errorLabelClass = classes.errorLabel;
			
			if(this.get('remoteInputClass')){
				e.target.removeClass(successText + ' ' + errorText).addClass(warningText);
				e.label.removeClass(successLabel + ' ' + errorLabel).addClass(warningLabel)
			}
			this.trigger('remote', e);
		},
		_clear: function(e){
			e.allElements.removeClass(this.allClass('text'));
			e.hideElements.removeClass(this.allClass('label'));
			e.showElements.removeClass(this.allClass('label'));
		},
		_clearItem: function(e){
			e.label.removeClass(this.allClass('label'));
			e.element.removeClass(this.allClass('text'));
		},
		_handler: function(e){
			if(this._edit.is(':hidden')){
				e.status = true;
				this._toggle(e);
				var self = this;
				setTimeout(function(){
					self._trigger.hide();
					self.trigger('modify', e);
				},1);
			}
		},
		_submit: function(e){
			this.trigger('submit', e);
		},
		_cancel: function(e){
			var target = $(e.currentTarget);
			e.index = this._cancelButton.index(target);
			this._toggle(e);
			this.resetForm();
			this.trigger('cancel', e);
		},
		resetForm: function(f){
			if(this._validator){
				for(var i=0, len=this._validator.length; i<len; i++){
					this._validator[i].resetForm(f);
				}
			}
		},
		_toggle: function(e){
			if(e.status){
				this._trigger.hide();
				this.hide();
			} else {
				this._trigger.show();
				this.show();
			}
		},
		show: function(){
			if(this._trigger.is(':hidden')){
				this._trigger.show();
			}
			this._edit.hide();
			this._normal.show();
		},
		hide: function(){
			this._edit.show();
			this._normal.hide();
		},
		allClass: function(name){
			var classes = this.get('classes'),
				success = classes['success' + ucFirst(name)],
				warning = classes['warning' + ucFirst(name)],
				error = classes['error' + ucFirst(name)];
			return success + ' ' + warning + ' ' + error;
		},
		getElement: function(name, index){
			return $(inputElement.replace(nameReg, name), this.get('element'));
		},
		getLabel: function(name, index){
			return $(labelElement.replace(nameReg, name), this.get('element'));
		},
		getDom: function(name, index){
			return $(name, this.get('element'));
		},
		getValidator: function(index){
			return this._validator[index || 0];
		},
		isEditor: function(){
			return this._edit.is(':visible');
		}
	});
	
	function ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}
	
	return editResume;
	
});