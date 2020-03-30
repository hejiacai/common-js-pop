// JavaScript Document

define('base.class', 'base.util', function(require, exports){
	
	var util = require('base.util');
	function checkContext(cls){
		return !(cls instanceof Class) || !util.type.isWindow(cls);
	}
	function Class(){}
	Class.extend = function(o){
		if(!checkContext(this))
			throw new Error('class.extends: 类对象的类型不符合');
		return util.extend(this, o);
	}
	Class.implement = function(items){
		if(!checkContext(this))
			throw new Error('class.implement: 类对象的类型不符合');
			
		util.type.isArray(items) || (items = [items]);
		var proto = this.prototype, item;
		while(item = items.shift()){
			util.mix(proto, item.prototype || item);
		}
		return this;
	}
	Class.parent = function(method){
		if( !checkContext(this) )
			throw new Error('class.parent: 类对象的类型不符合');
		if( !this.superclass )
			throw new Error('class.parent: 找不到父类');
		if(!method || !this.superclass[method]){
			method = 'constructor';
		}
		return this.superclass[method];
	}
	function classify(cls){
		cls.extend = Class.extend;
		cls.implement = Class.implement;
		cls.parent = Class.parent;
		return cls;
	}
	exports.Class = classify;
});