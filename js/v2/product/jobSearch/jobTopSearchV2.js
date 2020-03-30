// JavaScript Document

define('product.jobSearch.jobTopSearchV2', [
	'widge.tabs', 'widge.changeClass', 'product.jobSearch.search'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['product.jobSearch.search'],
		//select = module['widge.select'],
		tabs = module['widge.tabs'],
		changeClass = module['widge.changeClass'],
		util = require('base.util'),
		win = window,
		isPlaceHolder = "placeholder" in document.createElement('input');
		
	var jobTopSearch = shape(function(o){
			jobTopSearch.parent().call(this, util.merge({
				container: $('#search_box_a form'),
				trigger: 'button',
				tabs: {
					tabName: '.search_tab',
					itemName: 'a',
					className: 'cur'
				},
				checkBoxer: {
					element: '.hb_ui_checkbox',
					className: 'hb_ui_checkbox_checked'
				},
				search: {
					trigger: '.keys',
					align: {
						baseXY: [-2, '100%']
					},
					width: 419,
					target: $('#ui_hbsug_top')
				},
				selectedIndex: 1,
				initDataSource: null,
				dataSource: null,
				placeHolder: null
			}, o));
			this.init();
		});
	jobTopSearch.implement({
		init: function(){
			//this._keysInput = this.get('container').find('input[name=keysName]');
			this._initSearch();
			this._initCheckBoxer();
			this._initTab();
			this._initEvents();
		},
		_initTab: function(){
			var container = this.get('container'),
				tabsConfig = this.get('tabs'),
				index = this.get('selectedIndex');
				
			this._tabs = new tabs(util.merge(tabsConfig, {element: container}));
			this.set('selectedIndex', index);
		},
		_initCheckBoxer: function(){
			var container = this.get('container'),
				checkBoxerConfig = this.get('checkBoxer');
				
			this._changeClass = new changeClass(util.merge(checkBoxerConfig, {
				container: container,
				triggerType: 'click',
				isTrigger: true
			}));
		},
		_initSearch: function(){
			var container = this.get('container'),
				searchConfig = this.get('search'),
				trigger = container.find(searchConfig.trigger);
			this._search = new search(util.merge(searchConfig, {
				trigger: trigger,
				initDataSource: this.get('initDataSource'),
				defaultValue: this._getTextPlaceHolder()
			}));
			this._search.setData(this.get('dataSource')[this.get('selectedIndex')]);
		},
		_getTextPlaceHolder: function(){
			var textPlaceHolder = this.get('placeHolder');
			if(util.type.isString(textPlaceHolder)){
				return textPlaceHolder;
			} else if(util.type.isArray(textPlaceHolder)){
				var index = this.get('selectedIndex');
				return textPlaceHolder[index] || "请输入关键字";
			} else {
				return '请输入关键字';
			}
		},
		_initEvents: function(){
			var container = this.get('container'),
				trigger = container.find(this.get('trigger')),
				self = this;
			
			this._tabs.on('changeIn', function(e){
				if(e.index == 0){
					if(self._changeClass.getElement().hasClass('hb_ui_checkbox_checked')){
						e = {index: 2};	
					}
				}
				self.changeSelect(e);
			});
			this._changeClass.on('click', function(e){	
				var evtObj = {};			
				if(this.getElement().hasClass('hb_ui_checkbox_checked')){
					evtObj = {index: 2};	
				} else {
					evtObj = {index: 0};
				}
				self.changeSelect(evtObj);
			});
			
			trigger.on('click', function(e){
				var url = self.get('url') && self.get('url')[self.get('selectedIndex')];
				if(url){
					e.value = self._search.input.getValue();
					e.url = url.replace(/\{\{query\}\}/, encodeURIComponent(e.value));
					e.index = self.get('selectedIndex');
					self.trigger('submit', e);
				}
			});
			this._search.input.on('keyEnter', function(e){
				var url = self.get('url') && self.get('url')[self.get('selectedIndex')],
					value = $.trim(self._search.input.getValue());
				
				if(!value || !url) return;
				e.value = self._search.input.getValue();
				e.url = url.replace(/\{\{query\}\}/, encodeURIComponent(e.value));
				e.index = self.get('selectedIndex');
				self.trigger('submit', e);
			});
			container.submit(function(e){
				e.preventDefault();
			});
			
			var index = this.get('selectedIndex');
			if(index == 2){
				this._changeClass.getElement().addClass(this.get('checkBoxer').className);
				this.changeSelect({index: 2});
			} else {
				this._tabs.setSelectTab(index);
			}
		},
		changeSelect: function(e){
			if(e.index == this.selectedIndex){
				return;
			}
			
			if(e.index == 1){
				this._changeClass.getElement().hide();
			} else {
				this._changeClass.getElement().show();
			}
			
			this.set('selectedIndex', e.index);
			
			var oldValue = this._search.input.getValue();
			if(!isPlaceHolder && !oldValue){
				this._search.input._isInputed = false;
				this._search.input.get('element').val(oldValue);
			}
			this._search.input.setDefaultValue(this._getTextPlaceHolder());
			var data = this.get('dataSource')[e.index],
				container = this.get('container');

			this._search.setData(data || []);
			
			/*
			this._select.getElements().eq(e.index).hide();
			this._select.getElements().eq(e.oldIndex).show();*/
		},
		getSearch: function(){
			return this._search;
		},
		getTabs: function(){
			return this._tabs;
		}
	});
	return jobTopSearch;
});