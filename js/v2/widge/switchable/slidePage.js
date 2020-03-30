// JavaScript Document

define('widge.switchable.slidePage', 'widge.switchable.basePage', function(require, exports, module){
	
	var $ = module['jquery'],
		Class = require('base.class').Class,
		util = require('base.util'),
		basePage = module['widge.switchable.basePage'];
		
	var slidePage = Class(function(o){
			slidePage.parent().call(this,  util.merge({
				mouseWheel: false,
				timeout: 5000,
				direction: 0,
				slideSpeed: 1000,
				isMouseParent: false,
				isFullWindow: false
			}, o));
		}).extend(basePage);
	
	slidePage.implement({
		_initEvents: function(){
			this._isInitScroll = true;
			slidePage.parent('_initEvents').call(this);
			this.on('refresh', this._refreshSlide);
		},
		_refreshSlide: function(){
			this._stopPage();
			
			if(!this._isInitScroll){
				var itemWidth = this.getItemsSize(),
					wrapperWidth = this.getWrapperSize();
				
				this._itemStep = Math.floor(wrapperWidth / this.getItemSize());
				this._pageCount = this._scrollItem.length / this._itemStep;
				
				if(this._pageCount % 1  === 0){
					this._currentPage = this._currentPage || 0;
				} else {
					delete this._currentPage;
				}
				if(!this.isSlide()){
					delete this._currentPage;
					return;
				}
			}
			
			this._autoPage();
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
		_autoPage: function(event){
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
		updateSize: function(){
			if(this._isInitScroll){
				this._initRender();
			} else {
				if(!this.isSlide()){
					return;
				}
				if(this.get('isFullWindow')){
					if(this.hasVerticalScroll){
						this.scrollItem.height(this.getItemSize());
					} else {
						this.scrollItem.width(this.getItemSize());
					}
					this._oldScrollSize = this.getItemsSize();
				}
			}
			slidePage.parent('updateSize').call(this);
		},
		_initRender: function(){
			var itemWidth = this.getItemsSize(),
				wrapperWidth = this.getWrapperSize();
				
			this._itemStep = Math.floor(wrapperWidth / this.getItemSize());
			this._pageCount = this.scrollItem.length / this._itemStep;
			if(this._pageCount % 1  === 0){
				this._currentPage = 0;
			}
			
			if(this.isSlide()){
				this._scrollItem = this.scrollItem;
				this.scrollItem.clone().prependTo(this.scroller);
				
				var avaiSize = itemWidth - wrapperWidth;
				if(avaiSize < wrapperWidth){
					this.scrollItem.clone().appendTo(this.scroller);
				}
				
				this._oldScrollSize = this._scrollItem.length * this.getItemSize(); 
				this.scrollItem = this.getScrollItem();
				
				var isFullWindow = this.get('isFullWindow');
				if(this.hasVerticalScroll){
					isFullWindow && this.scrollItem.height(this.getItemSize());
					this.set('startY', -itemWidth);
				} else {
					isFullWindow && this.scrollItem.width(this.getItemSize());
					this.set('startX', -itemWidth);
				}
			}
		},
		resetPosition: function (time) {
			if(this.get('isFullWindow') && this.isSlide()){
				if(!this._isSlidePlay()){
					if(this.hasVerticalScroll){
						this._translate(this.x, -this._oldScrollSize);
					} else {
						this._translate(-this._oldScrollSize, this.y);
					}
				} else {
					return false;
				}
			}
			return slidePage.parent('resetPosition').call(this, time);
		},
		isSlide: function(){
			return this.getItemsSize() > this.getWrapperSize();
		},
		getItemSize: function(){
			var scrollItem = this._scrollItem || this.scrollItem;
			if(this.hasVerticalScroll){
				return this.scrollItem.outerHeight();
			} else {
				return this.get('isFullWindow') ? $(window).outerWidth() : this.scrollItem.outerWidth();
			}
		},
		getItemsSize: function(){
			var scrollItem = this._scrollItem || this.scrollItem;
			return this.getItemSize() * scrollItem.length;
		},
		getWrapperSize: function(){
			if(this.hasVerticalScroll){
				return this.wrapperHeight;
			} else {
				return this.wrapperWidth;
			}
		},
		_isSlidePlay: function(){
			return !this.enabled || (!this.get('useTransition') && this.isAnimated) || (this.get('useTransition') && this._isTransition);
		},
		_isSlidePage: function(page){
			return util.type.isNumber(page) && util.type.isNumber(this._currentPage) && page === this._currentPage;
		},
		goToPage: function (page, isAutoPlay, dir, time, easing, f) {
			if(this._isSlidePlay() || !this.isSlide()){
				return;
			}
			this._stopPage();
			easing = easing || this.get('bounceEasing');
			
			dir = dir || this.get('direction');
			var step = 0;
			if(this._isSlidePage(page) && !f){
				return;
			}
			
			if(!this._isSlidePage(page) && page >= 0 && page < this._pageCount){
				if(this._currentPage == undefined){
					return;
				}
				step = page - this._currentPage;
				this._currentPage = page;
			
				dir = step < 0 ? 1 : 0;
				step = Math.abs(step) - 1;
			}
			this._isTransition = true;
			
			this._slideStep = step || 0;
			var pos = this._getPos(dir);
			
			time = time === undefined ? this.get('slideSpeed') || Math.max(
				Math.max(
					Math.min(Math.abs(pos.x - this.x), 1000),
					Math.min(Math.abs(pos.y - this.y), 1000)
				), 300) : time;
			
			this.currentPage = {
				x: pos.x,
				y: pos.y,
				page: this._currentPage != undefined ? this._currentPage : -1
			};
			
			var triggerName = dir ? 'Prev' : 'Next',
				eventObj = {
					dir: triggerName.toLowerCase(),
					currentPage: isAutoPlay ? this.currentPage : $.extend(this.currentPage, {
						fn: this._autoPage
					}),
					time: time,
					page: this.currentPage.page
				};
			
			var triggerName = dir ? 'Prev' : 'Next';
			this.trigger('page' + triggerName, this.currentPage);
			this.scrollTo(pos.x, pos.y, time, easing, eventObj);
		},
		next: function (time, easing) {
			if(this._isSlidePlay() || !this.isSlide()){
				return;
			}
			
			if(util.type.isNumber(this._currentPage)){
				this._currentPage++;
				if(this._currentPage >= this._pageCount){
					this._currentPage = 0;
				}
			}
			var isAutoPlay = null;
			if(time === true){
				time = undefined;
				isAutoPlay = true;
			}

			this.goToPage(this._currentPage, isAutoPlay, 0, time, easing, true);
		},
		prev: function (time, easing) {
			if(this._isSlidePlay() || !this.isSlide()){
				return;
			}
			
			if(util.type.isNumber(this._currentPage)){
				this._currentPage--;
				if(this._currentPage < 0){
					this._currentPage = this._pageCount - 1;
				}
			}
			var isAutoPlay = null;
			if(time === true){
				time = undefined;
				isAutoPlay = true;
			}
			this.goToPage(this._currentPage, isAutoPlay, 1, time, easing, true);
		},
		_getPos: function(direction){
			var x = this.x, y = this.y,
				dir = direction != undefined ? direction : this.get('direction'),
				step;
				
			if(this.hasVerticalScroll){
				step = this._slideStep * this.wrapperHeight;
				y = dir ? this.y + (this.wrapperHeight + step) : this.y - (this.wrapperHeight + step);
			} else {
				step = this._slideStep * this.wrapperWidth;
				x = dir ? this.x + (this.wrapperWidth + step) : this.x - (this.wrapperWidth + step);
			}
			return {
				x: x,
				y: y
			}
		},
		_goToEnd: function(event){
			if(event && event.dir){
				this._addElement(event.dir === 'next' ? 0 : 1, event.time);
			}
			
			delete this._isTransition;
		},
		_addElement: function(direction, time){
			this.scrollItem = this.getScrollItem();
			var length = this.scrollItem.length,
				dir = direction != undefined ? direction : this.get('direction'),
				self = this, item,
				step = this._slideStep;
			
			this.scrollItem.each(function(i){
				if(i >= self._itemStep + self._itemStep * step) return false;
				if(dir){
					item = self.scrollItem.eq(length - i - 1);
					item.prependTo(self.scroller);
				} else {
					item = self.scrollItem.eq(i);
					item.appendTo(self.scroller);
				}
			});
			
			if(this.hasVerticalScroll){
				this._translate(this.x, -this._oldScrollSize);
			} else {
				this._translate(-this._oldScrollSize, this.y);
			}
		}
	});
	
	return slidePage;
});