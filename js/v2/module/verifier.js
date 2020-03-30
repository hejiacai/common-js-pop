// JavaScript Document
define('module.verifier', function(require, exports, module){
	var util = require('base.util'),
		$ = module['jquery'],
		isIE = !!window.ActiveXObject;
	
	exports.required = function(element){
		element = normalizeDom(element);
		var el = element[0];
		switch (el.nodeName.toLowerCase()){
			case 'select':
				var options = $("option:selected", el);
				return options.length > 0 && 
				(el.type == "select-multiple" || (isIE && !(options[0].attributes['value'].specified) ? 
				options[0].text : options[0].value).length > 0);
			case 'input':
				return getLength(element) > 0;
			case 'textarea':
				return getLength(element) > 0;
			default:
				return null;
		}
	}
	exports.min = function(element, param) {
		return !exports.required(element) || getLength(element) >= param;
	}
	exports.max = function(element, param) {
		return !exports.required(element) || getLength(element) <= param;
	}
	exports.range = function(element, param) {
		var length = getLength(element);
		return !exports.required(element) || (length >= param[0] && length <= param[1]);
	}
	exports.minNum = function(element, param){
		return !exports.required(element) || normalizeDom(element).val() >= param;
	}
	exports.maxNum = function(element, param){
		return !exports.required(element) || normalizeDom(element).val() <= param;
	}
	exports.rangeNum = function(element, param){
		var value = normalizeDom(element).val();
		return !exports.required(element) || value >= param[0] && value <= param[1];
	}
	exports.equalTo = function(element, param) {
		param = normalizeDom(param).val();
		return elementValue(element) === param;
	}
	exports.number = function(element){
		var value = normalizeDom(element).val();
		return !exports.required(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
	}
	exports.email = function(element){
		var value = normalizeDom(element).val();
		return !exports.required(element) || /^[a-z0-9]([a-z0-9]*[-_.]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z0-9]+([\.][a-z0-9]+)?([\.][a-z0-9]{2,3})?$/i.test(value);
	}
	exports.mobile = function(element){
		var value = normalizeDom(element).val();
		return !exports.required(element) || (/^(13[0-9]{9,9}|18[0-9]{9,9}|15[0-9]{9,9}|17[0-9]{9,9}|14[0-9]{9,9}|19[0-9]{9,9})$/.test(value));
	}
	exports.price = function(element){
		var value = normalizeDom(element).val();
		if(value == 0) return false;
		return !exports.required(element) || exports.required(element) && /^(\d+\.\d+|\d+)$/.test(value);
	}
	exports.url = function(element){
		var value = normalizeDom(element).val(),
			urlReg = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return !exports.required(element) || urlReg.test(value);
	}
	exports.idcard = (function(){
		var powers = ["7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"],
			parityBits = ["1","0","X","9","8","7","6","5","4","3","2"];
		function validId15(val){
			var id = val + "";
			for(var i = 0; i < id.length; i++){
				if(id.charAt(i) < '0' || id.charAt(i) > '9'){
					return false;
				}
			}
			var year = id.substr(6, 2),
				month = id.substr(8, 2),
				day = id.substr(10, 2),
				sexBit = id.substr(14);
			if(year < '01' || year > '90')
				return false;
			if(month < '01' || month > '12')
				return false;
			if(day < '01' || day > '31')
				return false;
			
			return true;    
		}
		function validId18(val){
			var id = val + "";
				num = id.substr(0, 17),
				parityBit = id.substr(17),
				power = 0;
			
			for(var i = 0; i < 17; i++){
				if(num.charAt(i) < '0' || num.charAt(i) > '9'){
					return false;
				} else {
					power += parseInt(num.charAt(i)) * parseInt(powers[i]);
				}
			} 
			var mod = parseInt(power) % 11;  
			if(parityBits[mod] == parityBit.toUpperCase()){
				return true;
			}
			return false;
		}      
		return function(element){  
			var value = normalizeDom(element).val();
			if($.trim(value) === ''){
				return true;
			}
			if(value.length === 15){
				return validId15(value);
			}else if(value.length === 18){
				return validId18(value);
			}    
			return false;
		}
	})();
	exports.pop = function(element){
		var value = normalizeDom(element).val(),
			reg = /^(pop|pop3|imap|smtp)\.\w+\.\w+(.\w+)*$/i;
		return !exports.required(element) || reg.test(value);
	}
	exports.tel = function(element){
		var value = normalizeDom(element).val();
		return !exports.required(element) || /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/.test(value);
	}
	exports.phone = function(element){
		return exports.tel(element) || exports.mobile(element);
	}
	exports.match = function(element, param){
		var value = normalizeDom(element).val();
		return param.test(value);
	}
	exports.format = function(source, params){
        if(arguments.length == 1)
            return function(){
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.format.apply(this, args);
            };
        if(arguments.length > 2 && params.constructor != Array){
            params = $.makeArray(arguments).slice(1);
        }
        if(params.constructor != Array){
            params = [params];
        }
        $.each(params, function(i, n){
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };
	
	exports.getLength = getLength;
	exports.checkable = checkable;
	exports.selectable = selectable;
	exports.elementValue = elementValue;
	
	function getLength(element) {
		element = normalizeDom(element);
		var el = element[0];
		switch( el.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( checkable( el ) ){
					return element.filter(':checked').length;
				} else {
					var len = 0;
					element.each(function(){
						len += $.trim($(this).val()).length;
					});
					return len;
				}
			case 'textarea':
				return $.trim(element.val()).length;
			default:
				return null;
		}
	}
	function normalizeDom(el){
		if(util.type.isString(el) || el.nodeName){
			el = $(el);
		}
		if(el.length){ 
			return el; 
		}	
		throw new Error('module.verifier: 找不到dom目标');
	}
	function checkable( element ){
		return element && /radio|checkbox/i.test(element.type);
	}
	function selectable( element ){
		return element.nodeName.toLowerCase() === 'select';
	}
	function elementValue(element, spliter){
		element = normalizeDom(element);
		var el = element[0], ret = [], type;
		if( checkable(el) ) {
			type = ":checked";
		} else if( selectable(el) ){
			type = ":selected";
		}
		element.each(function(){
			if(type && $(this).is(type)){
				ret.push($(this).val());
			} else {
				if(getLength($(this))){
					ret.push($(this).val().replace(/\r/i, ''));
				}
			}
		});
		spliter = util.type.isString(spliter) ? spliter : ',';
		return ret.join(spliter);
	}
	return exports;
});