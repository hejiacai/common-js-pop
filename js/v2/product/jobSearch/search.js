// JavaScript Document

define('product.jobSearch.search', [
	'widge.autoComplete.search', 'widge.overlay.confirmBox'
], function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		search = module['widge.autoComplete.search'],
		confirmBox = module['widge.overlay.confirmBox'],
		dataSource = require('widge.autoComplete.search').dataSource,
		util = require('base.util'),
		dom = {
			header: '.actions:eq(0)',
			list: 'ul',
			items: 'li',
			item: 'a',
			delItem: 'span'
		},
		template = {
			hot: {
				container: '<div class="ui_hb_hot"></div>',
				header: '<div class="ui_hb_search_header"><span>热搜职位</span><em></em></div>',
				list: '<div class="ui_hb_hot_list"></div>',
				item: '<a href="{link}" {isHot}>{label}</a>'
			},
			/*
			header: '<div class="ui_hb_search_header"><a class="clearAll" href="javascript:">清空</a><span>您最近搜索过</span><em></em></div>',
			empty: '<center class="empty">您最近没有搜索记录</center>',
			list: '<ul></ul>',
			item: '<li><a href="{link}" data-value="{value}"><span>删除</span>{label}</a></li>',
			*/
			main: {
				container: '<div class="ui_hb_actions"></div>',
				header: '<div class="ui_hb_search_header"><a class="clearAll" href="javascript:">清空</a><span>您最近搜索过</span><em></em></div>',
				list: '<ul></ul>',
				item: '<li><a href="{link}" data-value="{value}"><span>删除</span>{label}</a></li>',
				empty: '<center class="empty">您最近没有搜索记录</center>'
			},
			footer: {
				container: '<div class="bottom"></div>',
				top: '<div class="actions">您关注的职位（点击可快速搜索）</div>',
				list: '<div class="follow"></div>',
				item: '<a data-value="{value}" href="{link}">{label}</a>',
				empty: '<center class="empty">您没有添加过关注的职位</center>'
			}
			// DateTime : 2016.11.16 tw 改
			//header: '<div class="actions"><a class="clearAll" href="javascript:">清空</a>您最近搜索过</div>',
			//empty: '<center class="empty">您最近没有搜索记录</center>',
			//list: '<ul></ul>',
			//item: '<li><a href="{link}" data-value="{value}"><span>删除</span>{label}</a></li>',
			//footer: {
			//	container: '<div class="bottom"></div>',
			//	top: '<div class="actions">您关注的职位（点击可快速搜索）</div>',
			//	list: '<div class="follow"></div>',
			//	item: '<a data-value="{value}" href="{link}">{label}</a>',
			//	empty: '<center class="empty">您没有添加过关注的职位</center>'
			//}
		},
		delStatus = {
			'delAll': '.clearAll', 
			'delItem': 'ul ' + dom.delItem
		};
	
	var jobsearch = shape(function(o){
			this._isContent = true;
			this._isInitSearch = true;
			jobsearch.parent().call(this, util.merge({
				initDataSource: null,
				target: $("#ui_hbsug")
			}, o));
		}).extend(search);
	
	jobsearch.implement({
		_initElement: function(){
			/*
			var target = this.get('target');
			console.log(this.get('element').attr('class'));
			if(util.type.isString(target)){
				this.set('target', this.get('element').find(target));
			}
			*/
			jobsearch.parent('_initElement').call(this);
			this._initRecordData();
		},
		_initRecordData: function(){
			var source = this.get('initDataSource');
			if(!source){
				this._isContent = false;
			}
			this.initDataSource = new dataSource({
				source:source,
				options: {
					dataType: 'json',
					type: 'get'
				}
			});
			this.initDataSource.on('data', util.bind(this.updateRecord, this));
		},
		refreshInitData: function(){
			this.initDataSource.getData();
		},
		updateRecord: function(data){
			if(util.type.isObject(data)){
				var b = false,
					targetActionsHeader,
					isSearchRecord = data.searchRecord && data.searchRecord.length,
					isHotData = data.hotData && data.hotData.length;
					isAttentionRecord = data.attentionRecord && data.attentionRecord.length;
				
				if(isHotData){
					if(!this.get('targetHotHeader')){
						this.set('targetHotHeader', $(template.hot.container).prependTo(this.get('target')));
					}
					if(!this.get('targetHotTop')){
						this.set('targetHotTop', $(template.hot.header).appendTo(this.get('targetHotHeader')));
					}
					if(!this.get('targetHotList')){
						this.set('targetHotList', $(template.hot.list).appendTo(this.get('targetHotHeader')));
					}
					this._renderHotList(data.hotData);
				}
				if(isSearchRecord){
					if(!this.get('targetActionsHeader')){
						this.set('targetActionsHeader', $(template.main.container).appendTo(this.get('target')));
					}
					if(!this.get('targetHeader')){
						this.set('targetHeader', $(template.main.header).appendTo(this.get('targetActionsHeader')));
					}
					if(!this.get('targetList')){
						this.set('targetList', $(template.main.list).appendTo(this.get('targetActionsHeader')));
					}
					
					this._renderRecordList(data.searchRecord);
					this.set('data', this._initData = data.searchRecord);
				}
				
				if(isHotData || isSearchRecord){
					b = true;
				}
				
				/*
				if(isAttentionRecord){
					if(!this.get('targetBottom')){
						this.set('targetBottom', $(template.footer.container).appendTo(this.get('target')));
					}
					if(!this.get('targetBottomTop')){
						this.set('targetBottomTop', $(template.footer.top).appendTo(this.get('targetBottom')));
					}
					if(!this.get('targetBottomList')){
						this.set('targetBottomList', $(template.footer.list).appendTo(this.get('targetBottom')));
					}
					this._renderRecordBottom(data.attentionRecord);
					b = true;
				}
				
				if(isSearchRecord && !isAttentionRecord){
					if(!this.get('targetBottom')){
						this.set('targetBottom', $(template.footer.container).appendTo(this.get('target')));
					}
					this.get('targetBottom').html(template.footer.empty);
				}
				
				if(!isSearchRecord && isAttentionRecord){
					if(!this.get('targetHeaderEmpty')){
						this.set('targetHeaderEmpty', $(template.empty).prependTo(this.get('target')));
					}
				}
				*/
				
				this.setEnabled(b);
				
				if(this.isContent()){
					if (this.get('disabled')) return;
					this.set('data', this._initData);
					this.trigger('focus');
					this.show();
				}
			}
		},
		_renderHotList: function(data){
			var ul = this.get('targetHotList');
			ul.children().length && ul.empty();
			$.each(data, function(index, val){
				if(val['isHot']){
					val['isHot'] = 'style="color:#d73937"';
				}
				$(util.string.replace(template.hot.item, val)).appendTo(ul);
			});
			
			this._updateAllHotElements();
		},
		_renderRecordList: function(data){
			var ul = this.get('targetList');
			ul.children().length && ul.empty();
			$.each(data, function(index, val){
				$(util.string.replace(template.main.item, val)).appendTo(ul);
			});
			this._updateAllElements();
		},
		_renderRecordBottom: function(data){
			var list = this.get('targetBottomList');
			list.children().length && list.empty();
			$.each(data, function(index, val){
				$(util.string.replace(template.footer.item, val)).appendTo(list);
			});
		},
		_initEvents: function(){
			var self = this;
			jobsearch.parent('_initEvents').call(this);
			
			this.input.on('focus', util.bind(this._initFocus, this));
			this.get('target').on('click', function(e){
				var targetObj = getElement(self, e),
					statusName = util.object.keys(delStatus);
				
				if(!targetObj) return;
				if(targetObj.name === statusName[0]){
					self.removeAllElements();
				} else if(targetObj && targetObj.name === statusName[1]){
					e.preventDefault();
					e.stopPropagation();
					var group = targetObj.group,
						el = targetObj.element,
						index = group.index(el);
					self.removeElement(index);
				}
			});
			this.on('switch', function(e){
				var hoverClass = getClassName(this.get('className'), this.get('hoverClassName'));
				if(e && this.get('targetItem')){
					this.get('targetItem').removeClass(hoverClass);
				}
			});
		},
		_initFocus: function(){
			if(this._isInitSearch){
				delete this._isInitSearch;
				this.refreshInitData();
			} else if(!this._isInitSearch){
				if (this.get('disabled')) return;
				if (this.isContent()){
					this.set('data', this._initData);
					this.trigger('focus');
				}
				this.show();
			}
		},
		setEnabled: function(b){
			this._isContent = b;
		},
		isContent: function(){
			return this.isEmptyContent() && this._isContent;
		},
		_render: function(){
			jobsearch.parent('_render').call(this);
			var target = this.get('target');
			if(!(target && target[0])){
				this._isContent = false;
				return;
			}
			this.set('target', $(target).appendTo(this.get('element')));
		},
		_handleQueryChange: function(val, prev){
			jobsearch.parent('_handleQueryChange').call(this, val, prev);
			this._switch(this.isContent());
		},
		_isFireResult: function(){
			this._switch(this.isContent());
			if(this.isContent()){
				return false;
			} else {
				return this._isEmpty();
			}
		},
		_switch: function(b){
			var item = this.get('itemsName'),
				target = this.get('target');
			if(b){
				target && target.show();
				item && item.hide();
			} else {
				target && target.hide();
				item && item.show();
			}
			this.trigger('switch', b);
		},
		_renderData: function(data){
			jobsearch.parent('_renderData').call(this, data);
			if(this.isContent()){
				this.show();
			}
		},
		_handleSelection: function(e){
			if(this.isContent()){
				var isMouse = e ? e.type === 'click' : false,
					items = this.get('targetItem');
				if(!items || util.type.isString(items)){
					return;
				}
				var index = isMouse ? items.index($(e.target)) : this.get('selectedIndex'),
					item = items.eq(index);
					
				if (index >= 0 && item) {
					e.preventDefault();
					this.set('selectedIndex', index);
					item.attr('href') && (window.location.href = item.attr('href'));
					if (e && !isMouse){
						e.preventDefault();
					}
					var obj = {target: item, group: items};
					this.trigger('itemSelected', obj);
				}
			} else {
				jobsearch.parent('_handleSelection').call(this, e);
			}
		},
		_handleMouseMove: function(e){
			if(this.isContent()){
				var items = this.get('targetItem');
				if(!items || util.type.isString(items)){
					return;	
				}
				var index = items.index($(e.target));
				this.set('selectedIndex', index);
				this._renderItemsClass('targetItem', index);
			} else {
				jobsearch.parent('_handleMouseMove').call(this, e);
			}
		},
		_step: function(direction){
			if(this.isContent()){
				this._stepItems(direction, 'targetItem');
			} else {
				jobsearch.parent('_step').call(this, direction);
			}
		},
		removeElement: function(index){
			if(this.isContent()){
				var items = this.get('targetItems');
				if(!items.length) return;
				items = items.eq(index);
				var e = {
						index:index,
						value:items.children(dom.item).attr('data-value') || index
					};
				items.remove();
				this._initData.splice(index, 1);
				this._clearAll();
				var index = range(this.get('selectedIndex') - 1);
				this.set('selectedIndex', index);
				this.set('oldIndex', index);
				this.trigger('itemDeleted', e);
				this._updateAllElements();
			}
		},
		removeAllElements: function(){
			if(this.isContent()){
				var list = this.get('targetList');
				if(!list.children().length) return;
				this._isDialogClose = true;
				var self = this;
				confirmBox.confirm('是否清空记录？','提示', function(){
					var e = {};
						self.get('targetItems').each(function(index){
							e.value = e.value || [];
							e.index = e.index || [];
							e.value.push($(self).children(dom.item).attr('data-value') || index);
							e.index.push(index);
						});
					
					list.empty();
					self._initData.splice(0, self._initData.length);
					self._clearAll();
					self.set('selectedIndex', -1);
					self.set('oldIndex', -1);
					self.trigger('itemAllDelete', e);
					self._updateAllElements();
					this.hide();
					setTimeout(function(){
						delete self._isDialogClose;
					},10);
				}, function(){
					setTimeout(function(){
						delete self._isDialogClose;
					},10);
				}, {
					width: 300,
					close: 'x'
				});
			}
		},
		_clearAll: function(){
			var header = this.get('targetHeader'),
				list = this.get('targetList'),
				hotTargetItem = this.get('hotTargetItem');
				
			if(header && header.length){
				if(!list.children().length){
					header.remove();
					list.remove();
					
					var bottom = this.get('targetBottom');
					list = this.get('targetBottomList');
					
					if(bottom && list && list.children().length){
						if(!this.get('targetHeaderEmpty')){
							this.set('targetHeaderEmpty', $(template.main.empty).prependTo(this.get('target')));
						}
					} else {
						bottom && bottom.remove();
						if(!hotTargetItem || (hotTargetItem && !hotTargetItem.length)){
							this._isContent = false;
							this.hide();
						}
					}
				}
			}
		},
		addElement: function(value){
			if(this.isContent() && (value = normalizeValue(value))){
				var list = this.get('targetList'),
					html = util.string.replace(template,main.item, value);
				list.append(html);
				this._updateAllElements();
			}
		},
		_updateAllElements: function(){
			this.set('targetItems', this.get('targetList').find(dom.items));
			this.set('targetItem', this.get('targetList').find(dom.item));
		},
		_updateAllHotElements: function(){
			this.set('hotTargetItem', this.get('targetHotList').find('a'));
		}
	});
	
	function getElement(self, e){
		if($.contains(e.currentTarget, e.target)){
			var target = $(e.target);
			if(target.closest(delStatus.delAll).length){
				return {
					name: util.object.keys(delStatus)[0],
					element: target.closest(delStatus.delAll)
				}
			} else if(target.closest(delStatus.delItem).length){
				return {
					name: util.object.keys(delStatus)[1],
					group: $(e.currentTarget).find(delStatus.delItem),
					element:target.closest(delStatus.delItem)
				}
			}
		}
	}
	function normalizeValue(val){
		if(util.type.isString(val)){
			return {
				label: val,
				link: 'javascript:'
			}
		} else if(util.type.isObject(val)){
			return {
				label: val.label ? val.label : '无数据',
				link: val.link ? val.link : 'javascript:'
			}
		}
		return false;
	}
	function range(index){
		return index <= -1 ? -1 : index;
	}
	function getNodeName(node){
		return node[0] && node[0].nodeName.toLowerCase();
	}
	function getClassName(className, currentClassName){
		return className ? className + '_' + currentClassName : currentClassName || '';
	}
	
	return jobsearch;
});