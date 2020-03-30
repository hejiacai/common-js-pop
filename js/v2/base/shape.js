// JavaScript Document

define('base.shape', [
	'base.event', 'base.aspect', 'base.attribute','base.util', 'base.class', 'jquery'
], function(require, exports, module){

	var util = require('base.util'),
		aspect = require('base.aspect'),
		attribute = require('base.attribute'),
		events = module['base.event'],
		$ = module['jquery'],
		Class = require('base.class').Class,
		cidCounter = 0,
		cachedInstances = [],
		shape = Class(function(config){
			this.cid = uniqueCid();
			this.initAttrs(config);
			cachedInstances.push(this);
		});
	
	function uniqueCid() {
    	return 'shape-' + cidCounter++;
  	}
	shape.implement([events, aspect, attribute, {
		destory: function(f){
			this.off();
			if(f){
				for (var p in this) {
					if (this.hasOwnProperty(p)) {
						delete this[p];
					}
				}
				this.destory = function(){}
			}
		}
	}]);
	
	$(window).unload(function() {
		for(var i=0, len=cachedInstances.length; i<len; i++){
			cachedInstances[i].destory && cachedInstances[i].destory(true);
		}
		cachedInstances = null;
	});
	
	return function(o){
		if(!util.type.isFunction(o) && !util.type.isObject(o)){
			throw new Error('base.shape: 类型不符合');
		}
		return Class(o).extend(shape);	
	};
});