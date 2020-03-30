// JavaScript Document
define('product.jobSort.jobSorter',
['product.jobSort.jobSortDialog', 'module.dataSource'], 
function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		DataSource = module['module.dataSource'],
		jobSortDialog = module['product.jobSort.jobSortDialog'],
		util = require('base.util'),
		template = '<li data-id="{value}"><a href="javascript:">{label}<span class="close">×</span></a></li>',
		hidInput = '<input name="{name}" type="hidden" />';
	
	var jobSorter = shape(function(o){
			jobSorter.parent().call(this, util.merge({
				trigger: $('#dropJobsort'),
				remenSwitch:'hide',
				icon: 'icon',
				label: '.label',
				name: 'hidJobsort',
				maxLength: 5,
				url: '//assets.huibo.com/js/v2/data/jobSortData.js?v=20200226',
				initURL: null,
				initURLParam: null,
				selectedId: null,
				dialog: null,
				search: null,
				template: template,
				model: false,//二级是否可点击
				level: true,//二级是否显示
				categoryLack:false,//职位类别缺失
				updateDataFun:function (data) {
					console.log(data);
				},//选择成功后回调函数
			}, o));
			this.init();
		});
		
	jobSorter.implement({
		init: function(){
			this._initJobSorter();
			this._initDialog();
			this._initDataSource();
			this._initEvents();
		},
		_initJobSorter: function(){
			var trigger = this.get('trigger');
			this._label = trigger.children(this.get('label'));
			this._hidInput = trigger.find('input[type="hidden"]');
			if(!this._hidInput.length){
				this._hidInput = $(util.string.replace(hidInput, {name: this.get('name')})).appendTo(this.get('trigger'));
			}
			this._hidInput.val(this.get('selectedId'));
		},
		_initDataSource: function(){
			var url = this.get('initURL'),
				data = this._dialog.getMenu().getData();
				
			if(url){
				var urlParam = this.get('initURLParam'),
					param = urlParam ? '&' + urlParam + '=' + this.get('selectedId') : '';
					
				this._initDataSource = new DataSource({
					source: url + param
				});
				var self = this;
				this._initDataSource.on('data', function(e){
					if(util.type.isArray(e.data)){
						$.each(e.data, function(index, val){
							data.array[index] = val.id;
							data.object[val.id] = val.label;
							
							self._label.append(util.string.replace(self.get('template'), val));
						});
					}
				});
				this._initDataSource.getData();
			} else {
				var label = this._label.children();
				if(label.length){
					label.each(function(index, val){
						var id = $(this).attr('data-id');
						data.array[index] = id;
						data.object[id] = $(this).text().replace(/[×xX]/gi, '');
					});
				}
			}
			this._dialog.updateSearchData();
		},
		_initDialog: function(){
			this._dialog = new jobSortDialog({
				maxLength: this.get('maxLength'),
				remenSwitch:this.get('remenSwitch'),
				selectedId: this.get('selectedId'),
				template: this.get('template'),
				model: this.get('model'),
				level: this.get('level'),
				categoryLack: this.get('categoryLack'),
				url: this.get('url'),
				dialog: util.merge({
					idName: 'hbJobSortDialog',
					width: 854,
					height: 'auto',
					title: '选择职位类别'
				}, this.get('dialog')),
				search: util.merge({
					idName: 'jobSearch',
					width: 290,
					align: {
						baseXY: [-1, '100%-1']
					},
					size: 10,
					dataSource: null,
					defaultValue: '关键词快速匹配，点击选中'
				}, this.get('search'))
			});
		},
		_initEvents: function(){
			var trigger = this.get('trigger'),
				self = this;
			// 触发点击事件	
			trigger.on('click', function(e){
				var target = $(e.target);
				if(target.hasClass('close')){
					target = target.closest('li');
					target.remove();

					var value = target.attr('data-id'); 
					self._dialog.deleteItem([target, self._dialog._resultPanel.children('span[data-id=' + value + ']')], value);
					self._hidInput.val(self.getValue().array.join(','));
				} else if(target[0] == self.get('trigger')[0] || (self.get('icon') && target.hasClass(self.get('icon')))){
				
					self._dialog.show();
				}
			});
			this._dialog.on('submit', function(e){
				self._label.html(e.html);
				self._hidInput.val(e.value);
				this.hide();
				self.trigger('submit', e);
				if ('updateDataFun' in self.attrs) {
					self.attrs.updateDataFun(e);
				}
			});
		},
		addItem: function(e){
			if(!e) return;
			var menu = this._dialog._menu;
			if(menu.addSelectedItem(e.value, e.label)){
				this._label.append(util.string.replace(this.get('template'), e));
				this._dialog._addItemHTML(e);
			}
			this.updateData();
		},
		clearAllItem: function(){
			this._label.empty();
			this._dialog.clearAllItem();
		},
		updateData: function(){
			this._dialog.updateSearchData();
			this._hidInput.val(this.getValue().array.join(','));
		},
		getValue: function(){
			return this._dialog.getMenu().getData();
		},
		destory: function(){
			this._dialog.destory();
			jobSorter.parent('destory').call(this);
		},
        hide: function(){
            this._dialog.hide();
        }
	});
	
	return jobSorter;
	
});
