// JavaScript Document

define('widge.changeClass', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		doc = document,
		triggerType = {
			CLICK: 'click',
			HOVER: 'hover'
		}
	var changeClass = shape(function(o){
			changeClass.parent().call(this, util.merge({
				container: null,
				element: null,
				trigger: null,
				className: 'filter_menu_select',
				triggerType: 'hover',
				isParent: true,
				isLeaved: false,
				isAllTrigger: true
			}, o));
			this._initElements();
		});
	
	changeClass.clickElements = [];
	changeClass.implement({
		_initElements: function(){
			var element = this.getElement(),
				method;
			
			if(element && element.length){
				method = this._isClick() ? this._clickHide : this._hoverHide;
				method.call(this, element);
			}
		},
		_isClick: function(){
			return this.get('triggerType') === triggerType.CLICK;
		},
		getElement: function(){
			var container, element;
			if(container = this.get('container')){
				element = this.get('element') ? container.find(this.get('element')) : container;
			} else {
				if(util.type.isString(this.get('element'))){
					element = $(this.get('element'));
				} else {
					element = this.get('element');
				}
			}
			return element;
		},
		_clickHide: function(arr){
			
			var container = this.get('container'),
				triggerName = this.get('trigger'),
				className = this.get('className'),
				elementName = this.get('element'),
				isDocument = this.get('isDocument'),
				trigger = arr.find(triggerName),
				isParent = this.get('isParent'),
				isTrigger = this.get('isTrigger'),
				isAllTrigger = this.get('isAllTrigger'),
				self = this;
			
			if(this.get('isLeaved')){
				var el;
				if(container && container.length){
					el = container;
				} else {
					el = arr.parent();
				}
				leaveHide.call(this, el, arr, elementName);
			}
			
			if(isDocument && !this.get('isLeaved')){
				var elementArr = $.makeArray(arr);
				this._hideElements = elementArr;
				changeClass.clickElements.push(this);
			}
			
			arr.on('click', triggerName, function(e){
				var _this = $(this),
					el = arr;
					
				if(isParent){
					element = (elementName && _this.closest(elementName)) || container;
				} else {
					element = _this;
					el = trigger;
				}
				
				var f = element.hasClass(className);
				if( !f ){
					isAllTrigger && self.fire(el, true);
					f = self.fire(element);
					isDocument && (self._isDocClick = false);
				} else if( f && (!isDocument && isTrigger)){
					f = self.fire(element, true);
				}
				triggeHandler.call(self, element, trigger, _this, e, f);	
			});
		},
		_hoverHide: function(el){
		   	var self = this,
				container = this.get('container') || $(doc),
				className = this.get('className'),
				elementName = this.get('element'),
				f;
				
			container.on('mouseenter', elementName,  function(e){
				self.fire(el, true);
				var f = self.fire($(this));
				triggeHandler.call(self, container, el, $(this), e, f);
			});
			if(this.get('triggerType') === triggerType.HOVER){
				leaveHide.call(this, container, el, elementName);
			}
		},
		fire: function(el, b){
			var className = this.get('className');
			b ? el.removeClass(className) : el.addClass(className);
			return !(!!b);
		},
		destory: function(){
			delete this._isDocClick;
			destory(this, changeClass.clickElements);
			changeClass.parent('destory').call(this);
		}
	});
	
	
	function destory(target, array){
		for(var i=0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
	}
	function leaveHide(container, el, context){
		var self = this;
		container.on('mouseleave', context, function(e){
			f = self.fire($(this), true);
			triggeHandler.call(self, container, el, $(this), e, f);
		});
	}
	function triggeHandler(parent, group, target, e, f){
		e.parent = parent;	
		e.group = group;
		e.child = target;
		e.status = f;
		this.trigger(e.type, e);
	}
	function clickHidePopups(e){
		e.stopPropagation();
		$(changeClass.clickElements).each(function(index, item){
			if( !item || (item && (item._isDocClick === false || item.get('isLeaved')))) {
				item._isDocClick = true;
                return;
            }
			var className = item.get('className'),
				dom, other, f;
				
			for(var i=0; i<item._hideElements.length; i++) {
				dom = $(item._hideElements[i]),
				other = $(item.get('otherTrigger'));
				if(!dom.hasClass(className) && !other) continue;
                var el = dom[0],
					o = other[0];
                if (isInDocument(el, e.target) || isInDocument(o, e.target)) {
                    return;
                }
				f = item.fire(dom, true);
				triggeHandler.call(item, $(doc), dom.filter(function(){
					return $(this).selector === item.get('trigger');
				}), dom, f);
				item._isDocClick = false;
            }
		});
	}
	
	function isInDocument(el, target){
		return el == target || $.contains(el, target);
	}
	$(doc).on('click', function(e){
		clickHidePopups(e);
	});
	
	return changeClass;
});