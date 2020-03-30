// JavaScript Document

define('widge.combobox.comboBoxBase', 
'module.dataSource',
function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		dataSource = require('module.dataSource').dataSource,
		template = {
			list: '<ul></ul>',
			normal: '<li class="{className}" data-name="{name}" data-value="{value}">{icon}<span>{label}</span></li>',
			mutil: '<li><label class="{className}" data-all="{isAll}" data-name="{name}" data-value="{value}" data-status="{status}" data-disabled="{disabled}" >{icon}<span>{label}</span></label></li>'
		},
		cid = 0;
		
	function uid(){
		return ++cid;
	}
	
	var comboBoxBase = shape(function(o){
			comboBoxBase.parent().call(this, util.merge({
				element: $('#dropList'),
				menu: 'ul',
				type: false,
				dataSource: null,
				options: null,
				value: null
			}, o));
			
			this.init();
		});
		
	comboBoxBase.implement({
		init: function(){
			if(!this.get('element')[0])
				throw new Error('widge.comboBox: 找不到目标');
			this._initConfig();
		},
		_initConfig: function(){
			this._type = this.get('type');
			this._dataModel = [];
			this._originalDatas = [];
			this._initElements();
			this._initData();
		},
		_initElements: function(){
			var menu = this.get('element').find(this.get('menu'));
			if (menu[0]) {
				this._isInitLoad = true;
				if(menu.children().length){
					this._isInit = true;
					this.set('type', false);
				}
				this.set('menu', menu);
				this._renderTemplate();
			}
		},
		_initData: function(){
			var source = this.get('dataSource'),
				opts = {source: source};
			if(util.type.isString(source)){
				opts.options = $.extend({dataType: 'jsonp', type: 'get'}, this.get('options'));
				this.set('options', opts.options);
			}
			this.dataSource = new dataSource(opts);
			this.dataSource.on('data', util.bind(this._renderData, this));
			if(!this.get('dataSource')){
				this._renderTemplate();
			} else {
				this.updateData();
			}
		},
		_renderData: function(data){
			if(!this._isInitLoad){
				this.set('dataSource', data);
				this._renderTemplate();
			}
			if(this._isInitLoad)
				delete this._isInitLoad;
		},
		setData: function(data, opts){
			if(util.type.isString(data) || util.type.isArray(data)){
				if(util.type.isString(data)){
					opts = $.extend({dataType: 'jsonp', type: 'get'}, $.extend(this.get('options'), opts));
					this.set('options', opts);
					this.dataSource.setOptions(opts);
				}
				
				this.dataSource.set('source', data);
				this.dataSource.setData(data);
				this.updateData();
			}
		},
		updateData: function(){
			if(this.dataSource.get('source')){
				this.dataSource.abort();
				this.dataSource.getData(this.get('value'));
			}
		},
		_renderTemplate: function(){
			var e = {},
				dataSource = this.get('dataSource'),
				menu = this.get('menu'),
				html = '', 
				self = this;
				
			e.prevData = this._dataModel || [];
			if(dataSource && !this._isInit){
				this._dataModel = [];
				this._originalDatas = [];
				$.each(dataSource, function(index, val){
					html += self.normalizeValue(val, index);
				});
				e.data = this._dataModel;
			}
			
			if(!isDom(menu)){
				this.set('menu', $(template['list']));
				this.get('menu').appendTo(this.get('element'));
			}
			if(html){
				this.get('menu').empty().html(html);
			}
			
			this.set('items', this.get('menu').children());
			this.set('itemName', getNodeName(this.get('items')));
			this.trigger('renderComplete', e);
			if(this._isInit){
				delete this._isInit;
			}
		},
		normalizeValue: function(val, index){
			var type = val.renderType != undefined ? val.renderType : this._type,
				f, tem;
			if(!(tem = renderItem(template, type))){
				throw new Error('widge.comboBox.comboBoxBase: 模板错误');
			};
			if(util.type.isString(val)){
				f = true;
			} else if(util.type.isObject(val)) {
				f = false;
			} else {
				throw new Error('widge.comboBox.comboBoxBase: 数据格式不正确');
			}
			
			this._originalDatas[index] = val;
			this._dataModel[index] = normalizeItem(this._originalDatas[index], f, type);
			this.trigger('rended', {
				index: index,
				data: this._dataModel[index], 
				originalData: val
			});
			return util.string.replace(tem, this._dataModel[index]);
		},
		getDataModel: function(){
			return this._dataModel;	
		},
		getOriginalDatas: function(){
			return this._originalDatas;
		},
		destory: function(){
			this.get('menu').off('click, mouseenter mouseleave');
			this.dataSource.destory();
			comboBoxBase.parent('destory').call(this);
		}
	});
	
	function normalizeItem(val, f, type){
		if(f !== undefined){
			var id = uid();
			return type ? {
				name: f ? val : val.name || id,
				value: f ? val : val.value || id,
				label: f ? val : val.label || id,
				isAll: val.isAll || false,
				status: val.status || false,
				disabled: val.disabled || false,
				icon: val.icon || '',
				className: val.className || ''
			} : {
				value: f ? val : val.value || id,
				label: f ? val : val.label || id,
				name: f ? val : val.name || id,
				icon: val.icon || '',
				className: val.className || '',
				renderType: false
			};
		}
		throw new Error('widge.comboBoxBase: 找不到数据源');
	}
	function renderItem(template, type){
		return type ? template['mutil'] : template['normal'];
	}
	function isDom(menu){
		return menu && menu.jquery && menu[0];
	}
	function getNodeName(node){
		return node[0] && node[0].nodeName.toLowerCase();
	}

	return comboBoxBase;
});