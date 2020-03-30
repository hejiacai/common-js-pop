// JavaScript Document

define('product.mutilpleSelecter', 
['widge.popup', 'module.dataSource'], 
function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		Class = require('base.class').Class,
		dataSource = require('module.dataSource').dataSource,
		popup = module['widge.popup'],
		template = {
			title: '<div class="title"><a class="backBtn hbFntWes" href="javascript:">&#xf104;</a>{title}<a class="mutilpleButton" href="javascript:">确定</a></div>',
			panel: '<div class="panel"></div>',
			panelItem: '<div class="panelItem" data-value="{value}" data-all="{isAll}"><a href="javascript:">x</a>{label}</div>',
			list: '<ul></ul>',
			item: '<li><a data-value="{value}" href="javascript:void(0)" data-all="{isAll}" data-next="{isNext}">{itemIcon}<b>{label}</b></a></li>',
			defaultItemIcon: '<em class="hbFntWes">&#xf054;</em>',
			selectedItemIcon: '<em class="hbFntWes selectedIcon">&#xf00c;</em>'
		},
		delay = 70,
		cid = 0;
		
	function uid(){
		return ++cid;
	}
	var mutilpleSelecter = Class(function(o){
		mutilpleSelecter.parent().call(this, util.merge({
			className: 'mutilpleSelecter',
			width: '100%',
			height: '100%',
			title: '地点',
			position: 'fixed',
			selectedIndex: -1,
			selectedValue: null,
			dataSource: null,
			value: null
		}, o));
	}).extend(popup);
	
	mutilpleSelecter.implement({
		init: function(){
			this._isInit = true;
			
			if(!this.get('template')){
				this.set('template', template.item);	
			}
			mixSelecter.parent('init').call(this);
			this._initConfig();
		},
		_initConfig: function(){
			this.setTitle(this.get('title'));
			this._initPanel();
			this._initData();
			this._initEvents();
		},
		setTitle: function(title){
			if(title){
				if(title != this.get('title')){
					this.set('title', title);
				}
				
				if(this._titleElement){
					this._titleElement.remove();
					this._titleElement = null;
				}
				
				this._titleElement = $(template.title).prependTo(this.get('element'));
			}
		},
		_initPanel: function(){
			this._panel = $(template.panel).prependTo(this.get('element'));
		},
		addPanel: function(val){
			if(util.type.isObject(val)){
				$(util.string.replace(template.item, val)).appendTo(this._panel);
			}
		},
		deletePanel: function(val){
			if(util.type.isObject(val) && val.value){
				var panelItem = this.get('panelItem');
				if(panelItem && panelItem.length){
					panelItem.each(function(index, val){
						if($(this).attr('data-value') == val.value){
							$(this).remove();
							return false;
						}
					});
				}
			}
		},
		updatePanel: function(){
			this.set('panelItem', this._panel.children('.panelItem'));
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
			
			var itemTemplate = template.item;
			$.each(dataSource, function(index, val){
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
					
				
				if(util.type.isArray(selectedValue)){
					$.each(selectedValue, function(index, val){
						self.setSelectedValue(val, true);
					});
				} else if(util.type.isArray(selectedIndex)){
					$.each(selectedIndex, function(index, val){
						self.setSelectedIndex(val, true);
					});
				} else {
					if(selectedValue){
						self.setSelectedValue(selectedValue, true);
					} else {
						self.setSelectedIndex(selectedIndex, true);
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
				if(index < 0) return;
				var e = {},
					item = items.eq(index);
					
				e.label = item.children('b').html();
				e.value = item.attr('data-value');
				e.isAll = item.attr('data-all') == 'true';
				e.isNext = item.attr('data-next') === 'true';
				
				this.set('selectedIndex', e.index = index);

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
				e.status = item.hasClass('current');

				!f && this.trigger('change', e);
			}
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
				itemIcon: f ? template.selectedItemIcon : val.isNext ?  template.defaultItemIcon : template.selectedItemIcon,
				isAll: f ? false : val.isAll || false,
				isNext: f ? false : val.isNext || false
			}
		}
		throw new Error('product.mixSelecter: 找不到数据源');
	}
	
	return mutilpleSelecter;
});