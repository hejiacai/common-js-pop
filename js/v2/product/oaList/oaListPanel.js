// JavaScript Document
define('product.oaList.oaListPanel', [
	'product.oaList.oaSearch'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['product.oaList.oaSearch'],
		util = require('base.util'),
		template = '<li data-id="{link}" data-label="{label}"><a class="delBtn" href="javascript:">删除</a><em></em>{label}</li>',
		hidInput = '<input name="{name}" type="hidden" />',
		itemElName = 'li',
		delElName = itemElName + ' .delBtn';
	
	var oaListPanel = shape(function(o){
			oaListPanel.parent().call(this, util.merge({
				element: $('#oaListPanel'),
				list: '.oa_searchList',
				input: '.oa_input',
				search: null
			}, o));
			this.init();
		});
	
	oaListPanel.implement({
		init: function(){
			this._initElements();
			this._initSearch();
			this._initEvents();
		},
		_initElements: function(){
			var element = this.get('element');
			this._list = element.find(this.get('list'));
		},
		_initSearch: function(){
			this._search = new search(util.merge({
				trigger: this.get('element').find(this.get('input')),
			}, this.get('search')));
		},
		_initEvents: function(){
			var self = this;
			this._search.on('searchItemSelected', function(e){
				if(e.added){
					this.hide();
					this.input.get('element').blur();
					self._list.append(util.string.replace(template, e.data));
                    self.trigger('added', e);
				}
			});
			this._list.on('click', delElName, function(e){
				var target = $(e.currentTarget).closest(itemElName);
				target.remove();
                e.data = {
                    label: target.attr('data-label'),
                    link: target.attr('data-id')
                };
                self.trigger('deleted', e);
			});
		}
	});
	
	return oaListPanel;
});