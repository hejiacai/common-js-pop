// JavaScript Document

define('widge.tabs',
'widge.changeClass',
function(require, exports, module){
	
	var shape = module['base.shape'],
		changeClass = module['widge.changeClass'],
		util = require('base.util'),
		$ = module['jquery'],
		events = {
			click: ['click'],
			mouse: ['mouseenter', 'mouseleave']
		}
		
	var tabs = shape(function(o){
		tabs.parent().call(this, util.merge({
			element: $('#tabs'),
			tabName: '#tabT',
			tabIndex: 0,
			itemName: 'li',
			contentName: '.item',
			triggerType: 'click',
			className: 'current'
		}, o));
		this.init();
	});
	tabs.implement({
		init: function(){
			if(!this.get('element')[0]){
				throw new Error('widge.tabs: 找不到目标');
			}
			this._initElements();
			this._initEvents();
		},
		_initElements: function(){
			var target = this.get('element'),
				index = this.get('tabIndex');
				
			this._tabs = new changeClass({
				container: target.find(this.get('tabName')),
				element: this.get('itemName'),
				triggerType: this.get('triggerType'),
				className: this.get('className')
			});

			this.set('contentName', target.find(this.get('contentName')));
			this.set('oldIndex', index);
			this.setSelectTab(index);
		},
		_initEvents: function(){
			var triggerType = this.get('triggerType'),
				eventType = events[triggerType];
			
			this._tabs.on(eventType[0], util.bind(this.changeIn, this));
			if(eventType[1]){
				this._tabs.getElement().on(eventType[1], util.bind(this.changeOut, this));
			}
		},
		changeIn: function(e){
			var element = this._tabs.getElement();
			if(e.type === "click"){
				this.set('oldIndex', this.get('tabIndex'));
			}
			this.setSelectTab(element.index(e.child));
		},
		changeOut: function(e){
			var target = $(e.currentTarget),
				element = this._tabs.getElement();

			this.set('oldIndex' , element.index(target));
		},
		setSelectTab: function(index){
			var element = this._tabs.getElement();
			this._tabs.fire(element, true);
			this._tabs.fire(element.eq(index));
			this.set('tabIndex', index);
			this.setContent(index);
			var e = {
				index: this.get('tabIndex'),
				oldIndex: this.get('oldIndex')
			}
			this.trigger('changeIn', e);
		},
		setContent: function( index ){
			var content = this.get('contentName');
			content.hide().eq( index ).show();
		},
		getSelectedItem: function(){
			return this._tabs.getElement().eq(this.get('tabIndex'));
		}
	});
	
	return tabs;
});