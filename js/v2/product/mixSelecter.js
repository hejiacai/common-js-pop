// JavaScript Document

define('product.mixSelecter', 
['widge.popup', 'module.dataSource'], 
function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		dataSource = require('module.dataSource').dataSource,
		popup = module['widge.popup'],
		template = {
			title: '<div class="title"><a class="backBtn icon-svg10" href="javascript:"></a>{title}{mutilpleButton}</div>',
			list: '<ul></ul>',
			oneItem: '<li><a data-value="{value}" href="javascript:void(0)" data-all="{isAll}" data-next="{isNext}">{itemIcon}<span></span><b>{label}</b></a></li>',
			mutilpleButton: '<a class="mutilpleButton" href="javascript:">确定</a>',
			defaultItemIcon: '<em class="icon-svg15"></em>',
			selectedItemIcon: '<em class="icon-uniE602 selectedIcon"></em>',
			footer: '<div class="buttons"><a class="resultBtn" href="javascript:">确&nbsp;&nbsp;定</a></div>'
		},
		attr = "data-value",
		delay = 70,
		cid = 0;
		
	function uid(){
		return ++cid;
	}
	var mixSelecter = Class(function(o){
		mixSelecter.parent().call(this, util.merge({
			className: 'localSelecter',
			width: '100%',
			height: '100%',
			title: '地点',
			position: 'fixed',
			isFooter: false,
			isMutilple: false,
			isStyle: true,
			selectedIndex: -1,
			selectedValue: null,
			dataSource: null,
			value: null
		}, o));
	}).extend(popup);
	
	mixSelecter.implement({
		init: function(){
			this._isInit = true;
			
			if(!this.get('template')){
				this.set('template', template.oneItem);	
			}
			mixSelecter.parent('init').call(this);
			this._initConfig();
		},
		_initConfig: function(){
			this.setTitle(this.get('title'));
			this._initData();
			this._initEvents();
		},
		setTitle: function(title){
			if(title){
				var obj = {
					mutilpleButton: this.get('isMutilple') ? template.mutilpleButton : '',
					title: title
				};
				if(title != this.get('title')){
					this.set('title', title);
				}
				
				if(this._titleElement){
					this._titleElement.remove();
					this._titleElement = null;
				}
				
				this._titleElement = $(util.string.replace(template.title, obj)).prependTo(this.get('element'));
			}
		},
		updateFooter: function(){
			if(this.get('isFooter')){
				$(template.footer).appendTo(this.get('element'));
			}
		},
		_initData: function(){
			this.dataSource = new dataSource({
				source: this.get('dataSource')
			});
			this.dataSource.on('data', util.bind(this._renderData, this));
			this.updateData();
		},
		_renderData: function(data){
			this.set('dataSource', data);
			this._renderTemplate();
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
				html = '',
				self = this;
			
			if(!dataSource){
				throw new Error('错误：找不到数据源');
			}
			
			var itemTemplate = template.oneItem;
			$.each(dataSource, function(index, val){
				if(!self.get('isStyle')){
					val.isStyle = true;
				}
				html += normalizeValue(val, itemTemplate);
			});
			
			if(isDom(this.get('menu'))){
				this.get('menu').remove();
			}
			
			this.set('menu', $(template['list']));
			this.get('menu').appendTo(this.get('element'));
			
			html && this.get('menu').html(html);
			this.set('items', this.get('menu').find('a'));
			
			if(this._isInit){
				this.updateFooter();
				var selectedIndex = this.get('selectedIndex'),
					selectedValue = this.get('selectedValue');
					
				if(this.get('isStyle') && !this.get('isMutilple')){
					if(this.get('selectedValue')){
						this.setSelectedValue(selectedValue, true);
					} else {
						this.setSelectedIndex(selectedIndex, true);
					}
				} else if(!this.get('isStyle') && this.get('isMutilple')) {
					if(util.type.isArray(selectedValue)){
						$.each(selectedValue, function(index, val){
							self.setSelectedValue(val, true);
						});
					} else if(util.type.isArray(selectedIndex)){
						$.each(selectedIndex, function(index, val){
							self.setSelectedIndex(val, true);
						});
					} else {
						throw new Error('product.mixSelecter: 选择索引号的类型不正确');
					}
				}
				delete this._isInit;
			}
			this.trigger('renderComplete');
		},
		_initEvents: function(){
			var self = this,
				element = this.get('element');
			
			element.on('click', 'a', function(e){
				var target = $(e.currentTarget);
				if(target.hasClass('backBtn')){
					self.hide();
					self.trigger('back', e);
				} else if(target.hasClass('mutilpleButton')){
					e.indexs = self._mutilpleIndexs;
					e.labels = self._mutilpleLabels;
					e.values = self._mutilpleValues;
					self.hide();
					self.trigger('mutilpleSubmit', e);
				} else if(target.hasClass('resultBtn')){
					self.hide();
					self.trigger('submit', e);
				} else {
					var index = self.get('items').index(target);
					self.setSelectedIndex(index);
				}
			});
			
		},
		getSelectedIndex: function(index){
			if(!index){ 
				return this.get('selectedIndex'); 
			} else {
				return this.setSelectedValue(index, true, true);
			}
		},
		setSelectedValue: function(value, f, b){
			if(!value){ return; }
			var items = this.get('items'),
				i = 0;
			for(var len = items.length; i < len; i++){
				if(value == items.eq(i).attr('data-value')){
					!b && this.setSelectedIndex(i, f);
					return i;
				}
			}
		},
		setSelectedIndex: function(index, f){
			var items = this.get('items'),
				input, len;
			if(!items) return;
			if(len = items.length){
				if(util.type.isNumber(index) && index < 0) return;
				var e = {},
					item = items.eq(index);
					
				e.label = item.children('b').html();
				e.value = item.attr('data-value');
				e.isAll = item.attr('data-all') == 'true';
				e.isNext = item.attr('data-next') === 'true';
				e.isMutilple = this.get('isMutilple');
				
				this.set('selectedIndex', e.index = index);
				if(!this.get('isStyle')){
					if(this.get('isMutilple')){
						this._mutilpleLabels = this._mutilpleLabels || {};
						this._mutilpleValues = this._mutilpleValues || {};
						this._mutilpleIndexs = this._mutilpleIndexs || {};
						this._mutilpleNexts = this._mutilpleNexts || {};
						
						if(!item.hasClass('current')){
							item.addClass('current');
							this._mutilpleIndexs[e.index] = e.index;
							this._mutilpleLabels[e.index] = e.label;
							this._mutilpleValues[e.index] = e.value;
							this._mutilpleNexts[e.index] = e.isNext;
						} else {
							item.removeClass('current');
							
							delete this._mutilpleIndexs[e.index];
							delete this._mutilpleLabels[e.index];
							delete this._mutilpleValues[e.index];
							delete this._mutilpleNexts[e.index];
							this.set('selectedIndex', e.index = -1);
							e.label = null;
							e.value = null;
						}
						e.indexs = this._mutilpleIndexs;
						e.labels = this._mutilpleLabels;
						e.values = this._mutilpleValues;
						e.nexts = this._mutilpleValues;
						e.isAll = null;
					} else {
						items.removeClass('current');
						item.addClass('current');
						this.hide();
					}
				} else {
					items.removeClass('current');
					if(!e.isNext){
						item.addClass('current');
					}
				}
				!f && this.trigger('change', e);
			}
		},
		getSelectedLabel: function(index){
			var items = this.get('items');
			if(items.length){
				return items.eq(index).children('b');
			}
			return null;
		},
		clearShowLabel: function(){
			var items = this.get('items');
			if(items.length){
				items.children('span').html('');
			}
			return this;
		},
		getShowLabel: function(index){
			var items = this.get('items');
			if(items.length){
				return items.eq(index).children('span');
			}
			return null;
		}
	});
	
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
			throw new Error('product.mixSelecter: 数据格式不正确');
		}
		return util.string.replace(template, normalizeItem(val, f));
	}
	function normalizeItem(val, f){
		if(f !== undefined){
			var id = uid();
			return {
				value: f ? val : val.value != undefined ? val.value : id,
				label: f ? val : val.label || id,
				itemIcon: f ? template.defaultItemIcon : val.isAll ? '' : val.isStyle ? template.selectedItemIcon : val.isNext ? template.defaultItemIcon : template.selectedItemIcon,
				isAll: f ? false : val.isAll || false,
				isNext: f ? false : val.isNext || false
			}
		}
		throw new Error('product.mixSelecter: 找不到数据源');
	}
	
	return mixSelecter;
});