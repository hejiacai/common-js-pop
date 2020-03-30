// JavaScript Document

define('product.oaList.oaSearch', [
	'widge.autoComplete.search'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['widge.autoComplete.search'],
		util = require('base.util'),
		template = {
			list: '<ul class="options"></ul>',
			item: '<li><a href="javascript:" data-id="{link}"><span class="addBtn">添加</span>{label}</a></li>',
			empty: '<div class="empty">没找到数据</div>'
		},
		itemName = 'a';
	
	var oaSearch = shape(function(o){
			oaSearch.parent().call(this, util.merge({
				idName: 'oaSearch',
				template: template,
				width: 281,
				align: {
					baseXY: [0, '100%-1']
				}
			}, o));
		}).extend(search);
	
	oaSearch.implement({
		_initEvents: function(){
			oaSearch.parent('_initEvents').call(this);
			var element = this.get('element'),
				options = element.children('.options'),
				self = this;
			
			this.input.on('focus', util.bind(this.show, this));
			
			this.on('emptyData', function(e){
				if(self._emptyContent){
					self._emptyContent.remove();
					delete self._emptyContent;
				}
				if(self.isEmptyContent()) {
					search.parent('hide').call(self);
					return;
				}
				self._emptyContent = $(self.get('template').empty).appendTo(element);
				search.parent('show').call(self);
			});
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
					var target = $(e.pointTarget);
					if(target.hasClass('addBtn')){
						obj['added'] = true;
					} else {
						this.input.setValue(data.text);
					}
					this._isHide = true;
					this.trigger('searchItemSelected', obj);
				}
			}
		},
		_renderItems: function(data){
			if(this._emptyContent){
				this._emptyContent.remove();
				delete this._emptyContent;
			}
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
						temp.label = val.text = val.label;
						html += util.string.replace(item, temp);
					});
					
					items.html(html)
					
					if(html){
						this.set('items',  items.find(itemName));
					}
				} else {
					throw new Error('widge.autoComplete.search: 数据格式不正确');
				}
			} else {
				throw new Error('widge.autoComplete.search: 模板{item}不正确');
			}
		}
	});
	
	return oaSearch;
});