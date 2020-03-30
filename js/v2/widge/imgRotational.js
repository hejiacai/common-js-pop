// JavaScript Document
define('widge.imgRotational', function(require, exports, module){

	var $ = module['mobile'] || mmodule['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		PI = Math.PI,
		doc = document;
		
	var imgRotational = shape(function(o){
		imgRotational.parent().call(this, util.merge({
			container: $('#imgRotational'),
			element: 'li',
			move: 0.3,
			time: 10,
			isTransform: false
		}, o));
		this.init();
	});
		
	imgRotational.implement({
		init: function(){
			this.sc = 0;
			this.leftTimer = null;
			this.rightTimer = null;
			
			var container = this.get('container');
			if(!container || container && !container.length){
				this.set('container', $(doc));
			}
			var element = this.element = container.find(this.get('element'));
			var pos = this.pos = 360 / element.length;
			this._resize();
			var self = this;
			element.each(function(i){
				var cs = Math.cos(pos * i * PI / 180 - PI / 2),
					ss = Math.sin(pos * i * PI / 180 - PI / 2),
					css = {},
					left = self.objDim[0] * (cs + 1),
					top = self.objDim[1] * (ss + 1);
				
				if ( self.get('isTransform') && $.mobile && $.mobile.hasTransform ) {
					css[$.mobile.style.transform] = 'translate(' + left + 'px,' + top + 'px)' + ' translateZ(0)';
				} else {
					css['position'] = 'absolute';
					css['left'] = left;
					css['top'] = top;
				}
				css['z-index'] = parseInt((ss + 1) / 2 * element.length);
				
				$(this).css(css);
			});
		},
		_resize: function(){
			var container = this.get('container');
			this.objPos = [
				container.offset().left + container.outerWidth(true) / 2,
				container.offset().top + container.outerHeight(true) / 2
			];
			this.objDim = [
				container.outerWidth(true) / 2,
				container.outerHeight(true) / 2
			];
		},
		_scroll: function(direction){
			var element = this.element,
				pos = this.pos,
				dim = this.objDim;
			
			if(direction == 'left'){
				//if(lCounter<2)lCounter+=0.1;  //速度渐快
				this.sc += this.get('move');
			} else {
				//if(rCounter<2)rCounter +=0.1;  //速度渐快
				this.sc -= this.get('move');
			}
			
			sc = this.sc;
			element.each(function(i){
				var cs = Math.cos((pos * i + sc) * PI / 180),
					ss = Math.sin((pos * i + sc) * PI / 180),
					v = (ss + 1) / 2,
					css = {},
					left = dim[0] * (cs + 1),
					top = dim[1] * (ss + 1);
				
				if ( self.get('isTransform') && $.mobile && $.mobile.hasTransform ) {
					css[$.mobile.style.transform] = 'translate(' + left + 'px,' + top + 'px)' + ' translateZ(0)';
				} else {
					css['position'] = 'absolute';
					css['left'] = left;
					css['top'] = top;
				}
				css['z-index'] = parseInt(v * element.length);
				
				$(this).css(css);
			});
		},
		scrollLeft:function(){
			this._scroll("left");
		},
		scrollRight: function(){
			this._scroll('right');
		},
		playLeft: function(){
			this.stop();
			this.leftTimer = setInterval(util.bind(this.scrollLeft, this), this.get('time'));
		},
		playRight: function(){
			this.stop();
			this.rightTimer = setInterval(util.bind(this.scrollRight, this), this.get('time'));
		},
		stop: function(){
			this.leftTimer && clearInterval(this.leftTimer);
			this.rightTimer && clearInterval(this.rightTimer);
			this.leftTimer = null;
			this.rightTimer = null;
		}
	});
	
	return imgRotational;
});
	