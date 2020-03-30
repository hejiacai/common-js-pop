// JavaScript Document

define('widge.autoComplete.filter', function(require, exports, module){
	
	var $ = module['jquery'];
	
	exports['default'] = function(data){
		return data;
	}
	exports['startsWith'] = function(data, query){
		query = query || '';
		var result = [],
			l = query.length,
			reg = new RegExp('^' + escapeKeyword(query));
		
		if(!l) return [];
		$.each(data, function(index, item){
			var a, matchKeys = [item.value].concat(item.alias);
			
			while(a = matchKeys.shift()){
				if(reg.test(a)){
					if(item.label === a){
						item.highlightIndex = [
							[0, l]
						];
					}
					result.push(item);
					break;
				}
			}
		});
		return result;
	}
	exports['stringMatch'] = function(data, query){
		query = query || '';
		var result = [],
			l = query.length;
			
		if(!l) return [];
		$.each(data, function(index, item){
			item.highlightIndex = null;
			var a, matchKeys = [item.value].concat(item.alias);
			while(a = matchKeys.shift()){
				if(a.indexOf(query) > -1){
					if(item.label === a){
						item.highlightIndex = stringMatch(a, query);
					}
					result.push(item);
					break;
				}
			}
		});
		return result;
	}
	
	var keyword = /(\[|\[|\]|\^|\$|\||\(|\)|\{|\}|\+|\*|\?|\\)/g;
	function escapeKeyword(str){
		return (str || '').replace(keyword, '\\$1');
	}
	function stringMatch(matchKey, query){
		var r = [],
			a = matchKey.split(''),
			queryIndex = 0,
			q = query.split('');
		
		for(var i=0, l=a.length; i<l; i++){
			var v = a[i];
			if(v === q[queryIndex]){
				if(queryIndex === q.length - 1){
					r.push([i - q.length + 1, i + 1]);
					queryIndex = 0;
					continue;
				}
				queryIndex++;
			} else {
				queryIndex = 0;
			}
		}
		return r;
	}
	
});