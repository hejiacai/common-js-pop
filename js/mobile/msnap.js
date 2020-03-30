// JavaScript Document
define('mobile.msnap', 'mobile.mscroll', function(require, exports, module){

	var $ = module['mobile'],
		Class = require('base.class').Class,
		util = require('base.util'),
		mscroll = module['mobile.mscroll'];
	
	var msnap = Class(function(o){
			msnap.parent().call(this, util.merge({
				snapThreshold: 10000
			}, o));
		}).extend(mscroll);
		
	msnap.implement({
		_initEvents: function(remove){
			msnap.parent('_initEvents').call(this, remove);
			if ( this.get('snap') ) {
				this._initSnap();
			}
		},
		_nearestSnap: function(x, y){
			if ( !this.pages.length ) {
				return { x: 0, y: 0, pageX: 0, pageY: 0 };
			}
	
			var i = 0,
				l = this.pages.length,
				m = 0;
	
			if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
				Math.abs(y - this.absStartY) < this.snapThresholdY ) {
				return this.currentPage;
			}
	
			if ( x > 0 ) {
				x = 0;
			} else if ( x < this.maxScrollX ) {
				x = this.maxScrollX;
			}
	
			if ( y > 0 ) {
				y = 0;
			} else if ( y < this.maxScrollY ) {
				y = this.maxScrollY;
			}
	
			for ( ; i < l; i++ ) {
				if ( x >= this.pages[i][0].cx ) {
					x = this.pages[i][0].x;
					break;
				}
			}
	
			l = this.pages[i].length;
	
			for ( ; m < l; m++ ) {
				if ( y >= this.pages[0][m].cy ) {
					y = this.pages[0][m].y;
					break;
				}
			}
	
			if ( i == this.currentPage.pageX ) {
				i += this.directionX;
	
				if ( i < 0 ) {
					i = 0;
				} else if ( i >= this.pages.length ) {
					i = this.pages.length - 1;
				}
	
				x = this.pages[i][0].x;
			}
	
			if ( m == this.currentPage.pageY ) {
				m += this.directionY;
	
				if ( m < 0 ) {
					m = 0;
				} else if ( m >= this.pages[0].length ) {
					m = this.pages[0].length - 1;
				}
	
				y = this.pages[0][m].y;
			}
	
			return {
				x: x,
				y: y,
				pageX: i,
				pageY: m
			};
		},
		_initSnap: function(){
			this.currentPage = {};
			if ( util.type.isString(this.get('snap'))) {
				this.set('snap', this.scroller.find(this.get('snap')));
			}
			
			this.on('refresh', function () {
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
					el = this.get('snap');
					l = el.length;
					n = -1;
	
					for ( ; i < l; i++ ) {
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
			});
	
			this.on('flick', function () {
				var time = this.get('snapSpeed') || Math.max(
						Math.max(
							Math.min(Math.abs(this.x - this.startX), 1000),
							Math.min(Math.abs(this.y - this.startY), 1000)
						), 300);
	
				this.goToPage(
					this.currentPage.pageX + this.directionX,
					this.currentPage.pageY + this.directionY,
					time
				);
			});
		},
		goToPage: function (x, y, time, easing) {
			easing = easing || this.get('bounceEasing');
			
			if ( x >= this.pages.length ) {
				x = this.pages.length - 1;
			} else if ( x < 0 ) {
				x = 0;
			}
	
			if ( y >= this.pages[x].length ) {
				y = this.pages[x].length - 1;
			} else if ( y < 0 ) {
				y = 0;
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
			
			this.scrollTo(posX, posY, time, easing);
		},
		next: function (time, easing) {
			var x = this.currentPage.pageX,
				y = this.currentPage.pageY;
	
			x++;
			if ( x >= this.pages.length && this.hasVerticalScroll ) {
				x = 0;
				y++;
			}
			this.goToPage(x, y, time, easing);
		},
		prev: function (time, easing) {
			var x = this.currentPage.pageX,
				y = this.currentPage.pageY;
	
			x--;
			if ( x < 0 && this.hasVerticalScroll ) {
				x = 0;
				y--;
			}
			this.goToPage(x, y, time, easing);
		}
	});
	
	return msnap;
});