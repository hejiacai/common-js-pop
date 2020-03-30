// JavaScript Document

define('widge.overlay.confirmBox', 
	'widge.overlay.hbDialog', 
function(require, exports, module) {

    var jquery = module['jquery'],
		dialog = module['widge.overlay.hbDialog'],
		util = require('base.util'),
		Class = require('base.class').Class,
		template = {
			message: '<div class="ui_dialog_message"></div>',
			footer: '<div class="ui_dialog_footer"></div>'
		},
		list = ['title', 'message', 'confirmBtn', 'cancelBtn'];

	var confirmBox = Class(function(o){
			confirmBox.parent().call(this, util.merge({
				confirmBtn: '<button class="button_a button_a_red">确定</button>',
				cancelBtn: '<button class="button_a cancelbtn">取消</button>',
				message: null
			}, o));
		}).extend(dialog);
	
	confirmBox.implement({
		setContent: function(val){
			if(!val) return;
			delete this._isAjax;
			var self = this;
			if(util.type.isString(val)){
				this.set('message', val);
				this._updateMessage();
			} else if(util.type.isObject(val)) {
				jquery.each(list, function(index, key){
					if(val[key]){
						self.set(key, val[key]);
						if(key === "title"){
							self._updateHeader();
						} else if(key === "message"){
							self._updateMessage();
						} else if(key === "confirmBtn" || key === "cancelBtn"){
							self._updateBtn(key);
						}
					}
				});
			}
			this.setPosition();
			return this;
		},
		_renderContent: function(){
			this._initTemplate();
			this.setPosition();
		},
		_initTemplate: function(){
			this._updateMessage();
			this._updateFooter();
		},
		_updateMessage: function(){
			if(this.get('message')){
				this._message || (this._message = jquery(template.message).prependTo(this._body));
				this._message.html(this.get('message'));
			}
		},
		_updateFooter: function(){
			this._updateBtn('confirmBtn');
			this._updateBtn('cancelBtn');
		},
		_updateBtn: function(btnName){
			if(this.get(btnName)){
				this._footer || (this._footer = jquery(template.footer).appendTo(this._body));
				if(!this['_' + btnName]){
					this['_' + btnName] = jquery(this.get(btnName));
					if(isConfirmButton('confirmBtn')){
						this['_' + btnName].appendTo(this._footer);
					} else {
						this['_' + btnName].appendTo(this._footer);
					}
					this._bindFooterListener(btnName);
					return;
				}
				this['_' + btnName].html(this.get(btnName));
			}
		},
		_bindFooterListener: function(btnName){
			var fn;
			if(isConfirmButton(btnName)){
				fn = util.bind(function(e){
					e.preventDefault();
					this.trigger('confirm');
				}, this);
			} else {
				fn = util.bind(function(e){
					e.preventDefault();
					this.trigger('cancel');
					this.hide();
				}, this);
			}
			this['_' + btnName].on('click', fn);
		}
	});
	
	confirmBox.alert = function(message, callback, options){
		var defaults = {
			message: message,
			cancelBtn: ''
		}
		var d = new confirmBox(jquery.extend(null, defaults, options)).on('confirm', function(e){
			callback && callback.call(this, e);
			this.hide();
		}).show();
		d.toString = function(){
			return 'singleConfirmBox';
		}
		d.after('hide', function(){
			this.destory();
		});
		return d;
	}
	confirmBox.confirm = function(message, title, onConfirm, onCancel, options){
		if (typeof onCancel === 'object' && !options) {
            options = onCancel;
			onCancel = null;
        }
		var defaults = {
            message: message,
            title: title == '' ? '确认框' : title
        };
		var d = new confirmBox(jquery.extend(null, defaults, options)).on('cancel', function(e){
			onCancel && onCancel.call(this, e);
			this.hide();
		}).on('confirm', function(e){
			 onConfirm && onConfirm.call(this, e);
		}).show();
		d.toString = function(){
			return 'singleConfirmBox';
		}
		d.after('hide', function() {
            this.destory();
        });
		return d;
	}
	confirmBox.timeBomb = function(message, options, isTrigger){
		var timeout = 3000,
			firstName = "hb_ui_prt_",
			idName = '';

		var getIcon = function(name){
			var iconFont = "";
			switch(name){
				case 'success':
					iconFont = '&#xf058;';
					break;
				case 'fail':
					iconFont = '&#xf057;';
					break;
				case 'warning':
					iconFont = '&#xf06a;';
					break;
				case 'question':
					iconFont = '&#xf059;';
					break;
				case 'info':
					iconFont = '&#xf06a;';
					break;
				case 'normal':
					iconFont = '&#xf06a;';
					break;
			}
			return iconFont ? '<i class="hbFntWes">' + iconFont + '</i>' : '';
		}
		
		if(util.type.isObject(options)){
			if(util.type.isFunction(options.icons)){
				getIcon = options.icons;	
			}
			if(options.timeout != undefined){
				timeout = options.timeout;
				delete options.timeout;
			}
			if(options.name){
				idName = firstName + options.name;
				var icons = getIcon(options.name);
				if(!util.type.isString(icons)){
					icons = '';
				}
				message = icons + message;
				delete options.name;
			}
		} else if(util.type.isString(options)){
			idName = firstName + options;
			message = getIcon(options) + message;
			options = null; 
		}
		
		var defaults = {
				className: 'prt',
				message: message,
				idName: idName,
				title: null,
				cancelBtn: null,
				confirmBtn: null,
				width: 150,
				hasMask: false,
				isRejcetHideActions: true
			},
			d = new confirmBox(jquery.extend(null, defaults, options)),
			timer;

		d.setBlurHideTrigger(isTrigger);
		d.toString = function(){
			return 'singleConfirmBox';
		}
		d.after('show', function(){
			var self = this;
			timer = timeout ? setTimeout(function(){
				self.hide();
			}, timeout) : null;
		}).show().after('hide', function() {
			timer && clearTimeout(timer) && (timer = null);
            this.destory();
			options && options.callback && options.callback.call(this);
        });
		return d;
	}
	
	function isConfirmButton(name){
		return name === 'confirmBtn';
	}
	
	return confirmBox;
	
});