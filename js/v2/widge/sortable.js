// JavaScript Document

define('widge.sortable', 'tools.drag', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		Drag = module['tools.drag'];
	
	var sortable = Class(function(o){
			sortable.parent().call(this, util.merge({
				element: $('#foo'),
				children: true,
				limit: true,
				container: $('body'),
				dragOpacity: 0.7,
				sourceOpacity: 0.3
			}, o));
		}).extend(Drag);
		
	sortable.implement({
		_setItemPosition: function(element){
			element.addClass('dragStatus');
		},
		_renderOpacity: function(f){
			if(this._sourceElement && this._element){
				var dragOpacity = f ? 1 : this.get('dragOpacity');
				var sourceOpacity = f ? 1 : this.get('sourceOpacity');
				this._sourceElement.css('opacity', sourceOpacity);
				this._element.css('opacity', dragOpacity);
			}
		},
		_compareItem: function(dragEl, dropEl){
			var item = this.getItem();
			
			return {
				start: item.index(dragEl),
				end: item.index(dropEl)
			}
		},
		_start: function(e){
			var target = $(e.target);
			if(target[0].nodeName.toLowerCase() == 'a' || target.closest('a').length){
				return;
			}
			sortable.parent('_start').call(this, e);
		},
		_initEvent: function(){
			sortable.parent('_initEvent').call(this);
			var self = this,
				_silent = true,
				el = this.get('element');
			
			el.on('mousemove.sortable', function(e){
				if(!self._sourceElement || !self._element || !_silent){
					return;
				}
				
				var target = $(e.target).closest('.droping')[0];
				var curTarget = $(target);
				var dragEl = self._sourceElement[0];
				var ghostEl = self._element[0];
				el = self.get('element')[0];
				
				if( target && target !== dragEl ){
						e.preventDefault();
						var rect = target.getBoundingClientRect(),
							cloneTarget = curTarget.prev(),
							width = rect.right - rect.left,
							height = rect.bottom - rect.top,
							floating = /left|right|inline/.test(cloneTarget.css('float')),
							isWide = (target.offsetWidth > dragEl.offsetWidth),
							isLong = (target.offsetHeight > dragEl.offsetHeight),
							halfway = (floating ? (e.clientX - rect.left) / width : (e.clientY - rect.top) / height) > .5,
							nextSibling = curTarget.next()[0], after;	
						
						_silent = false;
						setTimeout(_unsilent, 30);
						
						var compareItem = self._compareItem(self._element, cloneTarget);
						
						if( floating ){
							after = (cloneTarget.prev()[0] === dragEl) && !isWide || halfway && isWide;
						} else {
							after = (nextSibling !== ghostEl) && !isLong || halfway && isLong;
						}
						
						if( after && !nextSibling ){
							el.appendChild(dragEl);
						} else {
							$(dragEl).insertBefore(after ? $(nextSibling) : cloneTarget);
							//target.parentNode.insertBefore(dragEl, after ? nextSibling : cloneTarget[0]);
						}
						
						self._element.insertBefore(self._sourceElement);
						
						var compareSize = Math.abs(compareItem.start - compareItem.end);
						if(compareSize != 2){
							var item, itemClone,
								isSorted = compareItem.start <= compareItem.end,
								start = isSorted ? compareItem.start : compareItem.end,
								end = isSorted ? compareItem.end : compareItem.start;

							for(var i = start; i <= end; i+= 2){
								item = self.getItem().eq(i);
								if(!item.hasClass('dropble')){
									continue;
								}
								itemClone = item.next();
								itemClone.css({
									left: item.position().left,
									top: item.position().top
								});
							}
							
						} else {
							$(target).css({
								left: cloneTarget.position().left,
								top: cloneTarget.position().top
							});
						}
					
				}
				
			});
			
			function _unsilent(){
				_silent = true;
			}
			
			this.on('dragInit', function(e){
				var target = this._element;
				target.addClass('dragable');
				
				this._sourceElement = target.clone().insertAfter(target).addClass('dragable');
				this._renderOpacity();
				
				var targetWidth = target.outerWidth();
				target.css({
					position: 'absolute',
					width: targetWidth,
					left: target.position().left,
					top: target.position().top
				});
				
				this._clone = this.getItem().filter(function(){
					var me = $(this);
					if(!me.hasClass('dragable')){
						var clone = me.clone().insertAfter(me).addClass('droping');
						clone.css({
							position: 'absolute',
							left: me.position().left,
							top: me.position().top,
							zIndex: 9999,
							opacity: 0,
							width: targetWidth
						});
						return true;
					}
					return false;
				}).addClass('dropble');
			});
			this.on('dragEnd', function(e){	
				var parent = $(e.parentTarget);
				parent.find('.dragable').removeClass('dragable');
				parent.find('.dropble').removeClass('dropble');
				parent.find('.droping').remove();
						
				this._renderOpacity(true);
				this._element.remove();
				delete this._sourceElement;
				this.trigger('dropEnd', e);
			});
		},
		destory: function(){
			this.get('element').off('mousemove.sortable');
			sortable.parent('destory').call(this);
		}
	});
	
	return sortable;
});