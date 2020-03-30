// JavaScript Document

define('product.jobSearch.jobTopSearch', [
	'widge.select', 'product.jobSearch.search'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['product.jobSearch.search'],
		select = module['widge.select'],
		util = require('base.util'),
		win = window,
		isPlaceHolder = "placeholder" in document.createElement('input');
		
	var jobTopSearch = shape(function(o){
			jobTopSearch.parent().call(this, util.merge({
				container: $('#search_box_a form'),
				trigger: 'button',
				select: {
					trigger: '.selecter',
					align: {
						baseXY: [-1, '100%']
					},
					selectName: 'keysName',
					triggerType: 'hover',
					className: 'search_select_options'
				},
				search: {
					trigger: '.keys',
					align: {
						baseXY: [-6, '100%+9']
					},
					width: 258
				},
				selectedIndex: 0,
				initDataSource: null,
				dataSource: null,
				placeHolder: null
			}, o));
			this.init();
		});
	jobTopSearch.implement({
		init: function(){
			this._initSelect();
			this._initSearch();
			this._initEvents();
		},
		_initSelect: function(){
			var container = this.get('container'),
				selectConfig = this.get('select'),
				trigger = container.find(selectConfig.trigger);
			this._select = new select(util.merge(selectConfig, {trigger: trigger}));
			var index = this.get('selectedIndex');
			this.set('selectedIndex', index);
			this._select.setSelectedIndex(index);
			/*
			this._select.getElements().eq(index).hide();
			*/
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
			this._select.on('change', util.bind(this.changeSelect, this));
			trigger.on('click', function(e){
				var url = self.get('url') && self.get('url')[self.get('selectedIndex')];
				if(url){
					e.value = self._search.input.getValue();
					e.url = url.replace(/\{\{query\}\}/, encodeURIComponent(e.value));
					e.index = self.get('selectedIndex');
					self.trigger('submit', e);
				}
			});
			this._search.input.on('keyEnter', function(){
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
		},
		changeSelect: function(e){
			if(e.index === this.selectedIndex){
				return;
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
		getSelect: function(){
			return this._select;
		}
	});
	return jobTopSearch;
});