// JavaScript Document

define('widge.overlay.hbDialog', 
	['widge.overlay.mask', 'widge.popup', 'base.event'], 
function(require, exports, module) {

    var $ = module['jquery'],
		mask = module['widge.overlay.mask'],
		popup = module['widge.popup'],
		events = module['base.event'],
		util = require('base.util'),
		Class = require('base.class').Class,
		template = {
			header: '<div class="ui_dialog_title"></div>',
			body: '<div class="ui_dialog_container"></div>',
			close: '<a class="ui_dialog_close" href="javascript:">×</a>',
			content: '<div class="ui_dialog_content"></div>',
			loader: '<div class="ui_dialog_loading">正在加载...</div>'
		},
		isIE6 = !-[1,] && !window.XMLHttpRequest,
		lteIE7 = /\bMSIE [67]\.0\b/.test(navigator.userAgent),
		doc = document,
		hideRet = [];

	var dialog = Class(function(o){
			this.readOnlyAttrs = {
				toTarget: true
			}
			dialog.parent().call(this, util.merge({
				className: 'dialog',
				trigger: null,
				hasMask: true,
				toTarget: null,
				initHeight: 100,
				height: null,
				autoHeight: true,
				zIndex: 9999,
				align: {
					selfXY: ['50%', '50%'],
                    baseXY: ['50%', '50%']
				},
				close: null,
				title: null,
				content: null,
				isSingle: false,
				maskOpacity: null,
				maskBackground: null
			}, o));
		}).extend(popup);

	dialog.implement({
		init: function(){
			var trigger = this.get('trigger');
			trigger && this._initTrigger();
			this.after('setPosition', function(){
				if(lteIE7 && this._header){
					var p = parseInt(this._header.css('padding-left')) + parseInt(this._header.css('padding-right'));
					this._header.css('width', this._contentElement.outerWidth() - p);
				}
			});
			dialog.parent('init').call(this);
			this.setMaskOpacity(this.get('maskOpacity'));
			this.setMaskBackground(this.get('maskBackground'));
			this._initElements();
			this._initKeyEvents();
			this._initFocus();
			trigger && toTabed(this.get('trigger'));
			toTabed(this.get('element'));
		},
		setBlurHideTrigger: function(trigger){
			if(((util.type.isBoolean(trigger) && !!trigger) || (trigger && trigger[0])) 
				&& !this.get('trigger')){ 
				this._blurHide(trigger); 
			}
			return this;
		},
		_blurHide: function(arr) {
			if(!this.get('trigger')){
				this.removeBlurHide();
				return dialog.parent('_blurHide').call(this, arr);
			}
			return this;
        },
		_render: function(){
			dialog.parent('_render').call(this);
			this._renderMask();
		},
		_toTarget: function(){
            this.get('element').appendTo(this._getTarget()).hide();
        },
		_getTarget: function(f){
			var target = this.get('toTarget');
			if(target){
				if(util.type.isWindow(target[0])){
					target = f ? target[0].document.documentElement : target[0].document.body;
				} else {
					throw new Error('widge.overlay.hbDialog: toTarget属性只能指定window对象');
				}
			} else {
				target = f ? doc.documentElement : doc.body;	
			}
			return target;
		},
		setPosition: function(){
			var target = this.get('toTarget');
			if(target){
				if(target[0].document){
					this.setDocument(target, target[0].document);
				} else {
					throw new Error('widge.overlay.hbDialog: toTarget属性只能指定window对象');
				}
				this.set('align', $.extend(this.get('align'), {
					baseElement: this._getTarget(true)
				}));
			} else {
				this.setDocument();
			}
			dialog.parent('setPosition').call(this);
		},
		isInDocument: function(element){
			return $.contains(this._getTarget(true), element);
		},
		_initElements: function(){
			var element = this.get('element');
			this._updateCloseBtn();
			this._contentElement = $(template.content).appendTo(element);
			this._updateHeader();
			this._initCloseEvent();
			this._updateContent();
		},
		_updateCloseBtn: function(){
			var close;
			if(this._close){
				this._close.remove();
				this._close = null;
			}
			if(close = this.get('close')){
				this._close = $(template.close).appendTo(this.get('element')).html(close);
			}
		},
		_initCloseEvent: function(){
			var self = this;
			this.get('element').on('click', '.ui_dialog_close', function(e){
				e.preventDefault();
				self.hide();
				self.trigger('closeX', e);
			});
		},
		_initTrigger:function(){
			var self = this;
			this.get('trigger').on('click', function(e){
				e.preventDefault();
				self.activeTrigger = $(this);
				self.show();
			});
		},
		_initFocus: function(){
			this.after('show', function(){
				this.get('element').focus();
			});
			if(this.activeTrigger){
				this.after('hide', function(){
					this.activeTrigger.focus();
				});
			}
		},
		_initKeyEvents: function(){
			var self = this;
			$(doc).on('keyup.esc', function(e){
				if(e.keyCode === 27){
					self.get('visible') && self.hide();
				}
			});
		},
		_updateHeader: function(){
			if(this.get('title')){
				var contentElement = this._contentElement;
				this._header || (this._header = $(template.header).prependTo(contentElement));
				this._header.html(this.get('title'));
			} else {
				if(this._header){
					this._header.remove();
					this._header = null;
				}
			}
		},
		_initMask: function(){
			mask._dialogs = mask._dialogs || [];
		},
		_renderMask: function(){
			this._initMask();
			this.after('show', util.bind(this._showMask, this));
			if(!this.get('isRejcetHideActions')){
				this.after('hide', util.bind(this._hideMask, this));
			}
		},
		setMaskOpacity: function(val){
			mask.setOpacity(val);	
		},
		setMaskBackground: function(val){
			mask.setBackground(val);	
		},
		getMask: function(){
			return mask;
		},
		_showMask: function(){
			if(!this.get('hasMask')){
				return;
			}
			mask.setLevel(this.get('zIndex'));
			mask.setTransition(!!this.get('transitionType'));
			mask.show().get('element').insertBefore(this.get('element'));
			
			isIE6 && setTimeout(function(){
				mask._renderPosition();
				mask._changeSize();
			}, 1);
			
			var existed = false;
			for(var i = 0; i < mask._dialogs.length; i++){
				if(mask._dialogs[i] === this){
					existed = true;
					break;
				}
			}
			if(!existed){
				mask._dialogs.push(this);
			}
		},
		_hideMask: function(){
			if(!this.get('hasMask')){
				return;
			}
			mask._dialogs && mask._dialogs.pop();
			if(mask._dialogs && mask._dialogs.length > 0){
				var last = mask._dialogs[mask._dialogs.length - 1];
				mask.set('zIndex', last.get('zIndex'));
				mask.get('element').insertBefore(last.get('element'));
			} else {
				mask.hide();
			}
		},
		_addLoading: function(){
			this._loader || (this._loader = $(template.loader).prependTo(this._body));
		},
		_removeLoading: function(){
			if(this._loader){
				this._loader.remove();
				delete this._loader;
			}
		},
		_updateContent: function(){
			this._body || (this._body = $(template.body).appendTo(this._contentElement));
			this._renderContent();
		},
		setContent: function(val){
			if(!val) return this;
			if(util.type.isObject(val)){
				if(val.title){
					this.set('title', val.title);
					this._updateHeader();
				}
				if(val.isAjax){
					this.set('isAjax', val.isAjax);
				}
				if(val.isReload){
					this.setReload(val.isReload);
				}
				if(val.isOverflow){
					this._isOverflow = true;
				}
				if(val.data){
					this._data = val.data;
				}
				if(val.content){
					this.set('content', val.content);
					this._updateContent();
				}
			} else {
				this.set('content', val);
				this._updateContent();
			}
			return this;
		},
		setReload: function(f){
			this.set('isReload', f);
			return this;
		},
		_renderContent: function(){
			var content = this.get('content');
			this._removeLoading();
			if (/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(content)) {
				this._isAjax = !!this.get('isAjax');
				this.setReload(true);
			} else {
				delete this._isAjax;
				if(this._isAjax == undefined){
					try{
						value = $(content);
					} catch (e){
						value = [];
					}
					if(value[0]){
						this._body.empty().append(value);
					} else {
						this._body.empty().html(content);
					}
					this.setPosition();
				}
			}
		},
		show: function(f){
			if(this._isAjax != undefined && this.get('isReload')){
				if(this._isAjax){
					this._ajaxHtml();
				} else {
					this._showIframe();
				}
			} else {
				this.trigger('noRequest');
			}
			hidDialog();
			if(this._isSingle()){
				hideRet.push(this);
			}
			this._isAjax != undefined && this.setReload(f != undefined ? f : true);
			return dialog.parent('show').call(this);
		},
		hide: function(f){
			if(this.iframe){
				this.iframe.removeAttr('src');
				this.iframe.remove();
				this.iframe = null;
			}
			if(this._interval){
				clearInterval(this._interval);
				delete this._interval;
			}
			this._isAjax != undefined && this.setReload(f != undefined ? f : true);
			return dialog.parent('hide').call(this);
		},
		_ajaxHtml: function(){
			var self = this,
				element = this._body;
			this._addLoading();
			element.css({
				height: this.get('initHeight'),
				overflow: 'hidden'
			});
			this.trigger('loadStart');
			var data = this._data || null;
			element.load(this.get('content'), data, function(data){
				try {
					var json_need = $.parseJSON(data);
					if (json_need && json_need['isNeedLogin']){
						data = "<div style='padding: 40px;text-align: center;color: #999;'>登录已超时，请重新登录后再操作! </div>";
						element.html(data);
						setTimeout(function () {
							window.open('/');
						},800);
					}
				}catch (e){

				}

				self._removeLoading();
				var height = 'auto';
				
				if(!self.get('autoHeight')){
					height = self.get('height') - (self._header ? self._header.outerHeight(true) : 0);
					height = height - ((parseInt(self._body.css('padding-top')) || 0) + (parseInt(self._body.css('padding-bottom')) || 0) +
					(parseInt(self._body.css('border-top')) || 0) + (parseInt(self._body.css('border-bottom')) || 0));
				}
				
				var cssObj = {
					//height: 'auto',
					height: height,
					overflow: self._isOverflow ? 'visible' : 'auto'
				}
				element.css(cssObj);
				delete self._isOverflow;
				delete self._data;
				self.setPosition();
				self.trigger('loadComplete');
			});
		},
		_showIframe: function(){
			var self = this,
				element = this._body;
		 	!this.get('height') &&
            element.css({
				height: this.get('initHeight')
			});
			
			if(!this.iframe){
				this._createIframe();
			}
			
			this.trigger('loadStart');
			this.iframe.attr({
				src: fixUrl(this.get('content')),
				name: 'hb_dialog_iframe' + new Date().getTime()
			}).one('load', function(){
				if(!self.get('visible')){
					return;
				}
				if(self.get('autoHeight')){
					clearInterval(self._interval);
					self._interval = setInterval(function(){
						updateHeight.call(self);
					},300);
				}
				updateHeight.call(self);
				self.setPosition();
				self.trigger('loadComplete');
			});
		},
		_createIframe: function(){
			var self = this;
			this.iframe = $('<iframe>', {
				src: 'javascript:;',
				scrolling: 'no',
				frameborder: 'no',
				allowTransparency: 'true',
				css: {
                    border: 'none',
                    width: '100%',
                    display: 'block',
                    height: '100%',
                    overflow: 'hidden'
                }
			}).appendTo(this._body);
			util.mix(this.iframe[0], events);
			this.iframe[0].on('close', function(){
				self.hide();
			});
		},
		addCloseEvent: function(domName, fn){
			var target = this.query(domName),
				self = this;
			if(target[0]){
				util.mix(target[0], events);
				target[0].on('close', function(){
					fn && fn.call(self);
					self.hide();
				});
			}
			return this;
		},
		removeCloseEvent: function(domName){
			var target = this.query(domName);
			if(target[0]){
				target[0].off && target[0].off('close');
			}
			return this;
		},
		oneCloseEvent: function(domName, fn){
			return this.removeCloseEvent(domName).addCloseEvent(domName, fn);
		},
		fireEvent: function(domName, typeName, fn){
			if(this.query(domName)[0]){
				if(util.type.isFunction(typeName)){
					fn = typeName;
					typeName = "click";
				}
				if(typeName === "close"){
					fn = util.bind(this.hide, this);
					typeName = "click";
				}
				if(isEventType(typeName, fn)){
					this.query(domName).on(typeName, util.bind(fn, this));
				}
			}
		},
		addListener: function(typeName, fn){
			if(isEventType(typeName, fn)){
				this.on(typeName, util.bind(fn, this));
			}
		}, 
		removeListener: function(typeName){
			if(util.type.isString(typeName)){
				this.off(typeName);
			}
		},
		query: function(selector){
			return this._body.find(selector);
		},
		destory: function() {
            this.get('element') != null && this.get('element').remove();
            this._hideMask();
            clearInterval(this._interval);
			delete this._interval;
			delete this._errCount;
			delete this._close;
			delete this._body;
			delete this._contentElement;
            return dialog.parent('destory').call(this, true);
        },
		_isSingle: function(){
			return this.get('isSingle') || this.toString() === "singleConfirmBox"
		}
	});
	
	function isEventType(name, fn){
		return util.type.isString(name) && util.type.isFunction(fn);
	}
	function updateHeight(){
		var h;
		if(!this.get('height')){
			try {
				h = getIframeHeight(this.iframe) + 'px';
			} catch (ex){
				this._errCount = (this._errCount || 0) + 1;
				if(this._errCount >= 6){
					h = this.get('initHeight');
					clearInterval(this._interval);
					delete this._interval;
					this._errCount = 0;
				}
			}
			
			this._body.css({
				height: h
			});
		} else {
			clearInterval(this._interval);
			delete this._interval;
		}
	}
	function getIframeHeight(iframe) {
        var doc = iframe[0].contentWindow.document;
        if (doc.body.scrollHeight && doc.documentElement.scrollHeight) {
            return Math.min(
                doc.body.scrollHeight,
                doc.documentElement.scrollHeight
            );
        } else if (doc.documentElement.scrollHeight) {
            return doc.documentElement.scrollHeight;
        } else if (doc.body.scrollHeight) {
            return doc.body.scrollHeight;
        }
    }
	function fixUrl(content){
		var s = content.match(/([^?#]*)(\?[^#]*)?(#.*)?/);
		s.shift();
		s[1] = ((s[1] && s[1] !== '?') ? (s[1] + '&') : '?') +
                't=' + new Date().getTime();
				
		return s.join('');
	}
	function toTabed(element){
		if(element.attr('tabindex') == null){
			element.attr('tabindex', '-1');
		}
	}
	function hidDialog(){
		var len;
		if(len = hideRet.length){
			for(var i=0; i<len; i++){
				if(hideRet[i]._isSingle()){
					hideRet[i].set('visible', true);
					hideRet[i].hide();
					hideRet.splice(i, 1);
				}
			}
		}
	}
	return dialog;
});