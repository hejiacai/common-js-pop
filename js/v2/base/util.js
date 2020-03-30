// JavaScript Document

define('base.util', function(require, exports){
	
	function isValidParamValue(val) {
        var t = typeof val;
        return val === null || (!hbjs.isObject(t) && !hbjs.isFunction(t));
    }
	var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
		enumProperties = [
			'constructor',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'toString',
			'toLocaleString',
			'valueOf'
		],
		encode = encodeURIComponent,
		decode = decodeURIComponent,
		reg_trim = /^\s+|\s+$/g,
		reg_arr_key = /^(\w+)\[\]$/,
		slice = Array.prototype.slice,
		toString = Object.prototype.toString,
		doc = document,
		elementStyle = doc.createElement('div').style;
		
	exports.getTime = Date.now || function() { return new Date().getTime(); };
	exports.type = {
		isArray: hbjs.isArray,
		isObject: hbjs.isObject,
		isString: hbjs.isString,
		isBoolean: hbjs.isBoolean,
		isFunction: hbjs.isFunction,
		isWindow: function(o){
			return o != null && o == o.window;
		},
		isDate: function(o){
			return toString.call(o) === '[object Date]';
		},
		isNumber: function(o){
			return toString.call(o) === '[object Number]';
		},
		isPlainObject: function(o){
			return o && this.isObject(o) && 
				!o['noteType'] && !this.isWindow(o);
		},
		isEmptyObject: function(o){
			if (!o || !this.isPlainObject(o) ||
				o.nodeType || this.isWindow(o) || !o.hasOwnProperty) {
				return false;
			}
			for (var p in o) {
			  if (o.hasOwnProperty(p)) return false;
			}
			return true;
		},
		isEmptyAttrValue: function(o) {
			return o == null || 
			(this.isString(o) || this.isArray(o)) && o.length === 0 ||
			this.isEmptyObject(o); 
		},
		isEmptyString: function(s, rev){
			var len = exports.string.trim(s).length,
			rev = rev ? len > 0 : len === 0;
			return this.isString(s) && rev;
		},
		isEqual: function(a, b) {
			if (a === b) return true;
			if (this.isEmptyAttrValue(a) && this.isEmptyAttrValue(b)) return true;
		
			var className = toString.call(a);
			if (className != toString.call(b)) return false;
		
			switch (className) {
				case '[object String]':
					return a == String(b);
				case '[object Number]':
					return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
				case '[object Date]':
				case '[object Boolean]':
					return +a == +b;
				case '[object RegExp]':
					return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
				// 简单判断数组包含的 primitive 值是否相等
				case '[object Array]':
					var aString = a.toString(),
						bString = b.toString();
					// 只要包含非 primitive 值，为了稳妥起见，都返回 false
					return aString.indexOf('[object') === -1 &&
					bString.indexOf('[object') === -1 &&
					aString === bString;
			}
		
			if (typeof a != 'object' || typeof b != 'object')
				return false;
			// 简单判断两个对象是否相等，只判断第一层
			if (this.isPlainObject(a) && this.isPlainObject(b)) {
				// 键值不相等，立刻返回 false
				if (!this.isEqual(exports.object.keys(a), exports.object.keys(b))) {
					return false;
				}
				// 键相同，但有值不等，立刻返回 false
				for (var p in a) {
					if (a[p] !== b[p]) return false;
				}
				return true;
			}
			// 其他情况返回 false, 以避免误判导致 change 事件没发生
			return false;
		}
	};
	exports.array = hbjs.arrayUtil;
	exports.array.contains = function(ret, target){
		if(!exports.type.isArray(ret)){
			return null;
		}
		var i = ret.length;
		while(i >= 0){
			if(ret[i] === target){ 
				return true; 
			}
			i--; 
		}
		return false;
	}
	exports.object = {
		keys: Object.keys || function (o) {
			var result = [], p, i;
			for (p in o) {
				if (o.hasOwnProperty(p)) {
					result.push(p);
				}
			}
			if (hasEnumBug) {
				for (i = enumProperties.length - 1; i >= 0; i--) {
					p = enumProperties[i];
					if (o.hasOwnProperty(p)) {
						result.push(p);
					}
				}
			}
			return result;
		}
	};
	exports.string = {
		trim: function(str){
			return str === undefined ? '' : str.toString().replace(reg_trim, '');
		},
		escape: function(val) {
			return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&acute;');
		},
		unescape: function(val) {
			return val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&acute;/g, '\'');
		},
		replace: function(string, obey, aval){
			if(arguments.length == 2){
				//简单模板的情况
				return string.replace(/\{([^{}]+)\}/g,function(match,key){
					var value = obey[key];
					return (value !== undefined) ? ''+ value : '';
				});
				//替换情况  ['lvke', 'hehe', 'mama'], ['1', '2', '3']
			} else {
				obey = hbjs.isArray(obey) ? obey : [obey];
				for(var len = obey.length - 1; len >= 0; len--){
					if( exports.type.isPlainObject( obey[len] )){
						continue;
					}
					string = string.replace( obey[len] , hbjs.isArray(aval) ? ( aval[len] || '' ) : aval );
				}
			}
			return string;
		},
		param: function(o){
			if(!exports.type.isPlainObject(o)) return '';
			var buf = [], key, val;
			for(key in o){
				val = o[key];
				key = encode(key);
				if(isValidParamValue(val)){
					buf.push(key, '=', encode(val + ''), '&');
				} else if (this.type.isArray(val) && val.length) {
					for(var i=0, len=val.length; i<len; i++){
						if(isValidParamValue(val[i])){
							buf.push(key, '[]=', encode(val[i] + ''), '&');
						}
					}
				}
			}
			buf.pop();
			return buf.join('');
		},
		unparam: function(str, sep){
			if(exports.type.isEmptyString(str) || !exports.type.isString(str))
				return {};
			var ret = {},
				pairs = str.split(sep || '&'),
				pair, key, val, m,
				i = 0, len = pairs.length;
				
			for(; i < len; i++){
				pair = pairs[i].split('=');
				key = decode(pair[0]);
				
				try{
					val = decode(pair[1]);
				} catch(e){
					val = pair[1] || '';
				}
				
				if((m = key.match(reg_arr_key)) && m[1]){
					ret[m[1]] = ret[m[1]] || [];
					ret[m[1]].push(val);
				} else {
					ret[key] = val;
				}
			}
			return ret;
		}
	};
	exports.mix = function(t, s, ov, wl){
		if (!s || !t) 
			return t;
		if (ov === undefined) 
			ov = true;
		var i, p, l;
		if(wl && (l = wl.length)){
			for (i = 0; i < l; i++){
				p = wl[i];
				if(p in s){
					if(ov || !(p in t)){
						t[p] = s[p];
					}
				}
			}
		} else {
			for (p in s){
				if (ov || !(p in t)){
					t[p] = s[p];
				}
			}
		}
		return t;
	};
	exports.extend = function(t, s){
		if(!s || !t)
			return t;
		var obj = Object.prototype,
		O = function(o){
			function F(){};
			F.prototype = o;
			return new F();
		},
		sp = s.prototype,
		op = O(sp);
		
		t.prototype = op;
		op.constructor = t;
		t.superclass = sp;
		
		if(s !== Object && sp.constructor === obj.constructor)
			sp.constructor = s;
		return t;
	};
	exports.merge = function(r, s){
		var key, value;
		for (key in s) {
			try {
				if (s.hasOwnProperty(key)) {
					r[key] = this.clone(s[key], r[key]);
				}
			} catch(ex) {
				delete s[key];
				delete r[key];
			}
		}
		
		return r;
	};
	exports.clone = function(r, s){
		if (this.type.isArray(r)) {
			r = r.slice();
		} else if (this.type.isPlainObject(r) && !r.jquery && !r.__className) {
			this.type.isPlainObject(s) || (s = {});
			r = this.merge(s, r);
		}
		return r;
	};
	exports.bind = function(){
		var args = slice.call(arguments) || [],
			fun = args.shift(),
			obj = args.shift();
		return function(e){
			var ar = slice.call(arguments) || null;
			return exports.type.isFunction(fun) && 
			fun.apply(obj, ar.concat(args));
		}
	};
	exports.json = window.JSON ? JSON.parse : function(text, mode){
		if(mode){
			return (new Function( "return " + text ) )();
		}
		var match;
		if((match = /\{[\s\S]*\}|\[[\s\S]*\]/.exec(text))){
			text = match[0];
		}
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		cx.lastIndex = 0;
		if(cx.test(text)){
			text = text.replace(cx, function(a){
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		if (/^[\],:{}\s]*$/.
		test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
		replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
		replace(/(?:^|:|,)(?:\s*\[)+/g, ''))){
			return eval('(' + text + ')');
		}
		throw 'JSON parse error';
	};
	
	return exports;
});