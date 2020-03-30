// JavaScript Document

define('widge.overlay.mask', 
['widge.popup', 'tools.fixed'], 
function(require, exports, module) {

    var $ = module['jquery'],
		popup = module['widge.popup'],
		util = require('base.util'),
		fixed = require('tools.fixed'),
		Class = require('base.class').Class,
        isIE6 = !-[1,] && !window.XMLHttpRequest,
		win = $(window);

	var mask = Class(function(o){
			mask.parent().call(this, util.merge({
				width: isIE6 ? win.width() : '100%',
				height: isIE6 ? win.height() : '100%',
				className: 'ui-mask',
				opacity: 0.2,
				background: '#000',
				style: {
					left: 0,
					top: 0
				}
			}, o));
		}).extend(popup);

	mask.implement({
		show: function() {
           	this._changeSize();
            return mask.parent('show').call(this);
        },
		_render: function(){
			this._isInit = true;
			mask.parent('_render').call(this);
			this._renderPosition();
			this._renderBackground();
			this._renderOpacity();
		},
		_renderPosition: function(){
			fixed.pin(this.get('element'), 0, 0);
		},
		_renderBackground: function(){
			this.get('element').css('background', this.get('background'));
		},
		_renderOpacity: function(val){
			this.get('element').css('opacity', val != undefined ? val : this.get('opacity'));
		},
		setPosition:function(){},
		_changeSize: function(e){
			if(isIE6){
				this.set('width', win.width());
				this.set('height', win.height());
				e && this.resetSize();
				this._iframe.resize(win.width(), win.height());
			}
		},
		setBackground: function(val){
			this.set('background', val);
			this._renderBackground();
		},
		setOpacity: function(val){
			this.set('opacity', val || this.get('opacity'));
			this._renderOpacity();
		},
		setTransition: function(f){
			this.set('transitionType', f || false);
			if(!f){
				this._renderOpacity();
			}
		},
		show: function(){
			this._clearTransitionTimer();
			if(this.get('transitionType')){
				if(!this.get('visible')){
					var element = this.get('element');
					var opacity = element.css('opacity');
					if(this._isInit){
						opacity = 0;
						delete this._isInit;
					}
					this._renderOpacity(opacity);
					this._useTransition('init');
					
					this.get('element').show();
					var self = this;
					setTimeout(function(){
						self._useTransition('in');
						self._renderOpacity();
					}, 0);
					this.set('visible', true);
				}
			} else {
				return mask.parent('show').call(this);
			}
			return this;
		},
		hide: function(){
			if(this.get('transitionType')){
				if(this.get('visible')){
					this._clearTransitionTimer(true);
					var element = this.get('element');
					var isTransition = this._useTransition('out');
					if(!mask._dialogs || (mask._dialogs && !mask._dialogs.length)){
						this._renderOpacity(0);
						if(!this._transitionTimer){
							this._transitionTimer = setTimeout(util.bind(this._transitionEnd, this), 200);
						}
					} else {
						this._clearTransition(true);
						this.set('visible', false);
					}
				}
			} else {
				return mask.parent('hide').call(this);
			}
			return this;
		},
		_getTransitionClass: function(type){
			return 'hb_ui_mask_' + type;
		}
	});
	
	return new mask();
});