// JavaScript Document

define('mobile.mobilePopup', 'module.css3, widge.overlay.mask', function(require, exports, module){

	var shape = module['base.shape'],
		$ = module['jquery'],
		util = require('base.util'),
		css3 = require('module.css3'),
		mask = module['widge.overlay.mask'],
		doc = document,
		win = window,
		template = {
			container: '<div></div>',
			header: '<div class="mobileTitle"><span>{title}</span>{closeBtn}{yesBtn}</div>',
    		closeBtn: '<a href="javascript:;" class="icon-svg10 closeButton"></a>',
			cancelBtn: '<a href="javascript:;" class="closeButton">{closeButton}</a>',
    		yesBtn: '<a class="yesButton" href="javascript:;">{yesButton}</a>',
			content: '<div class="mobileContent"></div>'
		},
		transitionEvent = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
	
	var mobilePopup = shape(function(o){
		mobilePopup.parent().call(this, util.merge({
			className: 'mobilePopup',
			idName: null,
			trigger: $('#station'),
			zIndex: 99,
			time: 200,
			easing: 'linear',
			title: 'xxxxx',
			close: 'x',
			yesBtn: true,
			background: '#f3f3f3',
			direction: 1,
			hasMask: false
		}, o));
		this.init();
	});
	
	mobilePopup.implement({
		init: function(){
			this._initTrigger();
			this._isClick = true;
			this.after('_render', function(){
				this.setLevel();
			});
			this._setupResize();
			this._render();
			this._initElements();
			this.setMaskOpacity(this.get('maskOpacity'));
			this.setMaskBackground(this.get('maskBackground'));
			this._initEvents();
		},
		_initElements: function(){
			var element = this.get('element');
			
			this.updateHeader();
			this._updateContent();
		},
		setMaskOpacity: function(val){
			mask.setOpacity(val);	
		},
		setMaskBackground: function(val){
			mask.setBackground(val);	
		},
		updateHeader: function(){
			var headerObj = {},
				isClose = this.get('close');
			if(util.type.isBoolean(isClose) && this.get('close')){
				headerObj['closeBtn'] = template.closeBtn;
			} else if(util.type.isString(isClose)){
				headerObj['closeBtn'] = util.string.replace(template.cancelBtn, {closeButton: isClose});
			}
			var isYesBtn = this.get('yesBtn');
			if(isYesBtn){
				headerObj['yesBtn'] = util.string.replace(template.yesBtn, {yesButton: util.type.isBoolean(isYesBtn) ? '确定' : isYesBtn});
			}
			if(this.get('title')){
				headerObj['title'] = this.get('title');
			}
			if(this._header){
				this._header.remove();
			}
			this._header = $(util.string.replace(template.header, headerObj)).prependTo(this.get('element'));
		},
		_updateContent: function(){
			this._body || (this._body = $(template.content).appendTo(this.get('element')));
			if(this.get('background')){
				this._body.css('background', this.get('background'));
			}
		},
		setBackground: function(background){
			if(!background)
				return;
			this.set('background', background);
			this._body.css('background', this.get('background'));
		},
		_initTrigger: function(){
			var trigger = this.get('trigger');
			if(!trigger){ return; }
			var self = this;
			this.get('trigger').on('click', function(e){
				e.preventDefault();
				self.show();
			});
		},
		_initEvents: function(){
			var self = this;
			this._header.on('click', '.closeButton, .yesButton', function(e){
				var target = $(e.currentTarget);
				if(target.hasClass('closeButton')){
					self._closeX(e);
				} else {
					e.status = true;
					self._submit(e);
				}
			});
		},
		_closeX: function(e){
			this.hide();
			this.trigger('closeX', e);
		},
		_submit: function(e){
			this.trigger('submit', e);
		},
		_render: function(){
			var element, target,
				className = this.get('className');
				
			if(this.get('element')){
				if(util.type.isString(this.get('element'))){
					element = $(this.get('element'));
					this.set('element', element);
				} else if (this.get('element')[0]){
					element = this.get('element');
				}
			} else {
				element = $(template.container);
				this.set('element', element);
			}
			
			this._resetSize();
			element.addClass(className);
			this.get('idName') && element.addClass(this.get('idName'));
			element.appendTo(doc.body).hide();
			
			element.css(css3.style.transitionDuration, this.get('time') + 'ms');
			element.css(css3.style.transitionTimingFunction, this.get('linear'));
			this._resetPosition(false, true);
			this._renderMask();
		},
		_initMask: function(){
			mask._dialogs = mask._dialogs || [];
		},
		_renderMask: function(){
			this._initMask();
			this.after('show', util.bind(this._showMask, this));
			this.after('hide', util.bind(this._hideMask, this));
		},
		_showMask: function(){
			if(!this.get('hasMask')){
				return;
			}
			mask.setLevel(this.get('zIndex'));
			mask.setTransition(true);
			mask.show().get('element').insertBefore(this.get('element'));
			
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
		_transition: function(f){		
			var elementCSS = {},
				element = this.get('element');
				
			if(f){
				elementCSS['position'] = 'fixed';
				elementCSS[css3.style.transitionProperty] = 'transform';
			} else {
				elementCSS[css3.style.transitionProperty] = 'none';
			}
			this.get('element').css(elementCSS);
		},
		_translate: function (x, y) {
			x = x || 0;
			y = y || 0;
			this.get('element').css(css3.style.transform, 'translate(' + x + 'px,' + y + 'px) translateZ(0)');
		},
		_resetPosition: function(f, isReader){
			this._transition(isReader);
			
			var dir = this.get('direction'),
				element = this.get('element'),
				elementCSS = {},
				x, y;
				
			switch(dir){
				case 0:
					elementCSS['top'] = -element.outerHeight();
					elementCSS['left'] = 0;
					x = null;
					y = f ? element.outerHeight() : 0;
					break;
				case 1:
					elementCSS['top'] = 0;
					elementCSS['left'] ='100%';
					x = f ? -element.outerWidth() : 0;
					y = null;
					break;
				case 2:
					elementCSS['top'] = '100%';
					elementCSS['left'] = 0;
					x = null;
					y = f ? -element.outerHeight() : 0;
					break;
				case 3:
				default:
					elementCSS['top'] = 0;
					elementCSS['left'] = -element.outerWidth();
					x = f ? element.outerWidth() : 0;
					y = null;
					break;
			}
			element.css(elementCSS);			
			this._translate(x, y);
		},
		_resetSize: function(width, height){
			var element = this.get('element');
			element.css({
				width: width || this.get('width') || '100%',
				height: height || this.get('height') || '100%'
			});
			return this;
		},
		setPosition: function(){
			var element = this.get('element');
		},
		setLevel: function(zIndex){
			zIndex != undefined && this.set('zIndex', zIndex);
			this.get('element').css('z-index', this.get('zIndex') || 0);
		},
		_setupResize: function(){
			mobilePopup.allPopups.push(this);
		},
		show: function(){
			if(!this._isClick){
				return;
			}
			
			if(!this.get('visible')){
				this._resetPosition(true, true);
				this.get('element').show();
				this._isClick = false;
				this.set('visible', true);
			}
			return this;
		},
		hide: function(){
			if(this.get('visible')){
				this._resetPosition(false, true);
				var element = this.get('element');
				var self = this;
				element.on(transitionEvent, function(){
					element.css({
						position: 'static'
					});
					element.hide();
					self._isClick = true;
					element.off(transitionEvent);
				});
				this.set('visible', false);
			}
			return this;
		},
		setContent: function(val){
			if(!val) return this;
			try{
				val = $(val);
			} catch (e){
				val = [];
			}
			if(val[0]){
				this._body.empty().append(val);
			} else {
				this._body.empty().html(val);
			}
			return;
		},
		query: function(selector){
			return this._body.find(selector);
		},
		destory: function(){
			destory(this, mobilePopup.allPopups);
			if(this.get('element')){
				this.get('element').remove();
			}
			mobilePopup.parent('destory').call(this);
		}
	});
	mobilePopup.allPopups = [];
	
	function destory(target, array){
		$(array).each(function(i, val){
			if(target === val){
				array.slice(i, 1);
			}
		});
		return array;
	}
	$(win).on('onorientationchange resize', function(e) {
		$(mobilePopup.allPopups).each(function(i, item) {
			if(item.get('visible')){
				this._resetPosition(true);
				item.trigger('resize');
			}
		});
	});
	
	return mobilePopup;

});