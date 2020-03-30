// JavaScript Document

define('base.attribute', 'base.util', function(require, exports){
	
	var util = require('base.util'),
		cached; 
	exports.initAttrs = function(config, instance) {
    	// initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
    	var attrs = this.attrs = {},
			readOnlyAttrs = this.readOnlyAttrs || {},
			specialProps = this.propsInAttrs || [],
			cached = instance;
		
		mergeInheritedAttrs(attrs, readOnlyAttrs, this, specialProps);
		
		if (config) {
			mergeAttrs(attrs, normalize(config), readOnlyAttrs);
		}
		
		//把attr属性绑定到this的属性以及方法
		copySpecialProps(specialProps, this, attrs, true);
	};
	
	exports.get = function(key, once) {
		var attr;
		if(this.attrs[key] !== undefined){
			attr = util.type.isEmptyObject(this.attrs[key]) ? null : this.attrs[key];
		} else {
			return null;
		}
		return attr;
	};
	exports.set = function(key, val, options) {
		var attrs = {};
		
		// set("key", val, options)
		// set({ "key": val, "key2": val2 }, true)
		if (util.type.isString(key)) {
			attrs[key] = val;
		} else {
			attrs = key;
			options = val;
		}
		
		var options = options || {},
			override = options.override,
			readOnly = !!options.readyOnly,
			now = this.attrs,
			read = this.readOnlyAttrs;
		for (key in attrs) {
			if (!attrs.hasOwnProperty(key)) continue;
			var attr = now[key] || (now[key] = {}),
				val = attrs[key];
			
			if (read[key]) {
				throw new Error('不能修改属性: ' + key);
			}
			
			// 获取设置前的 prev 值
			var prev = this.get(key);
			readOnly && (read[key] = true);
			
			// 获取需要设置的 val 值
			// 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
			// 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
			if (!override && util.type.isPlainObject(prev) && util.type.isPlainObject(val) && !val.jquery) {
				val = util.merge(util.merge({}, prev), val);
			}
			now[key] = val;
			
			// 触发事件改变
			// 初始化时对 set 的调用，不触发任何事件
			if (!this._initializingAttrs && !util.type.isEqual(prev, val)) {
				this.trigger('change:' + key, val, prev, key);
			}
		}
		return this;
	};
	
	function mergeInheritedAttrs(attrs, read, instance, specialProps) {
		var inherited = [],
			readOnlys = [],
			proto = instance.constructor.prototype;
			
		while (proto) {
			if (!proto.hasOwnProperty('attrs')) {
				proto.attrs = {};
			}
			if (!proto.hasOwnProperty('readOnlyAttrs')){
				proto.readOnlyAttrs = {};
			}
			// 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
			copySpecialProps(specialProps, proto.attrs, proto);
			copySpecialProps(specialProps, proto.readOnlyAttrs, proto);
			
			// 为空时不添加
			if (!util.type.isEmptyObject(proto.attrs)) {
				inherited.unshift(proto.attrs);
				readOnlys.unshift(proto.readOnlyAttrs);
			}
			
			// 向上回溯一级
			proto = proto.constructor.superclass;
		}
		
		// 合并复制默认值的实例
		for (var i = 0, len = inherited.length; i < len; i++) {
			mergeAttrs(attrs, normalize(inherited[i]));
			mergeAttrs(read, normalize(readOnlys[i]));
		}
	}
	
	function copySpecialProps(specialProps, receiver, supplier, isAttrProp) {
		for (var i = 0, len = specialProps.length; i < len; i++) {
			var key = specialProps[i];
			if (supplier.hasOwnProperty(key)) {
				receiver[key] = isAttrProp ? receiver.get(key) : supplier[key];
			}
		}
	}
	// 专用于 attrs 的 merge 方法
	function mergeAttrs(attrs, inheritedAttrs, read){
		var key, value;
		for (key in inheritedAttrs) {
			if (inheritedAttrs.hasOwnProperty(key)) {
				value = inheritedAttrs[key];
				if (!attrs[key]) {
					attrs[key] = {};
				}
				if(value != undefined){
					if(value.jquery || value.__className){
						attrs[key] = value;
					} else {
						attrs[key] = util.clone(value, attrs[key]);
					}
					if(read && read[key]){
						read[key] = true;
					}
				}
			}
    	}
    	return attrs;
	}
	function normalize(attrs) {
		var newAttrs = {};
		
		for (var key in attrs) {
			newAttrs[key] = attrs[key];
		}
		return newAttrs;
	}
	
	function hasOwnProperties(object, properties) {
		for (var i = 0, len = properties.length; i < len; i++) {
			if (object.hasOwnProperty(properties[i])) {
				return true;
			}
		}
		return false;
	}
});