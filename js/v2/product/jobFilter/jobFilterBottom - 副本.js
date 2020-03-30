// JavaScript Document

define('product.jobFilter.jobFilterBottom', 
	['widge.changeClass', 'tools.position'],
 function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		changeClass = module['widge.changeClass'],
		position = require('tools.position'),
		util = require('base.util'),
		win = $(window);
	
	var jobFilterBottom = shape(function(o){
			jobFilterBottom.parent().call(this, util.merge({
				container: $('#filter_group'),
				element: '.filter_menu',
				normal:{
					trigger: null,
					className: 'filter_menu_select'
				},
				normalTo: {
					trigger: '.mutil',
					className: 'mutil_mode'
				},
				mutil: {
					trigger: '.cancelbtn',
					className: 'mutil_mode'
				},
				popup: '.filter_options'
			}, o));
			this.init();
		});
	
	jobFilterBottom.implement({
		init: function(){
			this._initElements();
			//this._initEvents();
		},
		_initElements: function(){
			this._changeClass = new changeClass(
				$.extend(this.get('normal'), {
					container: this.get('container'),
					element: this.get('element'),
					triggerType: 'hover'
				})
			);
			/*
			this._normalToClass = new changeClass(
				$.extend(this.get('normalTo'), {
					container: this.get('container'),
					element: this.get('element'),
					triggerType: 'click',
					isAllTrigger: false,
					isTrigger: true
				})
			);
			this._mutilClass = new changeClass(
				$.extend(this.get('mutil'), {
					container: this.get('container'),
					element: this.get('element'),
					triggerType: 'click',
					isAllTrigger: false,
					isTrigger: true
				})
			);*/
		},
		getNormalChange: function(){
			return this._normalToClass;
		},
		getMutilChange: function(){
			return this._mutilClass;
		}/*,
		_initEvents: function(){
			var self = this,
				popup = this.get('popup');
			this._changeClass.before('fire', function(el, isHidden){
				if(!isHidden){
					self._updatePosition(el, el.find(popup));
				}
			});
		},
		_updatePosition: function(el, popup){
			var sLeft = el.offset().left,
				sWidth = el.outerWidth(),
				wLeft = win.scrollLeft(),
				wWidth = win.width(),
				pWidth = popup.outerWidth();
				
			var left = sLeft - wLeft,
				right = wWidth - (sLeft + sWidth),
				baseAlign = {
					element: el,
					x: 0,
					y: '100%+7'
				},
				selfAlign = {
					element: popup,
					y: 0
				},
				css = {};
			
			if(left <= right){
				selfAlign.x = 0;
				css
			} else {
				selfAlign.x = pWidth - sWidth;
			}
			popup.css('box-shadow', css);
			position.pin(selfAlign, baseAlign);
		}
		*/
	});
	
	return jobFilterBottom;
});