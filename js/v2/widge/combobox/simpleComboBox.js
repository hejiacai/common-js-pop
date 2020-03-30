// JavaScript Document

define('widge.combobox.simpleComboBox', 
['widge.combobox.comboBoxBase', 'widge.combobox.comboBoxActions'],
function(require, exports, module){
	
	var $ = module['jquery'],
		comboBoxBase = module['widge.combobox.comboBoxBase'],
		util = require('base.util'),
		Class = require('base.class').Class,
		comboBoxActions = require('widge.combobox.comboBoxActions');
		
	var simpleComboBox = Class(function(o){
			simpleComboBox.parent().call(this, util.merge({
				selectClassName: 'select',
				hoverClassName: 'hover',
				selectedIndex: -1
			}, o));
		}).extend(comboBoxBase);
	
	simpleComboBox.toString = function(){
		return "simpleComboBox";
	}
	simpleComboBox.implement([comboBoxActions, {
		init: function(){
			this.set('type', false);
			this.after('_renderTemplate', util.bind(this.updateHandler, this));
			simpleComboBox.parent('init').call(this);
			this.setSelectedIndex(this.get('selectedIndex'));
		},
		normalizeValue: function(val, index){
			val.renderType && (val.renderType = false);
			val.isAll && (val.isAll = false);
			return simpleComboBox.parent('normalizeValue').call(this, val, index);
		}
	}]);
		
	return simpleComboBox;
})