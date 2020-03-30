// JavaScript Document

define('widge.multipleSelect', 'widge.popup', function(require, exports, module){
	
	var $ = module['mobile'],
		util = require('base.util'),
		Class = require('base.class').Class,
		popup = module['widge.popup'],
		doc = document,
		win = window;
	
	var multipleSelect = Class(function(o){
		multipleSelect.parent().call(this, util.merge({
			trigger: $('#select'),
			content: $('#menu'),
			width: win.outerWidth(),
			height: win.outerHeight()
		}, o));
	}).extend(popup);
	
	multipleSelect.implement({
		init: function(){
			multipleSelect.parent('init').call(this);
			this._initEvents();
		},
		_render: function(){
			multipleSelect.parent('_render').call(this);
			if(this.get('content') && this.get('content').length){
				this.get('element').html(this.get('content'));
				this.resetSize();
			}
		},
		_initEvents: function(){
			var trigger = this.get('trigger'),
				self = this;
			trigger.on('click', function(e){
				self.show();
			});
		}
	});
	
	var winWidth = $(win).width(),
		winHeight = $(win).height();
		
	$(win).on('orientation', function(e) {
		var winNewWidth = $(win).width();
		var winNewHeight = $(win).height();
		// IE678 莫名其妙触发 resize
		if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
			$(multipleSelect.allPopups).each(function(i, item) {
				// 当实例为空或隐藏时，不处理
				if(!item || !item.get('visible')) {
					return;
				}
				item.setPosition();
				item.resetSize(winNewWidth, winNewHeight);
			});
		}
		winWidth = winNewWidth;
		winHeight = winNewHeight;
    });
	
	return popup;
});