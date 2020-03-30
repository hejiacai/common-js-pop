// JavaScript Document

define('product.jobSort.jobSortSearch', [
	'widge.autoComplete.search', 'widge.overlay.hbDialog', 'widge.overlay.confirmBox'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['widge.autoComplete.search'],
		util = require('base.util'),
		hbDialog = module['widge.overlay.hbDialog'],
		ConfirmBox = module['widge.overlay.confirmBox'],
		template = {
			list: '<ul class="options"></ul>',
			item: '<li><a {selected} href="javascript:" data-id="{link}"><span class="status"></span>{label}</a></li>',
			footer: '<div class="footer"><a href="javascript:">换一批</a><span>共{count}个</span></div>',
			empty: '<div class="empty">没有找到职位，可以将关键词反馈给工作人员添加<span class="empty_span"></span><a href="javascript:;" class="empty_a">提交</a></div>'
		},
		itemName = 'a';
	
	var jobSortSearch = shape(function(o){
			jobSortSearch.parent().call(this, util.merge({
				template: template,
				size: 10,
				datas: null
			}, o));
		}).extend(search);
	
	jobSortSearch.implement({
		_initEvents: function(){
			jobSortSearch.parent('_initEvents').call(this);
			var element = this.get('element'),
				options = element.children('.options'),
				self = this;
			
			element.on('click', '.footer a', function(e){
				if (self.get('disabled')) return;
				self.dataSource.abort();
				self.dataSource.set('source', self._nextURL);
				self.dataSource.getData(self.input.get('element').val());
			});
			
			element.on('click','.empty_a',function(event){
				if($('.empty_a').hasClass('onlyone')){
					return
				}else{
					$.post('/jobexcept/add',{station:self.input.get('element').val()},function(json){
						console.log(json);
						if(json.status){
							ConfirmBox.timeBomb('提交成功，工作人员将酌情增加该职位', {
								name: 'success',
								width: 350,
								timeout: 1000
							});
							$('.empty_a').css('color','#ccc')
							$('.empty_a').addClass('onlyone');
						}else {
							ConfirmBox.timeBomb(json.msg, {
								name: 'fail',
								width: 280,
								timeout: 1000
							});
						}
					},"json");
				}
			});
			
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
				$('.empty_span').text(self.input.get('element').val());
			});
		},
		_initData: function(){
			var dataSource = this.get('dataSource');
			if(util.type.isString(dataSource)){
				this.set('dataSource', dataSource.replace(/\{\{pageSize\}\}/g, this.get('size')));
			}
			jobSortSearch.parent('_initData').call(this);
		},
		_handleQueryChange: function(val, prev) {
			if (this.get('disabled')) return;
			this.dataSource.set('source', this.get('dataSource'));
			this.dataSource.abort();
			this.dataSource.getData(val);
		},
		_filterData: function(data){
			var oldData = data;
			if(util.type.isObject(data)){
				data = data.data || data;
			}
			jobSortSearch.parent('_filterData').call(this, data);
			if(this._footer){
				this._footer.remove();
				delete this._footer;
			}
			if(oldData.totalPage && oldData.totalPage > 1){
				this._footer = $(util.string.replace(template.footer, {count: oldData.totalSize})).appendTo(this.get('element'));
				var page = oldData.pageNo + 1;
				if(page > oldData.totalPage){
					page = 1;
				}
				this._nextURL = this.get('dataSource') + '&page=' + page;
			}
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
					var selected = !item.hasClass('selected');
					var obj = {
						data: data,
						index: index,
						target: item,
						url: data.link,
						group: items,
						selected: selected
					};
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
				item, d = this.get('datas').object;
				
			if(item = template.item){
				if(util.type.isArray(data)){
					var html = '',
						temp = {};
					
					$.each(data, function(key, val){
						if(d[val.link]){
							temp.selected = 'class="selected"';
						} else {
							temp.selected = '';
						}
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
		},
		_changeValue: function(){}
	});
	
	return jobSortSearch;
});