// JavaScript Document

define('widge.expander', function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util');
		
	var expander = shape(function(o){
		expander.parent().call(this, util.merge({
			container: $('#one_sort'),
			element: 'ul',
			trigger: '.more',
			status: 'collapse'
		}, o));
		this.init();
	});
	
	expander.implement({
		init: function(){
			this._initElements();
			this.resizeHeight();
			this._initView();
			this._initEvents();
		},
		_initElements: function(){
			var container = this.get('container');
			this.set('element', container.find(this.get('element')));
			this.set('trigger', container.find(this.get('trigger')));
			this._minHeight = container.outerHeight();
		},
		_initView: function(){
			var trigger = this.get('trigger');
			if(this.isOverflow()){
				trigger.show();
			} else {
				trigger.remove();
			}
		},
		_initEvents: function(){
			var self = this;
			this.get('trigger').on('click', function(){
				self._collapse(self.isOverflow());
			});
		},
		show: function(){
			this.get('trigger') && this.get('trigger').show();
		},
		hide: function(){
			this.get('trigger') && this.get('trigger').hide();
		},
		resizeHeight: function(){
			this._maxHeight = this.get('element').outerHeight();
		},
		isOverflow:function(){
			return this.get('container').outerHeight() < this._maxHeight;
		},
		resetHeight: function(height){
			height && this.get('container').css('height', height);
		},
		renderClass: function(b){
			var trigger = this.get('trigger'),
				className = this.get('status');
			b ? trigger.addClass(className) : trigger.removeClass(className);
		},
		_collapse: function(b){
			var trigger = this.get('trigger'),
				className = this.get('status'),
				eventName = "collapse",
				height;
			if(b){
				eventName = "expand";
				height = this._maxHeight;
			} else {
				height = this._minHeight;
			}
			this.renderClass(b);
			this.resetHeight(height);
			this.trigger(eventName, {
				target: trigger,
				height: height
			});
		}
	});
	return expander;

});