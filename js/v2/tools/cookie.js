// JavaScript Document

define('tools.cookie', function(require, exports){
	var util = require('base.util'),
		doc = document,
		decode = decodeURIComponent,
		encode = encodeURIComponent,
		config = {isDecode: true, isJSON: true};
	
	function checkCookieName(name){
		if(util.type.isEmptyString(name)){
			throw new Error('base.cookie: 必须指定cookie名称');
		}
	}	
	exports.get = function(name, options){
		checkCookieName(name);
		if(util.type.isFunction(options)){
			options = util.mix({callback: options}, config);
		} else {
			options = options || {};
		}
		var cookies = parseCookie(doc.cookie, util.mix(options, {isJSON: true}, true));
		return options.callback && options.callback(cookies[name]) || cookies[name];
	}
	exports.set = function(name, value, options){
		checkCookieName(name);
		options = util.mix({isEncode: true}, options, true);
		var expires = options['expires'];
        var domain = options['domain'];
        var path = options['path'];
		if(options['isEncode']){
			value = encode(value + '');
		}
		var text = name + "=" + value,
			date = expires;
		if(typeof date === 'number'){
			date = new Date();
			date.setDate(date.getDate() + expires);
		}
		if(date instanceof Date){
			text += "; expires=" + date.toUTCString();
		}
		if(util.type.isEmptyString(domain, true)){
			text += "; domain=" + domain;
		}
		if(util.type.isEmptyString(path, true)){
			text += "; path=" + path;
		}
		if(options['secure']){
			text += "; secure";
		}
		doc.cookie = text;
		return text;
	}
	exports.remove = function(name, options){
		options = options || {};
		options['expires'] = -1;
		return this.set(name, '', options);
	}
	var parseCookie = exports.parseCookie = function(text, options){
		
		options = options || config;
		if(util.type.isObject(text) || !text){
			options = text || config;
			text = doc.cookie;
		} 
		var result = {};
		if(!util.type.isEmptyString(text)){
			var cookie,
				cookieName, 
				cookieValue,
				value,
				cookies = text.split(/;\s/g);
				
			for(var i = 0, len = cookies.length; i < len; i++){
				cookie = cookies[i].match(/([^=]+)=/i);
				if(util.type.isArray(cookie)){
					cookieName = decode(cookie[1]);
					value = cookies[i].substring(cookie[1].length + 1);
					cookieValue = options.isDecode ? decode(value) : value;
				} else {
					cookieName = decode(cookies[i]);
					cookieValue = "";
				}
				if(cookieName){
					result[cookieName] = cookieValue;
				}
			}
		}
		return options.isJSON ? result : util.string.param(result);
	}
	return exports;
});