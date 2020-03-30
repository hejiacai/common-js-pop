define('widge.combobox.comboBoxer', 
[
	'widge.combobox.simpleComboBox'
],
function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		simpleComboBox = module['widge.combobox.simpleComboBox'],
		util = require('base.util'),
		eventMaps = {
			simpleComboBox: ['change']
			//mutilComboBox: ['selectCheckbox', 'selectItem']
		};
		
	var comboBoxer = shape(function(o){
			comboBoxer.parent().call(this, util.merge({
				element: $('#dropListGroup'),
				dataSource: null
			}, o));
			this.init();
		});
		
	comboBoxer.implement({
		init: function(){
			this._combos = [];
			var dataSource = this.get('dataSource');
			if(util.type.isArray(dataSource)){
				this._dataSource = this.get('dataSource');
			} else {
				this._dataSource = [];
			}
		},
		addCombos: function(type, opts){
			if(this._error){return this;}
			if(util.type.isObject(type)){
				opts = type;
				type = 'simpleComboBox';
			}
			if(util.type.isObject(opts)){
				var plus = this._getComboPlus(type),
					len = this._combos.length;

				if(!plus.prototype.hasOwnProperty('comboType')){
					plus.implement({
						comboType: function(){
							return plus.toString();
						}
					});
				}
				if(util.type.isString(opts.element)){
					opts.element = this.get('element').find(opts.element);
				}
				
				if(opts.dataSource){
					this._dataSource[len] = opts.dataSource;
					this.set('dataSource', this._dataSource);
				}
				if(len >= 1){
					opts = util.merge(opts, {
						dataSource: null
					});
				} else {
					opts = util.merge(opts, {
						dataSource: this._dataSource[len]
					});
				}
				
				this._combos.push(new plus(opts));
				this._initEvents(len);
				return this;
			}
		},
		removeCombos: function(){
			var len = this._combos.length;
			this._combos[len - 1].destory();
			this._combos.splice(len - 1, 1);
		},
		_initEvents: function(index){
			var self = this,
				mod = this._combos[index];
				
			$.each(eventMaps[mod.comboType()], function(i, val){
				mod.on(val, function(e){
					e.cols = index;
					e.type = val;
					if(val === "change"){
						self._fireChange(e);
					}
				});
			});
		},
		_fireChange: function(e){
			var index = e.cols,
				nextIndex = index + 1,
				afterCombos = this._getAfterCombos(nextIndex);
			
			if(afterCombos){
				for(var i = 0, len = afterCombos.length; i < len; i++){
					afterCombos[i].removeAllElements();
				}
				var afterCombo = this._combos[nextIndex],
					dataSource = this.get('dataSource')[nextIndex];
				
				if(util.type.isArray(dataSource)){
					this.setData(afterCombo, getCurrentData(dataSource, e.index));
				} else if (util.type.isObject(dataSource)){
					this.setData(afterCombo, getCurrentData(dataSource, e.value));
				} else if (util.type.isString(dataSource)){
					this.setData(afterCombo, dataSource, e.value);
				}
			}
		},
		setData: function(curCombo, data, value){
			value != undefined && curCombo.set('value', value);
			curCombo.setData(data, curCombo.get('options'));
		},
		setOptions: function(curCombo, opts){
			curCombo.set('options', opts);
		},
		_getComboPlus: function(type){
			if(type === simpleComboBox.toString()){
				return simpleComboBox;
			} /*else if( type === mutilComboBox.toString()){
				return mutilComboBox;
			}*/
			throw new Error('widge.combobox.comboBoxer: 找不到相关的组合框模块');
		},
		_getAfterCombos: function(index){
			index === undefined && (index = 0);
			if(index >= this._combos.length){
				return false;
			}
			return util.array.filter(this._combos, function(val, i){
				return i >= index;
			}, this);
		},
		getCombos: function(index){
			var combos = this._combos;
			if(index == undefined){
				return combos[combos.length - 1];
			}
			return this._combos[index || 0];
		}
	});
	
	function getCurrentData(dataSource, index){
		if(index === undefined) return null;
		return dataSource[index];
	}
	
	return comboBoxer;
	
});