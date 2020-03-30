// JavaScript Document

define('widge.swipeCoder', 'module.css3, tools.drag', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		css3 = require('module.css3'),
		Drag = module['tools.drag'],
		win = window;
	
	var inputEl = '';
	var swipeCoder = shape(function(o){
		swipeCoder.parent().call(this, util.merge({
			element: $('#swipeCodeBar'),//指定限制在容器内,
			trigger: '.mobile_swipeCodeBox',//设置触发对象（不设置则使用拖放对象）
			msgElement: '.mobile_swipeCodeMsg',
			maskElement: '.mobile_swipeCodeMask',
			maskMsgElement: '.mobile_swipeCodeMsgMask',
			refreshClass: 'refresh',
			name: 'validatCode',
			successClass: 'mobile_success_swipeCodeBar',
			failClass: 'mobile_error_swipeCodeBar',
			errorClass: 'mobile_error_swipeCodeBar',
			defaultHTML: '请按住滑块，拖动到最右侧',
			validatorHTML: '正在验证中...',
			successHTML: '验证通过',
			failHTML: '验证不通过，点击<a {refreshClass} href="javascript:">刷新</a>重试',
			errorHTML: '请求失败，点击<a {refreshClass} href="javascript:">刷新</a>重试',
			validatorHandle: false,
			failHandle: false,
			errorHandle: false,
			url: null,
			param: 'state',
			type: 'post'
		}, o));
		this.init();
	});
	
	swipeCoder.implement({
		init: function(){
			var element = this._element = this.get('element');
			this._trigger = element.find(this.get('trigger'));
			this._msgElement = element.find(this.get('msgElement'));
			this._maskElement = element.find(this.get('maskElement'));
			this._maskMsgElement = element.find(this.get('maskMsgElement'));
			
			var name = this.get('name') || 'validatCode';
			this._input = $(
				'<input type="hidden" id="swipeCode_' + name +
				'" name="' + name + '" />'
			).appendTo(element);
			
			this._createDrag();
			this.initStatus();
			this._initEvents();
		},
		initStatus: function(){
			this._element.removeClass(this.get('successClass') + ' ' + this.get('failClass') + ' ' + this.get('errorClass'));
			this._setMaskSize();
			this._trigger.css(css3.style.transform, 'translate3d(0, 0, 0)');
			this._setMsg(this.get('defaultHTML'));
			this.setLock(false);
		},
		_setMsg:function(msg){
			if(!msg) return;
			this._msgElement.html(msg);
			this._maskMsgElement.empty();
			this._maskMsgChildElement = $('<div>' + msg + '</div>').appendTo(this._maskMsgElement);
			this._maskMsgChildElement.css('width', this._element.width());
		},
		_setMaskSize: function(pos){
			pos = pos || 0;
			var elementWidth = this._element.width();
			var dragWidth = this._trigger.outerWidth(true);
			
			this._maskElement.css('width', elementWidth - dragWidth - pos);
			this._maskMsgElement.css('width', pos);
		},
		_createDrag: function(){
			this._drag = new Drag({
				container: this._element,
				element: this._trigger,
				limit: true,
				lockX: false,
				lockY: true,
				isTransition: true
			});
		},
		_initEvents: function(){
			var self = this;
			var element = this._element;
			var elementWidth = element.outerWidth();
			var dragWidth = this._trigger.outerWidth(),
				maskElement = this._maskElement;
			
			$(win).on('onorientationchange resize', function(){
				var elementWidth = element.width();
				var posX = self._trigger.position().left;
				self._maskMsgChildElement.css('width', elementWidth);
				if(posX != 0){
					self._trigger.css(css3.style.transform, 'translate3d(' + (elementWidth - dragWidth) + 'px, 0, 0)');
				} else {
					maskElement.css('width', elementWidth - dragWidth);
				}
			});
			this._element.on('click', '.' + this.get('refreshClass'), function(e){
				self.initStatus();
			});
			this._drag.on('drag', function(e){
				self._setMaskSize(e.dragX);
			});
			this._drag.on('dragEnd', function(e){
				var maskWidth = maskElement.outerWidth();
				if(maskWidth <= 0){
					var url;
					if(url = self.get('url')){
						if(!self.get('validatorHandle')){
							self._setMsg(self.get('validatorHTML'));
						}
						$.ajax({
							url: url,
							type: self.get('type'),
							dataType: 'json',
							success: function(e){
								if(e[self.get('param')]){
									self._input.val(e[self.get('data')] || 1);
									element.addClass(self.get('successClass'));
									self._setMsg(self.get('successHTML'));
									self.trigger('success', e);
								} else {
									self._input.val('');
									if(!self.get('failHandle')){
										element.addClass(self.get('failClass'));
										self._setMsg(
											util.string.replace(
												self.get('failHTML'), 
												{refreshClass: 'class="' + self.get('refreshClass') + '"'}
											)
										);
									}
									self.trigger('fail', e);
								}
								self.setLock(true);
							},
							error: function(e){
								self._input.val('');
								if(!self.get('errorHandle')){
									element.addClass(self.get('errorClass'));
									self._setMsg(
										util.string.replace(
											self.get('errorHTML'), 
											{refreshClass: 'class="' + self.get('refreshClass') + '"'}
										)
									);
									self.setLock(true);
								}
								self.trigger('error', e);
							}
						});
					} else {
						self._input.val(self.get('data') || 1);
						element.addClass(self.get('successClass'));
						self._setMsg(self.get('successHTML'));
						
						var e = {};
						e[self.get('param')] = true;
						self.trigger('success', e);
						
						self.setLock(true);
					}
				} else {
					self.initStatus();
				}
			});
		},
		setLock: function(f){
			this._drag.set('lock', f);
		},
		destory: function(){
			this._drag.destory();
			swipeCoder.parent('destory').call(this);
		}
	});

	return swipeCoder;
});