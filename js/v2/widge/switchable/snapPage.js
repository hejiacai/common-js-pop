// JavaScript Document

define('widge.switchable.snapPage', 'widge.switchable.basePage', function(require, exports, module){
	
	var $ = module['jquery'],
		Class = require('base.class').Class,
		util = require('base.util'),
		basePage = module['widge.switchable.basePage'];
		
	var snapPage = Class(function(o){
			snapPage.parent().call(this,  util.merge({
				snapThreshold: 10000,
				snapSpeed: 1000,
				snap: true,
				mouseWheel: true,
				bounce: false,
				timeout: 0,
				direction: 0,
				isLoop: false,
				isMouseParent: false
			}, o));
		}).extend(basePage);
	
	snapPage.implement({
		_initEvents: function(){
			snapPage.parent('_initEvents').call(this);
			this._initSnap();
		},
		getScrollItem: function(){
			if ( util.type.isString(this.get('snap'))) {
				return this.scroller.find(this.get('snap'));
			}
			return this.scroller.children();
		},
		_refreshSnap: function(){
			this._stopPage();
			
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.get('snapStepX') || this.wrapperWidth,
				stepY = this.get('snapStepY') || this.wrapperHeight,
				el;
				
			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}
			
			if ( this.get('snap') === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );
				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;
					
					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.scrollItem;
				l = el.length;
				n = -1;

				for ( ; i < l; i += (this.get('step') || 1) ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			if ( this.get('snapThreshold') % 1 === 0 ) {
				this.snapThresholdX = this.get('snapThreshold');
				this.snapThresholdY = this.get('snapThreshold');
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.get('snapThreshold'));
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.get('snapThreshold'));
			}
			
			this._autoPage();
		},
		_initSnap: function(){
			this._isInitScroll = true;
			this.currentPage = {};
			this.on('refresh', this._refreshSnap);
		},
		_hover: function(){
			if(this._isInitScroll && this.get('timeout')){
				var self = this,
					element = this.get('isMouseParent') ? this.get('element').parent() : this.get('element');
					
				element.on('mouseenter', function(e){
					self._stopPage();
					self._isStop = true;
				}).on('mouseleave', function(e){
					delete self._isStop;
					self._autoPage();
				});
				delete this._isInitScroll;
			}
		},
		_autoPage: function(){
			var self = this,
				timeout = this.get('timeout');
			if(timeout && !self._isStop){
				this._hover();
				this._timeout = setTimeout(function(){
					if(self.get('direction')){
						self.prev();
					} else {
						self.next();
					}
				}, timeout);
			}
		},
		_stopPage: function(){
			this._timeout && clearTimeout(this._timeout);
		},
		_isSnapPlay: function(){
			return !this.enabled || (!this.get('useTransition') && this.isAnimated);
		},
		goToPage: function (x, y, time, easing, dir, isAutoPlay) {
			if(this._isSnapPlay()){
				return;
			}
			this._stopPage();
			easing = easing || this.get('bounceEasing');
			
			var isLoop = this.get('isLoop');
			
			if ( x >= this.pages.length ) {
				x = isLoop ? 0 : this.pages.length - 1;
			} else if ( x < 0 ) {
				x = isLoop ? this.pages.length - 1 : 0;
			}
			
			if ( y >= this.pages[x].length ) {
				y = isLoop ? 0 : this.pages[x].length - 1;
			} else if ( y < 0 ) {
				y = isLoop ? this.pages[x].length - 1 : 0;
			}
			
			var posX = this.pages[x][y].x,
				posY = this.pages[x][y].y;
	
			time = time === undefined ? this.get('snapSpeed') || Math.max(
				Math.max(
					Math.min(Math.abs(posX - this.x), 1000),
					Math.min(Math.abs(posY - this.y), 1000)
				), 300) : time;
			
			this.currentPage = {
				x: posX,
				y: posY,
				pageX: x,
				pageY: y
			};
			
			dir && this.trigger('page' + dir, this.currentPage);
			this.scrollTo(posX, posY, time, easing, {
				dir: (dir && dir.toLowerCase()) || 'auto',
				currentPage: isAutoPlay ? this.currentPage : $.extend(this.currentPage, {
					fn: this._autoPage
				})
			});
		},
		next: function (time, easing) {
					
			var x = this.currentPage.pageX,
				y = this.currentPage.pageY;

			x++;
			if ( x >= this.pages.length && this.hasVerticalScroll ) {
				x = 0;
				y++;
			}
			var isAutoPlay = null;
			if(time === true){
				time = undefined;
				isAutoPlay = true;
			}
			
			this.goToPage(x, y, time, easing, 'Next', isAutoPlay);
		},
		prev: function (time, easing) {
			
			var x = this.currentPage.pageX,
				y = this.currentPage.pageY;
	
			x--;
			if ( x < 0 && this.hasVerticalScroll ) {
				x = 0;
				y--;
			}
			var isAutoPlay = null;
			if(time === true){
				time = undefined;
				isAutoPlay = true;
			}
			
			this.goToPage(x, y, time, easing, 'Prev', isAutoPlay);
		}
	});
	
	return snapPage;
});