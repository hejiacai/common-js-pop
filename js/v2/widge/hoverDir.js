// JavaScript Document

define('widge.hoverDir', 'module.css3', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		css3 = require('module.css3'),
		support = css3.style.isAnimateSupport();
	
	var hoverDir = shape(function(o){
			hoverDir.parent().call(this, util.merge({
				container: $('#hoverDirList'),
				trigger: 'a',
				element: '.hotInfo',
				speed: 300,
				easing: "ease",
				hoverDelay: 0,
				inverse: !1,
				size: 100,
				isTransitionListener: false
			}, o));
			this._init();
		});
	
	hoverDir.implement({
		_init: function(){
			this._transitionProp = "all " + this.get('speed') + "ms " + this.get('easing');
			this._trigger = this.get('container').find(this.get('trigger'));
			this._initEvents();
		},
		_initEvents: function(){
			var container = this.get('container'),
				trigger = this.get('trigger'),
				self = this;
				
			container.on('mouseenter mouseleave', trigger, function(e){
				var target = $(e.currentTarget),
					div = target.find(self.get('element')),
					dir = self._getDir(target, {x: e.pageX, y: e.pageY}),
					style = self._getStyle(dir);
				
				if (e.type === "mouseenter") {
					div.hide().css(style.from);
					clearTimeout(self.tmhover);
					self.tmhover = setTimeout(function(){
						div.show(0, function() {
							var c = $(this);
							if(support){
								c.css("transform", 'translateZ(0)');
								c.css("transition", self._transitionProp);
							}
							self._applyAnimation(c, style.to, self.get('speed'));
						});
						
					}, self.get('hoverDelay'))
				} else {
					if(support){
						div.css("transition", self._transitionProp);
					}
					clearTimeout(self.tmhover);
					self._applyAnimation(div, style.from, self.get('speed'));
				}
			});
		},
		_handleEvents: function(e){
			this.trigger('transitionEnd');
		},
		_applyAnimation: function(target, pos, speed) {
			var self = this,
				isTransitionListener = this.get('isTransitionListener');
				
			isTransitionListener && this.trigger('transitionStart');
			if(support){
				if(isTransitionListener){
					target.one('transitionend', util.bind(this._handleEvents, this));
					target.one('webkitTransitionEnd', util.bind(this._handleEvents, this));
					target.one('oTransitionEnd', util.bind(this._handleEvents, this));
					target.one('MSTransitionEnd', util.bind(this._handleEvents, this));
				}
				
				pos = $.extend(pos, {duration: speed + "ms"});
				target.css(pos);
			} else {
				target.stop().animate(pos, $.extend(!0, [], {
                	duration: speed + "ms"
            	}), function(){
					self.trigger('transitionEnd');
				});
			}
        },
		_getDir: function(target, offset){
			var width = target.width(),
				height = target.height(),
				left = (offset.x - target.offset().left - width / 2) * (width > height ? height / width : 1),
				top = (offset.y - target.offset().top - height / 2) * (height > width ? width / height : 1),
				result = Math.round((Math.atan2(top, left) * (180 / Math.PI) + 180) / 90 + 3) % 4;
			
            return result;
		},
		_getStyle: function(a) {
			
			var size = this.get('size') ? this.get('size') + 'px' : '100%';
            var b, c,
				d = {
					left: "0px",
					top: "-" + size
				},
				e = {
					left: "0px",
					top: size
				},
				f = {
					left: "-" + size,
					top: "0px"
				},
				g = {
					left: size,
					top: "0px"
				},
				h = {
					top: "0px"
				},
				i = {
					left: "0px"
				},
				inverse = this.get('inverse');
				
            switch (a) {
				case 0:
					b = inverse ? e: d,
					c = h;
					break;
				case 1:
					b = inverse ? f: g,
					c = i;
					break;
				case 2:
					b = inverse ? d: e,
					c = h;
					break;
				case 3:
					b = inverse ? g: f,
					c = i;
            }
            return {
                from: b,
                to: c
            }
        }
	});
	
	return hoverDir;
});