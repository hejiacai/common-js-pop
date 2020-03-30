// JavaScript Document

define('widge.select', 
['widge.popup', 'module.dataSource'], 
function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		dataSource = require('module.dataSource').dataSource,
		popup = module['widge.popup'],
		template = {
			list: '<ul></ul>',
			item: '<li data-value="{value}"><a href="javascript:void(0)" title="{label}">{labelTemplate}</a></li>'
		},
		attr = "data-value",
		iconReg = /(.*)(\<(?:em|u|i)\>\w*\<\/(?:em|u|i)\>)(.*)/i,
		delay = 70,
		cid = 0;
		
	function uid(){
		return ++cid;
	}
	var select = Class(function(o){
		this.readOnlyAttrs = {
			triggerType: true,
			maxHeight: true,
			hoverClassName: true,
			selectClassName: true,
			trigerClassName: true,
			triggerHoverClassName: true
		}
		select.parent().call(this, util.merge({
			trigger: $('#select'),
			target: 'label',
			menu: 'ul',
			itemName: 'li',
			className: 'select_options',
			trigerClassName: 'select_ui_open',
			triggerHoverClassName: 'select_ui_over',
			selectClassName: 'current',
			selectName: null,
			align: {
                baseXY: [0, '100%-1px']
            },
			isHidDefault: false, 
			triggerType: 'click',
			selectedIndex: -1,
			selectedValue: null,
			maxHeight: null,
			dataSource: null,
			selectCallback: {
				isDefault: false,
				defaultColor: '#ccc',
				lightColor: '#333'
			},
			value: null
		}, o));
	}).extend(popup);
	
	select.implement({
		init: function(){
			var trigger = this.get('trigger');
			if(!isDom(trigger)){
				throw new Error('widge.selecter: 找不到目标');
			}
			if(!this.get('template')){
				this.set('template', template.item);
			}
			
			this.setEnabled(true);

			this._bindBaseElement();
			select.parent('init').call(this);
			this.resetSize(trigger.width(), 'auto');
			this._initConfig();
			if(this.get('selectedValue')){
				this.setSelectedValue(this.get('selectedValue'), true);
			} else {
				this.setSelectedIndex(this.get('selectedIndex'), true);
			}
		},
		_initConfig: function(){
			this._initElements();
			this._initData();
			this._initInput();
			this._initHeight();
			this._initEvents();
		},
		_initElements: function(){
			var trigger = this.get('trigger');
			if(this.get('target')){
				this.set('target', trigger.find(this.get('target')));
			}
			var menu = trigger.find(this.get('menu'));
			if (menu[0]) {
				this._isInitLoad = true;
				if(menu.children().length){
					this._isInit = true;
				}
				this.set('menu', menu);
				this._isDom = true;
				this._renderTemplate();
			}
		},
		_bindBaseElement: function(){
			var align = this.get('align');
			align.baseElement = this.get('trigger');
			this.set('align', align);
		},
		_initData: function(){
			this.dataSource = new dataSource({
				source: this.get('dataSource')
			});
			this.dataSource.on('data', util.bind(this._renderData, this));
			this.updateData();
		},
		_renderData: function(data){
			if(!this._isInitLoad){
				this.set('dataSource', data);
				this._renderTemplate();
			}
			if(this._isInitLoad) delete this._isInitLoad;
		},
		updateData: function(){
			if(this.dataSource.get('source')){
				this.dataSource.abort();
				this.dataSource.getData(this.get('value'));
			}
		},
		setData: function(data){
			if(util.type.isString(data) || util.type.isArray(data) || util.type.isObject(data)){
				this.dataSource.set('source', data);
				this.dataSource.setData(data);
			}
		},
		_renderTemplate: function(){
			var dataSource = this.get('dataSource'),
				menu = this.get('menu'),
				html = '',
				self = this;
			if(dataSource && !this._isInit){
				$.each(dataSource, function(index, val){
					if(val['title']){
						val['labelTemplate'] = val['label'];
						val['label'] = val['title'];
					} else {
						val['labelTemplate'] = val['label'];
					}
					html += normalizeValue(val, self.get('template'));
				});
			} else {
				html = menu.html();
			}
			if(this._isDom || this._isInit){
				menu.remove();
				menu = null;
				delete this._isDom;
				delete this._isInit;
			}
			if(!isDom(menu)){
				this.set('menu', $(template['list']));
				this.get('menu').appendTo(this.get('element'));
			}
			html && this.get('menu').html(html);
			this._createItems();
			setTimeout(function(){
				self.trigger('data');
			}, 1);
		},
		_createItems: function(){
			this.set('items', this.get('menu').children());
			if(this.get('isHidDefault')){
				this.get('items').eq(0).hide();
			}
		},
		_initHeight: function() {
			this._updateScroll();
            this.after('show', function(){
                if (this.get('isScroll')) {
                    this.get('menu').scrollTop(0);
                }
            });
        },
		_initEvents: function(){
			var self = this,
				trigger = this.get('trigger'),
				element = this.get('element'),
				itemName = this.get('itemName'),
				hideTimer;
				
			trigger.on('click', function(){
				if(!self.get('enabled')) return;
				if(isClick(self.get('triggerType'))){
					util.bind(self.toggle, self)();
				} else {
					hideTimer && clearTimeout(hideTimer);
					self.show();
				}
			});

			element.on('click', itemName, function(e){
				if(!self.get('enabled')) return;
				hideTimer && clearTimeout(hideTimer);
				
				var index = self.get('items').index($(e.currentTarget));
				self.setSelectedIndex(index);
				self.hide();
			});
			
			if(isClick(this.get('triggerType'))){
				this._blurHide(trigger);
			} else {
				var hoverName = this.get('triggerHoverClassName');
				trigger.on('mouseenter', function(e){
					if(!self.get('enabled')) return;
					enterHandler(e);
					if(hoverName){ $(this).addClass(hoverName); }
				});
				element.on('mouseenter', enterHandler);
				trigger.on('mouseleave', function(e){
					if(!self.get('enabled')) return;
					leaveHandler(e);
					if(hoverName) { $(this).removeClass(hoverName); }
				});
				element.on('mouseleave', leaveHandler);
			}

			this.on('change:visible', util.bind(this._onChangeVisible, this));
			
			function enterHandler(e){
				if(!self.get('enabled')) return;
				self.get('visible') && hideTimer && clearTimeout(hideTimer);
			}
			function leaveHandler(e){
				if(!self.get('enabled')) return;
				if(self.get('visible')){
					hideTimer && clearTimeout(hideTimer);
					hideTimer = setTimeout(function(){
						self.hide();
					}, delay);
				}
			}
		},
		_onChangeVisible: function(e){
			var trigger = this.get('trigger');
			if(e){
				trigger.addClass(this.get('trigerClassName'))
			} else {
				trigger.removeClass(this.get('trigerClassName'));
			}
		},
		_initInput: function(){
			var trigger = this.get('trigger');
			if(name = this.get('selectName')){
				input = $(
					'<input type="text" id="select_' + name +
					'" name="' + name + '" />'
				).css({
					position: 'absolute',
					left: '-99999px',
					zIndex: -100
				}).insertAfter(trigger);
				
				this.set('selectName', input);
			}
		},
		_updateScroll: function(){
			var maxHeight,
				list = this.get('menu'); 
			
			if(util.type.isString(list))
				return;
			if(!(maxHeight = this.get('maxHeight')))
				return;
				
			var height = getLiHeight(list), css;
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
			list.css(css);
		},
		toggle: function(){
			if(this.get('visible')){
				this.hide();
			} else {
				if(this.get('items').length){
					this.show();
				}
			}
		},
		setSelectedIndex: function(index, f){
			var items = this.get('items'),
				input, len;

			if(!items) return;
			if(len = items.length){
				if(index < 0) return;	
				var selClass = this.get('selectClassName'),
					trigger = this.get('target')[0] ? this.get('target') : this.get('trigger'),
					value, label, oldValue, oldLabel,
					index = range(index, len);
					e = {};
				items.removeClass(selClass);
				items = items.eq(index);
				if(input = this.get('selectName')){
					oldValue = e.oldValue = this.get('value') || '';
					input.val(value = items.attr(attr));
					this.set('value', value);
					e.value = value;
				}
				oldLabel = e.oldLabel = this.get('label') || '';
				trigger.html(getLabel(trigger, items));
				this.set('label', e.label = items.text());
				
				e.oldIndex = this.get('selectedIndex');
				this.set('selectedIndex', e.index = index);
				items.addClass(selClass);
				this._changeColor();
				!f && this.trigger('change', e);
			}
		},
		clearLabel: function(){
			if(this.get('selectedIndex') == -1){
				this.set('label', null);
				this.set('value', null);
				this.get('target').html('');
				var input;
				if(input = this.get('selectName')){
					input.val('');
				}
			}
		},
		_changeColor: function(){
			var sc = this.get('selectCallback');
			if(sc && util.type.isObject(sc)){
				if(sc.isDefault && sc.lightColor && sc.defaultColor){
					var target = this.get('target'),
						items = this.get('items');
						index = this.get('selectedIndex');
					if(index && (items.eq(index).attr(attr) || items.eq(index).attr(attr) == 0)){
						target.css('color', sc.lightColor);
					} else {
						target.css('color', sc.defaultColor);
					}
				}
			}
		},
		setSelectedValue: function(value, f){
			if(!value){ return; }
			var items = this.get('items'),
				i = 0;
			for(var len = items.length; i < len; i++){
				if(value == items.eq(i).attr(attr)){
					this.setSelectedIndex(i, f);
					return i;
				}
			}
			return -1;
		},
		indexOf: function(value){
			var dataSource = this.get('dataSource');
			if(!value || !util.type.isArray(dataSource)) return;
			var i = 0;
			for(var len = dataSource.length; i < len; i++){
				if(value === dataSource[i]['value']){
					return i;
				}
			}
			return -1;
		},
		addElement: function( data ){
			var menu = this.get('menu'), html;
			if(util.type.isString(menu) || (menu.jquery && !menu.length)){
				return;
			}
			
			html = util.string.replace(this.get('template'), data);
			menu.append(html);
			this.updateAllElements();
		},
		removeElement: function(index){
			var items = this.get('items'),
				selectedIndex = this.get('selectedIndex'),
				len;
			if(len = items.length){
				index = range(index, len);
				items = items.eq(index);
				items.remove();
				selectedIndex = selectedIndex <= 0 ? -1 : selectedIndex - 1;
				
				this.set('selectedIndex', selectedIndex);
				this.updateAllElements();
			}
		},
		removeAllElements: function(){
			if(util.type.isString(this.get('menu'))){
				this.set('menu', this.get('trigger').find(this.get('menu')));
			}
			this.get('menu').empty();
			this.set('selectedIndex', -1);
			this.updateAllElements();
		},
		updateAllElements: function(){
			var menu = this.get('menu'),
				items = menu.children(this.get('items'));
			
			this.set('items', items);
			this.setSelectedIndex(this.get('selectedIndex'));
			this._updateScroll();
		},
		getElements: function(){
			return this.get('items');
		},
		setEnabled: function(b){
			if(!b){
				this.setSelectedIndex(0, true);
			}
			this.set('enabled', b);
		}
	});
	
	function getLabel(trigger, item){
		var html = trigger.html(),
			match = html.match(iconReg), icon;
		if( match ){
			html.replace(iconReg, function(all, $1, $2, $3){
				icon = $2;
			});
			if( match[1] ){
				return item.text() + icon;
			} else if( match[3] ){
				return icon + item.text();
			}
		}
		return item.text();
	}
	function range(index, length){
		return index <= 0 ? 0 : index >= length ? length - 1 : index;
	}
	function isDom(menu){
		return menu && menu.jquery && menu[0];
	}
	function normalizeValue(val, template){
		var f;
		if(util.type.isString(val)){
			f = true;
		} else if(util.type.isObject(val)) {
			f = false;
		} else {
			throw new Error('widge.select: 数据格式不正确');
		}
		return util.string.replace(template, normalizeItem(val, f));
	}
	function normalizeItem(val, f){
		if(f !== undefined){
			var id = uid();
			return {
				value: f ? val : val.value != undefined ? val.value : id,
				label: f ? val : val.label || id,
				labelTemplate : f ? val : val.labelTemplate || id,
				name: f ? val : val.name || id,
				url: val.url || 'javascript:'
			}
		}
		throw new Error('widge.select: 找不到数据源');
	}
	function isClick(type){
		return type === 'click';
	}
	function getNodeName(node){
		return node[0] && node[0].nodeName.toLowerCase();
	}
	function getLiHeight(ul) {
        var height = 0;
        ul.children().each(function(index, item) {
            height += $(item).outerHeight(true);
        });
        return height;
    }
	
	return select;
});