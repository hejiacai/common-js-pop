// JavaScript Document

define('tools.drag', 'module.css3', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		css3 = require('module.css3'),
		win = window,
		doc = document,
		dragFlag = '.drag',
        isIE = !win.XMLHttpRequest,
		events = css3.touchEvents;
	
	var drag = shape(function(o){
			drag.parent().call(this, util.merge({
				element: null,//设置触发对象（不设置则使用拖放对象）
				limit: false,//是否设置范围限制(为true时下面参数有用,可以是负数)
				left: 0,//左边限制
				right: 9999,//右边限制
				top: 0,//上边限制
				bottom: 9999,//下边限制
				container: "",//指定限制在容器内
				lockX: false,//是否锁定水平方向拖放
				lockY: false,//是否锁定垂直方向拖放
				lock: false,//是否锁定
				transparent: false,//是否透明
				children: false,
				isTransition: false
			}, o));
			this.init();
		});
		
	drag.implement({
		init: function(){
			var element = this.get('element');
			if(!element || util.type.isString(element) || !element.length){
				return;
			}
			this._initPosition();
			//修正范围
			this._repair();
			this._initEvent();
		},
		_setItemPosition: function(element){
			element.addClass('dragStatus').css('position', 'absolute');
		},
		getItem: function(){
			var children = this.get('children'),
				element = this.get('element');
				
			if(children){
				if(util.type.isString(children)){
					element = element.find(children);
				} else {
					element = element.children();
				}
			}
			return element;
		},
		_initPosition: function(){
			this._x = this._y = 0; //记录鼠标相对拖放对象的位置
			this._marginLeft = this._marginTop = 0;//记录margin
			this._container = this.get('container');
			
			var children = this.get('children');
			if(children){
				this._setItemPosition(this.getItem());
			} else {
				this.get('element').css('position', 'absolute');
			}
			
			//透明
			if(isIE && !!this.get('transparent')){
				//填充拖放对象
				$('<div></div>').appendTo(this.get('element')).css({
					'width': '100%',
					'height': '100%',
					'background': '#fff',
					'opacity': 0,
					'filter': 'alpha(opacity:0)',
					'font-size': 0
				});
			}
		},
		_initEvent: function(){
			var self = this;
			var element = this.get('element');
			if(this.get('children')){
				element.on(events.start + dragFlag, '.dragStatus', util.bind(this._start, this));
				//element.on('mousedown.drag', '.dragStatus', util.bind(this._start, this));
			} else {
				element.on(events.start + dragFlag, util.bind(this._start, this));
				//element.on('mousedown.drag', util.bind(this._start, this));
			}
		},
		_start: function(e){
			if(this.get('lock') || (e.type != 'touchstart' && e.button != 0)){ 
				return; 
			}
			
			var originalEvent = e.originalEvent;
			var touches = originalEvent.targetTouches ? originalEvent.targetTouches[0] : e;
			var element = this._element = $(e.currentTarget) || this.get('element');
			this.trigger('dragInit', e);
			
			this._repair();
			this._x = touches.pageX - element.position().left;
			this._y = touches.pageY - element.position().top;
			this._moveX = touches.pageX;
			this._moveY = touches.pageY;
			
			//记录margin
			this._marginLeft = parseInt(element.css('margin-left')) || 0;
			this._marginTop = parseInt(element.css('margin-top')) || 0;
			
			//mousemove时移动 
			//mouseup时停止
			$(doc).on(events.move + dragFlag, util.bind(this._move, this));
			$(doc).on(events.end + dragFlag, util.bind(this._stop, this));
			
			//$(doc).on('mousemove.drag', util.bind(this._move, this)).on('mouseup.drag', util.bind(this._stop, this));
			
			if(isIE){
				element = this.get('element');
				element.on('losecapture', util.bind(this._stop, this));
				element[0].setCapture();
			} else {
				$(win).bind('blur' + dragFlag, util.bind(this._stop, this));
				e.preventDefault();
			}
			this.trigger('dragStart', e);
		},
		//拖动
		_move: function(e) {
			if(this.get('lock')){ 
				this._stop(e);
				return;
			};
			var iLeft, iTop, mxLeft, mxRight, mxTop, mxBottom,
				element = this._element || this.get('element');
			
			//清除选择
			e.preventDefault();
			win.getSelection ? win.getSelection().removeAllRanges() : doc.selection.empty();
			
			//设置移动参数
			var originalEvent = e.originalEvent;
			var touches = originalEvent.targetTouches ? originalEvent.targetTouches[0] : e;
			
			iLeft = touches.pageX - this._x;
			iTop = touches.pageY - this._y;
			e.moveX = touches.pageX - this._moveX;
			e.moveY = touches.pageY - this._moveY;
			
			//设置范围限制
			if(this.get('limit')){
				//设置范围参数
				mxLeft = this.get('left');
				mxRight = this.get('right'); 
				mxTop = this.get('top');
				mxBottom = this.get('bottom');

				//如果设置了容器，再修正范围参数
				if(this._container && this._container[0]){
					mxLeft = Math.max(mxLeft, 0);
					mxTop = Math.max(mxTop, 0);
					mxRight = Math.min(mxRight, this._container.width());
					mxBottom = Math.min(mxBottom, this._container.height());
				}
				//修正移动参数
				iLeft = Math.max(Math.min(iLeft, mxRight - element.outerWidth()), mxLeft);
				iTop = Math.max(Math.min(iTop, mxBottom - element.outerHeight()), mxTop);
			}
			//设置位置，并修正margin
			var isTransition = this.get('isTransition');
			var dragX = element.position().left;
			var dragY = element.position().top;
			
			if(!this.get('lockX')){
				dragX = iLeft - this._marginLeft;
			}
			if(!this.get('lockY')){
				dragY = iTop - this._marginTop;
			}
			
			if(isTransition){
				element.css(css3.style.transform, 'translate3d(' + dragX + 'px,' + dragY + 'px,0)');
			} else {
				element.css({left: dragX, top: dragY});
			}
			
			/*
			if(!this.get('lockX')){
				element.css('left', iLeft - this._marginLeft);
			}
			if(!this.get('lockY')){
				element.css('top', iTop - this._marginTop);
			}*/
			
			e.dragX = dragX;
			e.dragY = dragY;
			
			//附加程序
			e.currentTarget = this._element[0];
			this.trigger('drag', e);
		},
		//停止拖动
		_stop: function(e) {
			//移除事件
			//$(doc).off('mousemove.drag', this._resize).off('mouseup.drag', this._stop);
			$(doc).off(events.move + dragFlag + ' ' + events.end + dragFlag);
			var element = this.get('element');
			
			if(isIE){
				element.off('losecapture');
				element[0].releaseCapture();
			} else {
				$(win).off("blur" + dragFlag);
			}

			e.parentTarget = element[0];
			e.currentTarget = this._element[0];
			this.trigger('dragEnd', e);
 		},
		
		//修正范围
		_repair: function() {
			if(this.get('limit')){
				//修正错误范围参数
				var element = this.get('element'),
					container = this.get('container');
				this.set('right', Math.max(this.get('right'), this.get('left') + element.outerWidth()));
				this.set('bottom', Math.max(this.get('bottom'), this.get('top') + element.outerHeight()));
				if(container && container.length && !util.type.isString(container) && !/body/.test(container[0].nodeName.toLowerCase())){
					container.css('position', 'relative');
				}
			}
		},
		destory: function(){
			var element = this.get('element');
			
			element.off(events.start + dragFlag);
			$(doc).off(events.move + dragFlag + ' ' + events.end + dragFlag);

			$(win).off("blur" + dragFlag);
			drag.parent('destory').call(this);
		}
	});
	
	return drag;
});