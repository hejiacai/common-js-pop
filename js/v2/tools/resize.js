// JavaScript Document

define('tools.resize', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		win = window,
		doc = document,
        isIE = !win.XMLHttpRequest,
		controls = {
			rightDown: 'right-down',
			leftDown: 'left-down',
			rightUp: 'right-up',
			leftUp: 'left-up',
			right: 'right',
			left: 'left',
			down: 'down',
			up: 'up'
		};
	
	var resize = shape(function(o){
			resize.parent().call(this, util.merge({
				element: null,
				max: false, //是否设置范围限制(为true时下面mx参数有用)
				container: null,//指定限制在容器内
				top: 0,//上边限制
				left: 0,//左边限制
				right: 9999,//右边限制
				bottom: 9999,//下边限制
				min: false,//是否最小宽高限制(为true时下面min参数有用)
				minWidth: 50,//最小宽度
				minHeight: 50,//最小高度
				scale: false,//是否按比例缩放
				ratio: 0,//缩放比例(宽/高)
				control: {
					rightDown: '#rRightDown',
					leftDown: '#rLeftDown',
					rightUp: '#rRightUp',
					leftUp: '#rLeftUp',
					right: '#rRight',
					left: '#rLeft',
					down: '#rDown',
					up: '#rUp'
				}
			}, o));
			this.init();
		});
		
	resize.implement({
		init: function(){
			this._styleWidth = this._styleHeight = this._styleLeft = this._styleTop = 0; //样式参数
			this._sideRight = this._sideDown = this._sideLeft = this._sideUp = 0;//坐标参数
			this._fixLeft = this._fixTop = 0;//定位参数
			this._scaleLeft = this._scaleTop = 0;//定位坐标
			this._rightWidth = this._downHeight = this._upHeight = this._leftWidth = 0;//范围参数
			this._scaleWidth = this._scaleHeight = 0;//比例范围参数
			this._mxSet = function(){};//范围设置程序
			this._fun = function(){};//缩放执行程序
			
			//获取边框宽度
			var element = this.get('element'),
				container = this.get('container');
			this._borderX = (parseInt(element.css('border-left-width') || 0) + parseInt(element.css('border-right-width') || 0));
			this._borderY = (parseInt(element.css('border-top-width') || 0) + parseInt(element.css('border-bottom-width') || 0));
			
			//范围限制
			element.css('position', 'absolute');
			if(this.isContainer()){
				container.css({'position': 'relative'});
			}
			
			this._initControl();			
		},
		_initControl: function(){
			var self = this, keyName;
			$.each(controls, function(key, val){
				if(keyName = self.get('control')[key]){
					self.setTrigger(keyName, val);
				}
			});
		},
		isContainer: function(){
			var container = this.get('container');
			return container && !util.type.isString(container) && container[0];
		},
		//设置触发对象
		setTrigger: function(resize, side) {
			var element = this.get('element'),
				resize = this.resizeControl = element.find(resize), fun;
			if(!resize[0]){
				resize.hide();
				return;
			}
			resize.show();
			//根据方向设置
			switch (side.toLowerCase()) {
				case "up" :
					fun = this._setUp;
					break;
				case "down" :
					fun = this._setDown;
					break;
				case "left" :
					fun = this._setLeft;
					break;
				case "right" :
					fun = this._setRight;
					break;
				case "left-up" :
					fun = this._setLeftUp;
					break;
				case "right-up" :
					fun = this._setRightUp;
					break;
				case "left-down" :
					fun = this._setLeftDown;
					break;
				case "right-down" :
				default :
					fun = this._setRightDown;
			};
			//设置触发对象
			resize.on('mousedown.resize', util.bind(this._start, this, fun));
		},
		_start: function(e, fun){
			//防止冒泡(跟拖放配合时设置)
			e.stopPropagation();
			
			//设置执行程序
			this._fun = fun;
			
			var element = this.get('element');
			//样式参数值
			this._styleWidth = element.width();
			this._styleHeight = element.height();
			this._styleLeft = element.position().left;
			this._styleTop = element.position().top;
			
			//四条边定位坐标
			this._sideLeft = e.pageX - this._styleWidth;
			this._sideRight = e.pageX + this._styleWidth;
			this._sideUp = e.pageY - this._styleHeight;
			this._sideDown = e.pageY + this._styleHeight;
			
			//top和left定位参数
			this._fixLeft = this._styleLeft + this._styleWidth;
			this._fixTop = this._styleTop + this._styleHeight;
			
			//缩放比例
			if(this.get('scale')){
				//设置比例
				this.set('ratio', Math.max(this.get('ratio'), 0) || this._styleWidth / this._styleHeight);
				
				//left和top的定位坐标
				this._scaleLeft = this._styleLeft + this._styleWidth / 2;
				this._scaleTop = this._styleTop + this._styleHeight / 2;
			}
			
			//范围限制
			if(this.get('max')){
				//设置范围参数
				var mxLeft = this.get('left'), 
					mxRight = this.get('right'), 
					mxTop = this.get('top'), 
					mxBottom = this.get('bottom');
				
				//如果设置了容器，再修正范围参数
				if(this.isContainer()){
					mxLeft = Math.max(mxLeft, 0);
					mxTop = Math.max(mxTop, 0);
					mxRight = Math.min(mxRight, this.get('container').width());
					mxBottom = Math.min(mxBottom, this.get('container').height());
				};
				
				//根据最小值再修正
				mxRight = Math.max(mxRight, mxLeft + (this.get('min') ? this.get('minWidth') : 0) + this._borderX);
				mxBottom = Math.max(mxBottom, mxTop + (this.get('min') ? this.get('minHeight') : 0) + this._borderY);
				
				//由于转向时要重新设置所以写成function形式
				this._mxSet = function(){
					this._rightWidth = mxRight - this._styleLeft - this._borderX;
					this._downHeight = mxBottom - this._styleTop - this._borderY;
					this._upHeight = Math.max(this._fixTop - mxTop, this.get('min') ? this.get('minHeight') : 0);
					this._leftWidth = Math.max(this._fixLeft - mxLeft, this.get('min') ? this.get('minWidth') : 0);
				};
				this._mxSet();
				//有缩放比例下的范围限制
				if(this.get('scale')){
					this._scaleWidth = Math.min(this._scaleLeft - mxLeft, mxRight - this._scaleLeft - this._borderX) * 2;
					this._scaleHeight = Math.min(this._scaleTop - mxTop, mxBottom - this._scaleTop - this._borderY) * 2;
				};
			};
			
			//mousemove时缩放 mouseup时停止
			$(doc).on('mousemove.resize', util.bind(this._resize, this)).on('mouseup.resize', util.bind(this._stop, this));
			if(isIE){
				element.on('losecapture', util.bind(this._stop, this));
				element[0].setCapture();
			} else {
				$(win).on("blur.resize", util.bind(this._stop, this));
				e.preventDefault();
			}
			this.trigger('resizeStart', e);
		},
		//缩放
		_resize: function(e) {
			//清除选择
			win.getSelection ? win.getSelection().removeAllRanges() : doc.selection.empty();
			//执行缩放程序
			this._fun(e);
			//设置样式，变量必须大于等于0否则ie出错
			this.get('element').css({
				'width': this._styleWidth,
				'height': this._styleHeight,
				'top': this._styleTop,
				'left': this._styleLeft
			});
			//附加程序
			this.trigger('resized', e);
		},
		//缩放程序
		//上
		_setUp: function(e) {
			this._repairY(this._sideDown - e.pageY, this._upHeight);
			this._repairTop();
			this._turnDown(this._setDown);
		},
		//下
		_setDown: function(e) {
			this._repairY(e.pageY - this._sideUp, this._downHeight);
			this._turnUp(this._setUp);
		},
		//右
		_setRight: function(e) {
			this._repairX(e.pageX - this._sideLeft, this._rightWidth);
			this._turnLeft(this._setLeft);
		},
		//左
		_setLeft: function(e) {
			this._repairX(this._sideRight - e.pageX, this._leftWidth);
			this._repairLeft();
			this._turnRight(this._setRight);
		},
		//右下
		_setRightDown: function(e) {
			this._repairAngle(
				e.pageX - this._sideLeft, this._rightWidth,
				e.pageY - this._sideUp, this._downHeight
			);
			this._turnLeft(this._setLeftDown) || this.get('scale') || this._turnUp(this._setRightUp);
		},
		//右上
		_setRightUp: function(e) {
			this._repairAngle(
				e.pageX - this._sideLeft, this._rightWidth,
				this._sideDown - e.pageY, this._upHeight
			);
			this._repairTop();
			this._turnLeft(this._setLeftUp) || this.get('scale') || this._turnDown(this._setRightDown);
		},
		//左下
		_setLeftDown: function(e) {
			this._repairAngle(
			  	this._sideRight - e.pageX, this._leftWidth,
				e.pageY - this._sideUp, this._downHeight
			);
			this._repairLeft();
			this._turnRight(this._setRightDown) || this.get('scale') || this._turnUp(this._setLeftUp);
		},
		//左上
		_setLeftUp: function(e) {
			this._repairAngle(
				this._sideRight - e.pageX, this._leftWidth,
				this._sideDown - e.pageY, this._upHeight
			);
			this._repairTop(); 
			this._repairLeft();
			this._turnRight(this._setRightUp) || this.get('scale') || this._turnDown(this._setLeftDown);
		},
		//修正程序
		//水平方向
		_repairX: function(iWidth, mxWidth) {
			iWidth = this._repairWidth(iWidth, mxWidth);
			if(this.get('scale')){
				var iHeight = this._repairScaleHeight(iWidth);
				if(this.get('max') && iHeight > this._scaleHeight){
					iHeight = this._scaleHeight;
					iWidth = this._repairScaleWidth(iHeight);
				} else if(this.get('min') && iHeight < this.get('minHeight')){
					var tWidth = this._repairScaleWidth(this.get('minHeight'));
					if(tWidth < mxWidth){ 
						iHeight = this.get('minHeight'); 
						iWidth = tWidth; 
					}
				}
				this._styleHeight = iHeight;
				this._styleTop = this._scaleTop - iHeight / 2;
			}
			this._styleWidth = iWidth;
		},
		//垂直方向
		_repairY: function(iHeight, mxHeight) {
			iHeight = this._repairHeight(iHeight, mxHeight);
			if(this.get('scale')){
				var iWidth = this._repairScaleWidth(iHeight);
				if(this.get('max') && iWidth > this._scaleWidth){
					iWidth = this._scaleWidth;
					iHeight = this._repairScaleHeight(iWidth);
				}else if(this.get('min') && iWidth < this.get('minWidth')){
					var tHeight = this._repairScaleHeight(this.get('minWidth'));
					if(tHeight < mxHeight){
						iWidth = this.get('minWidth');
						iHeight = tHeight;
					}
				}
				this._styleWidth = iWidth;
				this._styleLeft = this._scaleLeft - iWidth / 2;
			}
			this._styleHeight = iHeight;
		},
		//对角方向
		_repairAngle: function(iWidth, mxWidth, iHeight, mxHeight) {
			iWidth = this._repairWidth(iWidth, mxWidth);	
			if(this.get('scale')){
				iHeight = this._repairScaleHeight(iWidth);
				if(this.get('max') && iHeight > mxHeight){
					iHeight = mxHeight;
					iWidth = this._repairScaleWidth(iHeight);
				}else if(this.get('min') && iHeight < this.get('minHeight')){
					var tWidth = this._repairScaleWidth(this.get('minHeight'));
					if(tWidth < mxWidth){ 
						iHeight = this.get('minHeight'); 
						iWidth = tWidth; 
					}
				}
			} else {
				iHeight = this._repairHeight(iHeight, mxHeight);
			}
			this._styleWidth = iWidth;
			this._styleHeight = iHeight;
		},
		//top
		_repairTop: function() {
			this._styleTop = this._fixTop - this._styleHeight;
		},
		//left
		_repairLeft: function() {
			this._styleLeft = this._fixLeft - this._styleWidth;
		},
		//height
		_repairHeight: function(iHeight, mxHeight) {
			iHeight = Math.min(this.get('max') ? mxHeight : iHeight, iHeight);
			iHeight = Math.max(this.get('min') ? this.get('minHeight') : iHeight, iHeight, 0);
			return iHeight;
		},
		//width
		_repairWidth: function(iWidth, mxWidth) {
			iWidth = Math.min(this.get('max') ? mxWidth : iWidth, iWidth);
			iWidth = Math.max(this.get('min') ? this.get('minWidth') : iWidth, iWidth, 0);
			return iWidth;
		},
		//比例高度
		_repairScaleHeight: function(iWidth) {
			return Math.max(Math.round((iWidth + this._borderX) / this.get('ratio') - this._borderY), 0);
		},
		//比例宽度
		_repairScaleWidth: function(iHeight) {
			return Math.max(Math.round((iHeight + this._borderY) * this.get('ratio') - this._borderX), 0);
		},
		//转向程序
		//转右
		_turnRight: function(fun) {
			if(!(this.get('min') || this._styleWidth)){
				this._fun = fun;
				this._sideLeft = this._sideRight;
				this.get('max') && this._mxSet();
				return true;
			}
		},
		//转左
		_turnLeft: function(fun) {
			if(!(this.get('min') || this._styleWidth)){
				this._fun = fun;
				this._sideRight = this._sideLeft;
				this._fixLeft = this._styleLeft;
				this.get('max') && this._mxSet();
				return true;
			}
		},
		//转上
		_turnUp: function(fun) {
			if(!(this.get('min') || this._styleHeight)){
				this._fun = fun;
				this._sideDown = this._sideUp;
				this._fixTop = this._styleTop;
				this.get('max') && this._mxSet();
				return true;
			}
		},
		//转下
		_turnDown: function(fun) {
			if(!(this.get('min') || this._styleHeight)){
				this._fun = fun;
				this._sideUp = this._sideDown;
				this.get('max') && this._mxSet();
				return true;
			}
		},
		//停止缩放
		_stop: function(e) {
			$(doc).off('mousemove.resize').off('mouseup.resize');
			
			var element = this.get('element');
			if(isIE){
				element.off('losecapture', this._stop);
				element[0].releaseCapture();
			} else {
				$(win).off("blur.resize", this._stop);
			}
			this.trigger('resizeEnd', e);
		},
		destory: function(){
			this.resizeControl.off('mousedown.resize');
			$(doc).off('mousemove.resize mouseup.resize');
			var element = this.get('element');
			
			if(isIE){
				element.off('losecapture', this._stop);
				element[0].releaseCapture();
			} else {
				$(win).off("blur", this._stop);
			}
			resize.parent('destory').call(this);
		}
	});
	
	return resize;
});