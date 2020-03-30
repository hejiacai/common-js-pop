// JavaScript Document

define('widge.autoComplete.search', 
	['widge.popup', 'widge.textPlaceHolder', 'module.dataSource', 'widge.autoComplete.filter'],
function(require, exports, module){
	
	var $ = module['mobile'] || module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		dataSource = exports.dataSource = require('module.dataSource').dataSource,
		Filter = require('widge.autoComplete.filter'),
		popup = module['widge.popup'],
		Input = module['widge.textPlaceHolder'],
		lightClassName = 'item_hl',
		hoverClassName = 'item_hover',
		IE678 = /\bMSIE [678]\.0\b/.test(navigator.userAgent),
		template = {
			header: '',
			list: '<ul class="options"></ul>',
			item: '<li><a href="javascript:"  data-url="{link}">{label}</a></li>',
			footer: {
				'1':'<li class="itemBottom"><a href="{link}">{icons}搜急聘中的&quot;{label}&quot;的职位&raquo;</a></li>',
				'2':'<li class="itemBottom"><a href="{link}">{icons}搜&quot;{label}&quot;猎头职位&raquo;</a></li>',
				'3':'<li class="itemBottom"><a href="{link}">{icons}搜招聘&quot;{label}&quot;的名优企业&raquo;</a></li>'
			}
		},
		icons = {
			'1': '<span class="hbFntWes"><i>&#xf0e7;</i>急聘</span>',
			'2': '<span class="hbFntWes gray">猎头</span>',
			'3': '<span class="yellow"><em class="icons15_xing"></em></span>'
		},
		itemName = 'a';

	var search = Class(function(o){
		search.parent().call(this, util.merge({
			trigger: $('#searchInput'),
			className: 'search',
			lightClassName: lightClassName,
			hoverClassName: hoverClassName,
			align: {
                baseXY: [0, '100%']
            },
			width: 300,
			height: 'auto',
			maxHeight: null,
			template: template,
			isSubmit: false,
			selectedIndex: -1,
			dataSource: null,
			filter: 'stringMatch',
			delay: 70,
			icons: icons,
			cache: null,
			defaultValue: '请输入关键字',
			defaultColor: '#999',
			isAutoSelect: false
		}, o));
		
	}).extend(popup);
	
	search.implement({
		init: function(){
			var trigger = this.get('trigger');
			this._isOpen = false;
			this._isInit = true;
			search.parent('init').call(this);
			this._bindBaseElement();
			this._initElement();
		},
		_bindBaseElement: function(){
			var align = this.get('align');
			align.baseElement = this.get('trigger');
			this.set('align', align);
		},
		_initElement: function(){
			this._initInput();
			this._initData();
			this._initFilter();
			this._initEvents();
			this._initItemEvents();
			this._blurHide([this.get('trigger')]);
		},
		_initInput: function(){
			this.input = new Input({
				element: this.get('trigger'),
				delay: this.get('delay'),
				defaultValue: this.get('defaultValue'),
				defaultColor: this.get('defaultColor')
			});
		},
		_initData: function(){
			var options = {
					source: this.get('dataSource')
				},
				cache = this.get('cache');
			options.options = {
				dataType: 'jsonp',
				type: 'get'
			}
			
			if(util.type.isBoolean(cache) && cache !== false){
				options.isCache = cache;
			} else if( util.type.isPlainObject(cache)){
				if(util.type.isBoolean(cache.isCache) && cache.isCache !== false){
					options.isCache = cache.isCache;
					!isNaN(cache.cacheSize) && (options.cacheSize = cache.cacheSize);
				}
			}
			this.dataSource = new dataSource(options);
		},
		setData: function(data){
			if(util.type.isString(data) || util.type.isArray(data) || util.type.isObject(data)){
				this.dataSource.set('source', data);
				this.dataSource.setData(data);
			}
		},
		_initFilter: function(){
			var filter = this.get('filter');
			filter = initFilter(filter, this.dataSource);
			this.set('filter', filter);
		},
		_initItemEvents: function(){
			var element = this.get('element'),
				self = this;
			element.on('click', itemName, function(e){
				e.pointTarget = e.target;
				e.target = this;
				self._handleSelection.call(self, e);
			});
			element.on('mouseenter', itemName, function(e){
				e.target = this;
				self._handleMouseMove.call(self, e);
			});
			element.on('mouseleave', itemName, function(e){
				e.target = this;
				self._handleMouseMove.call(self, e);
			});
			element.on('mousedown', itemName, util.bind(this._handleMouseDown, this));
		},
		_initEvents: function(){
			var trigger = this.get('trigger'),
				element = this.get('element'),
				self = this;
				
			this.dataSource.on('data', util.bind(this._filterData, this));
			//this.input.on('blur', util.bind(this.hide, this));
			this.input.on('focus', util.bind(this._handleFocus, this));
			this.input.on('keyEnter', util.bind(this._handleSelection, this));
			this.input.on('keyEsc', util.bind(this.hide, this));
			this.input.on('keyUp keyDown', util.bind(this.show, this));
			this.input.on('keyUp keyDown', util.bind(this._handleStep, this));
			this.input.on('queryChanged', util.bind(this._handleQueryChange, this));
			
			this.after('hide', function() {
				if(this instanceof search){
        			this.set('selectedIndex', -1);
				}
      		});
			this.on('indexChanged', function(e) {
				if (!this.get('isScroll')) return;
				var maxHeight = this.get('maxHeight'),
					element = this.get('element'),
					list = this.get('itemsName'),
					items = this.get('items'),
					itemHeight = list.height() / items.length,
					itemTop = Math.max(0, itemHeight * (e.index + 1) - maxHeight);
				element.scrollTop(itemTop);
			});
		},
		_updateScroll: function(){
			var maxHeight; 
			if(!(maxHeight = this.get('maxHeight')))
				return
			
			var element = this.get('element'),
				list = this.get('itemsName'),
				height = getLiHeight(list),
				css;
			this.set('isScroll', height > maxHeight);
			if(this.get('isScroll')){
				css = {
					'overflow-y': 'scroll',
					'height': maxHeight
				};
			} else {
				css = {
					'overflow-y': 'auto',
					'height': 'auto'
				};
			}
			element.css(css);
		},
		_handleFocus: function() {
      		this._isOpen = true;
		},
		_handleMouseDown: function(e) {
			if (IE678) {
				var trigger = this.input.get('element')[0];
				trigger.onbeforedeactivate = function() {
					window.event.returnValue = false;
					trigger.onbeforedeactivate = null;
				};
      		}
			e.preventDefault();
		},
		_handleMouseMove: function(e){
			var items = this.get('items');
			if(!items || util.type.isString(items)){
				return;	
			}
			var index = items.index($(e.target));
			this.set('selectedIndex', index);
			this._renderItemsClass('items', index);
		},
		_handleSelection: function(e){
			var isMouse = e ? e.type === 'click' : false,
				items = this.get('items');
			if(!items || util.type.isString(items)){
				return;
			}
			var index = isMouse ? items.index($(e.target)) : this.get('selectedIndex'),
				item = items.eq(index),
				data = this.get('data')[index];
			if (index >= 0 && item) {
				this.input.setValue(data.text);
				this.set('selectedIndex', index);
				// 是否阻止回车提交表单
				if (e && !isMouse && !this.get('isSubmit')){
					e.preventDefault();
				}
				if(this.get('isAutoSelect')){
					data.link && (window.location.href = data.link);
				} else {
					var obj = {
						data: data,
						index: index,
						target: item,
						url: data.link,
						group: items
					};
					this.trigger('searchItemSelected', obj);
					this.hide();
				}
			}
		},
		_handleStep: function(e){
			e.preventDefault();
			this.get('visible') && this._step(e.type === 'keyUp' ? -1 : 1);
		},
		_step: function(direction){
			this._stepItems(direction, 'items');
		},
		_stepItems: function(direction, itemName, flagName){
			var currentIndex = this.get('selectedIndex'),
				items = this.get(itemName);
			if(!items) return;
			if (direction === -1) { // 反向
				if (currentIndex > -1) {
					 this.set('selectedIndex', currentIndex - 1);
				} else {
					this.set('selectedIndex', items.length - 1);
				}
			} else if (direction === 1) { // 正向
				if (currentIndex < items.length - 1) {
					this.set('selectedIndex', currentIndex + 1);
				} else {
					this.set('selectedIndex', -1);
				}
			}
			var index = this.get('selectedIndex');
			this._changeValue(index, flagName);
			this._renderItemsClass(itemName, index);
		},
		_changeValue: function(index, flagName){
			var data = this.get('data')[index];
			if(data && !(!!data.renderType)){
				this.get('trigger').val(data[flagName || 'text']);
			}
		},
		_renderItemsClass: function(itemName, index){
			var hoverClass = getClassName(this.get('className'), this.get('hoverClassName')),
				items = this.get(itemName), 
				e = {};
			items && items.removeClass(hoverClass);
			e.oldIndex = this.get('oldIndex') ? this.get('oldIndex') : -1;
			// -1 什么都不选
			if(index === -1)
				return;

			e.index = index;
			items.eq(index).addClass(hoverClass);
			getNodeName(items) === itemName && this.trigger('indexChanged', e);
			this.set('oldIndex', index);
		},
		_handleQueryChange: function(val, prev) {
			if (this.get('disabled')) return;
			this.dataSource.abort();
			this.dataSource.getData(val);
		},
		_renderData: function(data) {
			if(data.alias) delete data.alias;
			data || (data = []);
			if(this._isInit){
				this._renderList();
				delete this._isInit;
			}
			this._clear();
			if(!this._isEmpty()){
				this._renderItems(data);
				this.show();
			} else {
				if(!this.trigger('emptyData')){
					this.hide();
				}
			}
		},
		_renderItems: function(data){
			var items = this.get('itemsName'),
				template = this.get('template') || template,
				self = this,
				item;
			if(item = template.item){
				if(util.type.isArray(data)){
					var html = '',
						temp = {};
					
					$.each(data, function(key, val){
						temp.link = val.link;
						if(!val.renderType){
							temp.label = val.text = val.label;
							if(val.highlightIndex){
								temp.label = highlightItem(temp.label, self.get('className'), self.get('lightClassName'), val.highlightIndex);
							}
							html += util.string.replace(item, temp);
						} else {
							html += self._renderFooter(template.footer, val);
						}
					});
					items.html(html);
					
					if(html){
						this.set('items',  items.find(itemName));
						this._updateScroll();
					}
				} else {
					throw new Error('widge.autoComplete.search: 数据格式不正确');
				}
			} else {
				throw new Error('widge.autoComplete.search: 模板{item}不正确');
			}
		},
		_renderHeader: function(template, val){
			if(!template && !val) return '';
			return util.string.replace(template, val);
		},
		_renderFooter: function(template, val){
			if(!template && !val) return '';
			val.label = filterString(this.input.getValue());
			var icon = this.get('icons')[val.iconType] || '',
				iconStr = template[(val.iconType || 0) + ''];
			if(!iconStr) return '';
			return util.string.replace(iconStr, util.merge({
				'icons': icon
			}, val));
		},
		_renderList: function(){
			var template = this.get('template') || template;
			if(template.list){
				var element = this.get('element');
				this.set('itemsName', $(template.list).appendTo(element));
			} else {
				throw new Error('widge.autoComplete.search: 模板{ul}不正确');
			}
		},
		show: function(e){
			this._isOpen = true;
			if(this._isFireResult()) return;
			search.parent('show').call(this);
		},
		_isFireResult: function(){
			return this._isEmpty();
		},
		hide: function(){
			this._timeout && clearTimeout(this._timeout);
			this.dataSource.abort();
			this._hide();
		},
		_hide: function(){
			this._isOpen = false;
			search.parent('hide').call(this);
		},
		_clear: function(){
			var items = this.get('itemsName');
			items && items.empty();
			this.set('selectedIndex', -1);
			this.set('oldIndex', -1);
		},
		_filterData: function(data){
			var filter = this.get('filter');
			data = filter(normalize(data), this.input.get('query'));
			this.set('data', data);
			this._renderData(data);
		},
		_isEmpty: function(){
			var data = this.get('data');
			return !(data && data.length > 0);
		},
		isEmptyContent: function(){
			return $.trim(this.input.getValue()).length <= 0;
		},
		destory: function(){
			this._clear();
			if (this.input) {
				this.input.destory();
				this.input = null;
			}
			search.parent('destory').call(this);
		}
	});
	
	function filterString(text){
		if(text.length > 10){
			return text.substr(0, 10) + '...';
		}
		return text;
	}
	function isLink(el){
		return (util.type.isString(el) ? el : getNodeName(el)) === "a";
	}
	function getLiHeight(ul) {
        var height = 0;
        ul.children().each(function(index, item) {
            height += $(item).outerHeight(true);
        });
        return height;
    }
	function normalize(data) {
		var result = [];
		$.each(data, function(index, item) {
			if (util.type.isString(item)) {
				result.push({
					label: item,
					value: item,
					alias: [],
					link: 'javascript:',
					iconType: 0,
					renderType: false
				});
			} else if (util.type.isObject(item)) {
				if (!item.value && !item.label) return;
				item.label || (item.label = item.value);
				item.value || (item.value = item.label);
				item.alias || (data.alias ? item.alias = [data.alias] : item.alias = []);
				item.renderType || (item.readerType = false);
				item.iconType || (item.iconType = 0);
				item.link || (item.link = 'javascript:');
				result.push(item);
			}
		});
		return result;
	}
	function initFilter(filter, dataSource){
		// 字符串
		if (util.type.isString(filter)) {
			// 从组件内置的 FILTER 获取
			if (Filter[filter]) {
				filter = Filter[filter];
			} else {
				filter = Filter['default'];
			}
		} else if (!util.type.isFunction(filter)) {
			// 异步请求的时候不需要过滤器
			if (dataSource.get('type') === 'url') {
				filter = Filter['default'];
			} else {
				filter = Filter['startsWith'];
			}
		}
		return filter;
	}
	
	function getChildName(node, className, statusClassName){
		var className = getClassName(className, statusClassName),
			nodeName;

		while(node.children().length){
			node = node.children();
			if(!node.hasClass(className)){
				nodeName = getNodeName(node);
			}
		}
		return nodeName;
	}
	function getClassName(className, currentClassName){
		return className ? className + '_' + currentClassName : currentClassName || '';
	}
	function getNodeName(node){
		return node[0] && node[0].nodeName.toLowerCase();
	}
	function highlightItem(label, className, statusClassName, index, emptyName) {
		className || (className = "");
		var cursor = 0,
			v = label || emptyName || '',
			resultName,
			h = '';
		if (util.type.isArray(index)) {
			for (var i = 0, l = index.length; i < l; i++) {
				var j = index[i],
					start, length;
					
				if (util.type.isArray(j)) {
					start = j[0];
					length = j[1] - j[0];
				} else {
					start = j;
					length = 1;
				}
				if (start > cursor) {
					h += v.substring(cursor, start);
				}
				if (start < v.length) {
					resultName = getClassName(className, statusClassName);
					h += '<span class="' + resultName + '">' + v.substr(start, length) + '</span>';
				}
				
				cursor = start + length;
				if (cursor >= v.length) {
					break;
				}
			}
			if (v.length > cursor) {
				h += v.substring(cursor, v.length);
			}
			return h;
		}
    	return v;
	}
	
	return search;
});