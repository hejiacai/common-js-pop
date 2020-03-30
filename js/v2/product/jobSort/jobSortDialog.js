// JavaScript Document
define('product.jobSort.jobSortDialog',
['product.jobSort.jobSortMenu', 'product.jobSort.jobSortSearch', 'widge.overlay.hbDialog', 'widge.overlay.confirmBox'], 
function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		hbDialog = module['widge.overlay.hbDialog'],
		ConfirmBox = module['widge.overlay.confirmBox'],
		jobSortMenu = module['product.jobSort.jobSortMenu'],
		search = module['product.jobSort.jobSortSearch'],
		util = require('base.util'),
		loader = '<div class="loader" style="text-align:center">正在加载数据中...</div>',
		loaderError = [
			'<div class="loader" style="text-align:center">错误：加载数据失败</div>',
			'<div class="jobBottomBox" style="text-align:center"><a class="yesBtn" href="javascript:" style="margin:0">确定</a></div>'
		].join(''),
		oneLengthHTML = '选择<em>{maxLength}</em> 项',
		maxLengthHTML = '最多<em>{maxLength}</em> 项',
		content = [
			loader,
			'<div class="jobPanel" style="display:none">',
			'<div class="jobTopActionsPanel clearfix">',
			'<div class="jobTopActionsLeft">',
			'<div class="jobTopSearchInput"><em></em><input id="jobTopSearchInput" /></div>',
			'{maxLengthHTML}',
			'</div>',
			'<div id="jobTopResult" class="jobTopResult"></div>',
			'<span class="jobTopDeletion" style="display:none">职位类别缺失反馈</span>',
			'</div>',
			'<div class="jobContentBox {oneClass}">',
			'<div class="jobSortMenu"><ul></ul></div>',
			'<div class="jobSortItems"></div>',
			'</div>',
			//'<div class="jobBottomBox">{yesButton}{cancelButton}</div>',
			'{jobBottomBox}',
			'</div>'
		].join(''),
		cancelButtonTemplate = '<a class="cancelBtn" href="javascript:;">取消</a>',
		yesButtonTemplate = '<a class="yesBtn" href="javascript:;">确认</a>',
		resultItemTemplate = '<span data-id="{value}">{label}<a href="javascript:;"></a></span>',
		promptMsgs = {
			'limit': '不能超过{maxLength}项',
			'repeat': '不能重复选择'
		},
		jobBottomBoxTemplate = [
			'<div class="jobBottomBox">',
			yesButtonTemplate,
			cancelButtonTemplate,
			'</div>'
		].join(''),
		pWidth = 70, fontSize = 18;
	
	var jobSortDialog = shape(function(o){
			jobSortDialog.parent().call(this, util.merge({
				maxLength: 5,
				remenSwitch:"hide",
				selectedId: null,
				model: false,
				oneLengthHTML: oneLengthHTML,
				maxLengthHTML: maxLengthHTML,
				dialog: {
					idName: 'hbJobSortDialog',
					width: 854,
					height: 'auto',
					title: '选择类型'
				},
				search: {
					idName: 'jobSearch',
					width: 290,
					align: {
						baseXY: [-1, '100%-1']
					},
					size: 10,
					dataSource: null
				},
				url: '//assets.huibo.com/js/v2/data/jobSortData.js?v=20200226',
				level: true,
				categoryLack:false
			}, o));
			this.init();
		});
		
	jobSortDialog.implement({
		init: function(){
			this._isInit = true;
			this._initDialog();
			this._initResultPanel();
			this._initMenu();
			this._initSearch();
			this._initEvents();
		},
		_initDialog: function(){
			this._dialog = new hbDialog(this.get('dialog'));
			var maxLength = this.get('maxLength'),
				html = this.get('maxLengthHTML'),
				jobBottomBox = jobBottomBoxTemplate,
				oneClass = '',
				f = true;
			
			if(maxLength == 1){
				html = this.get('oneLengthHTML');
				f = false;
			} else if(maxLength <= 0){
				html = '';
				f = false;
			}
			if(!f){
				jobBottomBox = '';
				this._dialog.set('close', 'x');
				this._dialog._updateCloseBtn();
				oneClass = 'jobContentBox_one';
			}
			
			var dialogContent = util.string.replace(content, {
				'jobBottomBox': jobBottomBox,
				'oneClass': oneClass,
				'maxLengthHTML': html
			}); 
			
			this._dialog.setContent(util.string.replace(dialogContent, {
				'maxLength': maxLength
			}));
		},
		_initSearch: function(){
			this._search = new search(util.merge({
				trigger: this._dialog.query('#jobTopSearchInput'),
				zIndex: this._dialog.get('zIndex') + 1
			}, this.get('search')));
		},
		_initMenu: function(){
			var self = this;
			this._menu = new jobSortMenu({
				element: this._dialog.query('.jobSortItems'),
				trigger: this._dialog.query('.jobSortMenu'),
				selectedId: this.get('selectedId'),
				maxLength: this.get('maxLength'),
				remenSwitch:this.get('remenSwitch'),
				model: this.get('model'),
				url: this.get('url'),
				level: this.get('level'),
				categoryLack:this.get('categoryLack')
			});
			this._menu.on('initItem', function(e){
				if(!self._resultPanel.children('span[data-id=' + e.value + ']').length){
					self._resultPanel.append(util.string.replace(resultItemTemplate, e));
				}
			});
			this._menu.on('initError', function(e){
				self._dialog.setContent(loaderError);
				self._dialog.query('.yesBtn').on('click', function(){
					self._dialog.hide();
				});
			});
		},
		_initResultPanel: function(){
			this._resultPanel = this._dialog.query('#jobTopResult');
		},
		
		getItemHTML: function(){
			var data = this._menu.getData(),
				template = this.get('template'),
				label, resultHTML = '';
				this._labels = [];
				
			if(!template){
				return '';
			}
			
			for(var i = 0, len = data.array.length; i < len; i++){
				if(label = data.object[data.array[i]]){
					this._labels.push(label);
					resultHTML += util.string.replace(template, {value: data.array[i], label: label});
				}
			}
			return resultHTML;
		},
		_initEvents: function(){
			var self = this;
			
			function submitClick(e){
				var data = self._menu.getData().array;
				e.html = self.getItemHTML();
				e.value = data.join(',');
				e.data = {
					value: data,
					label: self._labels && self._labels || []
				};
				self.trigger('submit', e);
			}
			
			this._dialog.query('.yesBtn').on('click', submitClick);
			this._dialog.query('.cancelBtn').on('click', function(e){
				delete self._labels;
				var eventObj;
				self.clearAllItem();
				self._oldItem.each(function(key, val){
					eventObj = {
						label: $(this).text(),
						value: $(this).attr('data-id')
					}
					
					self.addItem(eventObj);
				});
				
				self.updateSearchData();
				self.trigger('cancel', e);
				self.hide();
			});
			
			this._menu.on('loadComplete', function(){
				self._dialog.query('.loader').remove();
				self._dialog.query('.jobPanel').show();
				self._dialog.setPosition();
				self._oldItem = self._resultPanel.children().clone();
				self.updateSearchData();
			});
			this._menu.on('selectItem', function(e){
				if(e.result && e.result.length){
					var span = self._resultPanel.find('span');
					for(var i = 0, len = e.result.length; i < len; i++){
						span.filter('[data-id=' + e.result[i] + ']').remove();
					}
				}
				var searchItems = self._search.get('items');
				self._resultPanel.append(util.string.replace(resultItemTemplate, e));
				self.updateSearchData();
				if(self.get('maxLength') == 1){
					searchItems && searchItems.removeClass('selected');
					if(!e.sourceName){
						submitClick(e);
					}
				}
				searchItems && searchItems.filter('[data-id=' + e.value + ']').addClass('selected');
			});
			this._menu.on('clickAll', function(e){
				self._search.get('items') && self._search.get('items').removeClass('selected');
			});
			this._menu.on('one', function(){
				self.clearAllItem();
				self.updateSearchData();
			});
			this._menu.on('limit', function(e){
				self.updateSearchData();
				var msg = util.string.replace(promptMsgs.limit, {maxLength: this.get('maxLength')});
				ConfirmBox.timeBomb(msg, {
					name: 'fail',
					width: pWidth + msg.length * fontSize,
					timeout: 800
				});
			});
			this._menu.on('notSelectItem', function(e){
				self.updateSearchData();
				var msg = promptMsgs.repeat;
				ConfirmBox.timeBomb(msg, {
					name: 'fail',
					width: pWidth + msg.length * fontSize,
					timeout: 800
				});
			});
			
			this._resultPanel.on('click', 'a', function(e){
				var target = $(e.currentTarget).parent(),
					id = target.attr('data-id');
				self.deleteItem(target, id);
				self._search.get('items').filter('[data-id=' + id + ']').removeClass('selected');
			});
			
			this._search.on('searchItemSelected', function(e){
				var menu = self._menu,
					value = e.url,
					eventObj = {
						label: e.data.value,
						value: value,
						result: menu._handleResult(value)
					};
				var maxLength = self.get('maxLength');
				if(e.selected){
					if(menu.addSelectedItem(value, eventObj.label) === true){
						if(maxLength == 1){
							this.hide();
							submitClick(e);
							eventObj.sourceName = 'search';
						}
						menu.trigger('selectItem', eventObj);
						
					} else if(menu.addSelectedItem(value, eventObj.label) === 'limit'){
						menu.trigger('limit', eventObj);
					} else {
						menu.trigger('notSelectItem', eventObj);
					}
				} else {
					e.target.removeClass('selected');
					var target = self._resultPanel.children('span[data-id=' + value + ']');
					self.deleteItem(target, value);
				}
			});
		},
		clearAllItem: function(){
			this._resultPanel.empty();
			this._menu.clearSelectedItem();
		},
		addItem: function(e){
			if(!e) return;
			var menu = this._menu;
			if(menu.addSelectedItem(e.value, e.label)){
				this._addItemHTML(e);
			}
			this.updateSearchData();
		},
		_addItemHTML: function(e){
			if(!e) return;
			this._resultPanel.append(util.string.replace(resultItemTemplate, e));
		},
		deleteItem: function(target, val){
			if(!val) return;
			if(util.type.isArray(target)){
				for(var i = 0,len = target.length; i < len; i++){
					target[i].remove();
				}
			} else {
				target.remove();
			}
			this._menu.delSelectedItem(val);
			this.updateSearchData();
		},
		updateSearchData: function(){
			this._search.set('datas', this._menu.getData(), {override: true});
		},
		getMenu: function(){
			return this._menu;
		},
		getSearch: function(){
			return this._search;
		},
		show: function(){
			//显示职位类别缺失
			var categoryLack = this.get('categoryLack');
			if(categoryLack){
				this._dialog.query('.jobTopDeletion').css('display','block');
			}
			if(this._isInit){
				var self = this;
				setTimeout(function(){
					self._menu.init();
				}, 1);
				delete this._isInit;
			} else {
				this._oldItem = this._resultPanel.children().clone();
			}
			this._dialog.show();
		},
		hide: function(){
			this._dialog.hide();
		},
		destory: function(){
			this._menu.destory();
			this._search.destory();
			this._dialog.destory();
			jobSortDialog.parent('destory').call(this);
		}
	});
	
	return jobSortDialog;
	
});