// JavaScript Document

define('module.dataSource', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		cacheName = "cache:";
	
	var dataSource = shape(function(o){
		dataSource.parent().call(this, util.merge({
			source: null,
			options: {
				dataType: 'json',
				type: 'post',
				data: null
			}
		}, o));
		this.init();
	});
	dataSource.implement({
		init: function(){
			this.id = 0;
			this.callbacks = {};
			this.setData();
		},
		setData: function(source){
			if(source){
				this.set('source', source);
			} else {
				source = this.get('source');
			}
			if (util.type.isString(source)) {
				this.set('type', 'url');
				if(this.get('options').isCache && !this._cache){
					delete this.get('options').isCache;
					this.set('cacheSize', this.get('options').cacheSize || 300);
					if(this.get('options').cacheSize != undefined){
						delete this.get('options').cacheSize;
					}
					this._cache = {};
					this._cacheMap = [];
				}
			} else if (util.type.isArray(source) || util.type.isObject(source)) {
				this.set('type', 'native');
			}
		},
		setParam: function(data){
			this.set('options', util.merge(this.get('options'), {data: data}));
		},
		setOptions: function(options){
			if(util.type.isObject(options)){
				this.set('options', util.merge(this.get('options'), options));
			}
		},
		abort: function() {
			this.callbacks = {};
		},
		_done: function(data) {
			this.trigger('data', data);
		},
		getData: function(query){
			var type = capitalize(this.get('type') || '');
			if(!type){ return; }
			return this['_get' + type + 'Data'](query);
		},
		_getNativeData: function(){
			var source = this.get('source');
			this._done(source);
			return source;
		},
		_getUrlData: function(query){
			var self = this,
				obj = {
					query: query ? encodeURIComponent(query) : '',
					timestamp: new Date().getTime()
				},
				url = this.get('source').replace(/\{\{(.*?)\}\}/g, function(all, match){
					return obj[match];
				}),
				callbackId = 'callback_' + this.id++;
				
			if(this.isPending){
				clearAjax();
				this.trigger('pending', this._cache);
				if(this.previousValue === query){
					return;
				}
			}
			if(query && this._cache && this._cache[cacheName + query]){
				clearAjax();
				this._cache[cacheName + query].isCache = true;
				this._done(this._cache[cacheName + query]);
				return;
			}
			this.isPending = true;
			this.previousValue = query;
			var options = util.merge(this.get('options'), {
				url: url,
				success: function(data){
					delete self.callbacks[callbackId];
					query && (data.alias = query);
					self._addCache(query, data);
					self.isPending = false;
					self._done(data);
				},
				error: function(r, t, e){
					delete self.callbacks[callbackId];
					self.isPending = false;
					self._done({});
				}
			});
			this.callbacks[callbackId] = $.ajax(options);
			
			function clearAjax(){
				for(var callbackId in self.callbacks){
					delete self.callbacks[callbackId];
				}
			}
		},
		_addCache: function(name, data){
			if(name && this._cache){
				var cacheSize = this.get('cacheSize'),
					len = this._cacheMap.length;
					
				if(len >= cacheSize){
					var i = 0,
						l = len - cacheSize;
					for(  ;i < l; ){
						delete this._cache[cacheName + this._cacheMap[i++]];
					}
					this._cacheMap.splice(0, i);
				}
				if(!this._cache[cacheName + name]){
					this._cacheMap.push(name);
				}
				this._cache[cacheName + name] = data;
			}
		},
		getCache: function(name){
			if(!name || !this._cache) return;
			return this._cache[cacheName + name];
		},
		removeCache: function(name){
			if(!name && !this._cache && !this._cache[cacheName + name]){
				return;
			}
			
			if(this._cacheMap){
				this._cacheMap.splice(0, 1);
			}
			delete this._cache[cacheName + name];
		},
		clearAllCache: function(){
			if(!this._cache) return;
			this._cache = {};
			this._cacheMap = [];
		}
	});
	
	exports.dataSource = dataSource;
	
	function capitalize(str) {
		return str.replace(/^([a-z])/, function(f, m) {
			return m.toUpperCase();
		});
	}
});